
const { GoogleGenAI, Type } = require("@google/genai");
const Groq = require("groq-sdk");

const { createInterviewPrompt } = require("../utils/interviewPrompt");
const { generateFallbackInterview } = require("../utils/fallbackInterview");
const { generateFallbackEvaluation } = require("../utils/fallbackEvaluation");
const { generateFallbackAnalysis } = require("./fallbackAnalyzer");

// ==========================================================
// AI CLIENTS
// ==========================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const GEMINI_TIMEOUT = 6000;
const GROQ_TIMEOUT = 8000;

function getGroqClient() {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is missing from environment variables.");
    }

    return new Groq({
        apiKey: process.env.GROQ_API_KEY,
        timeout: GROQ_TIMEOUT,
        maxRetries: 0
    });
}

// ==========================================================
// ERROR HELPERS
// ==========================================================

function getErrorStatus(err) {
    return Number(err.status || err.code);
}

function isQuotaError(err) {
    const message = String(
        err.message || err
    ).toLowerCase();

    return (
        getErrorStatus(err) === 429 ||
        message.includes("quota") ||
        message.includes("resource_exhausted") ||
        message.includes("rate limit") ||
        message.includes("too many requests")
    );
}

function isRetryableError(err) {
    const status = getErrorStatus(err);

    return (
        [408, 500, 502, 503, 504].includes(status) ||
        ["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED"].includes(err.code)
    );
}

// ==========================================================
// SAFE JSON PARSER
// ==========================================================

function extractJSON(text) {
    if (!text || typeof text !== "string") {
        throw new Error("Empty or invalid AI response.");
    }

    let cleaned = text.trim();

    cleaned = cleaned.replace(/```json/gi, "");
    cleaned = cleaned.replace(/```/g, "");

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("AI response does not contain valid JSON.");
    }

    cleaned = cleaned.substring(firstBrace, lastBrace + 1);

    try {
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("Invalid AI JSON:", cleaned);
        throw err;
    }
}

// ==========================================================
// RESUME ANALYSIS VALIDATION
// ==========================================================

function validateResumeAnalysis(data) {
    if (!data || typeof data !== "object") {
        throw new Error("Invalid resume analysis response.");
    }

    const requiredFields = [
        "atsScore",
        "developerType",
        "summary",
        "sectionScores",
        "strengths",
        "weaknesses",
        "missingSkills",
        "recommendedProjects",
        "resumeSuggestions",
        "roadmap"
    ];

    for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null) {
            throw new Error(`Resume analysis missing field: ${field}`);
        }
    }

    const scoreFields = [
        "skills",
        "projects",
        "experience",
        "education",
        "formatting"
    ];

    for (const field of scoreFields) {
        if (typeof data.sectionScores[field] !== "number") {
            throw new Error(`Invalid section score: ${field}`);
        }
    }

    const arrayFields = [
        "strengths",
        "weaknesses",
        "missingSkills",
        "recommendedProjects",
        "resumeSuggestions",
        "roadmap"
    ];

    for (const field of arrayFields) {
        if (!Array.isArray(data[field])) {
            throw new Error(`Invalid resume analysis array: ${field}`);
        }
    }

    for (const project of data.recommendedProjects) {
        if (
            !project ||
            typeof project.title !== "string" ||
            typeof project.description !== "string"
        ) {
            throw new Error("Invalid recommended project format.");
        }
    }

    if (
        typeof data.atsScore !== "number" ||
        typeof data.developerType !== "string" ||
        typeof data.summary !== "string"
    ) {
        throw new Error("Invalid resume analysis field types.");
    }

    return data;
}

// ==========================================================
// UNIVERSAL GEMINI CALL
// Used by interview questions and evaluation.
// ==========================================================

async function callGemini(prompt, schema, maxTokens = 4096) {
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            console.log(`Gemini Attempt ${attempt}`);

            const response = await ai.models.generateContent({
                model: "gemini-flash-latest",
                contents: prompt,
                config: {
                    temperature: 0.3,
                    maxOutputTokens: maxTokens,
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });

            return extractJSON(response.text);

        } catch (err) {
            console.error("Gemini error:", err.message);

            if (attempt === 2) {
                throw err;
            }
        }
    }
}

// ==========================================================
// RESUME SCHEMA
// ==========================================================

const ResumeSchema = {
    type: Type.OBJECT,
    properties: {
        atsScore: { type: Type.NUMBER },
        developerType: { type: Type.STRING },
        summary: { type: Type.STRING },

        sectionScores: {
            type: Type.OBJECT,
            properties: {
                skills: { type: Type.NUMBER },
                projects: { type: Type.NUMBER },
                experience: { type: Type.NUMBER },
                education: { type: Type.NUMBER },
                formatting: { type: Type.NUMBER }
            },
            required: [
                "skills",
                "projects",
                "experience",
                "education",
                "formatting"
            ]
        },

        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },

        weaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },

        missingSkills: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },

        recommendedProjects: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ["title", "description"]
            }
        },

        resumeSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },

        roadmap: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },

    required: [
        "atsScore",
        "developerType",
        "summary",
        "sectionScores",
        "strengths",
        "weaknesses",
        "missingSkills",
        "recommendedProjects",
        "resumeSuggestions",
        "roadmap"
    ]
};

// ==========================================================
// INTERVIEW SCHEMA
// ==========================================================

const InterviewSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    category: { type: Type.STRING }
                },
                required: [
                    "question",
                    "difficulty",
                    "category"
                ]
            }
        }
    },
    required: ["questions"]
};

// ==========================================================
// EVALUATION SCHEMA
// ==========================================================

const EvaluationSchema = {
    type: Type.OBJECT,
    properties: {
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        improvements: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        finalFeedback: {
            type: Type.STRING
        }
    },
    required: [
        "strengths",
        "improvements",
        "finalFeedback"
    ]
};

// ==========================================================
// GROQ RESUME ANALYSIS
// ==========================================================

async function analyzeWithGroq(prompt) {
    console.log("Switching to Groq...");

    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",

        messages: [
            {
                role: "system",
                content: "You are an expert ATS resume analyzer. Return only valid JSON matching the user's requested format. Do not include markdown or explanations."
            },
            {
                role: "user",
                content: prompt
            }
        ],

        max_completion_tokens: 2048,

        response_format: {
            type: "json_object"
        }
    });

    const content = completion.choices?.[0]?.message?.content;

    const data = extractJSON(content);

    validateResumeAnalysis(data);

    console.log("Groq resume analysis successful.");

    return data;
}

// ==========================================================
// ANALYZE RESUME
// Gemini -> Gemini retry -> Groq
// Existing controller fallback remains the final safety net.
// ==========================================================

async function analyzeResume(resumeText) {
    console.log("\n========== ANALYZING RESUME ==========\n");

    const prompt = `
You are an expert ATS Resume Analyzer.

Analyze the following resume.

Resume:
${resumeText}

Return ONLY valid JSON.

Format:

{
  "atsScore": 0,
  "developerType": "",
  "summary": "",
  "sectionScores": {
      "skills": 0,
      "projects": 0,
      "experience": 0,
      "education": 0,
      "formatting": 0
  },
  "strengths": ["", "", "", ""],
  "weaknesses": ["", "", "", ""],
  "missingSkills": ["", "", "", "", ""],
  "recommendedProjects": [
      {"title": "", "description": ""},
      {"title": "", "description": ""},
      {"title": "", "description": ""}
  ],
  "resumeSuggestions": ["", "", "", "", ""],
  "roadmap": ["", "", "", "", ""]
}

Rules:

- ATS score between 0 and 100.
- Summary should be 2-3 concise sentences.
- Give exactly 4 strengths.
- Give exactly 4 weaknesses.
- Give exactly 5 missing skills.
- Give exactly 3 recommended projects.
- Give exactly 5 resume suggestions.
- Give exactly 5 roadmap steps.
- Every recommended project must contain title and description.
- All section scores must be numbers between 0 and 100.
- Developer Type must be exactly one of:

Frontend Developer
Backend Developer
Full Stack Developer
AI/ML Enthusiast
Data Analyst
Beginner

Return ONLY JSON.
`;

    // ------------------------------
    // GEMINI: TWO CONTROLLED ATTEMPTS
    // ------------------------------

    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            console.log(
                `Gemini Resume Attempt ${attempt}/2`
            );

            const response = await ai.models.generateContent({
                model: "gemini-flash-latest",

                contents: prompt,

                config: {
                    responseMimeType: "application/json",
                    responseSchema: ResumeSchema,
                    temperature: 0.3,
                    maxOutputTokens: 2048,

                    httpOptions: {
                        timeout: GEMINI_TIMEOUT,
                        retryOptions: {
                            attempts: 1
                        }
                    }
                }
            });

            const data = extractJSON(response.text);

            validateResumeAnalysis(data);

            console.log("Gemini resume analysis successful.");

            return data;

        } catch (err) {
            console.error(
                `Gemini Attempt ${attempt} Failed:`,
                err.status || err.code || err.message
            );

            // Quota errors should go directly to Groq.
            if (isQuotaError(err)) {
                console.log(
                    "Gemini quota/rate limit detected. Skipping retry."
                );
                break;
            }

            // Retry only temporary failures.
            if (attempt === 1 && isRetryableError(err)) {
                console.log(
                    "Retrying Gemini once..."
                );
                continue;
            }

            // For other failures, switch to Groq.
            console.log(
                "Gemini unavailable. Moving to Groq."
            );
            break;
        }
    }

    // ------------------------------
    // GROQ FALLBACK
    // ------------------------------

    try {
        return await analyzeWithGroq(prompt);

    } catch (err) {
        console.error(
            "Groq resume analysis failed:",
            err.status || err.code || err.message
        );

        // Let the existing controller-level
        // generateFallbackAnalysis handle the final fallback.
        throw err;
    }
}

// ==========================================================
// GENERATE INTERVIEW QUESTIONS
// Existing functionality preserved.
// ==========================================================

async function generateInterviewQuestions(resume) {
    const prompt = createInterviewPrompt(resume);

    try {
        const interview = await callGemini(
            prompt,
            InterviewSchema,
            2048
        );

        if (
            !interview.questions ||
            interview.questions.length < 10
        ) {
            throw new Error(
                "Gemini generated insufficient questions."
            );
        }

        interview.questions = interview.questions.slice(0, 10);

        return interview;

    } catch (err) {
        console.log(err.message);

        return generateFallbackInterview(resume);
    }
}

// ==========================================================
// EVALUATE INTERVIEW
// Existing functionality preserved.
// ==========================================================

async function evaluateInterview(answers) {
    const prompt = `
You are a Senior Software Engineering Interviewer.

Evaluate the following interview answers.

Candidate Answers:

${JSON.stringify(answers, null, 2)}

IMPORTANT

Return ONLY JSON.

Do NOT use markdown.

Do NOT use triple backticks.

Return EXACTLY this format.

{
  "strengths":[
    "...",
    "...",
    "..."
  ],

  "improvements":[
    "...",
    "...",
    "..."
  ],

  "finalFeedback":"Write only 3 concise sentences."
}
`;

    try {
        const report = await callGemini(
            prompt,
            EvaluationSchema,
            2048
        );

        return report;

    } catch (err) {
        console.log(err.message);

        return generateFallbackEvaluation(answers);
    }
}

// ==========================================================
// EXPORTS
// ==========================================================

module.exports = {
    analyzeResume,
    generateInterviewQuestions,
    evaluateInterview
};

