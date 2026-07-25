/* ===========================================
        AI INTERVIEW
=========================================== */

const resumeData = JSON.parse(
    localStorage.getItem("resumeData")
);

const resumeId = localStorage.getItem("resumeId");

const roleName = document.getElementById("roleName");
const questionText = document.getElementById("questionText");
const questionCount = document.getElementById("questionCount");

const answerBox = document.getElementById("answer");

const timer = document.getElementById("timer");

const micBtn = document.getElementById("micBtn");
const micText = document.getElementById("micText");

const nextBtn = document.getElementById("nextBtn");

const ring = document.getElementById("ringProgress");
const progressBar = document.getElementById("progress");

const wordCount = document.getElementById("wordCount");

const leadChip = document.getElementById("leadChip");
const commChip = document.getElementById("commChip");
const probChip = document.getElementById("probChip");

if(resumeData){
    roleName.innerText = resumeData.developerType;
}

let questions = [];
let currentQuestion = 0;
let answers = [];

let recognition = null;
let isRecording = false;

let timerInterval = null;
let timeLeft = 120;

/* ===========================================
        LOAD QUESTIONS
=========================================== */

async function loadQuestions(){

    try{

        const response = await fetch(
    `https://placeprep-sb9x.onrender.com/api/interview/start/${resumeId}`
);

        const data = await response.json();

        console.log("Interview API:", data);

        if(!data.success){

            showToast("Interview could not be loaded.");
            return;

        }

        questions = data.questions.questions;

        currentQuestion = 0;

        showQuestion();

        startTimer();

    }

    catch(err){

        console.error(err);

        showToast("Unable to connect to server.");

    }

}

/* ===========================================
        SHOW QUESTION
=========================================== */

function showQuestion(){

    if(!questions.length) return;

    questionCount.innerText =
`${currentQuestion + 1} / ${questions.length}`;

    questionText.innerText =
    questions[currentQuestion].question;

    answerBox.value =
    answers[currentQuestion] || "";

    // Reset word counter
    const text = answerBox.value.trim();
    const words = text === "" ? 0 : text.split(/\s+/).length;
    wordCount.innerText = words + " Words";

    // Reset chips
    leadChip.classList.remove("active");
    commChip.classList.remove("active");
    probChip.classList.remove("active");

    // Update old progress bar if it still exists
    if(progressBar){

        progressBar.style.width =
        `${((currentQuestion+1)/questions.length)*100}%`;

    }

    // Circular Progress
    if(ring){

        const circumference = 163;

        const progressValue =
        (currentQuestion + 1) / questions.length;

        ring.style.strokeDashoffset =
        circumference - (progressValue * circumference);

    }

}

/* ===========================================
        TIMER
=========================================== */

function startTimer(){

    clearInterval(timerInterval);

    timeLeft = 120;

    updateTimer();

    timerInterval = setInterval(()=>{

        timeLeft--;

        updateTimer();

        if(timeLeft<=0){

            clearInterval(timerInterval);

            nextQuestion();

        }

    },1000);

}

function updateTimer(){

    const minutes=Math.floor(timeLeft/60);

    const seconds=timeLeft%60;

    timer.innerText =
    `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;

}

/* ===========================================
        NEXT QUESTION
=========================================== */

function nextQuestion(){

    answers[currentQuestion] = answerBox.value;

    if(isRecording){

        recognition.stop();

        isRecording = false;

        micBtn.classList.remove("recording");

        micText.innerText = "Start Speaking";

    }

    if(currentQuestion < questions.length-1){

        currentQuestion++;

        const box =
        document.querySelector(".question-box");

        if(box){

            box.classList.add("hide");

            setTimeout(()=>{

                showQuestion();

                box.classList.remove("hide");

                box.classList.add("show");

                setTimeout(()=>{

                    box.classList.remove("show");

                },400);

            },250);

        }

        else{

            showQuestion();

        }

        startTimer();

    }

    else{

        finishInterview();

    }

}

/* ===========================================
        NEXT BUTTON
=========================================== */

nextBtn.addEventListener("click",()=>{

    nextQuestion();

});

/* ===========================================
        START APPLICATION
=========================================== */

loadQuestions();


/* ===========================================
        VOICE RECOGNITION
=========================================== */

if ("webkitSpeechRecognition" in window) {

    recognition = new webkitSpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = function(event){

        let transcript = "";

        for(
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ){

            transcript += event.results[i][0].transcript;

        }

        answerBox.value = transcript;

        answerBox.dispatchEvent(new Event("input"));

    };

    recognition.onend = function(){

        if(isRecording){

            recognition.start();

        }

    };

}

else{

    micBtn.disabled = true;

    micText.innerText = "Speech Not Supported";

}

/* ===========================================
        MIC BUTTON
=========================================== */

micBtn.addEventListener("click",()=>{

    if(!recognition) return;

    if(!isRecording){

        recognition.start();

        isRecording = true;

        micBtn.classList.add("recording");

        micText.innerText = "Listening...";

    }

    else{

        recognition.stop();

        isRecording = false;

        micBtn.classList.remove("recording");

        micText.innerText = "Start Speaking";

    }

});

/* ===========================================
        FINISH INTERVIEW
=========================================== */

async function finishInterview(){

    clearInterval(timerInterval);

    answers[currentQuestion] = answerBox.value;

    try{

        const response = await fetch(

            `https://placeprep-sb9x.onrender.com/api/interview/evaluate`,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    answers

                })

            }

        );

        const data = await response.json();

        console.log(data);

        if(!data.success){

            showToast("Evaluation Failed");

            return;

        }

        localStorage.setItem(

            "interviewReport",

            JSON.stringify(data.report)

        );

        window.location.href = "result.html";

    }

    catch(err){

        console.error(err);

        showToast("Unable to evaluate interview.");

    }

}

/* ===========================================
        WORD COUNTER + AI CHIPS
=========================================== */

answerBox.addEventListener("input",()=>{

    const text = answerBox.value.trim();

    const words = text === "" ? 0 : text.split(/\s+/).length;

    wordCount.innerText = words + " Words";

    leadChip.classList.toggle(

        "active",

        /lead|manage|team|mentor/i.test(text)

    );

    commChip.classList.toggle(

        "active",

        /communicat|present|discuss|client|explain/i.test(text)

    );

    probChip.classList.toggle(

        "active",

        /problem|challenge|solve|debug|fix|issue/i.test(text)

    );

});
