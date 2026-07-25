function generateFallbackEvaluation(answers){

    const totalQuestions = answers.length;

    let answered = 0;

    let totalLength = 0;

    answers.forEach(answer=>{

        if(answer && answer.trim() !== ""){

            answered++;

            totalLength += answer.trim().length;

        }

    });

    const averageLength =

        answered === 0 ? 0 :

        Math.floor(totalLength / answered);

    let technicalScore = 70;

    let communicationScore = 75;

    let confidenceScore = 72;

    if(averageLength > 150){

        technicalScore += 10;

        communicationScore += 8;

    }

    if(answered === totalQuestions){

        confidenceScore += 10;

    }

    if(averageLength > 250){

        technicalScore += 5;

    }

    technicalScore = Math.min(technicalScore,100);

    communicationScore = Math.min(communicationScore,100);

    confidenceScore = Math.min(confidenceScore,100);

    const overallScore = Math.round(

        (

            technicalScore +

            communicationScore +

            confidenceScore

        ) / 3

    );

    return{

        overallScore,

        technicalScore,

        communicationScore,

        confidenceScore,

        strengths:[

            "Answered most interview questions.",

            "Demonstrated good communication.",

            "Showed willingness to solve problems."

        ],

        improvements:[

            "Explain your thought process more clearly.",

            "Improve technical depth with more examples.",

            "Practice DSA and mock interviews regularly."

        ],

        finalFeedback:

        "This evaluation was generated using the fallback engine because the AI service was temporarily unavailable. Overall, your interview performance was good. Continue practicing technical concepts, improve structured communication, and participate in more mock interviews to build confidence."

    };

}

module.exports={

    generateFallbackEvaluation

};