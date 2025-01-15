import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore-lite.js";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
    questionElement.innerHTML = ` <h4>${question.text}</h4> ${question.options
      .map(
        (option, index) =>
          ` <p> <label> <input type="checkbox" ${
            option.correct ? "checked" : ""
          } disabled> ${option.text} </label> </p> `
      )
      .join("")} <p>Клас: ${question.class}</p> <p>Складність: ${
      question.difficulty
    }</p> <input type="checkbox" class="select-question" value="${
      doc.id
    }"> Обрати для тестування `;
    questionsContainer.appendChild(questionElement);
  });
}

// Створення тестування
async function createTest() {
  const uid = new URLSearchParams(window.location.search).get("uid");
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
  const uid = new URLSearchParams(window.location.search).get("uid");
  const folderId = new URLSearchParams(window.location.search).get("folderId");
  if (uid && folderId) {
    loadQuestions(uid, folderId);
  } else {
    alert("Параметри URL не вказані.");
  }
  document
    .getElementById("createTestBtn")
    .addEventListener("click", createTest);
});

document.addEventListener("DOMContentLoaded", () => {
  const uid = new URLSearchParams(window.location.search).get("uid");
  const folderId = new URLSearchParams(window.location.search).get("folderId");
  if (uid && folderId) {
    loadQuestions(uid, folderId);
  } else {
    alert("Параметри URL не вказані.");
  }
  document
    .getElementById("createTestBtn")
    .addEventListener("click", createTest);
});
