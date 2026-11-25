
import { auth } from "../INDEX/login.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const API_URL = "https://e-commerce-website-73io.onrender.com";

// CHECK LOGGED-IN USER

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "../INDEX/index.html";
        return;
    }

    try {

        // Get Firebase authentication token
        const token = await user.getIdToken();

        // Get user details from Python backend
        const response = await fetch(`${API_URL}/user`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Unable to fetch user details");
        }

        const result = await response.json();

        // Get details from API response
        const data = result.details;

        // Display user details
        document.getElementById("user-name").textContent = data.name;
        document.getElementById("user-email").textContent = data.email;
        document.getElementById("user-age").textContent = data.age;
        document.getElementById("user-gender").textContent = data.gender;

    }

    catch (error) {
        console.error("Profile Error:", error);
        alert("Unable to load profile details");
    }

});


// LOGOUT BUTTON

document.getElementById("logout-btn").addEventListener("click", async () => {

    try {
        await signOut(auth);
        window.location.href = "../INDEX/index.html";
    }

    catch (error) {
        console.error("Logout Error:", error);
    }

});

// GO BACK BUTTON

document.getElementById("login-btn").addEventListener("click", () => {

    // Go to home page WITHOUT logging out
    window.location.href = "../HOME_PAGE/home.html";

});
