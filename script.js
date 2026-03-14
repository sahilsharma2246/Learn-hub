const firebaseConfig = {
    apiKey: "AIzaSyAC42sirek7m-9wnh-7FsX2ow25KFRTjVA",
    authDomain: "react-36e2c.firebaseapp.com",
    databaseURL: "https://react-36e2c-default-rtdb.firebaseio.com",
    projectId: "react-36e2c",
    storageBucket: "react-36e2c.firebasestorage.app",
    messagingSenderId: "995727795506",
    appId: "1:995727795506:web:420373ff0c0057b7a9a32b"
};

firebase.initializeApp(firebaseConfig);

const loginDB = firebase.database().ref("Login");
const courseDB = firebase.database().ref("Courses");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let adminKey = localStorage.getItem("adminKey");
let updateKey = null;

function login() {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  loginDB.once("value", snapshot => {
    let data = snapshot.val();
    for (let key in data) {
      if (data[key].email === email && data[key].password === password) {
        loginDB.child(key).update({ status: "1" });
        localStorage.setItem("adminKey", key);
        window.location = "dashboard.html";
        return;
      }
    }
    alert("Invalid Email or Password");
  });
}

function logout() {
  let key = localStorage.getItem("adminKey");
  if (key) loginDB.child(key).update({ status: "0" });
  localStorage.removeItem("adminKey");
  window.location = "login.html";
}

function checkAdmin() {
  let key = localStorage.getItem("adminKey");
  if (!key) window.location = "login.html";
  loginDB.child(key).once("value", snapshot => {
    let data = snapshot.val();
    if (!data || data.status != "1") window.location = "login.html";
  });
}

function addCourse() {
  let title = document.getElementById("title").value;
  let price = document.getElementById("price").value;
  let image = document.getElementById("image").value;
  let duration = document.getElementById("duration").value;
  let description = document.getElementById("description").value;

  if (!title || !price || !image || !duration || !description) {
    alert("Please fill all fields!");
    return;
  }

  let courseData = { title, price, image, duration, description };

  if (updateKey) {
    courseDB.child(updateKey).update(courseData);
    alert("Course Updated");
    updateKey = null;
  } else {
    courseDB.push(courseData);
    alert("Course Added");
  }

  displayDashboardCourses();
  displayCourses();
}

function deleteCourse(key){
  if(!adminKey) {
    alert("Only admin can delete courses");
    return;
  }
  if(confirm("Delete this course?")) courseDB.child(key).remove();
}

function editCourse(key,title,price,image,duration,description){
  document.getElementById("title").value = title;
  document.getElementById("price").value = price;
  document.getElementById("image").value = image;
  document.getElementById("duration").value = duration;
  document.getElementById("description").value = description;
  updateKey = key;
}

function displayCourses() {
  let container = document.getElementById("courses");
  if (!container) return;

  courseDB.on("value", snapshot => {
    container.innerHTML = "";
    snapshot.forEach(data => {
      let course = data.val();
      container.innerHTML += `
        <div class="course" onclick='showCourseDetails(${JSON.stringify(course)})'>
          <div class="course-img"><img src="${course.image}"></div>
          <h3>${course.title}</h3>
          <p>₹${course.price}</p>
          <button onclick='addToCart(${JSON.stringify(course)})'>Add To Cart</button>
        </div>
      `;
    });
  });
}

function displayDashboardCourses(){
  let table = document.getElementById("courseTable");
  if(!table) return;

  courseDB.on("value", snapshot => {
    table.innerHTML = "";
    let sno = 1;
    snapshot.forEach(data => {
      let course = data.val();
      let key = data.key;
      table.innerHTML += `
        <tr>
          <td>${sno++}</td>
          <td>${course.title}</td>
          <td>₹${course.price}</td>
          <td><img src="${course.image}"></td>
          <td>${course.duration}</td>
          <td>
            <button onclick="editCourse('${key}','${course.title}','${course.price}','${course.image}','${course.duration}','${course.description}')">Update</button>
            <button onclick="deleteCourse('${key}')">Delete</button>
          </td>
        </tr>
      `;
    });
  });
}

function searchCourse(){
  let input = document.getElementById("search").value.toLowerCase();
  let courses = document.querySelectorAll(".course");
  courses.forEach(course => {
    let title = course.querySelector("h3").innerText.toLowerCase();
    course.style.display = title.includes(input) ? "block" : "none";
  });
}

function addToCart(course) {
  let cartData = JSON.parse(localStorage.getItem("cart")) || [];
  cartData.push(course);
  localStorage.setItem("cart", JSON.stringify(cartData));
  alert("Course Added To Cart");
  displayCart();
}

function removeFromCart(index){
  let cartData = JSON.parse(localStorage.getItem("cart")) || [];
  cartData.splice(index,1);
  localStorage.setItem("cart", JSON.stringify(cartData));
  displayCart();
}

function displayCart() {
  let container = document.getElementById("cartItems");
  let totalBox = document.getElementById("total");
  if (!container) return;

  let cartData = JSON.parse(localStorage.getItem("cart")) || [];
  container.innerHTML = "";
  let total = 0;

  cartData.forEach((course,index) => {
    total += Number(course.price);
    container.innerHTML += `
      <div class="cart-row">
        <div class="cart-left">
          <img src="${course.image}">
          <div class="course-details">
            <h3>${course.title}</h3>
            <p>${course.duration}</p>
          </div>
        </div>
        <div class="cart-price">₹${course.price}</div>
        <button class="cart-remove" onclick="removeFromCart(${index})">Remove</button>
      </div>
    `;
  });

  if(totalBox) totalBox.innerHTML = "Total: ₹" + total;
}

function showCourseDetails(course){
  alert(`Title: ${course.title}\nPrice: ₹${course.price}\nDuration: ${course.duration}\nDescription: ${course.description}`);
}

displayCourses();
displayCart();
displayDashboardCourses();