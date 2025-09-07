// Show login after typing animation
window.onload = function() {
  setTimeout(() => {
    document.getElementById("login-section").style.display = "block";
  }, 4500); // after typing animation ends
};

function showLoader() {
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

// Login
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  showLoader();
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      hideLoader();
      alert("Login successful!");
      document.getElementById("login-section").style.display = "none";
      document.getElementById("complaint-section").style.display = "block";
    })
    .catch(error => {
      hideLoader();
      alert(error.message);
    });
}

// Signup
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  showLoader();
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      hideLoader();
      alert("Account created! Please login.");
    })
    .catch(error => {
      hideLoader();
      alert(error.message);
    });
}

// Submit Complaint
function submitComplaint() {
  const text = document.getElementById("complaintText").value;
  const file = document.getElementById("complaintImage").files[0];

  if (!text) {
    alert("Please enter a complaint description.");
    return;
  }

  if (file) {
    const storageRef = storage.ref("complaints/" + file.name);
    storageRef.put(file).then(snapshot => {
      snapshot.ref.getDownloadURL().then(url => {
        saveComplaint(text, url);
      });
    });
  } else {
    saveComplaint(text, "");
  }
}

function saveComplaint(text, imageUrl) {
  db.collection("complaints").add({
    text: text,
    image: imageUrl,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert("Complaint submitted!");
    document.getElementById("complaintText").value = "";
    document.getElementById("complaintImage").value = "";
  })
  .catch(error => alert("Error: " + error.message));
}
