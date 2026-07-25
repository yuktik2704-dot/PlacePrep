function showToast(message){

    const toast = document.getElementById("toast");

    if(!toast) return;

    toast.innerText = message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}