document.addEventListener("DOMContentLoaded", () => {
    let params = new URLSearchParams(location.search);
    if(params.has("error")){
        alert(params.get("error"))
    }
    $("#logo").on("click", () => {
        window.location.href = "/"
    });
    $("#support").on("click", () => {
        confirm("문의 페이지로 이동할까요?")?window.location.href = "/support":false;
    })
    $("#account").on("click", () => {
        window.location.href = "/signup"
    });
});