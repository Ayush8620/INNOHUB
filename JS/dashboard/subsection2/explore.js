import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDvebCBe0pcDMBrIVpDlydvpmz37KYYTJc",
  authDomain: "innohub-51f1e.firebaseapp.com",
  projectId: "innohub-51f1e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let ideasContainer, sidebar, hamburger;
let currentUserId = null;
let userMap = {}; // userId -> userName

document.addEventListener('DOMContentLoaded', () => {
  ideasContainer = document.getElementById('ideasContainer');
  sidebar = document.getElementById('sidebar');
  hamburger = document.getElementById('hamburger');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Auth & load ideas
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = '/HTML/login/login.html';
    } else {
      currentUserId = user.uid;
      await loadUserMap();
      await loadIdeas();
    }
  });
});

// Fetch user names and map them by UID
async function loadUserMap() {
  const snapshot = await getDocs(collection(db, 'Users'));
  snapshot.forEach(doc => {
    const data = doc.data();
    userMap[doc.id] = data.name || "Unknown User";
  });
}

// Load and display ideas
async function loadIdeas() {
  const q = query(collection(db, 'ideas'));
  const snapshot = await getDocs(q);

  let ideas = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    ideas.push({ id: doc.id, ...data });
  });

  ideas.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

  if (ideasContainer) {
    ideasContainer.innerHTML = '';
    ideas.forEach(idea => renderIdeaCard(idea));
  }
}

// Render idea card (vote only + user name)
function renderIdeaCard(idea) {
  const card = document.createElement('div');
  card.className = 'explore-card';
  card.setAttribute('data-id', idea.id);

  const pitcherName = userMap[idea.userId] || "Unknown";

  card.innerHTML = `
    <h4>${idea.idea_name}</h4>
    <p>${idea.description}</p>
    <p><strong>Category:</strong> ${idea.category}</p>
    <p><strong>Pitcher:</strong> ${pitcherName}</p>
    <p><strong>Votes:</strong> ${idea.voteCount || 0}</p>
    <button class="vote-btn">Vote</button>
  `;

  const voteBtn = card.querySelector('.vote-btn');
  if (voteBtn) {
    voteBtn.addEventListener('click', () => handleVote(idea.id));
  }

  if (ideasContainer) {
    ideasContainer.appendChild(card);
  }

  checkIfVoted(idea.id, voteBtn);
}

// Check if user already voted
async function checkIfVoted(ideaId, button) {
  const q = query(collection(db, 'votes'), where('userId', '==', currentUserId), where('ideaId', '==', ideaId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty && button) {
    button.textContent = "Voted";
    button.disabled = true;
  }
}

// Handle voting
async function handleVote(ideaId) {
  const ideaRef = doc(db, 'ideas', ideaId);

  await addDoc(collection(db, 'votes'), {
    userId: currentUserId,
    ideaId: ideaId,
    timestamp: serverTimestamp()
  });

  await updateDoc(ideaRef, {
    voteCount: increment(1)
  });

  await loadIdeas();
}
