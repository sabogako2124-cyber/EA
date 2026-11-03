// Import Firebase Authentication
import { auth } from "./firebase-config.js";

// Import Firebase login and logout functions
import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";


// For Firebase
// ========================================
// CAFE PORTAL SAMPLE PRODUCTS
// ========================================

const sampleProducts = [
    {
        id: 1,
        name: "Classic Burger + Fries",
        category: "Combo",
        price: 89,
        image: "images/classic-burger.jpg",
        bestSeller: true,
        promo: false,
        soldOut: false
    },
    {
        id: 2,
        name: "Double Smash Burger Meal",
        category: "Combo",
        price: 115,
        image: "images/smash-burger.jpg",
        bestSeller: false,
        promo: false,
        soldOut: false
    },
    {
        id: 3,
        name: "Pork Adobo + Rice",
        category: "Combo",
        price: 75,
        image: "images/pork-adobo.jpg",
        bestSeller: true,
        promo: false,
        soldOut: false
    },
    {
        id: 4,
        name: "Beef Steak (Bistek) Meal",
        category: "Combo",
        price: 99,
        image: "images/beef-steak.jpg",
        bestSeller: false,
        promo: false,
        soldOut: false
    },
    {
        id: 5,
        name: "Crispy Fries (Large)",
        category: "Combo",
        price: 45,
        image: "images/fries.jpg",
        bestSeller: false,
        promo: false,
        soldOut: false
    },
    {
        id: 6,
        name: "Chicken Adobo + Rice",
        category: "Combo",
        price: 70,
        image: "images/chicken-adobo.jpg",
        bestSeller: false,
        promo: false,
        soldOut: true
    },
    {
        id: 7,
        name: "Bilo-Bilo",
        category: "Desserts",
        price: 40,
        image: "images/bilo-bilo.jpg",
        bestSeller: false,
        promo: false,
        soldOut: false
    },
    {
        id: 8,
        name: "Leche Flan",
        category: "Desserts",
        price: 35,
        image: "images/leche-flan.jpg",
        bestSeller: false,
        promo: false,
        soldOut: false
    },
    {
        id: 9,
        name: "Halo-Halo",
        category: "Desserts",
        price: 55,
        image: "images/halo-halo.jpg",
        bestSeller: true,
        promo: false,
        soldOut: false
    },
    {
        id: 10,
        name: "Burger + Fries + Drink",
        category: "Promos",
        price: 120,
        image: "images/burger-combo.jpg",
        bestSeller: true,
        promo: false,
        soldOut: false
    },
    {
        id: 11,
        name: "Silog Breakfast Bundle",
        category: "Promos",
        price: 60,
        image: "images/silog.jpg",
        bestSeller: false,
        promo: true,
        soldOut: false
    },
    {
        id: 12,
        name: "Adobo + Lumpia + Rice",
        category: "Promos",
        price: 95,
        image: "images/adobo-lumpia.jpg",
        bestSeller: false,
        promo: true,
        soldOut: false
    },
    {
        id: 13,
        name: "Fresh Orange Juice",
        category: "Drinks",
        price: 45,
        image: "images/orange-juice.jpg",
        bestSeller: false,
        promo: false,
        soldOut: false
    },
    {
        id: 14,
        name: "Iced Coffee",
        category: "Drinks",
        price: 65,
        image: "images/iced-coffee.jpg",
        bestSeller: false,
        promo: false,
        soldOut: false
    },
    {
        id: 15,
        name: "Fruit Shake",
        category: "Drinks",
        price: 60,
        image: "images/fruit-shake.jpg",
        bestSeller: false,
        promo: false,
        soldOut: false
    },
    {
        id: 16,
        name: "Special Rice Meal",
        category: "Others",
        price: 85,
        image: "images/rice-meal.jpg",
        bestSeller: false,
        promo: false,
        soldOut: false
    },
    {
        id: 17,
        name: "Chocolate Milkshake",
        category: "Drinks",
        price: 70,
        image: "images/chocolate-shake.jpg",
        bestSeller: false,
        promo: false,
        soldOut: false
    },
    {
        id: 18,
        name: "Pancit Canton",
        category: "Others",
        price: 50,
        image: "images/pancit.jpg",
        bestSeller: false,
        promo: false,
        soldOut: false
    },
    {
        id: 19,
        name: "Cheesy Nachos",
        category: "Others",
        price: 55,
        image: "images/nachos.jpg",
        bestSeller: false,
        promo: false,
        soldOut: false
    }
];



let cart = [];
let selectedCategory = "All";

const productList = document.getElementById("product-list");
const searchInput = document.getElementById("product-search");

// ========================================
// DISPLAY PRODUCTS
// ========================================

function renderProducts() {

    const searchText = searchInput.value.toLowerCase().trim();

    const filteredProducts = sampleProducts.filter(product => {

        let matchesCategory = false;

        if (selectedCategory === "All") {
            matchesCategory = true;
        }
        else if (selectedCategory === "Best Sellers") {
            matchesCategory = product.bestSeller;
        }
        else {
            matchesCategory = product.category === selectedCategory;
        }

        const matchesSearch =
            product.name.toLowerCase().includes(searchText) ||
            product.category.toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;

    });

    // Update heading and item count
    const categoryHeading = document.querySelector(".products-heading h3");

    if (categoryHeading) {
        categoryHeading.textContent =
            selectedCategory === "All"
                ? "ALL ITEMS"
                : selectedCategory.toUpperCase();
    }

    document.getElementById("item-count").textContent =
        `${filteredProducts.length} items`;

    // No products
    if (filteredProducts.length === 0) {
        productList.innerHTML = "<p>No products found.</p>";
        return;
    }

    // Generate Figma-style product cards
    productList.innerHTML = filteredProducts.map(product => `

        <div class="product-card">

            <div class="product-image-wrapper">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    class="product-image"
                >

                ${product.bestSeller ? `
                    <span class="product-badge best-seller">
                        🏆 Best
                    </span>
                ` : ""}

                ${product.promo ? `
                    <span class="product-badge promo-badge">
                        PROMO
                    </span>
                ` : ""}

                ${product.soldOut ? `
                    <div class="sold-out-overlay">
                        <span>SOLD OUT</span>
                    </div>
                ` : ""}

            </div>

            <div class="product-info">

                <h3>${product.name}</h3>

                <span class="product-category">
                    ${product.category}
                </span>

                <div class="product-bottom">

                    <span class="product-price">
                        ₱${product.price}
                    </span>

                    ${!product.soldOut ? `
                        <button
                            class="add-cart-btn"
                            data-add="${product.id}"
                            title="Add to cart"
                        >
                            +
                        </button>
                    ` : ""}

                </div>

            </div>

        </div>

    `).join("");

}

document.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
        selectedCategory = button.dataset.category;

        document.querySelectorAll("[data-category]").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");
        renderProducts();
    });
});

searchInput.addEventListener("input", renderProducts);

document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
        const pageId = button.dataset.page;

        document.querySelectorAll(".page").forEach(page => {
            page.hidden = true;
        });

        document.getElementById(`${pageId}-page`).hidden = false;

        document.querySelectorAll("[data-page]").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        if (pageId === "cart") {
            renderCart();
        }
    });
});

productList.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");

    if (!button) return;

    const productId = Number(button.dataset.add);
    const product = sampleProducts.find(item => item.id === productId);

if (product && !product.soldOut) {

    cart.push(product);

    updateCartCount();

    // Temporarily show a checkmark
    button.textContent = "✓";

    setTimeout(() => {
        if (button.isConnected) {
            button.textContent = "+";
        }
    }, 800);

}
});

function updateCartCount() {
    document.getElementById("cart-count").textContent = cart.length;
}

function renderCart() {

    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    const emptyCart = document.getElementById("empty-cart");
    const cartSummary = document.getElementById("cart-summary");

    // CHECK IF CART IS EMPTY
    if (cart.length === 0) {

        emptyCart.hidden = false;

        cartItems.innerHTML = "";

        cartItems.hidden = true;
        cartSummary.hidden = true;

    } else {

        // HIDE EMPTY CART MESSAGE
        emptyCart.hidden = true;

        cartItems.hidden = false;
        cartSummary.hidden = false;

        // DISPLAY CART PRODUCTS
        cartItems.innerHTML = cart.map((product, index) => `

            <div class="cart-row">

                <span>
                    ${product.name} — ₱${product.price.toFixed(2)}
                </span>

                <button data-remove="${index}">
                    Remove
                </button>

            </div>

        `).join("");

    }

    // CALCULATE TOTAL
    const total = cart.reduce(
        (sum, product) => sum + product.price,
        0
    );

    cartTotal.textContent = total.toFixed(2);

}

document.getElementById("cart-items").addEventListener("click", event => {
    const button = event.target.closest("[data-remove]");

    if (!button) return;

    cart.splice(Number(button.dataset.remove), 1);
    updateCartCount();
    renderCart();
});

document.getElementById("checkout-button").addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    alert("Sample checkout only. Database checkout is not connected yet.");
});

renderProducts();
updateCartCount();

// ========================================
// LOGIN PAGE FUNCTIONALITY
// ========================================

let selectedRole = "Student";

const loginPage = document.getElementById("login-page");
const mainNavbar = document.getElementById("main-navbar");
const mainContent = document.getElementById("main-content");


// ACCOUNT TYPE SELECTION
document.querySelectorAll(".account-type-btn").forEach(button => {

    button.addEventListener("click", () => {

        // Remove active class
        document.querySelectorAll(".account-type-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        // Highlight selected account type
        button.classList.add("active");

        selectedRole = button.dataset.role;

    });

});


// SHOW HOME PAGE AFTER LOGIN
function openHomePage() {

    // Hide login page
    loginPage.hidden = true;

    // Show navbar and main content
    mainNavbar.hidden = false;
    mainContent.hidden = false;

    // Hide other pages
    document.querySelectorAll(".page").forEach(page => {
        page.hidden = true;
    });

    // Show home
    document.getElementById("home-page").hidden = false;

    // Update navigation
    document.querySelectorAll("[data-page]").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === "home"
        );
    });
     // Load Firebase student information
   loadStudentProfile();
}


// LOGIN FORM SUBMISSION
document.getElementById("login-form").addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const message = document.getElementById("login-message");

    message.textContent = "Logging in...";

    try {

        // Authenticate using Firebase
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        // Login successful
        console.log("Login successful:", userCredential.user.email);

        message.textContent = "";

        // Open Cafe Portal Home Page
        openHomePage();

   } catch (error) {

    console.error("FULL ERROR:", error);
    console.error("ERROR MESSAGE:", error.message);
    console.error("ERROR CODE:", error.code);
    console.error("ERROR STACK:", error.stack);

    message.textContent =
        error.message || "An unexpected error occurred.";

}

});

// ==============================
// BROWSE MENU NAVIGATION
// ==============================

document.getElementById("browse-menu-btn").addEventListener("click", () => {

    // Hide cart page
    document.getElementById("cart-page").hidden = true;

    // Show home page
    document.getElementById("home-page").hidden = false;

    // Update active sidebar button
    document.querySelectorAll(".sidebar .nav-btn").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === "home"
        );

    });

});


// ========================================
// PROFILE PAGE FUNCTIONALITY
// ========================================

// DISPLAY STUDENT INFORMATION
function loadStudentProfile() {

    const user = auth.currentUser;

    if (!user) return;

    // Firebase email
    const email = user.email || "";

    // Sample student details
    const studentName = user.displayName || "Student Test";
    const studentId = "2024-1234-ST";
    const accountType = "Student";

    // Generate initials
    const initials = studentName
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();

    // Update profile information
    document.getElementById("profile-name").textContent = studentName;
    document.getElementById("profile-email").textContent = email;
    document.getElementById("profile-student-id").textContent = studentId;
    document.getElementById("profile-account-type").textContent = accountType;
    document.getElementById("profile-role").textContent = accountType;
    document.getElementById("profile-avatar").textContent = initials;

    // Update sidebar
    document.getElementById("sidebar-user-name").textContent = studentName;
    document.getElementById("sidebar-user-role").textContent = accountType;
    document.querySelector(".sidebar .profile-avatar").textContent = initials;
}


// ========================================
// PROFILE BUTTON NAVIGATION
// ========================================

document.querySelectorAll("[data-profile-page]").forEach(button => {

    button.addEventListener("click", () => {

        const pageName = button.dataset.profilePage;

        // Use existing sidebar navigation
        const navButton = document.querySelector(
            `.sidebar .nav-btn[data-page="${pageName}"]`
        );

        if (navButton) {
            navButton.click();
        }

    });

});


// ========================================
// EDIT PROFILE BUTTON
// ========================================

document.getElementById("edit-profile-btn").addEventListener("click", () => {

    alert("Edit Profile feature will be available soon.");

});


// ========================================
// FIREBASE LOGOUT
// ========================================

document.getElementById("logout-btn").addEventListener("click", async () => {

    const confirmed = confirm("Are you sure you want to log out?");

    if (!confirmed) return;

    try {

        await signOut(auth);

        // Hide dashboard
        mainNavbar.hidden = true;
        mainContent.hidden = true;

        // Show login page
        loginPage.hidden = false;

        // Clear password field
        document.getElementById("login-password").value = "";

    } catch (error) {

        console.error("Logout error:", error);

        alert("Unable to log out. Please try again.");

    }

});