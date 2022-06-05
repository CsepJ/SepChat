document.addEventListener("DOMContentLoaded", () => {
    $("#logo").on("click", () => {
        window.location.href = "/"
    });
    $("#discord").on("click", () => {
        confirm("디스코드 서버 초대링크로 이동하시겠습니까?")?window.location.href = "https://discord.gg/pNj9fUSf7r":false;
    });
    $("#kakaotalk").on("click", () => {
        confirm("카카오톡 오픈프로필 링크로 이동하시겠습니까?")?window.location.href = "https://open.kakao.com/me/SepJ":false;
    });
    $("#profile").on("click", (e) => {
        window.open($(e.target).attr("src"), "_blank");
    });
    $("#github").on("click", () => {
        confirm("깃허브 링크로 이동하시겠습니까?")?window.location.href = "https://github.com/CsepJ":false;
    });
    $("span#sepchat").on("click", () => {
        confirm("셉챗 페이지로 이동할까요?")?window.location.href = "/signup":false;
    });
    $("span#support").on("click", () => {
        confirm("문의 페이지로 이동할까요?")?window.location.href = "/support":false;
    })
})