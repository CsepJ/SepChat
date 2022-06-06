let servers = new XMLHttpRequest();
servers.onload = () => {
    document.getElementById("server").innerText = `셉봇은 ${JSON.parse(server.responseText).server}개의 서버에 들어가있습니다.`
}
servers.open("POST", "https://sepbot.repl.co/servers");
document.addEventListener("DOMContentLoaded", () => {
    servers.send();
    $("#logo").on("click", () => {
        window.location.href = "/"
    });
    $("#invite").on("click", () => {
        window.location.href = "/bot";
    });
    $("#notice").on("click", () => {
        window.location.href = "/notice";
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
    });
})