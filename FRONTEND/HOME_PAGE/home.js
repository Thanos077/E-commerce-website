
// =====================================
// FIREBASE AUTHENTICATION
// =====================================

import { auth } from "../INDEX/login.js";

const API_URL = "https://e-commerce-website-1-klcz.onrender.com";


// =====================================
// CATEGORY DROPDOWN
// =====================================

const categoryDropdown = document.getElementById("cat");

if (categoryDropdown) {

    categoryDropdown.addEventListener("change", function () {

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
            window.location.href = "../BEAUTY/beauty.html";
        }

    });

}


// =====================================
// CART COUNTER
// =====================================

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

            method: "GET",

            headers: {
                "Authorization": `Bearer ${token}`
            }

        });

        if (!response.ok) {
            throw new Error("Unable to retrieve cart");
        }

        const products = await response.json();

        const count = products.reduce(
            (total, product) =>
                total + Number(product.quantity || 1),
            0
        );

        badge.textContent = count;

    }

    catch (error) {

        console.error("Cart counter error:", error);

    }

}


// =====================================
// ADD TO CART - HOME PAGE
// =====================================

const cartButtons = document.querySelectorAll(".btn-info, .btn-warning");

cartButtons.forEach(button => {

    button.addEventListener("click", async function () {

        const user = auth.currentUser;

        if (!user) {

            alert("Please login first!");

            return;

        }

        try {

            button.disabled = true;

            const token = await user.getIdToken();

            const product = {

                id: Number(button.dataset.id),

                name: button.dataset.name,

                price: Number(button.dataset.price),

                image: new URL(
                    button.dataset.image,
                    window.location.href
                ).href,

                quantity: 1

            };


            // Validate product information

            if (
                !product.id ||
                !product.name ||
                !product.price ||
                !button.dataset.image
            ) {

                throw new Error(
                    "Product information is missing. Check your HTML data attributes."
                );

            }


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


            if (!response.ok) {

                throw new Error(
                    result.detail || "Failed to add product"
                );

            }


           
            // Different messages for different buttons
        if (this.classList.contains("btn-info")) {
            showToast("🛒 Product added to cart successfully!");
        }
        else if (this.classList.contains("btn-warning")) {
            showToast("🎉 Great! Product added successfully. Happy Shopping!");
        }


            // Update cart counter immediately

            await updateCartCount(user);


            // Notify other scripts if needed

            window.dispatchEvent(new Event("cartUpdated"));

        }

      catch (error) {
    console.error("Error adding product:", error);
    showToast("Something went wrong. Please try again!");
}

        finally {

            button.disabled = false;

        }

    });

});


// =====================================
// UPDATE CART WHEN LOGIN STATUS CHANGES
// =====================================

auth.onAuthStateChanged(user => {

    updateCartCount(user);

});


// =====================================
// ACTIVE NAVBAR
// =====================================

const currentPage = window.location.pathname.toLowerCase();

document.querySelectorAll(".nav-link-item").forEach(link => {

    const href = link.getAttribute("href");

    if (!href) return;

    const linkPage = href.toLowerCase();

    if (

        currentPage.endsWith(linkPage.split("/").pop()) ||

        (

            link.textContent.trim().includes("Categories") &&

            (

                currentPage.includes("electronics") ||
                currentPage.includes("fashion") ||
                currentPage.includes("books") ||
                currentPage.includes("beauty") ||
                currentPage.includes("sports") ||
                currentPage.includes("home&kitchen")

            )

        )

    ) {

        link.classList.add("active");

    }

});
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