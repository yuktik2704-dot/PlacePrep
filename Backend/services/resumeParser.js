/* ==========================================================
                    RESUME PARSER
========================================================== */

/*
    This file is ONLY responsible for extracting
    information from raw resume text.

    No database logic.
    No Gemini logic.
    No ATS logic.
*/

/* ==========================================================
                    NAME
========================================================== */

function extractName(resumeText){

    const lines = resumeText.split("\n");

    const ignored = [

        "resume",
        "curriculum vitae",
        "cv"

    ];

    for(const line of lines){

        const current = line.trim();

        if(current === "") continue;

        if(ignored.includes(current.toLowerCase())) continue;

        if(current.length > 40) continue;

        return current;

    }

    return "";

}

/* ==========================================================
                    EMAIL
========================================================== */

function extractEmail(resumeText){

    const regex =
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;

    const match = resumeText.match(regex);

    return match ? match[0] : "";

}

/* ==========================================================
                    PHONE
========================================================== */

function extractPhone(resumeText){

    const regex =
    /(\+91[\s-]?)?[6-9]\d{9}/;

    const match = resumeText.match(regex);

    return match ? match[0] : "";

}

/* ==========================================================
                    GITHUB
========================================================== */

function extractGithub(resumeText){

    const regex =
    /https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+/i;

    const match = resumeText.match(regex);

    return match ? match[0] : "";

}

/* ==========================================================
                    LINKEDIN
========================================================== */

function extractLinkedin(resumeText){

    const regex =
    /https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/i;

    const match = resumeText.match(regex);

    return match ? match[0] : "";

}

/* ==========================================================
                    EDUCATION
========================================================== */

function extractEducation(resumeText){

    const lines = resumeText.split("\n");

    let education = "";

    let collecting = false;

    const stopHeadings = [

        "SKILLS",
        "TECHNICAL SKILLS",
        "PROJECTS",
        "PERSONAL PROJECTS",
        "WORK EXPERIENCE",
        "EXPERIENCE",
        "CERTIFICATIONS",
        "ACHIEVEMENTS"

    ];

    for(const line of lines){

        const current = line.trim();

        if(current.toUpperCase() === "EDUCATION"){

            collecting = true;

            continue;

        }

        if(
            collecting &&
            stopHeadings.includes(current.toUpperCase())
        ){

            break;

        }

        if(collecting){

            education += current + "\n";

        }

    }

    return education.trim();

}

/* ==========================================================
                    EXPERIENCE
========================================================== */

function extractExperience(resumeText){

    const lines = resumeText.split("\n");

    let experience = "";

    let collecting = false;

    const headings = [

        "WORK EXPERIENCE",
        "EXPERIENCE",
        "INTERNSHIP",
        "INTERNSHIPS"

    ];

    const stopHeadings = [

        "EDUCATION",
        "SKILLS",
        "PROJECTS",
        "CERTIFICATIONS",
        "ACHIEVEMENTS"

    ];

    for(const line of lines){

        const current = line.trim();

        if(headings.includes(current.toUpperCase())){

            collecting = true;

            continue;

        }

        if(
            collecting &&
            stopHeadings.includes(current.toUpperCase())
        ){

            break;

        }

        if(collecting){

            experience += current + "\n";

        }

    }

    return experience.trim();

}

/* ==========================================================
                    PROJECTS
========================================================== */

function extractProjects(resumeText){

    const lines = resumeText.split("\n");

    const projects = [];

    let collecting = false;

    const startHeadings = [

        "PROJECTS",
        "PERSONAL PROJECTS",
        "ACADEMIC PROJECTS",
        "PROJECT"

    ];

    const stopHeadings = [

        "SKILLS",
        "TECHNICAL SKILLS",
        "EDUCATION",
        "WORK EXPERIENCE",
        "EXPERIENCE",
        "CERTIFICATIONS",
        "ACHIEVEMENTS",
        "LANGUAGES",
        "INTERESTS"

    ];

    for(const line of lines){

        const current = line.trim();

        if(startHeadings.includes(current.toUpperCase())){

            collecting = true;

            continue;

        }

        if(
            collecting &&
            stopHeadings.includes(current.toUpperCase())
        ){

            break;

        }

        if(!collecting || current === "") continue;

        projects.push(current);

    }

    return projects;

}

/* ==========================================================
                    SKILLS
========================================================== */

function extractSkills(resumeText){

    const allSkills = [

        "C",
        "C++",
        "Java",
        "Python",

        "JavaScript",
        "TypeScript",

        "HTML",
        "CSS",

        "Bootstrap",
        "Tailwind",

        "React",
        "Angular",
        "Vue",

        "Node.js",
        "Express",
        "Express.js",

        "MongoDB",
        "MySQL",
        "SQL",
        "PostgreSQL",

        "Git",
        "GitHub",

        "REST API",
        "REST APIs",

        "JWT",

        "DSA",
        "Data Structures",
        "Algorithms",

        "OOP",

        "NumPy",
        "Pandas",

        "TensorFlow",
        "PyTorch",

        "Machine Learning",
        "Deep Learning",
        "NLP"

    ];

    const lower = resumeText.toLowerCase();

    const skills = [];

    for(const skill of allSkills){

        if(lower.includes(skill.toLowerCase())){

            skills.push(skill);

        }

    }

    return [...new Set(skills)];

}

/* ==========================================================
                    PARSE RESUME
========================================================== */

function parseResume(resumeText){

    return{

        name:extractName(resumeText),

        email:extractEmail(resumeText),

        phone:extractPhone(resumeText),

        github:extractGithub(resumeText),

        linkedin:extractLinkedin(resumeText),

        education:extractEducation(resumeText),

        experience:extractExperience(resumeText),

        existingProjects:extractProjects(resumeText),

        skills:extractSkills(resumeText)

    };

}

/* ==========================================================
                    EXPORTS
========================================================== */

module.exports={

    parseResume,

    extractName,

    extractEmail,

    extractPhone,

    extractGithub,

    extractLinkedin,

    extractEducation,

    extractExperience,

    extractProjects,

    extractSkills

};