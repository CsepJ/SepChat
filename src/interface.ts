export interface Mail{
    name: string,
    value: string,
    time: string
}
export interface Room{
    name: string,
    id: string,
    password: string|null,
    onlyFriend: boolean,
    members: Array<User>
}
export interface User{
    id: string,
    name: string,
    email: string|null,
    description: string,
    password: string,
    friends: Array<User>,
    mails: Array<Mail>,
    banlist: Array<User>,
    friendRequestList: Array<User>,
    point: number,
    profile: string,
    rooms: Array<string>, //방 아이디만
    banRoomList: Array<string>, //방 아이디만
    requestEmail: string|null,
    code: string|null,
}
export interface Message{
    id: string,
    sender: string,
    message: string,
    profile: string
}