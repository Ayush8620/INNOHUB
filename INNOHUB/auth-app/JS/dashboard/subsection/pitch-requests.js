import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";

// Firebase config
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
const auth = getAuth(app);
const db = getFirestore(app);

// Incoming Requests (Investor-side for Pitcher)
async function fetchIncomingRequests(uid) {
  const ref = collection(db, "Request-from-InvestorId");
  const q = query(ref, where("PitcherId", "==", uid), where("Status", "==", "Pending"));
  const snapshot = await getDocs(q);
  const container = document.getElementById("incoming-requests");
  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const card = document.createElement("div");
    card.className = "request-card";

    card.innerHTML = `
      <h4>Investor ID: ${data.InvestorId}</h4>
      <p>Status: ${data.Status}</p>
      <p>Date: ${data.timestamp.toDate().toLocaleString()}</p>
      <div>
        <button class="accept-btn" data-id="${docSnap.id}">Accept</button>
        <button class="decline-btn" data-id="${docSnap.id}">Decline</button>
      </div>
    `;

    container.appendChild(card);
  });

  // Handle buttons
  container.querySelectorAll(".accept-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const docRef = doc(db, "Request-from-InvestorId", btn.dataset.id);
      await updateDoc(docRef, { Status: "Accepted" });
      fetchIncomingRequests(uid); // Re-fetch after update
    });
  });

  container.querySelectorAll(".decline-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const docRef = doc(db, "Request-from-InvestorId", btn.dataset.id);
      await updateDoc(docRef, { Status: "Declined" });
      fetchIncomingRequests(uid); // Re-fetch after update
    });
  });
}

// Sent Requests (Pitcher-side for Investor)
async function fetchSentRequests(uid) {
  const ref = collection(db, "Request-from-pitcherId");
  const q = query(ref, where("PitcherId", "==", uid));
  const snapshot = await getDocs(q);
  const container = document.getElementById("sent-requests");
  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const card = document.createElement("div");
    card.className = "request-card";
    card.innerHTML = `
      <h4>Pitcher ID: ${data.PitcherId}</h4>
      <p>Status: ${data.Status}</p>
      <p>Date: ${data.timestamp.toDate().toLocaleString()}</p>
    `;
    container.appendChild(card);
  });
}

// Auth listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    fetchIncomingRequests(uid); // Fetch incoming requests for Pitcher on login
    fetchSentRequests(uid); // Fetch sent requests for Pitcher on login
  } else {
    console.log("User not logged in");
    window.location.href = "/HTML/login/login.html";
  }
});

// Toggle Sidebar (Hamburger Menu)
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');

hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});
