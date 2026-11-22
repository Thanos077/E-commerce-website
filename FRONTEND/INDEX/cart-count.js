import { auth } from "./login.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const API_URL = "http://127.0.0.1:8000";

onAuthStateChanged(auth, async (user) => {

    const cartCount = document.getElementById("cart-count");

    if (!cartCount) return;

    if (!user) {
        cartCount.textContent = "0";
        return;
    }

    try {

        const token = await user.getIdToken();

        const response = await fetch(`${API_URL}/items`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch cart items");
        }

        const data = await response.json();

        const items = Array.isArray(data) ? data : (data.items || []);

        let total = 0;

        items.forEach((item) => {
            total += Number(item.quantity) || 1;
        });

        cartCount.textContent = total;

    } catch (error) {
        console.error("Cart count error:", error);
    }

});