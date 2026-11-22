
import { auth } from "../INDEX/login.js";

const API_URL = "https://e-commerce-website-73io.onrender.com";

const cartItems = document.getElementById("cart-items");
const emptyCart = document.getElementById("empty-cart");
const totalItems = document.getElementById("total-items");
const subtotal = document.getElementById("subtotal");
const grandTotal = document.getElementById("grand-total");

let currentUser = null;


// =================================
// LOAD CART FROM FASTAPI
// =================================

async function loadCart(user) {

    cartItems.innerHTML = "<p>Loading your cart...</p>";
    emptyCart.style.display = "none";

    try {

        const token = await user.getIdToken();

        const response = await fetch(`${API_URL}/items`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const products = await response.json();

        currentUser = user;

        displayCart(products);

    } catch (error) {

        console.error("Unable to load cart:", error);

        cartItems.innerHTML = `
            <p class="text-danger">
                Unable to load your cart. Check your backend connection.
            </p>
        `;
    }
}


// =================================
// UPDATE PRODUCT QUANTITY
// =================================

async function updateQuantity(productId, newQuantity) {

    if (!currentUser) {
        alert("Please login first!");
        return;
    }

    try {

        const token = await currentUser.getIdToken();

        const response = await fetch(
            `${API_URL}/item/${productId}/quantity`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    quantity: newQuantity
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Quantity update failed");
        }

        // Reload cart after updating quantity
        await loadCart(currentUser);

    } catch (error) {

        console.error("Quantity update error:", error);
        alert(error.message);

    }
}


// =================================
// DISPLAY CART PRODUCTS
// =================================

function displayCart(products) {

    cartItems.innerHTML = "";

    let itemCount = 0;
    let total = 0;

    if (!Array.isArray(products) || products.length === 0) {

        emptyCart.style.display = "block";

        totalItems.textContent = "0";
        subtotal.textContent = "0.00";
        grandTotal.textContent = "0.00";

        return;
    }

    emptyCart.style.display = "none";


    products.forEach(product => {

        const quantity = Number(product.quantity) || 1;
        const price = Number(product.price) || 0;

        itemCount += quantity;
        total += price * quantity;


        // Product container
        const productElement = document.createElement("div");

        productElement.className =
            "d-flex align-items-center gap-3 border-bottom py-3";


        // Product image
        const image = document.createElement("img");

        image.src = product.image;
        image.alt = product.name;

        image.style.width = "100px";
        image.style.height = "100px";
        image.style.objectFit = "contain";

        image.onerror = function () {
            console.error("Image not found:", product.image);
            image.alt = "Image not available";
        };


        // Product details
        const details = document.createElement("div");

        const name = document.createElement("h5");
        name.textContent = product.name;

        const priceText = document.createElement("p");
        priceText.textContent = `Price: ₹${price.toFixed(2)}`;


        // =================================
        // QUANTITY COUNTER (+ 1 -)
        // =================================

        const quantityBox = document.createElement("div");

        quantityBox.className =
            "d-flex align-items-center gap-3 mb-3";


        // Minus button
        const minusButton = document.createElement("button");

        minusButton.type = "button";
        minusButton.textContent = "−";

        minusButton.className =
            "btn btn-outline-secondary btn-sm";

        minusButton.style.width = "35px";


        // Quantity number
        const quantityNumber = document.createElement("span");

        quantityNumber.textContent = quantity;

        quantityNumber.className = "fw-bold";

        quantityNumber.style.minWidth = "20px";
        quantityNumber.style.textAlign = "center";


        // Plus button
        const plusButton = document.createElement("button");

        plusButton.type = "button";
        plusButton.textContent = "+";

        plusButton.className =
            "btn btn-outline-primary btn-sm";

        plusButton.style.width = "35px";


        // Minus button functionality
        minusButton.addEventListener("click", function () {

            updateQuantity(product.id, quantity - 1);

        });


        // Plus button functionality
        plusButton.addEventListener("click", function () {

            updateQuantity(product.id, quantity + 1);

        });


        // Add buttons and quantity
        quantityBox.append(
            minusButton,
            quantityNumber,
            plusButton
        );


        // Product subtotal
        const itemTotal = document.createElement("p");

        itemTotal.className = "fw-bold";

        itemTotal.textContent =
            `Subtotal: ₹${(price * quantity).toFixed(2)}`;


        // Append everything
        details.append(
            name,
            priceText,
            quantityBox,
            itemTotal
        );

        productElement.append(
            image,
            details
        );

        cartItems.appendChild(productElement);

    });


    // =================================
    // UPDATE ORDER SUMMARY
    // =================================

    totalItems.textContent = itemCount;

    subtotal.textContent = total.toFixed(2);

    grandTotal.textContent = total.toFixed(2);

}


// =================================
// FIREBASE AUTHENTICATION
// =================================

auth.onAuthStateChanged(user => {

    if (user) {

        currentUser = user;

        loadCart(user);

    } else {

        currentUser = null;

        cartItems.innerHTML = `
            <p>Please log in to view your cart.</p>
        `;

        emptyCart.style.display = "none";

        totalItems.textContent = "0";

        subtotal.textContent = "0.00";

        grandTotal.textContent = "0.00";

    }

});
