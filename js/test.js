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
      // console.log("Тест:", test); // Додано журнал налагодження
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
          questionElement.innerHTML = ` <h4 class="question">${
            question.text
          }</h4> ${question.options
            .map(
              (option, index) =>
                ` <p class="checkbox-container">
              <input id="question-${questionId}" type="checkbox" name="question-${questionId}" value="${option.text}">
              <label for="question-${questionId}">  ${option.text} </label></p> `
            )
            .join("")} `;
          questionsContainer.appendChild(questionElement);
        } else {
          console.log(`Питання з ID ${questionId} не знайдено`); // Додано журнал налагодження
        }
      }
    } else {
      console.log(`Тест з ID ${testId} не знайдено`); // Додано журнал налагодження
      location.replace("/index.html");
    }
  } catch (error) {
    console.error("Помилка завантаження тесту:", error); // Додано журнал налагодження
    alert("Помилка завантаження тесту");
    location.replace("/index.html");
  }
}

// Підрахунок балів та збереження результатів
async function submitTest() {
  const testId = new URLSearchParams(window.location.search).get("testId");
  const lastName = document.getElementById("lastName").value;
  const firstName = document.getElementById("firstName").value;

  if (lastName.length < 3 || firstName.length < 3) {
    alert("Вкажіть прізвище та імʼя!");
    return;
  }

  const selectedAnswers = Array.from(
    document.querySelectorAll('input[type="checkbox"]:checked')
  ).map((checkbox) => checkbox.value);

  let score = 0;
  let totalQuestions = 0;
  const results = [];
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
            if (!option.correct && selectedAnswers.includes(option.text)) {
              questionScore -= 0.5;
            }
          }

          if (questionScore < 0) {
            questionScore = 0;
          }

          score += questionScore;
          results.push({
            questionId,
            questionScore,
          });
        }
      }
    }

    const result = (score / results.length) * 12;

    document.querySelectorAll("input").forEach((input) => {
      input.disabled = true;
    });

    document.getElementById("result").innerHTML = `Ви отримали ${Math.round(
      result
    )} балів з 12 можливих.`;

    await setDoc(doc(collection(db, "testResults")), {
      testId: testId,
      lastName: lastName,
      firstName: firstName,
      score: Math.round(result),
      submittedAt: new Date(),
      results: results,
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
    location.replace("/index.html");
  }
  document
    .getElementById("submitTestBtn")
    .addEventListener("click", submitTest);
});
