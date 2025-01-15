import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDoc,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore-lite.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Завантаження питань тесту
async function loadTest(testId) {
  try {
    const testDoc = await getDoc(doc(db, "tests", testId));
    if (testDoc.exists()) {
      const test = testDoc.data();
      console.log("Тест:", test); // Додано журнал налагодження
      const questionsContainer = document.getElementById("questions");
      for (const questionId of test.questions) {
        const questionDoc = await getDoc(
          doc(
            db,
            "teachers",
            test.teacherId,
            "folders",
            test.folderId,
            "questions",
            questionId
          )
        );
        if (questionDoc.exists()) {
          const question = questionDoc.data();
          console.log("Питання:", question); // Додано журнал налагодження
          const questionElement = document.createElement("div");
          questionElement.className = "question";
          questionElement.innerHTML = ` <h4>${
            question.text
          }</h4> ${question.options
            .map(
              (option, index) =>
                ` <p> <label> <input type="checkbox" name="question-${questionId}" value="${option.text}"> ${option.text} </label> </p> `
            )
            .join("")} `;
          questionsContainer.appendChild(questionElement);
        } else {
          console.log(`Питання з ID ${questionId} не знайдено`); // Додано журнал налагодження
        }
      }
    } else {
      console.log(`Тест з ID ${testId} не знайдено`); // Додано журнал налагодження
    }
  } catch (error) {
    console.error("Помилка завантаження тесту:", error); // Додано журнал налагодження
  }
}

// Підрахунок балів та збереження результатів
async function submitTest() {
  const testId = new URLSearchParams(window.location.search).get("testId");
  const lastName = document.getElementById("lastName").value;
  const firstName = document.getElementById("firstName").value;
  const selectedAnswers = Array.from(
    document.querySelectorAll('input[type="checkbox"]:checked')
  ).map((checkbox) => checkbox.value);
  let correctAnswersCount = 0;
  let totalQuestions = 0;
  try {
    const testDoc = await getDoc(doc(db, "tests", testId));
    if (testDoc.exists()) {
      const test = testDoc.data();
      totalQuestions = test.questions.length; // Встановлення загальної кількості питань
      for (const questionId of test.questions) {
        const questionDoc = await getDoc(
          doc(
            db,
            "teachers",
            test.teacherId,
            "folders",
            test.folderId,
            "questions",
            questionId
          )
        );
        if (questionDoc.exists()) {
          const question = questionDoc.data();
          let questionScore = 0;
          for (const option of question.options) {
            if (option.correct && selectedAnswers.includes(option.text)) {
              questionScore++;
            }
          }
          correctAnswersCount += Math.min(questionScore, 1); // Максимум одна правильна відповідь за питання
        }
      }
    }
    const score = (correctAnswersCount / totalQuestions) * 12;
    document.getElementById("result").innerHTML = `Ви отримали ${Math.round(
      score
    )} балів з 12 можливих.`;
    await setDoc(doc(collection(db, "testResults")), {
      testId: testId,
      lastName: lastName,
      firstName: firstName,
      score: Math.round(score),
      submittedAt: new Date(),
    });
  } catch (error) {
    console.error(
      "Помилка підрахунку балів або збереження результатів:",
      error
    ); // Додано журнал налагодження
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const testId = new URLSearchParams(window.location.search).get("testId");
  if (testId) {
    loadTest(testId);
  } else {
    alert("Параметр тесту не вказаний.");
  }
  document
    .getElementById("submitTestBtn")
    .addEventListener("click", submitTest);
});
