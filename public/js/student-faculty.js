import { supabase } from "./supabase-config.js";
// ========================================
// STUDENT / FACULTY DASHBOARD
// PAGE NAVIGATION AND CART
// ========================================
console.log("STUDENT FACULTY JS IS WORKING!");
const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".sidebar .nav-btn");

function showPage(pageName) {
    // Hide all pages
    pages.forEach(page => {
        page.hidden = true;
    });

    // Show selected page
    const selectedPage = document.getElementById(`${pageName}-page`);

    if (!selectedPage) return;

    selectedPage.hidden = false;

    // Update active sidebar button
    navButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    // Display cart when Cart is selected
    if (pageName === "cart") {
        renderCart();
    }
}

// Sidebar navigation
document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

// Browse Menu button
document
    .getElementById("browse-menu-btn")
    .addEventListener("click", () => {
        showPage("home");
    });

// ========================================
// CART DISPLAY
// ========================================

let cart = [];

function renderCart() {
    const emptyCart = document.getElementById("empty-cart");
    const cartItems = document.getElementById("cart-items");
    const cartSummary = document.getElementById("cart-summary");

    if (cart.length === 0) {
        emptyCart.hidden = false;
        cartItems.hidden = true;
        cartSummary.hidden = true;
        cartItems.innerHTML = "";
    }
}

// ========================================
// LOGOUT FUNCTION
// ========================================

const logoutButton = document.getElementById("logout-btn");

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {

        const confirmed = confirm("Are you sure you want to log out?");

        if (!confirmed) return;

        logoutButton.disabled = true;
        logoutButton.textContent = "Logging out...";

        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            window.location.replace("./index.html");

        } catch (error) {
            console.error("Logout Error:", error);

            alert("Unable to log out. Please try again.");

            logoutButton.disabled = false;
            logoutButton.textContent = "Log Out";
        }
    });
}