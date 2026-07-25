const title = document.getElementById("loadingTitle");
const subtitle = document.getElementById("loadingSubtitle");
const progress = document.getElementById("loadingProgress");

const loadingSteps = [
    document.getElementById("step1"),
    document.getElementById("step2"),
    document.getElementById("step3"),
    document.getElementById("step4"),
    document.getElementById("step5")
];

const steps = [

{
title:"Uploading Resume...",
subtitle:"Receiving your resume securely.",
progress:15
},

{
title:"Parsing Resume...",
subtitle:"Reading every section carefully.",
progress:35
},

{
title:"Extracting Skills...",
subtitle:"Finding projects, technologies and experience.",
progress:60
},

{
title:"Calculating ATS Score...",
subtitle:"Comparing against recruiter standards.",
progress:85
},

{
title:"Preparing Dashboard...",
subtitle:"Almost done...",
progress:100
}

];

let current = 0;

function nextStep(){

    title.innerText = steps[current].title;
    subtitle.innerText = steps[current].subtitle;
    progress.style.width = steps[current].progress + "%";

    loadingSteps.forEach(step=>step.classList.remove("active"));
    loadingSteps[current].classList.add("active");

    current++;

    if(current<steps.length){

        setTimeout(nextStep,900);

    }

    else{

        setTimeout(()=>{

            window.location.href="dashboard.html";

        },900);

    }

}

nextStep();