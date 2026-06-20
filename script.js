// =====================
// LOADER
// =====================

window.addEventListener("load",()=>{

const loader=
document.getElementById("loader");

if(loader){

setTimeout(()=>{

loader.style.opacity="0";

setTimeout(()=>{

loader.style.display="none";

},800);

},1000);

}

loadProfile();
loadJournal();

});

// =====================
// DARK MODE
// =====================

function toggleDarkMode(){

document.body.classList.toggle("dark");

localStorage.setItem(
"theme",
document.body.classList.contains("dark")
);

}

window.addEventListener("load",()=>{

if(
localStorage.getItem("theme")
==="true"
){
document.body.classList.add("dark");
}

});

// =====================
// LOGIN
// =====================

const loginForm =
document.getElementById("loginForm");

if(loginForm){

loginForm.addEventListener("submit",e=>{

e.preventDefault();

alert("Login Successful");

window.location.href =
"dashboard.html";

});

}

// =====================
// SIGNUP
// =====================

const signupForm =
document.getElementById("signupForm");

if(signupForm){

signupForm.addEventListener("submit",e=>{

e.preventDefault();

const password =
document.getElementById("password").value;

const confirm =
document.getElementById("confirmPassword").value;

if(password !== confirm){

alert("Passwords do not match");
return;

}

alert("Account Created");

window.location.href =
"dashboard.html";

});

}

// =====================
// AI CHAT
// =====================

function sendMessage(){

const input =
document.getElementById("messageInput");

const messages =
document.getElementById("messages");

if(!input || !messages) return;

const text =
input.value.trim();

if(text==="") return;

messages.innerHTML +=
`<p><strong>You:</strong> ${text}</p>`;

setTimeout(()=>{

const replies=[

"Thank you for sharing that with me.",

"I'm here to listen. Tell me more.",

"That sounds important. How are you feeling about it?",

"Your feelings matter.",

"Taking time to reflect is a positive step."

];

const reply=
replies[
Math.floor(
Math.random()*replies.length
)
];

messages.innerHTML +=
`<p><strong>MindCare AI:</strong> ${reply}</p>`;

messages.scrollTop =
messages.scrollHeight;

},1000);

detectRisk(text);

input.value="";

}

function detectRisk(message){

const warningWords=[
"hopeless",
"give up",
"suicide",
"end my life"
];

const risk=
warningWords.some(word=>
message.toLowerCase().includes(word)
);

if(risk){

alert(
"Please reach out to a trusted adult, counselor, mental health professional, or local emergency service if you feel unsafe."
);

}

}

// Enter Key

window.addEventListener("load",()=>{

const chatInput =
document.getElementById("messageInput");

if(chatInput){

chatInput.addEventListener(
"keypress",
function(e){

if(e.key==="Enter"){

e.preventDefault();

sendMessage();

}

}
);

}

});

// =====================
// ASSESSMENT
// =====================

function calculatePremiumAssessment(){

const q1=
Number(document.getElementById("q1").value);

const q2=
Number(document.getElementById("q2").value);

const q3=
Number(document.getElementById("q3").value);

const total=q1+q2+q3;

let result="";
let recommendation="";

if(total<=2){

result="Minimal";
recommendation=
"Continue healthy self-care habits.";

}
else if(total<=4){

result="Mild";
recommendation=
"Practice mindfulness and journaling.";

}
else if(total<=6){

result="Moderate";
recommendation=
"Monitor stress levels and seek support if needed.";

}
else{

result="High";
recommendation=
"Consider speaking with a counselor or trusted support person.";

}

document.getElementById("result")
.innerText=
"Assessment Result: "+result;

document.getElementById("recommendation")
.innerText=
recommendation;

}

// =====================
// JOURNAL
// =====================

function saveJournal(){

const mood=
document.getElementById("mood").value;

const entry=
document.getElementById("journalEntry").value;

if(entry.trim()==="") return;

const data={
mood,
entry,
date:new Date().toLocaleString()
};

localStorage.setItem(
"mindcareJournal",
JSON.stringify(data)
);

loadJournal();

alert("Journal Saved");

}

function loadJournal(){

const saved=
localStorage.getItem("mindcareJournal");

if(
saved &&
document.getElementById("savedEntry")
){

const data=
JSON.parse(saved);

document.getElementById("savedEntry")
.innerHTML=

`<strong>${data.date}</strong>
<br><br>
${data.mood}
<br><br>
${data.entry}`;

}

}

// =====================
// PROFILE
// =====================

function saveProfile(){

const profile={

name:
document.getElementById("profileName").value,

age:
document.getElementById("profileAge").value,

gender:
document.getElementById("profileGender").value

};

localStorage.setItem(
"profile",
JSON.stringify(profile)
);

alert("Profile Updated");

}

function loadProfile(){

const saved=
localStorage.getItem("profile");

if(
saved &&
document.getElementById("profileName")
){

const profile=
JSON.parse(saved);

document.getElementById("profileName").value=
profile.name || "";

document.getElementById("profileAge").value=
profile.age || "";

document.getElementById("profileGender").value=
profile.gender || "";

}

}

// =====================
// THREE JS BACKGROUND
// =====================

if(
document.getElementById("bg")
&& typeof THREE !== "undefined"
){

const scene=new THREE.Scene();

const camera=
new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
);

const renderer=
new THREE.WebGLRenderer({
alpha:true,
antialias:true
});

renderer.setSize(
window.innerWidth,
window.innerHeight
);

document
.getElementById("bg")
.appendChild(renderer.domElement);

camera.position.z=30;

const geometry=
new THREE.SphereGeometry(
0.15,
16,
16
);

const material=
new THREE.MeshBasicMaterial({
color:0x60a5fa
});

for(let i=0;i<500;i++){

const particle=
new THREE.Mesh(
geometry,
material
);

particle.position.x=
(Math.random()-0.5)*60;

particle.position.y=
(Math.random()-0.5)*60;

particle.position.z=
(Math.random()-0.5)*60;

scene.add(particle);

}

function animate(){

requestAnimationFrame(
animate
);

scene.rotation.y+=0.0008;
scene.rotation.x+=0.0003;

renderer.render(
scene,
camera
);

}

animate();

}