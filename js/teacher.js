import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore-lite.js";
import { checkAccess } from "./helpers.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Завантаження папок з питаннями
async function loadFolders(uid) {
  const querySnapshot = await getDocs(
    collection(db, "teachers", uid, "folders")
  );
  const foldersContainer = document.getElementById("folders");
  // console.log(querySnapshot._docs);
  if (querySnapshot._docs) {
    querySnapshot.forEach((doc) => {
      const folder = doc.data();
      const folderElement = document.createElement("div");
      folderElement.className = "folder";
      folderElement.innerHTML = `<a class="folder-link" href="folder.html?folderId=${doc.id}">${folder.name}</a>`;
      foldersContainer.appendChild(folderElement);
    });
  } else {
    const notFoundElement = document.createElement("h5");
    notFoundElement.textContent = "Ви ще не створили жодного питання...";
    foldersContainer.appendChild(notFoundElement);
  }
}

// Отримання uid користувача з URL
let user = JSON.parse(localStorage.getItem("user") || "null");
if (user) {
  checkAccess(user, db);
  document.getElementById("content").style.display = "block";
  loadFolders(user.uid);
} else {
  document.getElementById("error").style.display = "block";
}

// Додавання обробника подій для кнопки додавання тесту
document
  .getElementById("addTestBtn")
  .addEventListener("click", () => window.location.replace(`addTest.html`));

document
  .getElementById("resultsBtn")
  .addEventListener("click", () => window.location.replace(`testResults.html`));

// Функція для виходу користувача
function logout() {
  signOut(auth)
    .then(() => {
      localStorage.removeItem("user");
      window.location.replace("auth.html"); // Перенаправлення на сторінку входу після виходу
    })
    .catch((error) => {
      console.error("Помилка при виході: ", error);
    });
}

// Додавання обробника подій для кнопки виходу
document.getElementById("logoutBtn").addEventListener("click", logout);
