// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDvebCBe0pcDMBrIVpDlydvpmz37KYYTJc",
  authDomain: "innohub-51f1e.firebaseapp.com",
  projectId: "innohub-51f1e",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const regEmailInput = document.getElementById("reg-email");
const regPasswordInput = document.getElementById("reg-password");
const otpInput = document.getElementById("otp");
const nameInput = document.querySelector('input[name="name"]');
const verifyBtn = document.getElementById("verifybtn");
const submitBtn = document.getElementById("submitbtn");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const toRegister = document.getElementById("toRegister")
const toLogin = document.getElementById("toLogin")

let generatedOTP = "";

/* Toast Function */
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  toastMessage.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = "toast hidden";
  }, 3000);
}

/* Login */
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        showToast("Login successful!", "success");
        setTimeout(() => {
          window.location.href = "/HTML/dashboard/startup.html";
        }, 1500);
      })
      .catch((error) => {
        console.error(error);
        showToast("Invalid email or password.", "error");
      });
  });
}

/* Registration Step 1 - Send OTP */
function validatePassword() {
  const password = regPasswordInput.value.trim();
  const email = regEmailInput.value.trim();
  const name = nameInput.value.trim();

  if (password.length < 6) {
    showToast("Password must be at least 6 characters.", "error");
    return;
  }

  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

  emailjs.send("service_iogjfhm", "template_46y7agm", {
    to_email: email,
    to_name: name,
    passcode: generatedOTP,
  }).then(() => {
    showToast("OTP sent to your email.", "success");
    otpInput.style.display = "block";
    submitBtn.hidden = false;
    verifyBtn.hidden = true;
  }).catch(err => {
    console.error(err);
    showToast("Failed to send OTP. Try again.", "error");
  });
}

/* Registration Step 2 - Verify OTP */
function verifyOTP() {
  const enteredOTP = otpInput.value.trim();
  const email = regEmailInput.value.trim();
  const password = regPasswordInput.value;
  const name = nameInput.value.trim();

  if (enteredOTP !== generatedOTP) {
    showToast("Incorrect OTP. Please try again.", "error");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return userCredential.user.updateProfile({ displayName: name });
    })
    .then(() => {
      showToast("Registered successfully!", "success");
      setTimeout(() => {
        window.location.href = "/HTML/forms/registration.html";
      }, 1500);
    })
    .catch(error => {
      console.error(error);
      showToast(error.message, "error");
    });
}

/* Tab Switching */
loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
});

toLogin.addEventListener("click", () => {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
});
registerTab.addEventListener("click", () => {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

toRegister.addEventListener("click", () => {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});