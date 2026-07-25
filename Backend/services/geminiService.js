const { GoogleGenAI, Type } = require("@google/genai");

const { createInterviewPrompt } = require("../utils/interviewPrompt");
const { generateFallbackInterview } = require("../utils/fallbackInterview");
const { generateFallbackEvaluation } = require("../utils/fallbackEvaluation");
const { generateFallbackAnalysis } = require("./fallbackAnalyzer");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

/* ==========================================================
                    SAFE JSON PARSER
========================================================== */

function extractJSON(text) {

    if (!text) {
        throw new Error("Empty Gemini response");
    }

    let cleaned = text.trim();

    cleaned = cleaned.replace(/```json/g, "");
    cleaned = cleaned.replace(/```/g, "");

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    try {

        return JSON.parse(cleaned);

    } catch (err) {

        console.log("\n========== INVALID GEMINI JSON ==========\n");
        console.log(cleaned);

        throw err;

    }

}
/* ==========================================================
                    UNIVERSAL GEMINI CALL
========================================================== */

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

        }

        catch (err) {

            
            console.log(err.message);

            if (attempt === 2) {
                throw err;
            }

        }

    }

}

/* ==========================================================
                    RESUME SCHEMA
========================================================== */

const ResumeSchema = {

    type: Type.OBJECT,

    properties: {

        atsScore: {
            type: Type.NUMBER
        },

        developerType: {
            type: Type.STRING
        },

        summary: {
            type: Type.STRING
        },

        sectionScores: {

            type: Type.OBJECT,

            properties: {

                skills: {
                    type: Type.NUMBER
                },

                projects: {
                    type: Type.NUMBER
                },

                experience: {
                    type: Type.NUMBER
                },

                education: {
                    type: Type.NUMBER
                },

                formatting: {
                    type: Type.NUMBER
                }

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

            items: {
                type: Type.STRING
            }

        },

        weaknesses: {

            type: Type.ARRAY,

            items: {
                type: Type.STRING
            }

        },

        missingSkills: {

            type: Type.ARRAY,

            items: {
                type: Type.STRING
            }

        },

        recommendedProjects: {

            type: Type.ARRAY,

            items: {

                type: Type.OBJECT,

                properties: {

                    title: {
                        type: Type.STRING
                    },

                    description: {
                        type: Type.STRING
                    }

                },

                required: [
                    "title",
                    "description"
                ]

            }

        },

        resumeSuggestions: {

            type: Type.ARRAY,

            items: {
                type: Type.STRING
            }

        },

        roadmap: {

            type: Type.ARRAY,

            items: {
                type: Type.STRING
            }

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

/* ==========================================================
                    INTERVIEW SCHEMA
========================================================== */

const InterviewSchema = {

    type: Type.OBJECT,

    properties: {

        questions: {

            type: Type.ARRAY,

            items: {

                type: Type.OBJECT,

                properties: {

                    question: {
                        type: Type.STRING
                    },

                    difficulty: {
                        type: Type.STRING
                    },

                    category: {
                        type: Type.STRING
                    }

                },

                required: [
                    "question",
                    "difficulty",
                    "category"
                ]

            }

        }

    },

    required: [
        "questions"
    ]

};

/* ==========================================================
                    EVALUATION SCHEMA
========================================================== */

const EvaluationSchema = {

    type: Type.OBJECT,

    properties: {

        strengths: {

            type: Type.ARRAY,

            items: {
                type: Type.STRING
            }

        },

        improvements: {

            type: Type.ARRAY,

            items: {
                type: Type.STRING
            }

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

/* ==========================================================
                    ANALYZE RESUME
========================================================== */

async function analyzeResume(resumeText) {

    

    const prompt = `

You are an expert ATS Resume Analyzer.

Analyze the following resume carefully.

Resume:

${resumeText}

IMPORTANT:
Return ONLY valid JSON.

The JSON MUST contain ALL of these fields.

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
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "recommendedProjects": [
    {
      "title": "",
      "description": ""
    }
  ],
  "resumeSuggestions": [],
  "roadmap": []
}

Rules:

- ATS score between 0 and 100.
- Developer Type should be one of:
  Frontend Developer
  Backend Developer
  Full Stack Developer
  AI/ML Enthusiast
  Data Analyst
  Beginner
- Summary should be 2-3 concise sentences.
- Give exactly 4 strengths.
- Give exactly 4 weaknesses.
- Give exactly 5 missing skills.
- Give exactly 3 recommended projects.
- Give exactly 5 resume suggestions.
- Give exactly 5 roadmap steps.

DO NOT return markdown.
DO NOT use triple backticks.
Return PURE JSON only.

`;

    try {

        const analysis = await callGemini(
            prompt,
            ResumeSchema,
            4096
        );

        
        console.log(JSON.stringify(analysis, null, 2));

        return analysis;

    }

    catch (err) {

        
        console.log(err.message);

        

        return generateFallbackAnalysis(resumeText);

    }

}

/* ==========================================================
            GENERATE INTERVIEW QUESTIONS
========================================================== */

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

            throw new Error("Gemini generated insufficient questions.");

        }

        interview.questions = interview.questions.slice(0, 10);

        

        return interview;

    }

    catch (err) {

       
        console.log(err.message);

        

        return generateFallbackInterview(resume);

    }

}

/* ==========================================================
                EVALUATE INTERVIEW
========================================================== */

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

    }

    catch (err) {

        

        console.log(err.message);

        

        return generateFallbackEvaluation(answers);

    }

}

/* ==========================================================
                    EXPORTS
========================================================== */

module.exports = {

    analyzeResume,

    generateInterviewQuestions,

    evaluateInterview

};

