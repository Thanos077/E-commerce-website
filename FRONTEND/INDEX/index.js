import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ===============================
// FIREBASE CONFIGURATION
// ===============================

const firebaseConfig = {
    apiKey: "AIzaSyBueHG75dsNPdzR5a0by51FdWvjmo-qZ6s",
    authDomain: "e-comm-f3fce.firebaseapp.com",
    projectId: "e-comm-f3fce",
    storageBucket: "e-comm-f3fce.firebasestorage.app",
    messagingSenderId: "70284819107",
    appId: "1:70284819107:web:de841a78c333470c9cdd16"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);


// ===============================
// SHOW ERROR MESSAGE
// ===============================

function show_message(id, message) {
    document.getElementById(id).textContent = message;
}


// ===============================
// FORM SUBMIT
// ===============================

document.getElementById("myform").addEventListener("submit", async function (event) {

    event.preventDefault();

    let isValid = true;

    document.querySelectorAll(".error").forEach(function (element) {
        element.textContent = "";
    });


    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim();

    const age = Number(
        document.getElementById("age").value.trim()
    );

    const gender = document.getElementById("gender").value;

    const password =
        document.getElementById("password").value.trim();

    const confirmPassword =
        document.getElementById("re-pass").value.trim();

    if (name === "") {

        show_message(
            "nameError",
            "Full name is required."
        );

        isValid = false;

    } else if (name.length < 3) {

        show_message(
            "nameError",
            "Name must be at least 3 characters."
        );

        isValid = false;
    }



    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (email === "") {

        show_message(
            "emailError",
            "Email is required."
        );

        isValid = false;

    } else if (!emailPattern.test(email)) {

        show_message(
            "emailError",
            "Enter a valid email address."
        );

        isValid = false;
    }


    // ===============================
    // AGE VALIDATION
    // ===============================

    if (!age || age < 1) {

        show_message(
            "ageError",
            "Please enter a valid age."
        );

        isValid = false;
    }


    // ===============================
    // GENDER VALIDATION
    // ===============================

    if (gender === "") {

        show_message(
            "genderError",
            "Please select your gender."
        );

        isValid = false;
    }


    // ===============================
    // PASSWORD VALIDATION
    // ===============================

    if (password === "") {

        show_message(
            "passwordError",
            "Password is required."
        );

        isValid = false;

    } else if (password.length < 6) {

        show_message(
            "passwordError",
            "Password must be at least 6 characters."
        );

        isValid = false;

    } else if (
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password)
    ) {

        show_message(
            "passwordError",
            "Password must contain at least one uppercase letter and one number."
        );

        isValid = false;
    }


    // ===============================
    // CONFIRM PASSWORD
    // ===============================

    if (confirmPassword === "") {

        show_message(
            "confirmPasswordError",
            "Please enter password."
        );

        isValid = false;

    } else if (confirmPassword !== password) {

        show_message(
            "confirmPasswordError",
            "Passwords do not match."
        );

        isValid = false;
    }


    // ===============================
    // FIREBASE SIGNUP
    // ===============================

    if (isValid) {

        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const token = await userCredential.user.getIdToken();
            // Save user in FastAPI
            const response = await fetch("https://e-commerce-website-1-klcz.onrender.com/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    name: name,
                    age: age,
                    email: email,
                    gender: gender,
                    role: "user",

                })
            });
            const data = await response.json();
            console.log(data);


            alert("Account created successfully!");
            window.location.href = 'login.html';


            // Reset form
            document.getElementById("myform").reset();


        
} catch (error) {

    console.error("Firebase signup error:", error);

    if (error.code === "auth/email-already-in-use") {

        show_message(
            "emailError",
            "This email is already registered. Please login."
        );

    }

    else if (error.code === "auth/weak-password") {

        show_message(
            "passwordError",
            "Password is too weak. Please use a stronger password."
        );

    }

    else if (error.code === "auth/invalid-email") {

        show_message(
            "emailError",
            "Please enter a valid email address."
        );

    }

    else {

        alert("Signup failed: " + error.message);

    }
}

    }

});


// ===============================
// RESET FORM
// ===============================

function reset_form() {

    document.getElementById("myform").reset();

    document.querySelectorAll(".error").forEach(function (element) {
        element.textContent = "";
    });
}