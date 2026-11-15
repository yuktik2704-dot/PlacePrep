
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

const GEMINI_TIMEOUT = 10000;
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
                content: `
You are an expert ATS resume analyzer, technical recruiter,
and professional career coach.

Your job is to produce detailed, personalized, evidence-based
resume analysis.

IMPORTANT INSTRUCTIONS:

- Analyze the actual resume carefully.
- Never give generic or repetitive feedback.
- Explain the reasoning behind your recommendations.
- Use specific evidence from the resume wherever possible.
- Provide practical suggestions that the candidate can implement.
- Do not invent experience, achievements, or technical skills.
- Be honest, constructive, and professionally detailed.
- Follow the exact JSON structure requested by the user.
- Return only valid JSON without Markdown or code fences.
- Never omit any required field.
- Make explanations meaningful rather than excessively short.
`
            },
            {
                role: "user",
                content: prompt
            }
        ],

        max_completion_tokens: 4096,

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
You are a highly experienced Technical Recruiter,
ATS Specialist, and Career Coach specializing in software
engineering and technology roles.

Your task is to perform a thorough, realistic, evidence-based
analysis of the candidate's resume.

Do not provide generic feedback.
Every observation must be based on the actual resume content.

RESUME:

${resumeText}

==================================================
1. ATS SCORE
==================================================

Give a realistic score between 0 and 100.

Evaluate:
- Technical keyword relevance.
- Skills and technologies.
- Project quality and relevance.
- Professional experience or internships.
- Educational background.
- Resume formatting and readability.
- Relevance to the candidate's likely target role.

Do not award high scores simply because the resume contains
many technical keywords.

==================================================
2. DEVELOPER TYPE
==================================================

Choose exactly ONE:

Frontend Developer
Backend Developer
Full Stack Developer
AI/ML Enthusiast
Data Analyst
Beginner

Base your decision on demonstrated skills and projects,
not merely the candidate's stated career objective.

==================================================
3. SUMMARY
==================================================

Write 4-5 meaningful sentences covering:

- The candidate's current technical profile.
- Their strongest demonstrated abilities.
- Their most significant weaknesses.
- Their readiness for entry-level technical opportunities.
- Their most important area requiring improvement.

Make the summary specific to this candidate.

==================================================
4. SECTION SCORES
==================================================

Give each section a separate score between 0 and 100:

- skills
- projects
- experience
- education
- formatting

Scores must reflect the actual quality and relevance
of the content.

==================================================
5. STRENGTHS
==================================================

Give exactly 4 strengths.

For each strength:

- Identify a specific skill, project, achievement,
  or qualification from the resume.
- Explain why it is valuable to recruiters.
- Explain how it improves the candidate's profile.

Avoid one-word or generic strengths.

==================================================
6. WEAKNESSES
==================================================

Give exactly 4 weaknesses.

For each weakness:

- Identify a specific gap or problem.
- Explain why it weakens the resume.
- Explain its potential impact on ATS screening
  or recruiter evaluation.
- Suggest what the candidate should improve.

Be constructive and specific.

==================================================
7. MISSING SKILLS
==================================================

Give exactly 5 relevant skills.

Select skills that would genuinely improve the candidate's
employability for their likely target role.

Do not list technologies randomly.

For each skill, briefly explain why it is useful
for the candidate's career direction.

==================================================
8. RECOMMENDED PROJECTS
==================================================

Recommend exactly 3 practical projects suited
to the candidate's current skill level.

For each project:

- Provide a specific and professional title.
- Write a detailed 3-4 sentence description.
- Explain what the candidate should build.
- Mention relevant technologies.
- Explain which skills or concepts the project demonstrates.
- Describe how it would strengthen the candidate's resume.

Avoid recommending projects that simply repeat
existing projects in the resume.

==================================================
9. RESUME SUGGESTIONS
==================================================

Give exactly 5 actionable suggestions.

Each suggestion must:

- Identify what needs improvement.
- Explain why the change matters.
- Describe how to implement the improvement.
- Include a concrete example where appropriate.

Pay special attention to:

- Project descriptions.
- Measurable achievements.
- Technical keywords.
- Clarity and readability.
- Professional presentation.
- Strong action verbs.
- Relevant technical skills.

==================================================
10. ROADMAP
==================================================

Give exactly 5 sequential improvement steps.

Each step must explain:

- What the candidate should learn or do.
- Why it is important.
- A practical action or deliverable they should complete.

Make the roadmap realistic and progressively challenging.

==================================================
GENERAL RULES
==================================================

- Be detailed, constructive, professional, and honest.
- Personalize every recommendation using evidence from
  the resume.
- Never invent work experience, achievements,
  certifications, or skills.
- Clearly distinguish between demonstrated skills
  and missing skills.
- Do not penalize a fresher simply for lacking
  professional experience.
- Do not confuse the number of projects with their quality.
- Avoid repetitive observations across different sections.
- Prioritize practical improvements over motivational statements.
- Use clear, meaningful explanations rather than short phrases.
- Do not exaggerate the candidate's abilities.
- Maintain consistent and realistic scoring.
- Ensure every recommendation is relevant to the candidate.

==================================================
OUTPUT REQUIREMENTS
==================================================

Return ONLY valid JSON.

Do not include Markdown.
Do not include code fences.
Do not include explanations outside the JSON.

Return exactly this structure:

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

IMPORTANT:
All arrays must contain exactly the requested number of items.
All project descriptions must contain meaningful detail.
All explanations must be personalized to the supplied resume.
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
                    maxOutputTokens: 4096,

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
