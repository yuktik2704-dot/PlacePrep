window.onload = function () {

   
    const fileInput = document.getElementById("resume");

    const dropZone = document.getElementById("dropZone");

    const selectedFile = document.getElementById("selectedFile");

    const fileName = document.getElementById("fileName");

    const fileSize = document.getElementById("fileSize");

    const analyzeBtn = document.getElementById("analyzeBtn");
function validateFile(file) {
    if (!file) {
        return {
            ok: false,
            message: "Please upload a PDF resume."
        };
    }

    const isPDF =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

    if (!isPDF) {
        return {
            ok: false,
            message: "Please upload a PDF resume only."
        };
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (file.size > maxSize) {
        return {
            ok: false,
            message: "PDF must be under 5 MB."
        };
    }

    return {
        ok: true
    };
}
    /* ===========================
            FILE PREVIEW
    =========================== */

    function showFile(file){

    fileName.innerText = file.name;

    fileSize.innerText =
    (file.size/1024).toFixed(1) + " KB • ATS Compatible PDF";

    dropZone.classList.add("hide");

    setTimeout(()=>{

        dropZone.style.display="none";

        selectedFile.style.display="flex";

        selectedFile.classList.add("show");

    },300);

    analyzeBtn.innerHTML=`
    <i class="fa-solid fa-sparkles"></i>
    Generate My Report
    `;

    analyzeBtn.classList.add("active");

    showToast("✨ Resume uploaded successfully");

}
/* ===========================
        FILE SELECT
=========================== */

fileInput.addEventListener("change", () => {

    const file = fileInput.files[0];

    if (!file) return;

    const result = validateFile(file);

    if (!result.ok) {
        showToast(result.message);
        fileInput.value = "";
        return;
    }

    showFile(file);

});

    /* ===========================
            DRAG & DROP
    =========================== */

    dropZone.addEventListener("dragover",(e)=>{

        e.preventDefault();

        dropZone.classList.add("dragging");

    });

    dropZone.addEventListener("dragleave",()=>{

        dropZone.classList.remove("dragging");

    });

    dropZone.addEventListener("drop",(e)=>{

        e.preventDefault();

        dropZone.classList.remove("dragging");

        const files = e.dataTransfer.files;

if (files.length) {

    const file = files[0];
    const result = validateFile(file);

    if (!result.ok) {
        showToast(result.message);
        return;
    }

    fileInput.files = files;
    showFile(file);

}

    });

    /* ===========================
            SUBMIT
    =========================== */

    analyzeBtn.addEventListener("click",async()=>{

        const file = fileInput.files[0];

const result = validateFile(file);

if (!result.ok) {
    showToast(result.message);
    return;
}

        analyzeBtn.innerHTML=

        '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';

        analyzeBtn.disabled=true;

        const formData=new FormData();

        formData.append("resume",file);

        try{

            const response=await fetch(

                "https://placeprep-sb9x.onrender.com/api/resume/upload",

                {

                    method:"POST",

                    body:formData

                }

            );

            const data=await response.json();

            localStorage.setItem(

                "resumeData",

                JSON.stringify(data.savedResume)

            );

            localStorage.setItem(

                "resumeId",

                data.savedResume._id

            );

            window.location.href="loading.html";

        }

        catch(err){

            console.error(err);

            showToast("Upload Failed");

            analyzeBtn.disabled=false;

            analyzeBtn.innerHTML=

            '<i class="fa-solid fa-wand-magic-sparkles"></i> Analyze Resume';

        }

    });

};