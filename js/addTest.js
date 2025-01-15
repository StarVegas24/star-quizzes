import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore-lite.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Функція для додавання папки до Firestore, якщо вона не існує
async function addFolderIfNotExists(uid, folderName) {
  const folderDocRef = doc(db, "teachers", uid, "folders", folderName);
  const folderDoc = await getDoc(folderDocRef);
  if (!folderDoc.exists()) {
    await setDoc(folderDocRef, { name: folderName });
    console.log("Папку створено!");
  }
}

// Функція для додавання користувача до Firestore, якщо він не існує
async function addUserIfNotExists(uid) {
  const userDocRef = doc(db, "teachers", uid);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) {
    await setDoc(userDocRef, { created_at: new Date() });
    console.log("Користувача створено!");
  }
}

// Функція для додавання питання до Firestore
async function addQuestion(question) {
  try {
    const uid = new URLSearchParams(window.location.search).get("uid");
    await addUserIfNotExists(uid);
    await addFolderIfNotExists(uid, question.folder);
    await addDoc(
      collection(db, "teachers", uid, "folders", question.folder, "questions"),
      question
    );
    alert("Питання додано успішно!");
  } catch (error) {
    console.error("Помилка при додаванні питання: ", error);
  }
}

// Функція для обробки форми додавання питання
function handleAddQuestion() {
  const questionText = document.getElementById("questionText").value;
  const questionType = document.getElementById("questionType").value;
  const folder = document.getElementById("folder").value;
  const questionClass = document.getElementById("class").value;
  const difficulty = document.getElementById("difficulty").value;
  const manualCheck = document.getElementById("manualCheck").checked;
  const question = {
    text: questionText,
    type: questionType,
    folder: folder,
    class: questionClass,
    difficulty: difficulty,
    manualCheck: manualCheck,
    options: [], // Додаткові поля для варіантів відповідей в залежності від типу питання
  };

  // Додавання додаткових варіантів відповідей в залежності від типу питання
  if (questionType === "oneCorrect" || questionType === "multipleCorrect") {
    const options = document.getElementsByClassName("option");
    for (const option of options) {
      question.options.push({
        text: option.value,
        correct: option.dataset.correct === "true",
      });
    }
  }
  addQuestion(question);
}

// Додавання обробника подій для кнопки додавання питання
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("addQuestionBtn")
    .addEventListener("click", handleAddQuestion);
});

function handleQuestionTypeChange() {
  const questionType = document.getElementById("questionType").value;
  const optionsContainer = document.getElementById("optionsContainer");
  optionsContainer.innerHTML = ""; // Очистити контейнер
  if (questionType === "oneCorrect" || questionType === "multipleCorrect") {
    for (let i = 0; i < 4; i++) {
      // Наприклад, 4 варіанти відповідей
      const optionDiv = document.createElement("div");
      optionDiv.innerHTML = ` <label for="option${i}">Варіант ${
        i + 1
      }:</label> <input type="text" class="option" id="option${i}" data-correct="false"> <input type="checkbox" class="correctCheckbox" id="option${i}Correct"> Правильний `;
      optionsContainer.appendChild(optionDiv);
    }

    // Додавання обробника подій для позначення правильних відповідей
    const correctCheckboxes =
      document.getElementsByClassName("correctCheckbox");
    for (const checkbox of correctCheckboxes) {
      checkbox.addEventListener("change", function () {
        const inputId = this.id.replace("Correct", "");
        const optionInput = document.getElementById(inputId);
        optionInput.dataset.correct = this.checked ? "true" : "false";
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("questionType")
    .addEventListener("change", handleQuestionTypeChange);
});
