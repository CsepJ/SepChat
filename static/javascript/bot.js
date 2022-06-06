document.addEventListener("DOMContentLoaded", () => {
    $("#logo").on("click", () => {
        window.location.href = "/";
    });
    $("#invite").on("click", () => {
        window.location.href = "/bot";
    });
    $("#notice").on("click", () => {
        window.location.href = "/notice";
    });
    $("span.redirect[name=sepbot]").on("click", () => {
        confirm("셉봇 초대 페이지로 이동할까요?")?window.open("/invite", "_blank"):false;
    });
    $("span.redirect[name=seprpg]").on("click", () => {
        confirm("셉RPG봇 초대 페이지로 이동할까요?")?window.open("https://discord.com/api/oauth2/authorize?client_id=884444770812981278&permissions=8&scope=bot", "_blank"):false;
    });
    $("span.redirect[name=sonnet]").on("click", () => {
        confirm("소네트봇 초대 페이지로 이동할까요?")?window.open("https://discord.com/api/oauth2/authorize?client_id=850706596463116309&permissions=8&scope=bot", "_blank"):false;
    })
    $("span#sepchat").on("click", () => {
        confirm("셉챗 페이지로 이동할까요?")?window.location.href = "/signup":false;
    });
    $("span#support").on("click", () => {
        confirm("문의 페이지로 이동할까요?")?window.location.href = "/support":false;
    })
})