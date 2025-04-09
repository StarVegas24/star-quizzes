import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore-lite.js";
import { checkAccess } from "./helpers.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let user = JSON.parse(localStorage.getItem("user") || "null");
checkAccess(user, db);

// Завантаження тексту питань за їх ID
async function getQuestionText(test) {
  const questionTexts = {};
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
      questionTexts[questionId] = questionDoc.data().text;
    } else {
      questionTexts[questionId] = "Питання не знайдено";
    }
  }
  return questionTexts;
}

// Завантаження результатів тестування
// Завантаження результатів тестування
async function loadTestResults(testId) {
  try {
    // Отримуємо дані тесту
    const testDoc = await getDoc(doc(db, "tests", testId));
    const test = testDoc.data();
    const questionTexts = await getQuestionText(test);

    // Елемент для відображення результатів
    const resultsContainer = document.getElementById("results");

    // Фільтрація результатів на сервері
    const resultsQuery = query(
      collection(db, "testResults"),
      where("testId", "==", testId)
    );
    const querySnapshot = await getDocs(resultsQuery);

    // Формування HTML таблиці
    let resultsHTML =
      "<table><tr><th>Прізвище</th><th>Ім'я</th><th>Оцінка</th><th>Питання</th><th>Оцінка за питання</th></tr>";

    querySnapshot.forEach((doc) => {
      const result = doc.data();

      // Додаємо заголовок для кожного результату (одна клітинка для ПІБ та оцінки)
      resultsHTML += `
        <tr>
          <td rowspan="${result.results.length}">${
        result.lastName || "Невідомо"
      }</td>
          <td rowspan="${result.results.length}">${
        result.firstName || "Невідомо"
      }</td>
          <td rowspan="${result.results.length}">${result.score || "Н/Д"}</td>
      `;

      // Додаємо кожне питання для результату
      result.results.forEach((questionResult, index) => {
        if (index > 0) resultsHTML += `<tr>`; // Новий рядок для наступних питань
        resultsHTML += `
          <td>${
            questionTexts[questionResult.questionId] || "Питання не знайдено"
          }</td>
          <td>${
            questionResult.questionScore != undefined
              ? questionResult.questionScore
              : "-"
          }</td>
        </tr>`;
      });
    });

    resultsHTML += "</table>";
    resultsContainer.innerHTML = resultsHTML;
  } catch (error) {
    console.error("Помилка завантаження результатів тесту:", error);
    document.getElementById("results").innerHTML =
      "<p>Не вдалося завантажити результати тесту. Перевірте підключення до бази даних.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const testId = new URLSearchParams(window.location.search).get("testId");
  if (testId) {
    loadTestResults(testId);
    document.getElementById(
      "testLink"
    ).innerHTML = `<a class="button" href="test.html?testId=${testId}">Перейти до тестування</a>`;
  } else {
    alert("Параметр тесту не вказаний.");
  }
});
