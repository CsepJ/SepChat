var XSSfilter = function(content) { return content.replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
document.addEventListener("DOMContentLoaded", () => {
    let user;
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
        if(data.id != id){
            $("ul#chatlog").append(`<li id="chat">
                    <div class="sender"><img id="profile" src="${data.profile}"/><span id="name">${data.sender}</span><span id="time">${data.time.toLocaleString("ko")}</span></div>
                    <div class="message">${data.message}</div>
                </li>`);
            $("ul#chatlog").animate({scrollTop : document.getElementById("chatlog").scrollHeight}, 300);
        }else{
            $("ul#chatlog").append(`<li id="userchat">
                    <div class="sender"><img id="profile" src="/image/me.png"/><span id="name">${data.sender}</span><span id="time">${data.time.toLocaleString("ko")}</span></div>
                    <div class="message">${data.message}</div>
                </li>`);
            $("ul#chatlog").animate({scrollTop : document.getElementById("chatlog").scrollHeight}, 100);
        }
    });
    $("form#chat").submit((e) => {
        $("ul#chatlog").animate({scrollTop : document.getElementById("chatlog").scrollHeight}, 100);
        let msg = $("input#chat").val();
        $("input#chat").val("");
        let message = {
            id: id,
            sender: name,
            message: XSSfilter(msg),
            time: new Date()
        }
        socket.emit("chat", message);
    })
})