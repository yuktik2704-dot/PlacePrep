/* ===========================================================
                RULE BASED ATS ANALYZER
=========================================================== */

const SKILLS = {

frontend:[
"html","css","javascript","react","redux","next","tailwind",
"bootstrap","typescript","vue","angular"
],

backend:[
"node","express","mongodb","mysql","postgresql","firebase",
"rest api","jwt","api","socket","redis"
],

languages:[
"c","c++","java","python","javascript","typescript","go",
"rust","kotlin"
],

aiml:[
"machine learning","deep learning","tensorflow","keras",
"opencv","pandas","numpy","scikit","ai","cnn","nlp"
],

tools:[
"github","git","docker","aws","linux","postman","vercel",
"netlify","figma","jira"
]

};

/* ===========================================================
                    COUNT KEYWORDS
=========================================================== */

function countKeywords(text, list){

    let count = 0;

    list.forEach(word=>{

        if(text.includes(word.toLowerCase())){

            count++;

        }

    });

    return count;

}

/* ===========================================================
                    DETECT DEVELOPER TYPE
=========================================================== */

function detectDeveloperType(text){

    const frontend =
    countKeywords(text,SKILLS.frontend);

    const backend =
    countKeywords(text,SKILLS.backend);

    const ai =
    countKeywords(text,SKILLS.aiml);

    if(ai>=5){

        return "AI/ML Enthusiast";

    }

    if(frontend>=4 && backend>=4){

        return "Full Stack Developer";

    }

    if(frontend>backend){

        return "Frontend Developer";

    }

    if(backend>frontend){

        return "Backend Developer";

    }

    return "Beginner";

}

/* ===========================================================
                    COUNT PROJECTS
=========================================================== */

function countProjects(text){

    const matches =
    text.match(/project/gi);

    return matches ? matches.length : 0;

}

/* ===========================================================
                    EXPERIENCE
=========================================================== */

function hasExperience(text){

    const words=[

        "internship",
        "experience",
        "freelance",
        "open source",
        "volunteer"

    ];

    return countKeywords(text,words);

}

/* ===========================================================
                    EDUCATION
=========================================================== */

function educationScore(text){

    let score = 0;

    if(text.includes("b.tech")) score+=3;

    if(text.includes("cgpa")) score+=3;

    if(text.includes("university")) score+=2;

    if(text.includes("college")) score+=2;

    return Math.min(score,10);

}

/* ===========================================================
                    SKILL SCORE
=========================================================== */

function skillScore(text){

    const totalSkills =

        countKeywords(text,SKILLS.frontend)+
        countKeywords(text,SKILLS.backend)+
        countKeywords(text,SKILLS.languages)+
        countKeywords(text,SKILLS.aiml)+
        countKeywords(text,SKILLS.tools);

    return Math.min(25,totalSkills*2);

}

/* ===========================================================
                    PROJECT SCORE
=========================================================== */

function projectScore(text){

    const projects = countProjects(text);

    if(projects===0) return 5;

    if(projects===1) return 10;

    if(projects===2) return 16;

    return 20;

}

/* ===========================================================
                    EXPERIENCE SCORE
=========================================================== */

function experienceScore(text){

    const exp = hasExperience(text);

    if(exp===0) return 4;

    if(exp===1) return 8;

    if(exp===2) return 12;

    return 15;

}

/* ===========================================================
                    FORMATTING SCORE
=========================================================== */

function formattingScore(text){

    let score = 0;

    if(text.includes("@")) score+=2;

    if(text.includes("github")) score+=2;

    if(text.includes("linkedin")) score+=2;

    if(text.includes("phone")) score+=2;

    if(text.includes("education")) score+=1;

    if(text.includes("skills")) score+=1;

    return Math.min(score,10);

}

/* ===========================================================
                    KEYWORD SCORE
=========================================================== */

function keywordScore(text){

    const keywords=[

        "problem solving",
        "leadership",
        "communication",
        "team",
        "api",
        "database",
        "cloud",
        "git",
        "dsa",
        "algorithm"

    ];

    return Math.min(

        10,

        countKeywords(text,keywords)

    );

}

/* ===========================================================
                    ATS SCORE
=========================================================== */

function calculateATS(text){

    const skills = skillScore(text);

    const projects = projectScore(text);

    const education = educationScore(text);

    const experience = experienceScore(text);

    const formatting = formattingScore(text);

    const keywords = keywordScore(text);

    const total =

        skills+
        projects+
        education+
        experience+
        formatting+
        keywords;

    return{

        atsScore:Math.min(100,total),

        sectionScores:{

            skills,

            projects,

            education,

            experience,

            formatting

        }

    };

}

/* ===========================================================
                STRENGTHS
=========================================================== */

function getStrengths(text){

    const strengths=[];

    if(skillScore(text)>=18)
        strengths.push("Strong technical skill set.");

    if(projectScore(text)>=16)
        strengths.push("Good project portfolio.");

    if(experienceScore(text)>=12)
        strengths.push("Practical industry/open-source exposure.");

    if(formattingScore(text)>=8)
        strengths.push("Well-structured resume.");

    if(keywordScore(text)>=7)
        strengths.push("Resume contains relevant recruiter keywords.");

    while(strengths.length<4){

        strengths.push("Shows willingness to learn.");

    }

    return strengths.slice(0,4);

}

/* ===========================================================
                WEAKNESSES
=========================================================== */

function getWeaknesses(text){

    const weaknesses=[];

    if(skillScore(text)<15)
        weaknesses.push("Technical skills can be improved.");

    if(projectScore(text)<16)
        weaknesses.push("More real-world projects are recommended.");

    if(experienceScore(text)<10)
        weaknesses.push("Industry exposure is limited.");

    if(formattingScore(text)<8)
        weaknesses.push("Resume formatting needs improvement.");

    if(keywordScore(text)<6)
        weaknesses.push("Important ATS keywords are missing.");

    while(weaknesses.length<4){

        weaknesses.push("Resume can be strengthened further.");

    }

    return weaknesses.slice(0,4);

}

/* ===========================================================
                MISSING SKILLS
=========================================================== */

function getMissingSkills(text){

    const allSkills=[

        "React",
        "Node.js",
        "MongoDB",
        "Git",
        "Docker",
        "AWS",
        "SQL",
        "REST API",
        "DSA",
        "Python",
        "Machine Learning",
        "System Design"

    ];

    const missing=[];

    allSkills.forEach(skill=>{

        if(!text.includes(skill.toLowerCase())){

            missing.push(skill);

        }

    });

    return missing.slice(0,5);

}

/* ===========================================================
                RECOMMENDED PROJECTS
=========================================================== */

function recommendedProjects(type){

    if(type==="Frontend Developer"){

        return [

            {
                title:"Modern Portfolio Website",
                description:"Responsive React portfolio with animations."
            },

            {
                title:"E-Commerce UI",
                description:"Frontend shopping application using React."
            },

            {
                title:"Task Management App",
                description:"React + Firebase productivity application."
            }

        ];

    }

    if(type==="Backend Developer"){

        return [

            {
                title:"REST API Server",
                description:"Node.js + Express + MongoDB API."
            },

            {
                title:"Authentication System",
                description:"JWT based login system."
            },

            {
                title:"Blog Backend",
                description:"Complete CRUD backend project."
            }

        ];

    }

    if(type==="AI/ML Enthusiast"){

        return [

            {
                title:"House Price Predictor",
                description:"Regression model using Python."
            },

            {
                title:"Image Classifier",
                description:"CNN based deep learning project."
            },

            {
                title:"Resume ATS Analyzer",
                description:"NLP based resume screening."
            }

        ];

    }

    return [

        {
            title:"Full Stack Task Manager",
            description:"React + Node + MongoDB."
        },

        {
            title:"AI Resume Analyzer",
            description:"Gemini powered ATS analyzer."
        },

        {
            title:"Placement Preparation Portal",
            description:"Complete SaaS placement platform."
        }

    ];

}

/* ===========================================================
                RESUME SUGGESTIONS
=========================================================== */

function resumeSuggestions(){

    return [

        "Add measurable achievements in every project.",

        "Include GitHub and LinkedIn profile links.",

        "Use action verbs like Built, Developed, Designed and Optimized.",

        "Keep the resume limited to one page.",

        "Tailor your resume according to the job role."

    ];

}

/* ===========================================================
                    ROADMAP
=========================================================== */

function roadmap(type){

    if(type==="AI/ML Enthusiast"){

        return [

            "Strengthen Python programming.",

            "Master Machine Learning fundamentals.",

            "Build Deep Learning projects.",

            "Practice Kaggle competitions.",

            "Prepare for AI/ML interviews."

        ];

    }

    if(type==="Frontend Developer"){

        return [

            "Master HTML, CSS and JavaScript.",

            "Build React applications.",

            "Learn Next.js and TypeScript.",

            "Create responsive UI projects.",

            "Practice frontend interview questions."

        ];

    }

    if(type==="Backend Developer"){

        return [

            "Master Node.js and Express.",

            "Build REST APIs.",

            "Learn Authentication & JWT.",

            "Deploy projects on cloud.",

            "Practice backend interview questions."

        ];

    }

    return [

        "Practice DSA consistently.",

        "Build full stack projects.",

        "Improve problem solving.",

        "Learn deployment and Git.",

        "Prepare for technical interviews."

    ];

}

/* ===========================================================
                FALLBACK ANALYZER
=========================================================== */

function generateFallbackAnalysis(resumeText){

    const text = resumeText.toLowerCase();

    const developerType = detectDeveloperType(text);

    const ats = calculateATS(text);

    return{

        atsScore:ats.atsScore,

        developerType,

        summary:

        `This resume indicates a ${developerType}. The profile demonstrates good potential with opportunities to further strengthen technical depth, projects and ATS optimisation.`,

        sectionScores:ats.sectionScores,

        strengths:getStrengths(text),

        weaknesses:getWeaknesses(text),

        missingSkills:getMissingSkills(text),

        recommendedProjects:

        recommendedProjects(developerType),

        resumeSuggestions:

        resumeSuggestions(),

        roadmap:

        roadmap(developerType)

    };

}

/* ===========================================================
                    EXPORT
=========================================================== */

module.exports = {

    generateFallbackAnalysis

};