let servers = new XMLHttpRequest();
let command = new XMLHttpRequest();
let version = new XMLHttpRequest();
version.onload = () => {
    let result = JSON.parse(version.responseText);
    document.getElementById("version").innerHTML = `
현재 셉봇 버전 : ${result[0].version}
<br>
내용 : ${result[0].description}
<hr>
<br>
이전 셉봇 버전 : ${result[1].version}
<br>
내용 : ${result[1].description}
    `
}
command.onload = () => {
    let result = JSON.parse(command.responseText).map((e,i) => (i+1)+". <span id=\"commandName\">/"+ e.name+"</span><br><span id=\"commandDescription\">"+e.description+"<span>").join("<br><br><hr><br>")
    document.getElementById("commands").innerHTML = "<br>"+result+"<br>";
}
servers.onload = () => {
    document.getElementById("server").innerText = `셉봇은 ${JSON.parse(server.responseText).server}개의 서버에 들어가있습니다.`
}
servers.open("POST", "https://sepbot.repl.co/servers");
command.open("POST", "https://sepbot.repl.co/cmd");
version.open("POST", "https://sepbot.repl.co/update");
document.addEventListener("DOMContentLoaded", () => {
    let socket = io();
    socket.on("chat", (chatData) => {
        $("ul#chat").append(`
        <li name="chat">
                <div name="chat" class="sender"><img name="chat" class="profile" src="${chatData.profile}" alt="${chatData.id}" title="${chatData.id}"><span name="chat" class="name">${chatData.sender}</span><span name="chat" class="time">${chatData.time}</span></div>
                <div name="chat" class="message">${chatData.message}</div>
            </li>
            `)
    });
	$("span#invite[name=sepbot]").on("click", () => {
		confirm("초대 링크로 이동할까요?")?window.location.href = "https://discord.com/oauth2/authorize?client_id=764104980218118194&permissions=8&scope=bot%20applications.commands":false;
	});
    $("span#sepchat").on("click", () => {
        confirm("셉챗 페이지로 이동할까요?")?window.location.href = "/signup":false;
    });
    $("span#support").on("click", () => {
        confirm("문의 페이지로 이동할까요?")?window.location.href = "/support":false;
    })
    servers.send();
    command.send();
    version.send();
})