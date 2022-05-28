import { Database } from 'sqlite3';
import * as crypto from 'crypto';
import * as utility from './util';
import config from "../private/config";
import * as type from "./interface";
class util{
    database:Database;
    errors = [
        "아직 회원가입을 하시지 않으신 것 같습니다.", //0
        "이미 회원가입을 하신 것 같습니다.", //1
        "사용자를 찾지 못했습니다.", //2
        "방을 찾지 못했습니다.", //3
        "방이 차단됐습니다.", //4
        "대상 유저가 친구 추가를 하지 않았습니다.", //5
        "포인트가 부족합니다.", //6
        "두 분은 이미 친구십니다.", //7
        "요청된 친구 신청을 찾지 못했습니다.", //8
        "등록할 이메일 주소를 찾지 못했습니다.", //9
        "코드가 맞지 않습니다.", //10
    ]
    constructor(db:Database){
        this.database = db;
    }
    async query(query:string):Promise<any>{
        let result = this.database.serialize(async () => {
            let result = this.database.run(query);
            return result;
        });
        return result;
    }
    async all(query:string):Promise<any[]>{
        return new Promise(async resolve => {
            this.database.serialize(async () => {
                this.database.all(query, (err:Error,rows:any) => {
                    if(err) throw err;
                    resolve(rows);
                });
            });
        });
    }
    async getUsers(){
        let users = await this.all("select * from user");
        for(let i=0;i<users.length;i++){
            users[i].friends=JSON.parse(users[i].friends);
            users[i].mails=JSON.parse(users[i].mails);
            users[i].banlist=JSON.parse(users[i].banlist);
        }
        return users;
    }
    async getUser(userID:string){
        let result = {isSign: false, user: null, users:null};
        let users = await this.all("select * from user");
        for(let i=0;i<users.length;i++){
            users[i].friends=JSON.parse(users[i].friends);
            users[i].mails=JSON.parse(users[i].mails);
            users[i].banlist=JSON.parse(users[i].banlist);
            users[i].friendRequestList=JSON.parse(users[i].friendRequestList);
            users[i].banRoomList = JSON.parse(users[i].banRoomList);
            users[i].rooms = JSON.parse(users[i].rooms);
        }
        result.users = users;
        if(users.find(e => e.id==userID)){
            result.isSign = true;
            result.user = users.find(e => e.id==userID);
        }
        return result;
    }
    async checkCode(userID:string, code:string){
        let result = {isSign: false, user: null, bool: false, reason: null};
        let {user, isSign} = await this.getUser(userID) as {isSign: boolean, user: type.User};
        result.isSign = isSign;
        if(isSign){
            result.user = user;
            if(user.code == code){
                if(user.requestEmail){
                    user.email = utility.encrypt(user.requestEmail);
                    user.requestEmail = null;
                    user.code = null;
                    this.query("update user set email='"+user.email+"', requestEmail=null, code=null where id='"+userID+"'");
                    result.bool = true;
                }else{
                    result.reason = this.errors[9];
                }
            }else{
                result.reason = this.errors[10];
            }
        }else{
            result.reason = this.errors[0];
        }
        return result;
    }
    async findUserByEmail(email: string, password: string){
        let result = {isSign: false, user: null, reason: null};
        let users = await this.getUsers() as type.User[];
        if(users.find(v=>v.email===utility.encrypt(email))){
            let user = users.find(v=>v.email===utility.encrypt(email));
            if(user.password===crypto.createHmac("sha256", config.salt).update(password).digest("hex")){
                result.user = user;
                result.isSign = true;
            }else{
                result.reason = this.errors[0];
            }
        }else{
            if(users.find(v=>v.requestEmail===email)){
                let user = users.find(v=>v.requestEmail===email);
                if(user.password===crypto.createHmac("sha256", config.salt).update(password).digest("hex")){
                    result.user = user;
                    result.isSign = true;
                }else{
                    result.reason = this.errors[0];
                }
            }else{
                result.reason = this.errors[0];
            }
        }
        return result;
    }
    async findEmails(email:string){
        let users = await this.getUsers() as type.User[];
        for(let user of users){
            if(user.email == utility.encrypt(email)){
                return true;
            }
        }
    }
    async signup(userID:string, email:string|null=null, name:string, password:string){
        let result = {isSign: true, user: null, reason: null};
        let user = (await this.findUserByEmail(email, password))
        let {isSign} = user;
        let emails = await this.findEmails(email);
        if(isSign||emails){
            result.reason = this.errors[1];
        }else{
            let user:type.User = {
                id: userID,
                name: name,
                email: null,
                description: ["치킨 먹고 싶다...", "자고싶다....", "집가고 싶다...."][Math.floor(Math.random() * 3)],
                password: crypto.createHmac("sha256", config.salt).update(password).digest("hex"),
                friends: [],
                mails: [],
                banlist: [],
                friendRequestList: [],
                point: 0,
                profile: "/image/user.png",
                rooms: [],
                banRoomList: [],
                requestEmail: email,
                code: null
            }
            this.database.run(this.getQuery(user));
            if(user.requestEmail){
                let emailResult = await this.verificationEmail(userID);
                result.reason = emailResult.reason;
            }
            result.user = user;
            result.isSign = false;
        }
        return result;
    }
    getQuery(user:type.User){
        let result:Array<string> = [];
        for(let key in user){
            if(typeof user[key] == "string") result.push(`'${user[key]}'`);
            else if(typeof user[key] == "object"&&user[key] !== null) result.push(`'${JSON.stringify(user[key])}'`);
            else result.push(`${user[key]}`)
        }
        return "insert into user values("+result.join(", ")+")";
    }
    async getRoom(roomID:string){
        let result = {isExists: false, room: null};
        let rooms = await this.all("select * from room");
        rooms.forEach(e => e.members = JSON.parse(e.members));
        if(rooms.find(e => e.id == roomID)){ [result.isExists, result.room] = [true, rooms.find(e => e.id===roomID)] }
        return result;
    }
    async setProfile(userID: string, link: string){
        let result = {isSign: false, user: null, reason: null};
        let {isSign, user} = await this.getUser(userID) as {isSign: boolean, user: type.User}
        result.isSign = isSign;
        if(isSign){
            user.profile = link;
            this.query("update user set profile='"+user.profile+"' where id='"+userID+"'");
        }else{
            result.reason = this.errors[0];
        }
        return result;
    }
    async makeRoom(userID: string, roomName:string|null=null, password:string|null=null, onlyFriend:boolean){
        let result = {isSign: false, user: null, room: null, reason: null};
        let {isSign, user} = await this.getUser(userID) as {isSign: boolean, user: type.User};
        result.isSign = isSign;
        if(isSign){
            let room:type.Room = {
                id: utility.generateID(),
                members: [user],
                name: (roomName==null)?user.name+"의 방":roomName,
                password: crypto.createHmac("sha256", config.salt).update(password).digest("hex"),
                onlyFriend: onlyFriend
            }
            user.rooms.push(room.id);
            [result.room, result.user] = [room, user];
            this.query("update user set rooms='"+JSON.stringify(user.rooms)+"' where id='"+userID+"'");
            this.query(`insert into room values(${room.id}, ${room.name}, ${room.password}, ${JSON.stringify(room.members)}, ${room.onlyFriend})`)
        }else{
            result.reason = this.errors[0];
        }
        return result;
    }
    async deleleRoom(roomID:string){
        let result = {isExists: false, room: null, reason: null};
        let {isExists, room} = await this.getRoom(roomID) as {isExists: boolean, room :type.Room|null};
        result.isExists = isExists;
        if(isExists){
            result.room = room;
            for(let i=0;i<room.members.length;i++){
                let {user} = await this.getUser(room.members[i].id) as {user: type.User};
                user.rooms.splice(user.rooms.findIndex(v=>v==roomID), 1);
                this.query("update user set rooms='"+JSON.stringify(user.rooms)+"' where id='"+user.id+"'");
            }
            this.query("delete from room where id='"+roomID+"'");
        }else{
            result.reason = this.errors[3];
        }
        return result;
    }
    async verificationEmail(userID: string){
        let result = {isSign: false, user: null, reason: null};
        let {isSign, user} = await this.getUser(userID) as {isSign: boolean, user: type.User};
        if(isSign){
            if(user.requestEmail){
                let code = utility.generateCode().toString();
                let text = `
                    <h3 id="title">
                    아래 코드를 코드 입력란에 입력해주세요.
                    </h3>
                    <h3>
                     만약 가입을 시도하지 않으셨다면 이 메일을 무시해주세요.
                     </h3>
                    <h4 id="number">
                    ${code}
                    </h4>
                `;
                utility.sendMail(user.requestEmail, "[ Sepchat ] - 이메일 인증", text);
                this.query("update `user` set code='"+code+"' where id='"+userID+"'");
                user.code = code;
                result.user = user;
            }else{
                result.reason = this.errors[9];
            }
        }else{
            result.reason = this.errors[0];
        }
        return result;
    }
    async exitRoom(userID:string, roomIndex: number, isBan:boolean){
        let result = {isSign: false, user: null, room: null, reason: null}
        let {isSign, user} = await this.getUser(userID) as {isSign: boolean, user: type.User};
        result.isSign = isSign;
        if(isSign){
            let {isExists, room} = await this.getRoom(user.rooms[roomIndex]) as {isExists: boolean, room :type.Room|null};
            if(isExists){
                if(isBan){
                    user.banRoomList.push(user.rooms[roomIndex]);
                }
                user.rooms.splice(roomIndex, 1);
                let userIndex:number;
                for(let i=0;i<room.members.length;i++){
                    if(room.members[i].id == user.id){
                        userIndex = i;
                    }
                }
                room.members.splice(userIndex, 1);
                this.query("update user set rooms='"+JSON.stringify(user.rooms)+"' where id='"+userID+"'");
                this.query("update room set members='"+JSON.stringify(room.members)+"' where id='"+room.id+"'");
            }else{
                result.reason = this.errors[3];
            }
        }else{
            result.reason = this.errors[0];
        }
        return result;
    }
    async findUserEmail(email: string, password: string){
        let result = {isSign: false, user: null, reason: null};
        let users = await this.getUsers() as type.User[];
        for(let user of users){
            if(user.email===utility.encrypt(email)&&user.password===crypto.createHmac("sha256", config.salt).update(password).digest("hex")){
                result.isSign = true;
                result.user = user;                
            }
        }
        if(!result.isSign) result.reason = this.errors[0];
        return result;
    }
    async deleteFriend(userID: string, friendID: string){
        let result = {isSign: false, user: null, friend:null, reason: null};
        let {isSign, user} = await this.getUser(userID) as {isSign: boolean, user: type.User};
        result.isSign = isSign;
        if(isSign){
            let {isSign: friendIsSign, user: friend} = await this.getUser(friendID) as {isSign: boolean, user: type.User};
            if(friendIsSign){
                if(user.friends.length >= 1&&friend.friends.length >= 1){
                    let usersFriendID = user.friends.map(e => e.id);
                    let friendsFriendID = friend.friends.map(e => e.id);
                    if(usersFriendID.some(v=>v===friendID)&&friendsFriendID.some(v=>v===userID)){
                        user.friends.splice(usersFriendID.findIndex(v=>v===friendID), 1);
                        friend.friends.splice(friendsFriendID.findIndex(v=>v===userID), 1);
                        result.user = user;
                        result.friend= friend;
                        this.query("update user set friends='"+JSON.stringify(user.friends)+"' where id='"+userID+"'");
                        this.query("update user set friends='"+JSON.stringify(friend.friends)+"' where id='"+friendID+"'");
                }else{
                    result.reason = this.errors[5];
                }
            }else{
                result.reason = this.errors[5]
            }
        }else{
            result.reason = this.errors[2]
        }
        }else{
            result.reason = this.errors[0];
        }
        return result;
    }
    async inviteFriend(userID:string, friendID: string, roomIndex:number){
        let result = {isSign: false, friendIsSign: false, user: null, friend: null, room: null, reason: null};
        let {isSign, user} = await this.getUser(userID) as {isSign: boolean, user: type.User|null};
        let {isSign: friendIsSign, user: friend} = await this.getUser(friendID) as {isSign: boolean, user: type.User|null};
        [result.isSign, result.friendIsSign] = [isSign, friendIsSign];
        if(isSign){
            if(friendIsSign){
                let {isExists, room} = await this.getRoom(user.rooms[roomIndex]) as {isExists: boolean, room :type.Room|null}
                if(isExists){
                    if(friend.banRoomList.some(v=>v==room.id)){
                        result.reason = this.errors[4];
                    }else{
                        friend.rooms.push(room.id);
                        [result.room, result.user, result.friend] = [room, user, friend];
                        this.query("update user set rooms='"+JSON.stringify(friend.rooms)+"' where id='"+friendID+"'");
                    }
                }else{
                    result.reason = this.errors[3]
                }
            }else{
                result.reason = this.errors[2];
            }
        }else{
            result.reason = this.errors[0];
        }
        return result;
    }
    async acceptFriend(userID:string, friendID: string){
        let result = {isSign: false, friendIsSign: false, user: null, friend: null, reason: null};
        let {isSign, user} = await this.getUser(userID) as {isSign: boolean, user: type.User|null};
        let {isSign: friendIsSign, user: friend} = await this.getUser(friendID) as {isSign: boolean, user: type.User|null};
        if(isSign){
            if(friendIsSign){
                if(user.friendRequestList.some(v=>v.id===friendID)){
                    let friendIndex = user.friendRequestList.findIndex(v=>v.id===friendID);
                    user.friendRequestList.splice(friendIndex,1);
                    user.friends.push(friend);
                    friend.friends.push(user);
                    this.query("update user set friends='"+JSON.stringify(user.friends)+"' where id='"+userID+"'");
                    this.query("update user set friends='"+JSON.stringify(friend.friends)+"' where id='"+friendID+"'");
                    [result.user, result.friend] = [user,friend];
                }else{
                    result.reason = this.errors[5];
                }
            }else{
                result.reason = this.errors[2];
            }
        }else{
            result.reason = this.errors[0];
        }
        return result;
    }
    async refuseFriend(userID: string, friendID: string){
        let result = {isSign: false, user:null, reason: null};
        let {isSign, user} = await this.getUser(userID) as {isSign: boolean, user: type.User};
        if(isSign){
            let userRequestFriendIDs = user.friendRequestList.map(e => e.id);
            if(userRequestFriendIDs.some(v=>v===friendID)){
                user.friendRequestList.splice(userRequestFriendIDs.findIndex(e => e===friendID), 1);
                this.query("update user set friendRequestList='"+JSON.stringify(user.friendRequestList)+"' where id='"+userID+"'");
                result.user = user;
            }else{
                result.reason = this.errors[8];
            }
        }else{
            result.reason = this.errors[0];
        }
        return result;
    }
    async refuseAllFriends(userID: string){
        let result = {isSign: false, user: null, reason: null};
        let {isSign, user} = await this.getUser(userID) as {isSign: boolean, user: type.User};
        result.isSign = isSign;
        if(isSign){
            for(let i=0;i<user.friendRequestList.length;i++){
                user.friendRequestList.splice(i, 1);
            }
            this.query("update user set friends='"+JSON.stringify(user.friends)+"' where id='"+userID+"'");
        }else{
            result.reason = this.errors[0];
        }
        return result;
    }
    async acceptAllFriends(userID:string){
        let result = {isSign: false, user: null, reason: null};
        let {isSign, user} = await this.getUser(userID) as {isSign: boolean, user: type.User};
        result.isSign = isSign;
        if(isSign){
            for(let i=0;i<user.friendRequestList.length;i++){
                user.friends.push(user.friendRequestList[i]);
                let {user:friend} = await this.getUser(user.friendRequestList[i].id) as {user: type.User};
                friend.friends.push(user);
                this.query("update user set friends='"+JSON.stringify(friend.friends)+"' where id='"+friend.id+"'");
                user.friendRequestList.splice(i, 1);
            }
            this.query("update user set friends='"+JSON.stringify(user.friends)+"' where id='"+userID+"'");
        }else{
            result.reason = this.errors[0];
        }
        return result;
    }
    async addPoint(userID: string, amount: number){
        let result = {isSign: false, user: null, reason: null};
        let {isSign, user} = await this.getUser(userID) as {isSign: boolean, user: type.User};
        result.isSign = isSign;
        if(isSign){
            user.point += amount;
            result.user = user;
            this.query("update user set point="+user.point+" where id='"+userID+"'");
        }else{
            result.reason = this.errors[0];
        }
        return result;
    }
    async setName(userID: string, name: string){
        let result = {isSign: false, user: null, reason: null};
        let {isSign, user} = await this.getUser(userID) as {isSign: boolean, user: type.User};
        if(isSign){
            if(user.point >= 100){
                [result.isSign, result.user] = [isSign, user];
                user.name = name;
                this.query("update user set name='"+user.name+"' where id='"+userID+"'");
            }else{
                result.reason = this.errors[6];
            }
        }else{
            result.reason = this.errors[0];
        }
        return result;
    }
    async searchUser(name: string){
        let users = await this.getUsers() as Array<type.User>;
        let result = users.filter(e => e.name.includes(name));
        return result;
    }
    async sendFriendRequest(userID: string, friendID: string){
        let result = {isSign: false, friendIsSign: false,user: null, friend: null, reason: null};
        let {isSign, user} = await this.getUser(userID) as {isSign: boolean, user: type.User|null};
        let {isSign: friendIsSign, user: friend} = await this.getUser(friendID) as {isSign: boolean, user: type.User|null};
        [result.isSign, result.friendIsSign] = [isSign, friendIsSign];
        if(isSign&&friendIsSign){
            if(user.friends.some(e => e.id==friendID)){
                result.reason = this.errors[7];
            }else if(user.banlist.some(e => e.id==friendID)){
                result.reason = this.errors[2];
            }else{
                friend.friendRequestList.push(user);
                this.query("update user set friendRequestList='"+JSON.stringify(friend.friendRequestList)+"' where id='"+friendID+"'");
                [result.user,result.friend] = [user, friend];
            }
        }else if(!friendIsSign){
            result.reason = this.errors[2];
        }else if(!isSign){
            result.reason = this.errors[0];
        }
        return result;
    }
}
export default util;