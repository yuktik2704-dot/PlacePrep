const Resume = require("../models/resumeModel");
const { calculateScores } = require("../utils/scoreCalculator");
const {

generateInterviewQuestions,
evaluateInterview

}=require("../services/geminiService");

const startInterview = async(req,res)=>{

try{

const resume=await Resume.findById(req.params.id);

if(!resume){

return res.status(404).json({

success:false,

message:"Resume not found"

});

}

const questions=

await generateInterviewQuestions(resume);

return res.json({

success:true,

questions

});

}

catch(error){

return res.status(500).json({

success:false,

message:error.message

});

}

};
const evaluateInterviewController = async(req,res)=>{

    try{

        const answers = req.body.answers;

        /* Local numerical scoring */

        const scores = calculateScores([], answers);

        /* Gemini / Fallback textual feedback */

        const feedback = await evaluateInterview(answers);

        const report = {

            overallScore: scores.overallScore,

            technicalScore: scores.technicalScore,

            communicationScore: scores.communicationScore,

            confidenceScore: scores.confidenceScore,

            strengths: feedback.strengths,

            improvements: feedback.improvements,

            finalFeedback: feedback.finalFeedback

        };

        return res.json({

            success:true,

            report

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

module.exports={

startInterview,
evaluateInterviewController

};