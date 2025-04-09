import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore-lite.js";

const difficulty = new Map();

function addUnits() {
  difficulty.set("hard", "складно");
  difficulty.set("medium", "середньо");
  difficulty.set("easy", "легко");
}

addUnits();

async function checkAccess(user, db) {
  if (user) {
    // user = JSON.parse(user);
    const uid = user.uid;
    if (uid) {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (!userDoc.exists() || userDoc.data().role !== "teacher") {
        alert("Ви не ввійшли у свій акаунт або у вас немає прав доступу!");
        location.replace("auth.html");
      }
    }
  } else {
    alert("Ви не ввійшли у свій акаунт або у вас немає прав доступу!");
    location.replace("auth.html");
  }
}

export { difficulty, checkAccess };
