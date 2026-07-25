const atsCircle = document.getElementById("atsCircle");

// Show real ATS score if resume already exists
const resumeData = JSON.parse(localStorage.getItem("resumeData"));

if (resumeData && resumeData.atsScore) {

    atsCircle.innerText = resumeData.atsScore + "%";

}

// Login Form
document
.getElementById("loginForm")
.addEventListener("submit", function(e){

    e.preventDefault();

    // Later we'll replace this with backend authentication
    window.location.href = "resume-upload.html";

});
function comingSoon(){

    alert("Forgot Password feature coming soon 🚀");

}