
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword
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


// ===============================
// INITIALIZE FIREBASE
// ===============================

const app = initializeApp(firebaseConfig);


// ===============================
// INITIALIZE FIREBASE AUTH
// ===============================

export const auth = getAuth(app);


// ===============================
// LOGIN FORM
// ===============================

const form = document.getElementById("myform");


// IMPORTANT:
// login.js is also imported by elec.js.
// elec.html does NOT have "myform".
// Therefore, only attach the event listener
// if the form actually exists.

if (form) {

    // ===============================
    // RESET FORM
    // ===============================

    function reset_form() {

        form.reset();

        document.querySelectorAll(".error").forEach(function (element) {
            element.textContent = "";
        });

    }


    // ===============================
    // SHOW MESSAGE
    // ===============================

    function show_message(id, message) {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = message;
        }

    }


    // ===============================
    // LOGIN
    // ===============================

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        let isValid = true;


        // ===============================
        // GET EMAIL AND PASSWORD
        // ===============================

        const email = document
            .getElementById("email")
            .value
            .trim();

        const password = document
            .getElementById("password")
            .value
            .trim();


        // ===============================
        // EMAIL VALIDATION
        // ===============================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (email === "") {

            show_message(
                "emailError",
                "Email is required."
            );

            isValid = false;

        }
        else if (!emailPattern.test(email)) {

            show_message(
                "emailError",
                "Enter a valid email address."
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

        }
        else if (password.length < 6) {

            show_message(
                "passwordError",
                "Password must be at least 6 characters."
            );

            isValid = false;

        }


        // ===============================
        // STOP IF VALIDATION FAILED
        // ===============================

        if (!isValid) {
            return;
        }


        // ===============================
        // FIREBASE LOGIN
        // ===============================

        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user = userCredential.user;


            console.log(
                "Firebase login successful:",
                user
            );


            // ===============================
            // GET FIREBASE ID TOKEN
            // ===============================

            const token =
                await user.getIdToken();


            // Save token
            localStorage.setItem(
                "token",
                token
            );


            // ===============================
            // GET USER FROM SIGN.PY
            // ===============================
            // sign.py is running on port 8001

            const response = await fetch(
                "https://e-commerce-website-73io.onrender.com/user",
                {
                    method: "GET",

                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );


            // ===============================
            // CHECK FASTAPI RESPONSE
            // ===============================

            if (!response.ok) {

                const errorData = await response.json();

                console.error("Status:", response.status);
                console.error("FastAPI error:", errorData.detail || errorData);

                show_message(
                    "emailError",
                    errorData.detail || "Unable to get user information."
                );

                return;
            }

            // ===============================
            // GET USER DATA
            // ===============================

            const result =
                await response.json();


            console.log(
                "User data:",
                result
            );


            // ===============================
            // ROLE-BASED REDIRECT
            // ===============================

            if (result.role === "Admin") {

                window.location.href =
                    "../Admin/admin.html";

            }
            else {

                window.location.href =
                    "../HOME_PAGE/home.html";

            }


        }
        catch (error) {

            console.error(
                "Firebase login error:",
                error
            );


            // ===============================
            // FIREBASE ERROR HANDLING
            // ===============================

            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                show_message(
                    "passwordError",
                    "Invalid email or password."
                );

            }

            else if (
                error.code ===
                "auth/user-not-found"
            ) {

                show_message(
                    "emailError",
                    "No account exists with this email."
                );

            }

            else if (
                error.code ===
                "auth/wrong-password"
            ) {

                show_message(
                    "passwordError",
                    "Incorrect password."
                );

            }

            else {

                show_message(
                    "emailError",
                    "Login failed. Please try again."
                );

            }

        }

    });

}

