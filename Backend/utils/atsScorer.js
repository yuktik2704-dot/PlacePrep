function calculateATS(data) {

    let score = 0;

    const sectionScores = {
        skills: 0,
        projects: 0,
        experience: 0,
        education: 0,
        formatting: 80
    };

    /* Basic Details */

    if (data.name) score += 5;

    if (data.email) score += 5;

    if (data.phone) score += 5;

    if (data.github) score += 5;

    if (data.linkedin) score += 5;

    /* Education */

    if (data.education) {

        score += 15;
        sectionScores.education = 90;

    }

    else {

        sectionScores.education = 20;

    }

    /* Experience */

    if (data.experience) {

        score += 15;
        sectionScores.experience = 80;

    }

    else {

        sectionScores.experience = 20;

    }

    /* Skills */

    const skillScore = Math.min(data.skills.length * 2, 20);

    score += skillScore;

    sectionScores.skills = Math.min(skillScore * 5, 100);

    /* Projects */

    const projectScore = Math.min(data.projects.length * 3, 15);

    score += projectScore;

    sectionScores.projects = Math.min(projectScore * 6, 100);

    score = Math.min(score, 100);

    return {

        atsScore: score,

        sectionScores

    };

}

module.exports = {

    calculateATS

};