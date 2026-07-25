window.onload = function () {
    const resumeData = JSON.parse(localStorage.getItem("resumeData"));

if (resumeData && resumeData.name) {
    const firstName = resumeData.name.split(" ")[0];

    document.getElementById("userName").innerText = firstName;
}

    const raw = localStorage.getItem("resumeData");

    if (!raw) {

        alert("Resume data not found!");

        window.location.href = "resume-upload.html";

        return;

    }
    document.body.classList.add("loaded");

    const data = JSON.parse(raw);

    /* ======================================
            HERO DETAILS
    ====================================== */

    function animateScore(finalScore){

    const score=document.getElementById("atsScore");

    let current=0;

    const interval=setInterval(()=>{

        current++;

        score.innerText=current+"%";

        if(current>=finalScore){

            clearInterval(interval);

        }

    },18);

}

animateScore(data.atsScore);

    document.getElementById("developerType").innerText =
        data.developerType;

    document.getElementById("summary").innerText =
        data.summary;

    /* ======================================
            OVERVIEW CARDS
    ====================================== */

    document.getElementById("overviewScore").innerText =
        data.atsScore + "%";

    document.getElementById("overviewDeveloper").innerText =
        data.developerType;

    document.getElementById("projectCount").innerText =
        data.recommendedProjects
            ? data.recommendedProjects.length
            : 0;

    document.getElementById("skillsCount").innerText =
        data.missingSkills
            ? data.missingSkills.length
            : 0;

    /* ======================================
            ATS LABEL
    ====================================== */

    const label = document.getElementById("scoreLabel");

    if (data.atsScore >= 85)
        label.innerText = "Excellent Resume";

    else if (data.atsScore >= 70)
        label.innerText = "Good Resume";

    else if (data.atsScore >= 50)
        label.innerText = "Needs Improvement";

    else
        label.innerText = "Needs Major Improvement";

    /* ======================================
            SECTION SCORES
    ====================================== */

    document.getElementById("skillsScore").innerText =
        data.sectionScores.skills;

    document.getElementById("projectsScore").innerText =
        data.sectionScores.projects;

    document.getElementById("experienceScore").innerText =
        data.sectionScores.experience;

    document.getElementById("educationScore").innerText =
        data.sectionScores.education;

    document.getElementById("formattingScore").innerText =
        data.sectionScores.formatting;

    /* ======================================
            ANIMATE PROGRESS BARS
    ====================================== */

    function animateBar(id, value) {

        const bar = document.getElementById(id);

        if (!bar) return;

        setTimeout(() => {

            bar.style.width = value + "%";

        }, 300);

    }

    animateBar("skillsBar", data.sectionScores.skills);
    animateBar("projectsBar", data.sectionScores.projects);
    animateBar("experienceBar", data.sectionScores.experience);
    animateBar("educationBar", data.sectionScores.education);
    animateBar("formattingBar", data.sectionScores.formatting);

    /* ======================================
            STRENGTHS / WEAKNESSES
    ====================================== */

    function renderCards(id, array, className, emptyMessage) {

        const container = document.getElementById(id);

        if (!container) return;

        container.innerHTML = "";

        if (!array || array.length === 0) {

            container.innerHTML =
                `<p class="empty-message">${emptyMessage}</p>`;

            return;

        }

        array.forEach(item => {

            const card = document.createElement("div");

            card.className = className;

            card.innerHTML = `
                <i class="fa-solid fa-circle-check"></i>
                <span>${item}</span>
            `;

            container.appendChild(card);

        });

    }

    renderCards(
        "strengths",
        data.strengths,
        "strength-card",
        "No strengths available."
    );

    renderCards(
        "weaknesses",
        data.weaknesses,
        "weakness-card",
        "No weaknesses available."
    );

    /* ======================================
            MISSING SKILLS
    ====================================== */

    const skillsContainer =
        document.getElementById("missingSkills");

    skillsContainer.innerHTML = "";

    if (!data.missingSkills || data.missingSkills.length === 0) {

        skillsContainer.innerHTML =
            `<p class="empty-message">
            No missing skills detected.
            </p>`;

    }

    else {

        data.missingSkills.forEach(skill => {

            const chip = document.createElement("span");

            chip.className = "skill-chip";

            chip.innerText = skill;

            skillsContainer.appendChild(chip);

        });

    }

    /* ======================================
            AI SUGGESTIONS
    ====================================== */

    const suggestionList =
        document.getElementById("resumeSuggestions");

    suggestionList.innerHTML = "";

    if (!data.resumeSuggestions ||
        data.resumeSuggestions.length === 0) {

        suggestionList.innerHTML =
            `<li>No suggestions available.</li>`;

    }

    else {

        data.resumeSuggestions.forEach(item => {

            const li = document.createElement("li");

            li.innerText = item;

            suggestionList.appendChild(li);

        });

    }

    /* ======================================
            PROJECTS
    ====================================== */

    const projectContainer =
        document.getElementById("projects");

    projectContainer.innerHTML = "";

    if (!data.recommendedProjects ||
        data.recommendedProjects.length === 0) {

        projectContainer.innerHTML =
            `<p class="empty-message">
            No projects available.
            </p>`;

    }

    else {

        data.recommendedProjects.forEach(project => {

            const card = document.createElement("div");

            card.className = "project-card";

            card.innerHTML = `

                <h3>${project.title}</h3>

                <p>${project.description}</p>

            `;

            projectContainer.appendChild(card);

        });

    }

    /* ======================================
            ROADMAP
    ====================================== */

    const roadmap =
        document.getElementById("roadmap");

    roadmap.innerHTML = "";

    if (!data.roadmap || data.roadmap.length === 0) {

        roadmap.innerHTML =
            `<li>No roadmap available.</li>`;

    }

    else {

        data.roadmap.forEach(step => {

            const li = document.createElement("li");

            li.innerText = step;

            roadmap.appendChild(li);

        });

    }

    /* ======================================
            INTERVIEW BUTTON
    ====================================== */

    const interviewBtn =
        document.getElementById("startInterviewBtn");

    if (interviewBtn) {

        interviewBtn.onclick = function () {

            window.location.href = "interview.html";

        };

    }

};

const downloadBtn = document.getElementById("downloadReportBtn");

if (downloadBtn) {
    downloadBtn.addEventListener("click", generatePDFReport);
}

function generatePDFReport() {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF("p", "mm", "a4");

    const resume = JSON.parse(localStorage.getItem("resumeData"));

    if (!resume) {
        alert("Resume data not found.");
        return;
    }

    let y = 20;

    /* ==========================================
                HEADER
    ========================================== */

    doc.setFillColor(37,99,235);
    doc.rect(0,0,210,30,"F");

    doc.setFont("helvetica","bold");
    doc.setFontSize(22);
    doc.setTextColor(255,255,255);
    doc.text("PlacePrep AI",20,16);

    doc.setFontSize(11);
    doc.text("Professional Resume Analysis Report",20,23);

    doc.setTextColor(0,0,0);

    y = 42;

    /* ==========================================
            CANDIDATE DETAILS
    ========================================== */

    doc.setFont("helvetica","bold");
    doc.setFontSize(15);
    doc.text("Candidate Details",20,y);

    y += 10;

    doc.setFont("helvetica","normal");
    doc.setFontSize(12);

    doc.text(`Name : ${resume.name || "N/A"}`,20,y);

    y += 8;

    doc.text(`Developer Type : ${resume.developerType || "N/A"}`,20,y);

    y += 8;

    doc.text(`Email : ${resume.email || "Not Available"}`,20,y);

    y += 8;

    doc.text(`Phone : ${resume.phone || "Not Available"}`,20,y);

    y += 8;

    const today = new Date().toLocaleDateString();

    doc.text(`Generated : ${today}`,20,y);

    y += 14;

    /* ==========================================
                ATS CARD
    ========================================== */

    doc.setFillColor(246,248,252);

    doc.roundedRect(18,y,174,38,5,5,"F");

    doc.setFont("helvetica","bold");
    doc.setFontSize(14);

    doc.text("ATS SCORE",28,y+11);

    let scoreColor = [34,197,94];

    if(resume.atsScore < 70)
        scoreColor = [234,179,8];

    if(resume.atsScore < 50)
        scoreColor = [239,68,68];

    doc.setTextColor(...scoreColor);

    doc.setFontSize(28);

    doc.text(`${resume.atsScore}%`,145,y+20);

    doc.setTextColor(0,0,0);

    let label = "Excellent Resume";

    if(resume.atsScore < 85)
        label = "Good Resume";

    if(resume.atsScore < 70)
        label = "Needs Improvement";

    if(resume.atsScore < 50)
        label = "Major Improvements Needed";

    doc.setFontSize(12);
    doc.text(label,28,y+28);

    y += 50;

    /* ==========================================
            SECTION ANALYSIS
    ========================================== */

    doc.setFont("helvetica","bold");
    doc.setFontSize(15);

    doc.text("Section Analysis",20,y);

    y += 10;

    const scores = [

        {
            label:"Skills",
            value:resume.sectionScores?.skills || 0
        },

        {
            label:"Projects",
            value:resume.sectionScores?.projects || 0
        },

        {
            label:"Experience",
            value:resume.sectionScores?.experience || 0
        },

        {
            label:"Education",
            value:resume.sectionScores?.education || 0
        },

        {
            label:"Formatting",
            value:resume.sectionScores?.formatting || 0
        }

    ];

    scores.forEach(item=>{

        doc.setFont("helvetica","normal");
        doc.setFontSize(11);

        doc.text(item.label,20,y);

        doc.text(`${item.value}/100`,170,y);

        doc.setFillColor(230,230,230);

        doc.roundedRect(58,y-4,95,5,2,2,"F");

        doc.setFillColor(37,99,235);

        doc.roundedRect(

            58,

            y-4,

            (95*item.value)/100,

            5,

            2,

            2,

            "F"

        );

        y += 11;

    });

    y += 10;

    /* ==========================================
                SUMMARY
    ========================================== */

    doc.setFont("helvetica","bold");
    doc.setFontSize(15);

    doc.text("Professional Summary",20,y);

    y += 8;

    doc.setFont("helvetica","normal");
    doc.setFontSize(11);

    const summary = doc.splitTextToSize(
        resume.summary || "",
        170
    );

    doc.text(summary,20,y);

    y += summary.length*6 + 10;

        /* ==========================================
                STRENGTHS
    ========================================== */

    if (y > 235) {
        doc.addPage();
        y = 20;
    }

    doc.setFont("helvetica","bold");
    doc.setFontSize(15);
    doc.text("Strengths",20,y);

    y += 10;

    (resume.strengths || []).forEach(item=>{

        doc.setFillColor(236,253,245);

        doc.roundedRect(20,y-5,170,10,3,3,"F");

        doc.setTextColor(22,101,52);

        doc.setFont("helvetica","bold");
        doc.text("✓",26,y+1);

        doc.setTextColor(0,0,0);

        doc.setFont("helvetica","normal");

        const lines = doc.splitTextToSize(item,150);

        doc.text(lines,34,y+1);

        y += Math.max(lines.length*6,10);

        y += 3;

    });

    y += 5;

    /* ==========================================
                WEAKNESSES
    ========================================== */

    if (y > 230) {
        doc.addPage();
        y = 20;
    }

    doc.setFont("helvetica","bold");
    doc.setFontSize(15);
    doc.text("Areas To Improve",20,y);

    y += 10;

    (resume.weaknesses || []).forEach(item=>{

        doc.setFillColor(255,247,237);

        doc.roundedRect(20,y-5,170,10,3,3,"F");

        doc.setTextColor(194,65,12);

        doc.setFont("helvetica","bold");
        doc.text("!",27,y+1);

        doc.setTextColor(0,0,0);

        doc.setFont("helvetica","normal");

        const lines = doc.splitTextToSize(item,150);

        doc.text(lines,34,y+1);

        y += Math.max(lines.length*6,10);

        y += 3;

    });

    y += 6;

    /* ==========================================
                MISSING SKILLS
    ========================================== */

    if (y > 230) {
        doc.addPage();
        y = 20;
    }

    doc.setFont("helvetica","bold");
    doc.setFontSize(15);
    doc.text("Missing Skills",20,y);

    y += 10;

    let x = 20;

    (resume.missingSkills || []).forEach(skill=>{

        const width = doc.getTextWidth(skill)+10;

        if(x+width>180){

            x=20;

            y+=10;

        }

        doc.setFillColor(219,234,254);

        doc.roundedRect(x,y-5,width,8,3,3,"F");

        doc.setFontSize(10);

        doc.text(skill,x+5,y);

        x += width + 5;

    });

    y += 18;

    /* ==========================================
            RESUME SUGGESTIONS
    ========================================== */

    if (y > 220) {
        doc.addPage();
        y = 20;
    }

    doc.setFont("helvetica","bold");
    doc.setFontSize(15);

    doc.text("AI Resume Suggestions",20,y);

    y += 10;

    (resume.resumeSuggestions || []).forEach(item=>{

        doc.setFont("helvetica","normal");

        const lines = doc.splitTextToSize("• " + item,165);

        doc.text(lines,24,y);

        y += lines.length*6 + 2;

    });

    y += 8;
        /* ==========================================
            RECOMMENDED PROJECTS
    ========================================== */

    if (y > 200) {
        doc.addPage();
        y = 20;
    }

    doc.setFont("helvetica","bold");
    doc.setFontSize(15);
    doc.text("Recommended Projects",20,y);

    y += 10;

    (resume.recommendedProjects || []).forEach(project=>{

        if(y>245){

            doc.addPage();
            y=20;

        }

        doc.setFillColor(248,250,252);

        doc.roundedRect(20,y-5,170,22,3,3,"F");

        doc.setFont("helvetica","bold");
        doc.setFontSize(12);

        doc.text(project.title || "Project",25,y+2);

        doc.setFont("helvetica","normal");
        doc.setFontSize(10);

        const desc = doc.splitTextToSize(
            project.description || "",
            155
        );

        doc.text(desc,25,y+8);

        y += Math.max(desc.length*5 + 12,24);

    });

    y += 8;

    /* ==========================================
                ROADMAP
    ========================================== */

    if (y > 210) {
        doc.addPage();
        y = 20;
    }

    doc.setFont("helvetica","bold");
    doc.setFontSize(15);
    doc.text("Learning Roadmap",20,y);

    y += 10;

    (resume.roadmap || []).forEach((step,index)=>{

        if(y>270){

            doc.addPage();
            y=20;

        }

        doc.setFillColor(37,99,235);

        doc.circle(25,y-1,3,"F");

        doc.setTextColor(255,255,255);

        doc.setFontSize(9);
        doc.text(String(index+1),24,y);

        doc.setTextColor(0,0,0);

        doc.setFontSize(11);

        const lines = doc.splitTextToSize(step,155);

        doc.text(lines,33,y);

        y += lines.length*6 + 4;

    });

    /* ==========================================
                FOOTER
    ========================================== */

    const totalPages = doc.getNumberOfPages();

    for(let i=1;i<=totalPages;i++){

        doc.setPage(i);

        doc.setDrawColor(220);

        doc.line(20,285,190,285);

        doc.setFont("helvetica","italic");
        doc.setFontSize(9);

        doc.setTextColor(120);

        doc.text(
            "Generated by PlacePrep AI",
            20,
            291
        );

        doc.text(
            `Page ${i} of ${totalPages}`,
            165,
            291
        );

    }

    /* ==========================================
                SAVE PDF
    ========================================== */

    const filename =
        `${(resume.name || "Resume").replace(/\s+/g,"_")}_ATS_Report.pdf`;

    doc.save(filename);

}