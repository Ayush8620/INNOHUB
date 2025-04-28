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

// DOM Elements
const modal = document.getElementById("ideaModal");
const modalContent = document.getElementById("idea-content");
const closeModal = document.querySelector(".close");

// Incoming Requests
async function fetchIncomingRequests(uid) {
  const ref = collection(db, "Request-from-pitcherId");
  // Fetch only requests that are "Pending"
  const q = query(ref, where("InvestorId", "==", uid), where("Status", "==", "Pending"));
  const snapshot = await getDocs(q);
  const container = document.getElementById("incoming-requests");
  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const card = document.createElement("div");
    card.className = "request-card";

    card.innerHTML = `
      <h4>Pitcher ID: ${data.PitcherId}</h4>
      <p>Status: ${data.Status}</p>
      <p>Date: ${data.timestamp.toDate().toLocaleString()}</p>
      <div>
        <button class="accept-btn" data-id="${docSnap.id}">Accept</button>
        <button class="decline-btn" data-id="${docSnap.id}">Decline</button>
        <button class="view-btn" data-uid="${data.PitcherId}">View Idea</button>
      </div>
    `;

    container.appendChild(card);
  });

  // Handle buttons
  container.querySelectorAll(".accept-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const docRef = doc(db, "Request-from-pitcherId", btn.dataset.id);
      await updateDoc(docRef, { Status: "Accepted" });
      fetchIncomingRequests(uid); // Re-fetch after update
    });
  });

  container.querySelectorAll(".decline-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const docRef = doc(db, "Request-from-pitcherId", btn.dataset.id);
      await updateDoc(docRef, { Status: "Declined" });
      fetchIncomingRequests(uid); // Re-fetch after update
    });
  });

  container.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const pitcherId = btn.dataset.uid;

      // Reference to the ideas collection
      const ideaRef = collection(db, "ideas");

      // Query for all ideas where userId matches the PitcherId
      const q = query(ideaRef, where("userId", "==", pitcherId));

      // Fetch the idea documents
      const ideaSnap = await getDocs(q);

      // Check if ideas exist for the pitcher
      if (!ideaSnap.empty) {
        let modalHTML = '';
        ideaSnap.forEach(doc => {
          const idea = doc.data();
          modalHTML += `
            <div class="idea-card">
              <h4>Title: ${idea.idea_name || "No title"}</h4>
              <p><strong>Category:</strong> ${idea.category || "No category"}</p>
              <p><strong>Description:</strong> ${idea.description || "No description"}</p>
              <p><strong>Submitted At:</strong> ${idea.submittedAt.toDate().toLocaleString() || "No date"}</p>
            </div>
            <hr/>
          `;
        });

        modalContent.innerHTML = modalHTML;
      } else {
        modalContent.innerHTML = "<p>No ideas found for this pitcher.</p>";
      }

      modal.style.display = "block";  // Show the modal
    });
  });
}

// Sent Requests
async function fetchSentRequests(uid) {
  const ref = collection(db, "Request-from-InvestorId");
  const q = query(ref, where("InvestorId", "==", uid));
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
      <p>Idea ID: ${data.ideaId}</p>
      <p>Date: ${data.timestamp.toDate().toLocaleString()}</p>
    `;
    container.appendChild(card);
  });
}

// Modal controls
closeModal.onclick = () => {
  modal.style.display = "none";
};
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// Auth listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    fetchIncomingRequests(uid); // Fetch incoming requests on login
    fetchSentRequests(uid); // Fetch sent requests on login
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
