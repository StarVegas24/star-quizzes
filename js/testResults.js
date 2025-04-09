import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore-lite.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function checkAccess(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (!userDoc.exists() || userDoc.data().role !== "teacher") {
    alert("Ви не ввійшли у свій акаунт або у вас немає прав доступу!");
    location.replace("auth.html");
  }
}

let user = localStorage.getItem("user");
if (user) {
  user = JSON.parse(user);
  const uid = user.uid;
  if (uid) {
    checkAccess(uid);
  }
} else {
  alert("Ви не ввійшли у свій акаунт або у вас немає прав доступу!");
  location.replace("auth.html");
}

async function deleteTest(testId) {
  if (confirm("Ви впевнені, що хочете видалити це тестування?")) {
    try {
      await deleteDoc(doc(db, "tests", testId));
      alert("Тестування видалено успішно.");
      location.reload();
    } catch (error) {
      console.error("Помилка видалення тесту:", error);
    }
  }
}

deleteTest;

// Завантаження списку тестувань
async function loadTests(uid) {
  try {
    const querySnapshot = await getDocs(collection(db, "tests"));
    const testsContainer = document.getElementById("tests");
    querySnapshot.forEach((doc) => {
      const test = doc.data();
      if (test.teacherId === uid) {
        const testElement = document.createElement("div");
        testElement.className = "test";
        testElement.innerHTML = `<div class="test-div"><a class="test-link" href="result.html?testId=${doc.id}">Переглянути результати тесту з ID: ${doc.id}</a> <button onclick="deleteTest('${doc.id}')">Видалити</button> </div>`;
        testsContainer.appendChild(testElement);
      }
    });
  } catch (error) {
    console.error("Помилка завантаження тестів:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const uid = new URLSearchParams(window.location.search).get("uid");
  if (uid) {
    loadTests(uid);
  } else {
    alert("Параметр UID не вказаний.");
  }
});
