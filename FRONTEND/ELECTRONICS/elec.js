// Category dropdown navigation
document.getElementById("cat").addEventListener("change", function () {

    if (this.value === "1") {
        window.location.href = "../ELECTRONICS/elec.html";
    }
    else if (this.value === "2") {
        window.location.href = "../FASHION/fashion.html";
    }
    else if (this.value === "3") {
        window.location.href = "../HOME&KITCHEN/h&k.html";
    }
    else if (this.value === "4") {
        window.location.href = "../SPORTS/sports.html";
    }
    else if (this.value === "5") {
        window.location.href = "../BOOKS/books.html";
    }
    else if (this.value === "6") {
        window.location.href = "beauty.html";
    }

});

import { auth } from "../INDEX/login.js";

// FastAPI backend URL
const API_URL = "https://e-commerce-website-73io.onrender.com";

// Select all Add to Cart buttons
const cartButtons = document.querySelectorAll(".btn-info,.btn-warning");

cartButtons.forEach(button => {

    button.addEventListener("click", async function () {

        // Check if user is logged in
        const user = auth.currentUser;

        if (!user) {
            alert("Please login first!");
            return;
        }

        try {

            // Get Firebase ID token
            const token = await user.getIdToken();

            // Get product information from HTML
            const product = {
                id: Number(button.dataset.id),
                name: button.dataset.name,
                price: Number(button.dataset.price),

                // Convert relative path into absolute URL
                image: new URL(
                    button.dataset.image,
                    window.location.href
                ).href,

                quantity: 1
            };

            console.log("Product being sent:", product);

            // Send product to FastAPI
            const response = await fetch(`${API_URL}/item`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify(product)
            });

            const result = await response.json();

            console.log("Backend response:", result);

            if (!response.ok) {
                alert(result.detail || "Failed to add product");
                return;
            }

           if (this.classList.contains("btn-info")) {
            showToast("🛒 Product added to cart successfully!");
        }
        else if (this.classList.contains("btn-warning")) {
            showToast("🎉 Great! Product added successfully. Happy Shopping!");
        }

        // Refresh cart counter
        await updateCartCount(user);

        window.dispatchEvent(new Event("cartUpdated"));
    }
        catch (error) {
    console.error("Error adding product:", error);
    showToast("Something went wrong. Please try again!");
}

    });

});
async function updateCartCount(user) {

    const cartCount = document.getElementById("cart-count");

    if (!user) {
        cartCount.innerText = 0;
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
            throw new Error("Unable to fetch cart items");
        }

        const items = await response.json();

        const total = items.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0
        );

        cartCount.innerText = total;

    } catch (error) {
        console.error("Cart count error:", error);
    }
}
function showToast(message) {

    document.getElementById("toastMessage").innerText = message;

    const toastElement = document.getElementById("cartToast");

    const toast = bootstrap.Toast.getOrCreateInstance(toastElement, {
        delay: 3000
    });

    toast.show();
}
const contactPanel = document.getElementById("contactOffcanvas");

contactPanel.addEventListener("hidden.bs.offcanvas", function () {

    document.querySelector('[data-bs-target="#contactOffcanvas"]').blur();

});
