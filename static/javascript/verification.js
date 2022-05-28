document.addEventListener("DOMContentLoaded", () => {
    let params = new URLSearchParams(location.search);
    if(params.has("error")){
        alert(params.get("error"))
    }
    $("#logo").on("click", () => {
        window.location.href = "/"
    });
    $("#hide").on("click", () => {
        $(".header").css("display", "none");
        $("body").css("gap", "0px")
        $("span#container").css("height" , "100vh");
    });
    $("#support").on("click", () => {
    });
    $("#account").on("click", () => {
        window.location.href = "/login"
    });
});