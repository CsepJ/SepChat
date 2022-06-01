import * as express from "express";
import * as socket from "socket.io";
import * as Http from "http";
import * as type from "./interface";
import Main from "./main";
import * as Database from "sqlite3";
import * as utility from "./util";
import * as session from "express-session";
import * as cookieParser from "cookie-parser";
import * as sessionStore from "session-file-store";
import config from "../private/config";
declare module "express-session" {
    interface SessionData{
        userid?: string,
        name?: string,
        email?: string
    }
}
const app:express.Application = express();
const db = new (Database.verbose()).Database("./data/data.db");
const userUtil = new Main(db);
const http = Http.createServer(app);
const io = new socket.Server(http);
const fileStore = sessionStore(session);
const cookieConfig:express.CookieOptions = {
    signed: false,
    maxAge: 300000
}
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: config.salt,
    cookie: {
        maxAge: 500000,
        sameSite:true
    },
    store: new fileStore()
}))
app.set('views', __dirname+"/../static/view");
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname+"/../static"));

// < APP SIDE > //

app.use("/signup", async (req,res) => {
    if(req.method == "GET"){
        let error = req.query.error?req.query.error:null;
        res.render("signup.ejs",
        {
            error: error
        })
    }else if(req.method == "POST"){
        let { name, email, password } = req.body;
        let user = await userUtil.signup(utility.generateID(), email.toLowerCase(), name, password) as {isSign: boolean, user:type.User, reason: string|null};
        if(user.reason){
            let finduser = await userUtil.findUserByEmail(email, password) as {isSign: boolean, user: type.User|null, reason: string|null}
            if(finduser.isSign&&finduser.user.requestEmail&&!finduser.user.email){
                res.cookie("id", finduser.user.id, cookieConfig);
                req.session.email = email;
                userUtil.verificationEmail(finduser.user.id)
                res.render("verification.ejs", 
                {
                    email: finduser.user.requestEmail,
                    id: finduser.user.id
                })
            }else{
                res.redirect("/login?error="+user.reason);
            }
        }else{
            //email, id
            res.cookie("id", user.user.id, cookieConfig);
            req.session.email = email;
            res.render("verification.ejs",
            {
                email: user.user.requestEmail,
                id: user.user.id
            });
        }
    }
});
app.use("/verification", async(req,res) => {
    if(req.method == "GET"){
        let { id } = req.cookies;
        let { email } = req.session;
        let error = req.query.error?req.query.error:"";
        res.render("verification.ejs", {
            error: error,
            id: id,
            email: email
        })
    }else if(req.method == "POST"){
        let { code } = req.body;
        let { id } = req.cookies;
        let { email } = req.session;
        if(id==null||code==null){
            res.redirect("/verification?error=오류가 발생했습니다. 다시 시도해주세요.");
        }else{
            let result = await userUtil.checkCode(id, code) as {isSign: boolean, user: type.User, reason: string|null, bool: boolean};
            if(result.isSign){
                if(result.bool){
                    req.session.userid = result.user.id;
                    req.session.save(() => {
                        res.redirect("/main");
                    });
                }else{
                    res.redirect("/verification?error=코드를 다시 입력해주세요.");
                }
            }else{
                res.redirect("/verification?error=오류가 발생했습니다. 다시 시도해주세요.");
            }
        }
    }
});
app.use("/main", async (req,res) => {
    if(req.method == "GET"&&req.session.userid){
        let {isSign, user} = await userUtil.getUser(req.session.userid) as {isSign: boolean, user:type.User|null};
        if(isSign){
            res.render("main.ejs",
            {
                name: user.name,
                id: user.id
            })
        }else{
            res.redirect("/signup?error="+userUtil.errors[0]);
        }
    }else{
        res.redirect("/signup");
    }
});
app.get("/support", (req,res) => {
    res.render("support.ejs")
})
app.use("/login", async (req,res) => {
    if(req.method == "GET"){
        let error = req.query.error?req.query.error:null;
        res.render("login.ejs",
        {
            error: error
        })
    }else{
        let {email, password} = req.body;
        let user = await userUtil.findUserEmail(email.toLowerCase(), password) as {isSign: boolean, user: type.User|null, reason: null|string};
        if(user.reason){
            res.redirect("/signup?error="+user.reason);
        }else{
            req.session.userid = user.user.id;
            req.session.save(() => {
                res.redirect("/main");
            });
        }
    }
})
// < SOCKET SIDE > //
io.on("connection", async (socket) => {
    socket.on("join", async (data:{id: string, name:string}) => {
        let utc = new Date().getTime() + (new Date().getTimezoneOffset() * 60 * 1000);
        let currentDate = new Date(utc + (32400000)).toLocaleTimeString("ko")
        socket.emit("chat", {
            id: "Administor",
            sender: "관리자",
            profile: "/image/Sepchat.png",
            message: "안녕하세요",
            time: currentDate
        });
    });
    socket.on("chat", async (data:{id: string, name:string, message: string, time: Date}) => {
        let {isSign,user} = await userUtil.getUser(data.id) as {isSign: boolean, user : type.User};
        if(isSign){
            userUtil.addPoint(data.id, 1);
            let utc = new Date().getTime() + (new Date().getTimezoneOffset() * 60 * 1000);
            let currentDate = new Date(utc + (32400000)).toLocaleTimeString("ko")
            io.emit("chat", {
                id: user.id,
                sender: user.name,
                profile: user.profile,
                message: data.message,
                time: currentDate
            });
        }else{
            socket.emit("errorMsg",userUtil.errors[0]);
        }
    });
    socket.on("getUser", async (userID:string) => {
        let {isSign, user} = await userUtil.getUser(userID) as {isSign: boolean, user: type.User|null};
        if(isSign){
            socket.emit("getUser", user);
        }else{
            socket.emit("errorMsg", "계정을 찾지 못했습니다.");
        }
    })
});
http.listen(3000, () => console.log("Server is running on port 3000"));