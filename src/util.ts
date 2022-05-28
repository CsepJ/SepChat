import config from "../private/config";
import * as mailer from "nodemailer";
import * as crypto from "crypto";
export function isEmptyObject(obj:object){
	return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}
export function comma(x:number):string{
	 return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
export function generateCode(){
	return Math.floor(Math.random() * 888889)+111111;
}
export function encrypt(msg:string){
	const cipher = crypto.createCipher('aes-256-cbc', 'key');
	let result = cipher.update(msg, 'utf8', 'base64');
	result += cipher.final('base64');
	return result;
}
export function decrypt(msg:string){
	const decipher = crypto.createDecipher('aes-256-cbc', 'key');
	let result2 = decipher.update(msg, 'base64', 'utf8');
	result2 += decipher.final('utf8');
	return result2;
}
var words = ["지랄","애미","애비","에미","창년","에비","씨발","시발","개새","개새끼","샊이","개새기","개샊이","^^ㅣ발","씹알","씨벌","씨불","씨부레","시벌","병신","븅신","퓽신","샊2","벙신","놈","좆","졷","느금마","늑음마","느금아","쉑끼","늑음아","늑으마","느그마","니엄마","네엄마","자위","딸치기","딸쳐라","딸딸이","세끼","섀끼","셰끼","섻으","섻스","색스","섹스","성관계", "fuck", "bitch", "Fuck", "fUck", "fuCk", "fucK", "bItch", "Bitch", "쓰발"]
export function filter(sentence:string){
	var result = "";
	var find = words.filter(e => sentence.includes(e));
			if(find == undefined){
				result = sentence;
			}else{
				for(var i = 0;i < find.length; i++){
					var filt = "*".repeat(find[i].length);
					sentence = sentence.replace(find[i],filt);
			}
			result = sentence;
		}
		return result;
		}
export function getPersent(percent:number):boolean{
	let numList = [];
	for(let i=1;i<percent+1;i++){ numList.push(i)}
	let randomNum = Math.floor(Math.random() * 100)+1;
	if(numList.some(v=>v==randomNum)){
		return true;
	}else{
		return false;
	}
}
export function generateID():string{
	let result = Date.now().toString(35);
	return result;
}
export function sendMail(email:string, title:string, html:string){
	let transport = mailer.createTransport({
		service: "gmail",
		host: "smtp.gmail.com",
		port: 587,
		secure: false,
		auth: {
			user: config.email,
			pass: config.emailpw
		}
	});
	var mailOptions:mailer.SendMailOptions = {
		from: "Sepchat",
		to: email,
		subject: title,
		html: html
	  };
	  transport.sendMail(mailOptions, function (error, info) {
		if (error) {
		  console.log(error);
		} else {
		  console.log('Email sent: ' + info.response);
		}
	  });
}