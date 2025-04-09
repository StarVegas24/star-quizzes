import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  addDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore-lite.js";
import { difficulty, checkAccess } from "./helpers.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let user = JSON.parse(localStorage.getItem("user") || "null");
checkAccess(user, db);

// Завантаження питань з папки
async function loadQuestions(uid, folderId) {
  const querySnapshot = await getDocs(
    collection(db, "teachers", uid, "folders", folderId, "questions")
  );
  const questionsContainer = document.getElementById("questions");
  querySnapshot.forEach((doc) => {
    const question = doc.data();
    const questionElement = document.createElement("div");
    questionElement.className = "question";
    questionElement.innerHTML = ` <h4 class="question">${
      question.text
    }</h4> ${question.options
      .map(
        (option, index) =>
          ` <div class="checkbox-container"> 
        <input type="checkbox" ${option.correct ? "checked" : ""} id="${
            doc.id
          }${index}" disabled> 
           <label for="${doc.id}${index}">  ${option.text} </label></div> `
      )
      .join("")} <p>Клас: ${question.class}</p> <p>Складність: ${difficulty.get(
      question.difficulty
    )}</p><div class="option"> <input type="checkbox" class="select-question" id="question${
      doc.id
    }" value="${doc.id}"> <label for="question${
      doc.id
    }"><b>Обрати для тестування </b></label> </div>`;
    questionsContainer.appendChild(questionElement);
  });
}

// Створення тестування
async function createTest() {
  const uid = user.uid;
  const folderId = new URLSearchParams(window.location.search).get("folderId");
  const selectedQuestions = Array.from(
    document.getElementsByClassName("select-question")
  )
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
  if (selectedQuestions.length === 0) {
    alert("Будь ласка, оберіть питання для тестування.");
    return;
  }
  console.log(selectedQuestions);
  const testDocRef = await addDoc(collection(db, "tests"), {
    teacherId: uid,
    folderId: folderId,
    questions: selectedQuestions,
    createdAt: new Date(),
  });

  const testId = testDocRef.id;
  document.getElementById(
    "testLink"
  ).innerHTML = `<a href="test.html?testId=${testId}">Перейти до тестування</a>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const uid = user.uid;
  const folderId = new URLSearchParams(window.location.search).get("folderId");
  if (folderId) {
    loadQuestions(uid, folderId);
  } else {
    location.replace("teacher.html");
  }
  document
    .getElementById("createTestBtn")
    .addEventListener("click", createTest);
});
