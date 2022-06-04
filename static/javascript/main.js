function removeAllchild(div) {
    while (div.hasChildNodes()) {
        div.removeChild(div.firstChild);
    }
}
var XSSfilter = function(content) { return content.replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("chatlog").style.setProperty("--chat-scrollbar-color", "#0E185F");
    document.getElementById("input").style.setProperty("--input-chat-color", "gray");
    let user;
    let isDarkmode = false;
    let socket = io();
    let id = $("input#id").val();
    let name=$("input#name").val();
    socket.emit("getUser", id);
    socket.on("getUser", (userData) => {
        user = userData;
        for(let friend of user.friends){
            $("ul#friends").append(`<li class="friend" id="${friend.id}">${friend.name}</li>`);
        }
        for(let friendRequest of user.friendRequestList){
            $("ul#friendRequest").append(`<li class="friendRequest" id="${friendRequest.id}" alt="${friendRequest.id}">${friendRequest.name}</li>`);
        }
    });
    $("#hide").on("click", () => {
        $(".header").css("display", "none");
        $("body").css("gap", "0px")
        $(".menu").css({
            "height": "100vh", 
            "border" : "0",
            "border-top-right-radius": "0"
        })
        $(".chat").css({
            "height": "100vh",
            "border" : "0", 
            "border-top-left-radius": "0"
        });
    })
    socket.emit("join", {
        id: id,
        name: name
    });
    socket.on("error", (errorMsg) => {
        alert(errorMsg);
    });
    socket.on('chat', function(data){
        let senderImgFilter = isDarkmode?"grayscale(0.6) brightness(0.7)":"grayscale(0) brightness(1)";
        let timeColor = isDarkmode?"white":"black";
        if(data.id != id){
            $("ul#chatlog").append(`<li name="chat">
                    <div class="sender" name="chat"><img name="chat" class="profile" src="${data.profile}" alt="${data.id}" title="${data.id}" style="filter: ${senderImgFilter};"/><span name="chat" class="name">${data.sender}</span><span name="chat" class="time" style="color: ${timeColor};">${data.time.toLocaleString("ko")}</span></div>
                    <div name="chat" class="message">${data.message}</div>
                </li>`);
            $("ul#chatlog").animate({scrollTop : document.getElementById("chatlog").scrollHeight}, 300);
        }else{
            $("ul#chatlog").append(`<li name="userchat">
                    <div name="chat" class="sender"><img name="chat" class="profile" src="/image/me.png" alt="${data.id}" title="${data.id}"/ style="filter: ${senderImgFilter};"><span name="chat" class="name">${data.sender}</span><span name="chat" class="time" style="color: ${timeColor};">${data.time.toLocaleString("ko")}</span></div>
                    <div name="chat" class="message">${data.message}</div>
                </li>`);
            $("ul#chatlog").animate({scrollTop : document.getElementById("chatlog").scrollHeight}, 100);
        }
    });
    $("form#input").submit((e) => {
        $("ul#chatlog").animate({scrollTop : document.getElementById("chatlog").scrollHeight}, 100);
        let msg = $("input#input").val();
        $("input#input").val(""); //채팅창 초기화
        let message = {
            id: id,
            sender: name,
            message: XSSfilter(msg),
            time: new Date()
        }
        socket.emit("chat", message);
    });
    $('html').click(function(e) {
        if($(e.target).attr("name") == "chat" && e.target.id != "input"){
            $("#popup").css({
                width: "100vw",
                height: "100vh",
            });
            $("#popup").css("display", "block");
            let pop_up = document.createElement("span");
            pop_up.setAttribute("id", "USER");
            pop_up.setAttribute("class", "userinfo");
            document.getElementById("popup").appendChild(pop_up);
        }else if($(e.target).attr("name") != "chat" && $(e.target).attr("class") != "userinfo"){
            removeAllchild(document.getElementById("popup"));
            $("#popup").css({
                "display": "none",
                "width" : "0",
                "height" : "0"
            });
        }
        switch (e.target.className) {
            case "bi bi-moon-fill":
                isDarkmode = true;
                $("#dark-mode")?.html("<i class=\"bi bi-brightness-high-fill\"></i>");
                document.getElementById("dark-mode")?.setAttribute("id", "light-mode");
                $(".header").css("background-color", "black");
                document.querySelectorAll("li[name=\"chat\"]").forEach(e => { e.style.background="black"; e.style.color = "white"; e.style.border = "1px solid white"});
                document.querySelectorAll("#chatlog > li > div.sender > span.time").forEach(e => e.style.color = "white");
                document.getElementsByClassName("chat").item(0).style.backgroundColor="black";
                document.getElementById("chatlog").style.backgroundColor = "black";
                document.getElementById("chatlog").style.setProperty("--chat-scrollbar-color", "black");
                document.getElementById("input").style.setProperty("--input-chat-color", "white");
                document.querySelectorAll("form#input > input[type=text]").forEach(e => { e.style.backgroundColor = "black"; e.style.color = "white"; e.style.border = "1px solid white" });
                document.getElementById("submit").style.backgroundColor = "gray";
                document.querySelectorAll("img.profile").forEach(e => e.setAttribute("style", "filter: grayscale(0.6) brightness(0.7);"));
                document.querySelectorAll("#chatlog > li > div.sender > span.time").forEach(e => e.setAttribute("style", "color: white"));
            break;
            case "bi bi-brightness-high-fill":
                isDarkmode = false;
                $("#light-mode").html("<i class=\"bi bi-moon-fill\"></i>");
                document.getElementById("light-mode")?.setAttribute("id", "dark-mode");
                $(".header").css("background-color", "#fd3175");
                document.querySelectorAll("li[name=\"chat\"]").forEach(e => { e.style.background="white"; e.style.color = "black"; e.style.border = "0"});
                document.querySelectorAll("#chatlog > li > div.sender > span.time").forEach(e => e.style.color = "black");
                document.getElementsByClassName("chat").item(0).style.backgroundColor="#0E185F";
                document.getElementById("chatlog").style.backgroundColor = "#0E185F";
                document.getElementById("chatlog").style.setProperty("--chat-scrollbar-color", "#0E185F");
                document.getElementById("input").style.setProperty("--input-chat-color", "gray");
                document.querySelectorAll("form#input > input[type=text]").forEach(e => { e.style.backgroundColor = "white"; e.style.color = "black" });
                document.getElementById("submit").style.backgroundColor = "#fd3175";
                document.querySelectorAll("img.profile").forEach(e => e.setAttribute("style", "filter: grayscle(0) brightness(1);"));
                document.querySelectorAll("#chatlog > li > div.sender > span.time").forEach(e => e.setAttribute("style", "color: black;"));
            break;
        }
    })
})