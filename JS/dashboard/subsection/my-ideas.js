// Firebase Configuration (same as before)
const firebaseConfig = {
  apiKey: "AIzaSyDvebCBe0pcDMBrIVpDlydvpmz37KYYTJc",
  authDomain: "innohub-51f1e.firebaseapp.com",
  projectId: "innohub-51f1e",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const ideasContainer = document.getElementById('ideasContainer');
const viewModal = document.getElementById('viewModal');
const editModal = document.getElementById('editModal');
const closeViewModal = document.getElementById('closeViewModal');
const closeEditModal = document.getElementById('closeEditModal');
const editIdeaForm = document.getElementById('editIdeaForm');

// Check if the user is logged in
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = '/HTML/login/login.html';
  } else {
    // Load user ideas
    loadIdeas(user.uid);
  }
});

// Load Ideas Function
function loadIdeas(userId) {
  db.collection('ideas')
    .where('userId', '==', userId)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const ideaData = doc.data();
        const ideaCard = document.createElement('div');
        ideaCard.classList.add('idea-card');
        ideaCard.setAttribute('data-id', doc.id);
        ideaCard.innerHTML = `
          <h4>${ideaData.idea_name}</h4>
          <p>${ideaData.description}</p>
          <button class="view-btn">View</button>
          <button class="edit-btn">Edit</button>
        `;
        ideasContainer.appendChild(ideaCard);
      });

      // Attach event listeners to buttons
      document.querySelectorAll('.view-btn').forEach((button) => {
        button.addEventListener('click', viewIdea);
      });

      document.querySelectorAll('.edit-btn').forEach((button) => {
        button.addEventListener('click', editIdea);
      });
    })
    .catch((error) => {
      console.error("Error fetching ideas: ", error);
    });
}

// View Idea Function
function viewIdea(event) {
  const ideaId = event.target.closest('.idea-card').getAttribute('data-id');
  db.collection('ideas').doc(ideaId).get().then((doc) => {
    const ideaData = doc.data();
    document.getElementById('viewIdeaDetails').innerHTML = `
      <p><strong>Idea Name:</strong> ${ideaData.idea_name}</p>
      <p><strong>Description:</strong> ${ideaData.description}</p>
      <p><strong>Category:</strong> ${ideaData.category}</p>
    `;
    viewModal.style.display = 'block';
  });
}

// Edit Idea Function
function editIdea(event) {
  const ideaId = event.target.closest('.idea-card').getAttribute('data-id');
  db.collection('ideas').doc(ideaId).get().then((doc) => {
    const ideaData = doc.data();
    document.getElementById('editIdeaName').value = ideaData.idea_name;
    document.getElementById('editIdeaDescription').value = ideaData.description;
    document.getElementById('editIdeaCategory').value = ideaData.category;

    editIdeaForm.onsubmit = function (e) {
      e.preventDefault();
      const updatedIdea = {
        idea_name: document.getElementById('editIdeaName').value,
        description: document.getElementById('editIdeaDescription').value,
        category: document.getElementById('editIdeaCategory').value
      };

      db.collection('ideas').doc(ideaId).update(updatedIdea).then(() => {
        alert('Idea updated successfully!');
        editModal.style.display = 'none';
        loadIdeas(auth.currentUser.uid);  // Reload ideas
        // Refresh page after a successful action (e.g., after submitting an idea or editing it)
        window.location.reload();
      }).catch((error) => {
        console.error("Error updating idea: ", error);
      });
    };

    editModal.style.display = 'block';
  });
}

// Close Modals
closeViewModal.addEventListener('click', () => {
  viewModal.style.display = 'none';
});

closeEditModal.addEventListener('click', () => {
  editModal.style.display = 'none';
});
