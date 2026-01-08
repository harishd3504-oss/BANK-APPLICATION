class Password{
static score(p){
let s=0
if(p.length>=12)s++
if(/[A-Z]/.test(p))s++
if(/[a-z]/.test(p))s++
if(/[0-9]/.test(p))s++
if(/[^A-Za-z0-9]/.test(p))s++
return s
}
static draw(p,b,t){
const s=this.score(p)
b.style.width=s*20+"%"
b.style.background=s<3?"red":s<4?"orange":s<5?"#00bfff":"#00ff7f"
t.innerText=s<3?"Weak":s<4?"Medium":s<5?"Strong":"Very Strong"
}
}

class OTP{
static send(){
this.code=Math.floor(100000+Math.random()*900000)+""
alert("OTP: "+this.code)
}
static verify(){
return prompt("Enter OTP")==this.code
}
}

class Transaction{
constructor(type,note,amt){
this.time=new Date().toLocaleString()
this.type=type
this.note=note
this.amount=amt
}
row(){
return `<tr>
<td>${this.time}</td>
<td>${this.type}</td>
<td>${this.note}</td>
<td style="color:${this.amount>0?'#00ff9d':'#ff6b6b'}">${this.amount>0?'+':'-'}₹${Math.abs(this.amount)}</td>
<td>
<div class="bill">
<b>SAIRAM BANK</b><br>
${this.type}<br>
₹${Math.abs(this.amount)}<br>
${this.time}
</div>
</td>
</tr>`
}
}

class Bank{
constructor(){
this.user=JSON.parse(localStorage.getItem("bankUser"))||null
this.balance=Number(localStorage.getItem("bankBalance"))||0
this.txns=JSON.parse(localStorage.getItem("bankTxns"))||[]
this.visible=true
}

save(){
localStorage.setItem("bankUser",JSON.stringify(this.user))
localStorage.setItem("bankBalance",this.balance)
localStorage.setItem("bankTxns",JSON.stringify(this.txns))
}

register(){
if(!rUser.value||!rPass.value||!rMobile.value||!rAcc.value||!rIfsc.value)return alert("All fields required")
if(rMobile.value.length!==10)return alert("Mobile must be 10 digits")

const acc=rAcc.value.replace(/\D/g,"")
if(acc.length!==12)return alert("Account number must be 12 digits")

if(rIfsc.value.length!==11||/^[A-Za-z]+$/.test(rIfsc.value)||/^\d+$/.test(rIfsc.value))return alert("Invalid IFSC")
if(Password.score(rPass.value)<5)return alert("Weak password")

OTP.send()
if(!OTP.verify())return alert("OTP failed")

this.user={
username:rUser.value.trim(),
password:rPass.value.trim(),
account:acc,
phone:countryCode.value+rMobile.value
}

this.balance=0
this.txns=[]
this.save()

registerView.style.display="none"
loginView.style.display="flex"
}

login(){
if(!lUser.value||!lPass.value)return alert("All fields required")

const u=JSON.parse(localStorage.getItem("bankUser"))
if(!u)return alert("Register first")

if(lUser.value.trim()!==u.username||lPass.value.trim()!==u.password)return alert("Invalid login")

this.user=u
loginView.style.display="none"
appView.style.display="block"
this.update()

setInterval(()=>clock.innerText=new Date().toLocaleString(),1000)
}

update(){
balance.innerText=this.visible?`₹ ${this.balance}`:"₹ ****"
accno.innerText="Account No: **** **** "+this.user.account.slice(-4)
tbody.innerHTML=this.txns.map(t=>new Transaction(t.type,t.note,t.amount).row()).join("")
this.save()
}

deposit(){
if(+dAmt.value<=0)return alert("Invalid amount")
OTP.send()
if(!OTP.verify())return alert("OTP failed")
this.balance+=+dAmt.value
this.txns.unshift(new Transaction("Deposit","Self",+dAmt.value))
this.update()
}

withdraw(){
if(!purpose.value||!beneficiary.value)return alert("All fields required")
if(+wAmt.value<=0||+wAmt.value>this.balance)return alert("Invalid amount")
OTP.send()
if(!OTP.verify())return alert("OTP failed")
this.balance-=+wAmt.value
this.txns.unshift(new Transaction("Withdraw",beneficiary.value,-+wAmt.value))
this.update()
}

toggle(){
this.visible=!this.visible
this.update()
}

logout(){
location.reload()
}
}

const bank=new Bank()

const codes=[
["🇮🇳","+91"],["🇺🇸","+1"],["🇬🇧","+44"],["🇨🇦","+1"],["🇦🇺","+61"],["🇩🇪","+49"],["🇫🇷","+33"],["🇯🇵","+81"],["🇸🇬","+65"]
]

codes.forEach(c=>{
const o=document.createElement("option")
o.textContent=c[0]+" "+c[1]
o.value=c[1]
countryCode.appendChild(o)
})

rEye.onclick=()=>rPass.type=rPass.type==="password"?"text":"password"
lEye.onclick=()=>lPass.type=lPass.type==="password"?"text":"password"

rShow.onclick=()=>rPass.type=rPass.type==="password"?"text":"password"
lShow.onclick=()=>lPass.type=lPass.type==="password"?"text":"password"

rPass.oninput=()=>Password.draw(rPass.value,rBar,rText)
lPass.oninput=()=>Password.draw(lPass.value,lBar,lText)

rMobile.oninput=()=>rMobile.value=rMobile.value.replace(/\D/g,"").slice(0,10)
rAcc.oninput=()=>rAcc.value=rAcc.value.replace(/\D/g,"").slice(0,12)

registerBtn.onclick=()=>bank.register()
loginBtn.onclick=()=>bank.login()
toLogin.onclick=()=>{registerView.style.display="none";loginView.style.display="flex"}

dPlus.onclick=()=>dAmt.value=+dAmt.value+100
dMinus.onclick=()=>dAmt.value=Math.max(0,+dAmt.value-100)
wPlus.onclick=()=>wAmt.value=+wAmt.value+100
wMinus.onclick=()=>wAmt.value=Math.max(0,+wAmt.value-100)

depositBtn.onclick=()=>bank.deposit()
sendBtn.onclick=()=>bank.withdraw()
toggleBal.onclick=()=>bank.toggle()
logout.onclick=()=>bank.logout()
