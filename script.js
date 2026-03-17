// ==========================
// 🔥 SYSTEM LOG FUNCTION
// ==========================

function addLog(message) {

let logBox = document.getElementById("logs");

if (!logBox) return;

let time = new Date().toLocaleTimeString();

let log = document.createElement("p");
log.innerText = `[${time}] ${message}`;

logBox.appendChild(log);

// auto scroll
logBox.scrollTop = logBox.scrollHeight;

}

// ==========================
// PASSWORD ANALYZER
// ==========================

function analyzePassword(){

let password=document.getElementById("passwordInput").value;
let score=0;

if(password.length>=8) score++;
if(/[A-Z]/.test(password)) score++;
if(/[a-z]/.test(password)) score++;
if(/[0-9]/.test(password)) score++;
if(/[^A-Za-z0-9]/.test(password)) score++;

let result="Weak";

if(score==5) result="Very Strong";
else if(score>=4) result="Strong";
else if(score>=3) result="Medium";

document.getElementById("strengthResult").innerText="Strength: "+result;
document.getElementById("strengthVisual").innerText="Strength Level: "+result;

// 🔥 LOGICAL TIPS (THIS MAKES IT SMART)
let tips = "";

if(password.length < 8) tips += "Use at least 8 characters. ";
if(!/[A-Z]/.test(password)) tips += "Add uppercase letters. ";
if(!/[0-9]/.test(password)) tips += "Include numbers. ";
if(!/[^A-Za-z0-9]/.test(password)) tips += "Use special characters. ";

document.getElementById("securityTips").innerText =
tips || "Good password 👍";

// 🔥 LOGS
let logBox = document.getElementById("passwordLogs");

if(logBox){
let time = new Date().toLocaleTimeString();
let log = document.createElement("p");
log.innerText = `[${time}] Password checked → ${result}`;
logBox.appendChild(log);
logBox.scrollTop = logBox.scrollHeight;
}

addLog("Password module used");

}

// ==========================
// PASSWORD GENERATOR
// ==========================

function generatePassword(){

let chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
let password="";

for(let i=0;i<12;i++){
password+=chars[Math.floor(Math.random()*chars.length)];
}

document.getElementById("generatedPassword").innerText=password;

addLog("Secure password generated");

}

// ==========================
// ENCRYPT TEXT
// ==========================

function encryptText(){

let text=document.getElementById("cipherText").value;
let shift=parseInt(document.getElementById("shiftValue").value);

if(!text || isNaN(shift)){
alert("Enter text and shift!");
return;
}

let result="";

for(let i=0;i<text.length;i++){

let c=text.charCodeAt(i);

if(c>=65 && c<=90)
result+=String.fromCharCode((c-65+shift)%26+65);

else if(c>=97 && c<=122)
result+=String.fromCharCode((c-97+shift)%26+97);

else
result+=text[i];

}

document.getElementById("cipherResult").innerText=result;
document.getElementById("cipherShiftInfo").innerText="Shift: +"+shift;

// LOG
addEncryptionLog("Text encrypted (shift " + shift + ")");

addLog("Encryption used");

}

// ==========================
// FILE ENCRYPTION
// ==========================

function encryptFile(){

let file=document.getElementById("fileInput").files[0];
let shift=parseInt(document.getElementById("fileShift").value);

if(!file){
alert("Please select a file");
return;
}

let reader=new FileReader();

reader.onload=function(e){

let text=e.target.result;
let result="";

for(let i=0;i<text.length;i++){

let c=text.charCodeAt(i);

if(c>=65 && c<=90)
result+=String.fromCharCode((c-65+shift)%26+65);

else if(c>=97 && c<=122)
result+=String.fromCharCode((c-97+shift)%26+97);

else
result+=text[i];

}

document.getElementById("fileResult").innerText="File encrypted successfully!";

let blob=new Blob([result],{type:"text/plain"});

let link=document.createElement("a");
link.href=URL.createObjectURL(blob);
link.download="encrypted.txt";
link.click();

addLog("File encrypted & downloaded");

};

reader.readAsText(file);

}

// ==========================
// HASH GENERATOR
// ==========================

async function generateHash(){

let text=document.getElementById("hashInput").value;

if(!text){
alert("Enter text first!");
return;
}

let encoder=new TextEncoder();
let data=encoder.encode(text);

let hashBuffer=await crypto.subtle.digest("SHA-256",data);

let hashArray=Array.from(new Uint8Array(hashBuffer));

let hashHex=hashArray
.map(b=>b.toString(16).padStart(2,"0"))
.join("");

document.getElementById("hashResult").innerText=hashHex;

addLog("SHA-256 hash generated");

}

// ==========================
// BRUTE FORCE SIMULATOR
// ==========================

async function startCrack(){

let target = document.getElementById("targetPassword").value;
let resultBox = document.getElementById("crackResult");

let attemptsBox = document.getElementById("attemptCount");
let timeBox = document.getElementById("timeTaken");
let statusBox = document.getElementById("attackStatus");

if(!target){
alert("Enter a password to simulate cracking.");
return;
}

let chars="abcdefghijklmnopqrstuvwxyz0123456789";
let attempt="";
let attempts=0;

let startTime = Date.now();

function sleep(ms){
return new Promise(resolve=>setTimeout(resolve,ms));
}

statusBox.innerText = "Status: Attacking...";
addCrackLog("Brute force attack started");

for(let i=0;i<chars.length;i++){
for(let j=0;j<chars.length;j++){
for(let k=0;k<chars.length;k++){

attempt = chars[i]+chars[j]+chars[k];
attempts++;

resultBox.innerText = "Trying: " + attempt;
attemptsBox.innerText = "Attempts: " + attempts;

await sleep(10);

if(attempt === target){

let time = ((Date.now() - startTime)/1000).toFixed(2);

resultBox.innerText =
"✅ Password Cracked!\n\n"+
"Password: "+attempt+"\n"+
"Attempts: "+attempts+"\n"+
"Time: "+time+"s";

timeBox.innerText = "Time: " + time + "s";
statusBox.innerText = "Status: Success";

addCrackLog("Password cracked in " + attempts + " attempts");

return;

}

}}}

let time = ((Date.now() - startTime)/1000).toFixed(2);

resultBox.innerText = "❌ Password not found (3-char limit)";
timeBox.innerText = "Time: " + time + "s";
statusBox.innerText = "Status: Failed";

addCrackLog("Attack failed");

}

function addCrackLog(message){

let logBox = document.getElementById("crackLogs");

if(!logBox) return;

let time = new Date().toLocaleTimeString();

let log = document.createElement("p");
log.innerText = `[${time}] ${message}`;

logBox.appendChild(log);
logBox.scrollTop = logBox.scrollHeight;

}

// ==========================
// SECTION SWITCH + ACTIVE MENU
// ==========================

function showSection(section){

// hide sections
document.querySelectorAll(".toolSection")
.forEach(sec=>sec.classList.remove("active"));

// show selected
document.getElementById(section+"Section")
.classList.add("active");

// sidebar active effect
document.querySelectorAll(".sidebar ul li")
.forEach(li=>li.classList.remove("active"));

event.target.classList.add("active");

// log it
addLog("Switched to " + section + " module");

// remove focus when switching sections
let terminalInput = document.getElementById("terminalInput");

if(terminalInput){
terminalInput.blur();
}

}

// ==========================
// INITIAL LOAD
// ==========================

window.onload = () => {
showSection("dashboard");
addLog("System initialized");
addLog("All modules loaded");
};


// ==========================
// 🔥 LIVE SYSTEM STATS
// ==========================

function updateStats(){

let cpu = document.getElementById("cpuStat");
let net = document.getElementById("networkStat");
let threat = document.getElementById("threatStat");

if(!cpu) return;

// random CPU
cpu.innerText = Math.floor(Math.random()*60+20) + "%";

// random network
let states = ["Stable","Monitoring","Active","Secured"];
net.innerText = states[Math.floor(Math.random()*states.length)];

// random threats (rare)
let t = Math.random();
if(t > 0.85){
threat.innerText = "1";
addLog("⚠ Potential threat detected");
} else {
threat.innerText = "0";
}

}

// update every 2 sec
setInterval(updateStats,2000);

function decryptText(){

let text=document.getElementById("cipherText").value;
let shift=parseInt(document.getElementById("shiftValue").value);

if(!text || isNaN(shift)){
alert("Enter text and shift!");
return;
}

let result="";

for(let i=0;i<text.length;i++){

let c=text.charCodeAt(i);

if(c>=65 && c<=90)
result+=String.fromCharCode((c-65-shift+26)%26+65);

else if(c>=97 && c<=122)
result+=String.fromCharCode((c-97-shift+26)%26+97);

else
result+=text[i];

}

document.getElementById("cipherResult").innerText=result;
document.getElementById("cipherShiftInfo").innerText="Shift: -"+shift;

addEncryptionLog("Text decrypted (shift " + shift + ")");

}

function smartDecrypt(){

let text=document.getElementById("cipherText").value;

if(!text){
alert("Enter text first!");
return;
}

let results=[];
let commonWords=["the","and","is","you","hello","hi"];

for(let shift=1; shift<26; shift++){

let result="";

for(let i=0;i<text.length;i++){

let c=text.charCodeAt(i);

if(c>=65 && c<=90)
result+=String.fromCharCode((c-65-shift+26)%26+65);

else if(c>=97 && c<=122)
result+=String.fromCharCode((c-97-shift+26)%26+97);

else
result+=text[i];

}

// score readability
let score=0;
let lower=result.toLowerCase();

commonWords.forEach(word=>{
if(lower.includes(word)) score++;
});

results.push({shift,result,score});

}

// sort best result first
results.sort((a,b)=>b.score-a.score);

// display results
let output="🔍 Possible Decryptions:\n\n";

results.slice(0,5).forEach(r=>{
output+=`Shift ${r.shift}: ${r.result}\n\n`;
});

document.getElementById("cipherResult").innerText=output;

// log best guess
addLog("Smart decryption executed (best shift: " + results[0].shift + ")");

document.getElementById("cipherShiftInfo").innerText =
"Detected Shift: " + results[0].shift;

addEncryptionLog("Smart decryption executed");

}

function addEncryptionLog(message){

let logBox = document.getElementById("encryptionLogs");

if(!logBox) return;

let time = new Date().toLocaleTimeString();

let log = document.createElement("p");
log.innerText = `[${time}] ${message}`;

logBox.appendChild(log);
logBox.scrollTop = logBox.scrollHeight;

}



function printLine(text){

let line = document.createElement("p");
line.innerText = "> " + text;
output.appendChild(line);

output.scrollTop = output.scrollHeight;

}

// COMMAND HANDLER
function runCommand(cmd){

printLine(cmd);

switch(cmd.toLowerCase()){

case "help":
printLine("Commands: help, clear, status, scan, logs");
break;

case "clear":
output.innerHTML="";
break;

case "status":
printLine("System: ACTIVE");
printLine("Network: STABLE");
addLog("Status checked via terminal");
break;

case "scan":
printLine("Scanning system...");
setTimeout(()=>{
printLine("No threats found ✅");
addLog("System scan completed");
},1000);
break;

case "logs":
printLine("Opening system logs...");
addLog("Logs accessed from terminal");
break;

default:
printLine("Unknown command");
}

}

// ==========================
// 🔥 TYPE EFFECT
// ==========================

function typeLine(text, speed = 30){

return new Promise(resolve => {

let output = document.getElementById("terminalOutput");
let line = document.createElement("p");

output.appendChild(line);

let i = 0;

function typing(){
if(i < text.length){
line.innerHTML += text.charAt(i);
i++;
setTimeout(typing, speed);
} else {
resolve();
}
}

typing();

});

}

// ==========================
// 🚀 BOOT SEQUENCE
// ==========================

async function bootSequence(){

await typeLine("> Initializing system...");
await typeLine("> Loading security modules...");
await typeLine("> Connecting network...");
await typeLine("> Access granted ✅");
await typeLine("> Welcome to CYBER TERMINAL");

addLog("System boot completed");

}

window.onload = () => {
showSection("dashboard");
bootSequence();
};

// ==========================
// ⚡ FAKE HACK EFFECT
// ==========================

function fakeHack(){

let output = document.getElementById("terminalOutput");

let chars = "01ABCDEF!@#$%^&*";
let count = 0;

let interval = setInterval(()=>{

let randomLine = "";
for(let i=0;i<40;i++){
randomLine += chars[Math.floor(Math.random()*chars.length)];
}

let line = document.createElement("p");
line.innerText = randomLine;

output.appendChild(line);

output.scrollTop = output.scrollHeight;

count++;

if(count > 15){
clearInterval(interval);
let done = document.createElement("p");
done.innerText = "> Hack simulation complete ✅";
output.appendChild(done);
}

},50);

}

// ==========================
// 💻 TERMINAL COMMANDS UPGRADE
// ==========================

function runCommand(cmd){

let output = document.getElementById("terminalOutput");

function print(text){
let line = document.createElement("p");
line.innerText = "> " + text;
output.appendChild(line);
output.scrollTop = output.scrollHeight;
}

print(cmd);

switch(cmd.toLowerCase()){

case "help":
print("Commands: help, clear, status, scan, hack, logs");
break;

case "clear":
output.innerHTML="";
break;

case "status":
print("System: ACTIVE");
print("Network: STABLE");
addLog("Status checked");
break;

case "scan":
print("Scanning system...");
setTimeout(()=>{
print("No threats found ✅");
addLog("Scan complete");
},1000);
break;

case "hack":
print("Launching hack simulation...");
fakeHack();
addLog("Hack simulation started");
break;

case "logs":
print("Opening logs...");
addLog("Logs viewed");
break;

default:
print("Unknown command");
}

}

// ==========================
// ⌨ INPUT LISTENER
// ==========================

setTimeout(()=>{

let input = document.getElementById("terminalInput");

input.addEventListener("keypress", function(e){

if(e.key === "Enter"){

let command = input.value.trim();
runCommand(command);
input.value = "";

}

});

},500);

async function scanPorts(){

let ip = document.getElementById("targetIP").value;
let start = parseInt(document.getElementById("startPort").value);
let end = parseInt(document.getElementById("endPort").value);

let resultBox = document.getElementById("scanResult");
let summary = document.getElementById("scanSummary");

if(!ip || isNaN(start) || isNaN(end)){
alert("Enter valid IP and port range");
return;
}

resultBox.innerText = "";
summary.innerText = "Status: Scanning...";

addNetworkLog("Scan started on " + ip);

let openPorts = [];

function sleep(ms){
return new Promise(resolve => setTimeout(resolve, ms));
}

// simulate scanning
for(let port = start; port <= end; port++){

resultBox.innerText = "Scanning port: " + port;

await sleep(50);

// random open/closed simulation
if(Math.random() > 0.8){
openPorts.push(port);
addNetworkLog("Port " + port + " is OPEN");
} else {
addNetworkLog("Port " + port + " is closed");
}

}

let output = "Scan Complete\n\n";

if(openPorts.length === 0){
output += "No open ports found";
summary.innerText = "Status: Secure";
} else {
output += "Open Ports:\n" + openPorts.join(", ");
summary.innerText = "Status: Vulnerable (" + openPorts.length + " open)";
}

resultBox.innerText = output;

addNetworkLog("Scan completed");

addLog("Network scan executed");

}

function addNetworkLog(message){

let logBox = document.getElementById("networkLogs");

if(!logBox) return;

let time = new Date().toLocaleTimeString();

let log = document.createElement("p");
log.innerText = `[${time}] ${message}`;

logBox.appendChild(log);
logBox.scrollTop = logBox.scrollHeight;

}

document.addEventListener("DOMContentLoaded", () => {

let input = document.getElementById("terminalInput");

if(!input) return;

input.addEventListener("keypress", function(e){

if(e.key === "Enter"){

let command = input.value.trim();

runCommand(command);

input.value = "";

}

});

});