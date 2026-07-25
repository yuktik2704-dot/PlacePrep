function generateFallbackInterview(resume) {

    const questions = [];

    questions.push({
        id: 1,
        type: "HR",
        question: "Tell me about yourself."
    });

    questions.push({
        id: 2,
        type: "Resume",
        question: "Walk me through your resume."
    });

    if (resume.existingProjects.length > 0) {

        questions.push({
            id: 3,
            type: "Projects",
            question: `Explain your project "${resume.existingProjects[0]}".`
        });

    }
    else {

        questions.push({
            id: 3,
            type: "Projects",
            question: "Describe your favorite project."
        });

    }

    if (resume.skills.includes("Node.js")) {

        questions.push({
            id: 4,
            type: "Technical",
            question: "Explain the Node.js Event Loop."
        });

    }

    if (resume.skills.includes("Express")) {

        questions.push({
            id: 5,
            type: "Technical",
            question: "Why do we use Express.js?"
        });

    }

    if (resume.skills.includes("MongoDB")) {

        questions.push({
            id: 6,
            type: "Database",
            question: "Difference between MongoDB and MySQL?"
        });

    }

    if (resume.skills.includes("React")) {

        questions.push({
            id: 7,
            type: "Frontend",
            question: "What are React Hooks?"
        });

    }

    questions.push({
        id: 8,
        type: "DSA",
        question: "Explain Binary Search."
    });

    questions.push({
        id: 9,
        type: "Behavioural",
        question: "Tell me about a challenge you faced while building a project."
    });

    questions.push({
        id: 10,
        type: "HR",
        question: "Why should we hire you?"
    });

    return {

        questions

    };

}

module.exports = {

    generateFallbackInterview

};