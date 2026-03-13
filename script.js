const firebaseConfig = {
  apiKey: "AIzaSyAC42sirek7m-9wnh-7FsX2ow25KFRTjVA",
    authDomain: "react-36e2c.firebaseapp.com",
    
    projectId: "react-36e2c",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

function register(){

let email=document.getElementById("email").value;
let password=document.getElementById("password").value;

auth.createUserWithEmailAndPassword(email,password)
.then(()=>alert("Registered"));

}

function login(){

let email=document.getElementById("email").value;
let password=document.getElementById("password").value;

auth.signInWithEmailAndPassword(email,password)
.then(()=>window.location="dashboard.html");

}

function uploadCourse(){

let title=document.getElementById("title").value;
let desc=document.getElementById("desc").value;

db.collection("courses").add({
title:title,
desc:desc
});

alert("Course uploaded");

}

if(document.getElementById("courses")){

db.collection("courses").onSnapshot(snapshot=>{

let html="";

snapshot.forEach(doc=>{

let data=doc.data();

html+=`
<div class="course">
<h3>${data.title}</h3>
<p>${data.desc}</p>
<a href="course.html?id=${doc.id}">Open</a>
</div>
`;

});

document.getElementById("courses").innerHTML=html;

});

}

const params = new URLSearchParams(window.location.search);
const courseId = params.get("id");

if(courseId){

db.collection("courses").doc(courseId).get().then(doc=>{

let data=doc.data();

document.getElementById("title").innerText=data.title;
document.getElementById("desc").innerText=data.desc;

});

}

function addComment(){

let text=document.getElementById("commentInput").value;

db.collection("comments").add({
course:courseId,
text:text
});

}

if(document.getElementById("comments")){

db.collection("comments").where("course","==",courseId)
.onSnapshot(snapshot=>{

let html="";

snapshot.forEach(doc=>{

html+=`<div class="comment">${doc.data().text}</div>`;

});

document.getElementById("comments").innerHTML=html;

});

}