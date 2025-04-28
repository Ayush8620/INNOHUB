import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDvebCBe0pcDMBrIVpDlydvpmz37KYYTJc",
  authDomain: "innohub-51f1e.firebaseapp.com",
  projectId: "innohub-51f1e",
  storageBucket: "innohub-51f1e.appspot.com",
  messagingSenderId: "689639186724",
  appId: "1:689639186724:web:efe973cbd8e2f19ecf93b1",
  measurementId: "G-CXBQCDS758"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Redirect if not logged in + prefill form if data exists
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/index.html"; // 🔁 Replace with your login page path
    return;
  }

  const uid = user.uid;
  const docRef = doc(db, "userSkillsQualifications", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // Prefill form with existing data
    const data = docSnap.data();
    document.getElementById('fullName').value = data.fullName || "";
    document.getElementById('email').value = data.email || "";
    document.getElementById('highestQualification').value = data.highestQualification || "";
    document.getElementById('fieldOfStudy').value = data.fieldOfStudy || "";
    document.getElementById('skills').value = data.skills || "";
    document.getElementById('experience').value = data.experience || "";
    document.getElementById('certifications').value = data.certifications || "";
  }
});

// Save or update the form
document.getElementById('skillsForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return alert("You must be logged in.");

  const uid = user.uid;

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const highestQualification = document.getElementById('highestQualification').value;
  const fieldOfStudy = document.getElementById('fieldOfStudy').value.trim();
  const skills = document.getElementById('skills').value.trim();
  const experience = parseInt(document.getElementById('experience').value.trim()) || 0;
  const certifications = document.getElementById('certifications').value.trim();

  try {
    await setDoc(doc(db, "userSkillsQualifications", uid), {
      fullName,
      email,
      highestQualification,
      fieldOfStudy,
      skills,
      experience,
      certifications,
      timestamp: new Date()
    });

    alert("Your details have been saved!");
    window.location.href = "/HTML/dashboard/learner.html"; // 🔁 Replace with your login page path

  } catch (err) {
    console.error("Error saving:", err);
    alert("Failed to save. Please try again.");
  }
});
