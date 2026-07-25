/* ===========================================
        LOAD REPORT
=========================================== */

const report = JSON.parse(

    localStorage.getItem("interviewReport")

);

if(!report){

    alert("Interview report not found.");

    window.location.href = "dashboard.html";

}

/* ===========================================
        ELEMENTS
=========================================== */

const overallScore = document.getElementById("overallScore");

const technicalScore = document.getElementById("technicalScore");

const communicationScore = document.getElementById("communicationScore");

const confidenceScore = document.getElementById("confidenceScore");

const technicalBar = document.getElementById("technicalBar");

const communicationBar = document.getElementById("communicationBar");

const confidenceBar = document.getElementById("confidenceBar");

const strengthList = document.getElementById("strengthList");

const improvementList = document.getElementById("improvementList");

const feedback = document.getElementById("feedback");

/* ===========================================
        ANIMATE NUMBER
=========================================== */

function animateNumber(element, target){

    let current = 0;

    const interval = setInterval(()=>{

        current++;

        element.innerText = current;

        if(current >= target){

            clearInterval(interval);

        }

    },15);

}

/* ===========================================
        LOAD SCORES
=========================================== */

animateNumber(

    overallScore,

    report.overallScore

);

animateNumber(

    technicalScore,

    report.technicalScore

);

animateNumber(

    communicationScore,

    report.communicationScore

);

animateNumber(

    confidenceScore,

    report.confidenceScore

);

/* ===========================================
        PROGRESS BARS
=========================================== */

technicalBar.style.width =
`${report.technicalScore}%`;

communicationBar.style.width =
`${report.communicationScore}%`;

confidenceBar.style.width =
`${report.confidenceScore}%`;

/* ===========================================
        STRENGTHS
=========================================== */

report.strengths.forEach(item=>{

    const li = document.createElement("li");

    li.innerText = item;

    strengthList.appendChild(li);

});

/* ===========================================
        IMPROVEMENTS
=========================================== */

report.improvements.forEach(item=>{

    const li = document.createElement("li");

    li.innerText = item;

    improvementList.appendChild(li);

});

/* ===========================================
        FEEDBACK
=========================================== */

feedback.innerText = report.finalFeedback;

/* ===========================================
        BUTTONS
=========================================== */

document

.getElementById("dashboardBtn")

.addEventListener("click",()=>{

    window.location.href="dashboard.html";

});

document

.getElementById("retakeBtn")

.addEventListener("click",()=>{

    window.location.href="interview.html";

});