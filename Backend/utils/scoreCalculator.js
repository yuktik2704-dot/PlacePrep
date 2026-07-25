function calculateScores(questions, answers) {

    let technical = 0;
    let communication = 0;
    let confidence = 0;

    const technicalWords = [
        "algorithm","database","api","backend","frontend",
        "react","node","express","mongodb","sql","python",
        "java","c++","javascript","machine learning",
        "ai","model","optimization","debug","deploy",
        "git","github","docker","cloud"
    ];

    const confidenceWords = [
        "led","managed","created","implemented",
        "designed","built","developed","optimized",
        "improved","solved","achieved","delivered",
        "organized","handled","owned"
    ];

    answers.forEach(answer=>{

        const text = (answer || "").toLowerCase();

        const words = text.split(/\s+/);

        // Communication

        if(words.length > 80)
            communication += 10;

        else if(words.length > 40)
            communication += 8;

        else if(words.length > 20)
            communication += 6;

        else
            communication += 3;

        // Technical

        technicalWords.forEach(word=>{

            if(text.includes(word))
                technical += 3;

        });

        // Confidence

        confidenceWords.forEach(word=>{

            if(text.includes(word))
                confidence += 4;

        });

    });

    technical = Math.min(100,technical);

    communication = Math.min(100,communication);

    confidence = Math.min(100,confidence);

    const overall = Math.round(

        technical*0.45 +

        communication*0.30 +

        confidence*0.25

    );

    return{

        overallScore:overall,

        technicalScore:technical,

        communicationScore:communication,

        confidenceScore:confidence

    };

}

module.exports = {

    calculateScores

};