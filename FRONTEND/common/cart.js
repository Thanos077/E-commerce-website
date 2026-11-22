import { auth } from "../INDEX/login.js";

const API_URL = "http://127.0.0.1:8000";

async function updateCartCount(user) {

    const badge = document.getElementById("cart-count");

    if (!badge) return;

    if (!user) {
        badge.textContent = "0";
        return;
    }

    try {

        const token = await user.getIdToken();

        const response = await fetch(`${API_URL}/items`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Unable to retrieve cart");
        }

        const products = await response.json();

        const count = products.reduce(
            (total, product) => total + Number(product.quantity || 1),
            0
        );

        badge.textContent = count;

    } catch (error) {

        console.error("Cart counter error:", error);

    }
}

auth.onAuthStateChanged(user => {
    updateCartCount(user);
});

// Allow other JavaScript files to refresh the counter.
window.updateCartCount = updateCartCount;