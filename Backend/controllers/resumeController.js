const Resume = require("../models/resumeModel");

const {

    analyzeResume

} = require("../services/geminiService");

const {

    generateFallbackAnalysis

} = require("../services/fallbackAnalyzer");

const pdfParse = require("pdf-parse");

const fs = require("fs");

/* ==========================================================
                    BASIC EXTRACTION HELPERS
========================================================== */

function extractEmail(resumeText){

    const regex =

    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;

    const match = resumeText.match(regex);

    return match ? match[0] : "";

}

function extractPhone(resumeText){

    const regex =

    /(\+91[\s-]?)?[6-9]\d{9}/;

    const match = resumeText.match(regex);

    return match ? match[0] : "";

}

function extractGithub(resumeText){

    const regex =

    /https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+/i;

    const match = resumeText.match(regex);

    return match ? match[0] : "";

}

function extractLinkedin(resumeText){

    const regex =

    /https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/i;

    const match = resumeText.match(regex);

    return match ? match[0] : "";

}

function extractName(resumeText){

    const ignored = [

        "resume",

        "curriculum vitae",

        "cv"

    ];

    const lines = resumeText.split("\n");

    for(const line of lines){

        const current = line.trim();

        if(current==="") continue;

        if(ignored.includes(current.toLowerCase()))

            continue;

        if(current.length>40)

            continue;

        return current;

    }

    return "";

}

function extractEducation(resumeText){

    const lines = resumeText.split("\n");

    let education = "";

    let collecting = false;

    const stopHeadings = [

        "SKILLS",

        "TECHNICAL SKILLS",

        "PROJECTS",

        "WORK EXPERIENCE",

        "EXPERIENCE",

        "CERTIFICATIONS",

        "ACHIEVEMENTS"

    ];

    for(const line of lines){

        const current = line.trim();

        if(current.toUpperCase()==="EDUCATION"){

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

        if(!collecting || current==="")

            continue;

        projects.push(current);

    }

    return projects;

}

function extractSkills(resumeText){

    const allSkills = [

        "C","C++","Java","Python","JavaScript","TypeScript",

        "HTML","CSS","Bootstrap","Tailwind","React","Angular","Vue",

        "Node.js","Express","Express.js",

        "MongoDB","MySQL","SQL","PostgreSQL",

        "Git","GitHub",

        "REST API","REST APIs","JWT",

        "DSA","Data Structures","Algorithms","OOP",

        "Pandas","NumPy","TensorFlow","PyTorch",

        "Machine Learning","Deep Learning","NLP"

    ];

    const lowerText = resumeText.toLowerCase();

    const skills = [];

    for(const skill of allSkills){

        if(lowerText.includes(skill.toLowerCase())){

            skills.push(skill);

        }

    }

    return [...new Set(skills)];

}

/* ==========================================================
                    UPLOAD RESUME
========================================================== */

const uploadResume = async(req,res)=>{

    try{

        if(!req.file){

            return res.status(400).json({

                success:false,

                message:"Resume PDF is required."

            });

        }

        const pdfBuffer = fs.readFileSync(req.file.path);

        const pdfData = await pdfParse(pdfBuffer);

        const resumeText = pdfData.text;

        const extractedName = extractName(resumeText);

        const extractedEmail = extractEmail(resumeText);

        const extractedPhone = extractPhone(resumeText);

        const extractedGithub = extractGithub(resumeText);

        const extractedLinkedin = extractLinkedin(resumeText);

        const extractedEducation = extractEducation(resumeText);

        const extractedExperience = extractExperience(resumeText);

        const existingProjects = extractProjects(resumeText);

        const skills = extractSkills(resumeText);

        let analysis;

        try{

            analysis = await analyzeResume(resumeText);

            
console.log(JSON.stringify(analysis, null, 2));
        }

        catch(err){

            

            console.log(err.message);

           
            analysis = generateFallbackAnalysis(resumeText);

        }

        const savedResume = await Resume.create({

            name: extractedName,

            email: extractedEmail,

            phone: extractedPhone,

            github: extractedGithub,

            linkedin: extractedLinkedin,

            education: extractedEducation,

            experience: extractedExperience,

            skills,

            existingProjects,

            resumeText,

            atsScore: analysis.atsScore,

            developerType: analysis.developerType,

            summary: analysis.summary,

            sectionScores: analysis.sectionScores,

            strengths: analysis.strengths,

            weaknesses: analysis.weaknesses,

            missingSkills: analysis.missingSkills,

            recommendedProjects: analysis.recommendedProjects,

            roadmap: analysis.roadmap,

            resumeSuggestions: analysis.resumeSuggestions

        });
        
        console.log(JSON.stringify(savedResume, null, 2));

        return res.status(200).json({

            success:true,

            message:"Resume analyzed successfully.",

            savedResume

        });

    }

    catch(error){

        console.log(error);

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

/* ==========================================================
                    GET ALL RESUMES
========================================================== */

const getAllResumes = async(req,res)=>{

    try{

        const resumes = await Resume.find();

        return res.status(200).json({

            success:true,

            totalResumes:resumes.length,

            resumes

        });

    }

    catch(error){

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

/* ==========================================================
                    GET RESUME BY ID
========================================================== */

const getResumeById = async(req,res)=>{

    try{

        const resume = await Resume.findById(req.params.id);

        if(!resume){

            return res.status(404).json({

                success:false,

                message:"Resume not found."

            });

        }

        return res.status(200).json({

            success:true,

            resume

        });

    }

    catch(error){

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

/* ==========================================================
                    UPDATE RESUME
========================================================== */

const updateResume = async(req,res)=>{

    try{

        const updatedResume = await Resume.findByIdAndUpdate(

            req.params.id,

            req.body,

            {

                new:true,

                runValidators:true

            }

        );

        if(!updatedResume){

            return res.status(404).json({

                success:false,

                message:"Resume not found."

            });

        }

        return res.status(200).json({

            success:true,

            message:"Resume updated successfully.",

            updatedResume

        });

    }

    catch(error){

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

/* ==========================================================
                    DELETE RESUME
========================================================== */

const deleteResume = async(req,res)=>{

    try{

        const deletedResume = await Resume.findByIdAndDelete(

            req.params.id

        );

        if(!deletedResume){

            return res.status(404).json({

                success:false,

                message:"Resume not found."

            });

        }

        return res.status(200).json({

            success:true,

            message:"Resume deleted successfully."

        });

    }

    catch(error){

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

/* ==========================================================
                    EXPORTS
========================================================== */

module.exports={

    uploadResume,

    getAllResumes,

    getResumeById,

    updateResume,

    deleteResume

};


