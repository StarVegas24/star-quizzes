import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore-lite.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Функція для входу через Google
async function googleSignIn() {
  console.log(`Sign in/up (google)`);
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user; // Перевірка, чи існує користувач у базі даних
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      // Якщо користувача не існує, реєструємо його
      const role = prompt(
        "Виберіть свою роль: вчитель (teacher) або учень (student)"
      ); // Або можна реалізувати інший спосіб вибору ролі
      await setDoc(doc(db, "users", user.uid), { role });
    } // Перенаправлення користувача після успішного входу
    handleUserRedirect(user);
  } catch (error) {
    console.error(error);
  }
}

async function emailSignUp(email, password, role) {
  console.log(`Sign up (email) ${email} ${password} ${role}`);
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Збереження ролі користувача в Firestore
    await setDoc(doc(db, "users", user.uid), { role });

    // Зчитування даних з Firestore для перенаправлення
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      handleUserRedirect(user);
    } else {
      console.error("Роль користувача не збережено.");
    }
  } catch (error) {
    console.error(error);
  }
}

// Функція для входу через електронну пошту
async function emailSignIn(email, password) {
  console.log(`Sign in (email) ${email} ${password}`);
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Зчитування ролі з Firestore перед перенаправленням
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      handleUserRedirect(user);
    } else {
      console.error("Користувача не знайдено в базі даних.");
    }
  } catch (error) {
    console.error(error);
  }
}

// Функція для перенаправлення користувача на відповідну сторінку
async function handleUserRedirect(user) {
  console.log(`Redirecting user: ${user.uid}`);
  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (userDoc.exists()) {
    const role = userDoc.data().role;

    if (role === "teacher") {
      window.location.href = `teacher.html?uid=${user.uid}`;
    } else if (role === "student") {
      window.location.href = `student.html?uid=${user.uid}`;
    } else {
      alert("Невідома роль користувача.");
    }
  } else {
    alert("Користувача не знайдено в базі даних.");
  }
}

// Додавання обробників подій для кнопок
document
  .getElementById("googleSignInBtn")
  .addEventListener("click", googleSignIn);
document.getElementById("emailSignUpBtn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.querySelector('input[name="role"]:checked').value;
  console.log(role);
  emailSignUp(email, password, role);
});
document.getElementById("emailSignInBtn").addEventListener("click", () => {
  const email = document.getElementById("emailLogin").value;
  const password = document.getElementById("passwordLogin").value;
  emailSignIn(email, password);
});
