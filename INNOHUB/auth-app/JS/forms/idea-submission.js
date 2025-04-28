// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvebCBe0pcDMBrIVpDlydvpmz37KYYTJc",
  authDomain: "innohub-51f1e.firebaseapp.com",
  projectId: "innohub-51f1e",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const ideaForm = document.getElementById('ideaForm');
const ideaName = document.getElementById('ideaName');
const ideaDescription = document.getElementById('ideaDescription');
const ideaCategory = document.getElementById('ideaCategory');

// Check if the user is logged in
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User signed in:", user.displayName);
  } else {
    window.location.href = '/HTML/login/login.html';
  }
});

// Submit Idea Function
ideaForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to submit an idea.");
    return;
  }

  try {
    // First, add the idea to Firestore
    const docRef = await db.collection('ideas').add({
      idea_name: ideaName.value.trim(),
      description: ideaDescription.value.trim(),
      category: ideaCategory.value,
      userId: user.uid,
      submittedAt: new Date()
    });

    // Then update the same document with its own ID
    await db.collection('ideas').doc(docRef.id).update({
      ideaId: docRef.id
    });

    alert("Your idea has been submitted successfully!");
    window.location.href = '/HTML/dashboard/subsection/my-ideas.html';
  } catch (error) {
    console.error("Error submitting idea: ", error);
    alert("There was an error submitting your idea. Please try again.");
  }
});
