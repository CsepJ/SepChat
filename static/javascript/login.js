document.addEventListener("DOMContentLoaded", () => {
    let params = new URLSearchParams(location.search);
    if(params.has("error")){
        alert(params.get("error"))
    }
    $("#logo").on("click", () => {
        window.location.href = "/"
    });
    $("#support").on("click", () => {
    });
    $("#account").on("click", () => {
        window.location.href = "/signup"
    });
});