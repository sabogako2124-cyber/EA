/* ==========================================
   CAFÉ PORTAL
   STUDENT / FACULTY DASHBOARD
   SUPABASE FOOD MENU
   ========================================== */

import { supabase } from "./supabase-config.js";

console.log("Student / Faculty Dashboard Loaded!");


// ==========================================
// CONFIGURATION
// ==========================================

const STORAGE_BUCKET = "product-images";

const DEFAULT_FOOD_IMAGE =
    "../public/Assets/images/food-placeholder.png";


// ==========================================
// HTML ELEMENTS
// ==========================================

const pages = document.querySelectorAll(".page");

const navButtons =
    document.querySelectorAll(".sidebar .nav-btn");

const productList =
    document.getElementById("product-list");

const emptyProducts =
    document.getElementById("empty-products");

const searchInput =
    document.getElementById("product-search");

const itemCount =
    document.getElementById("item-count");

const categoryButtons =
    document.querySelectorAll(".category-btn");

const cartCount =
    document.getElementById("cart-count");

const emptyCart =
    document.getElementById("empty-cart");

const cartItems =
    document.getElementById("cart-items");

const cartSummary =
    document.getElementById("cart-summary");

const cartTotal =
    document.getElementById("cart-total");

const logoutButton =
    document.getElementById("logout-btn");


// ==========================================
// APPLICATION DATA
// ==========================================

let products = [];

let cart = [];

let selectedCategory = "All";


// ==========================================
// PAGE NAVIGATION
// ==========================================

function showPage(pageName) {

    const selectedPage =
        document.getElementById(`${pageName}-page`);

    if (!selectedPage) return;

    pages.forEach(page => {
        page.hidden = true;
    });

    selectedPage.hidden = false;

    navButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );

    });

    if (pageName === "cart") {
        renderCart();
    }

    window.scrollTo(0, 0);
}


// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

document.querySelectorAll("[data-page]")
    .forEach(button => {

        button.addEventListener("click", () => {

            showPage(button.dataset.page);

        });

    });


// ==========================================
// BROWSE MENU BUTTON
// ==========================================

document.getElementById("browse-menu-btn")
    .addEventListener("click", () => {

        showPage("home");

    });


// ==========================================
// PROFILE PAGE NAVIGATION
// ==========================================

document.querySelectorAll("[data-profile-page]")
    .forEach(button => {

        button.addEventListener("click", () => {

            showPage(button.dataset.profilePage);

        });

    });


// ==========================================
// EDIT PROFILE PLACEHOLDER
// ==========================================

document.getElementById("edit-profile-btn")
    .addEventListener("click", () => {

        alert("Edit Profile will be available soon.");

    });


// ==========================================
// GET PRODUCT IMAGE
// ==========================================

function getProductImage(imagePath) {

    if (!imagePath) {
        return DEFAULT_FOOD_IMAGE;
    }

    const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(imagePath);

    return data.publicUrl;
}


// ==========================================
// LOAD PRODUCTS FROM SUPABASE
// ==========================================

async function loadProducts() {

    try {

        const { data, error } = await supabase
            .from("products")
            .select(`
                product_id,
                product_name,
                description,
                price,
                image_path,
                is_available,
                categories (
                    category_name
                )
            `)
            .eq("is_available", true)
            .order("created_at", {
                ascending: false
            });

        if (error) {
            throw error;
        }

        products = data || [];

        console.log(
            "Products loaded from Supabase:",
            products
        );

        renderProducts();

    } catch (error) {

        console.error(
            "Load Products Error:",
            error
        );

        products = [];

        productList.replaceChildren();

        emptyProducts.hidden = false;

        emptyProducts.querySelector("h3").textContent =
            "Unable to load products";

        emptyProducts.querySelector("p").textContent =
            "Please refresh the page and try again.";

        itemCount.textContent = "0 items";

    }

}


// ==========================================
// FILTER PRODUCTS
// ==========================================

function getFilteredProducts() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    return products.filter(product => {

        const categoryName =
            product.categories?.category_name || "Others";

        let matchesCategory = false;

        if (selectedCategory === "All") {

            matchesCategory = true;

        } else if (selectedCategory === "Best Sellers") {

            // Best Sellers requires sales data.
            // We will implement it later.
            matchesCategory = false;

        } else {

            matchesCategory =
                categoryName.toLowerCase() ===
                selectedCategory.toLowerCase();

        }

        const matchesSearch =
            product.product_name
                .toLowerCase()
                .includes(searchText) ||

            categoryName
                .toLowerCase()
                .includes(searchText);

        return matchesCategory && matchesSearch;

    });

}


// ==========================================
// CREATE PRODUCT CARD
// ==========================================

function createProductCard(product) {

    const categoryName =
        product.categories?.category_name || "Others";

    const card = document.createElement("div");
    card.className = "product-card";

    // IMAGE CONTAINER

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "product-image-wrapper";

    const image = document.createElement("img");

    image.className = "product-image";
    image.src = getProductImage(product.image_path);
    image.alt = product.product_name;
    image.loading = "lazy";

    // DEFAULT IMAGE IF UPLOADED IMAGE FAILS

    image.onerror = () => {

        image.onerror = null;

        image.src = DEFAULT_FOOD_IMAGE;

    };

    imageWrapper.appendChild(image);

    // PRODUCT INFORMATION

    const productInfo = document.createElement("div");
    productInfo.className = "product-info";

    const productName = document.createElement("h3");
    productName.textContent = product.product_name;

    const category = document.createElement("span");
    category.className = "product-category";
    category.textContent = categoryName;

    // PRODUCT BOTTOM

    const productBottom = document.createElement("div");
    productBottom.className = "product-bottom";

    const price = document.createElement("span");
    price.className = "product-price";

    price.textContent =
        `₱${Number(product.price).toFixed(2)}`;

    // ADD TO CART BUTTON

    const addButton = document.createElement("button");

    addButton.type = "button";
    addButton.className = "add-cart-btn";
    addButton.textContent = "+";
    addButton.title = "Add to Cart";
    addButton.setAttribute("aria-label",
        `Add ${product.product_name} to cart`
    );

    addButton.addEventListener("click", () => {

        addToCart(product);

        addButton.textContent = "✓";

        setTimeout(() => {

            if (addButton.isConnected) {
                addButton.textContent = "+";
            }

        }, 800);

    });

    // ASSEMBLE CARD

    productBottom.appendChild(price);
    productBottom.appendChild(addButton);

    productInfo.appendChild(productName);
    productInfo.appendChild(category);
    productInfo.appendChild(productBottom);

    card.appendChild(imageWrapper);
    card.appendChild(productInfo);

    return card;
}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function renderProducts() {

    const filteredProducts = getFilteredProducts();

    productList.replaceChildren();

    itemCount.textContent =
        `${filteredProducts.length} items`;

    // UPDATE CATEGORY HEADING

    const heading =
        document.querySelector(".products-heading h2");

    if (heading) {

        heading.textContent =
            selectedCategory === "All"
                ? "ALL ITEMS"
                : selectedCategory.toUpperCase();

    }

    // EMPTY PRODUCT LIST

    if (filteredProducts.length === 0) {

        emptyProducts.hidden = false;

        if (products.length === 0) {

            emptyProducts.querySelector("h3").textContent =
                "No products available yet";

            emptyProducts.querySelector("p").textContent =
                "The cafeteria staff will add food and drinks here soon.";

        } else {

            emptyProducts.querySelector("h3").textContent =
                "No products found";

            emptyProducts.querySelector("p").textContent =
                "Try searching for another food or category.";

        }

        return;
    }

    emptyProducts.hidden = true;

    // CREATE PRODUCT CARDS

    const fragment = document.createDocumentFragment();

    filteredProducts.forEach(product => {

        fragment.appendChild(
            createProductCard(product)
        );

    });

    productList.appendChild(fragment);

}


// ==========================================
// CATEGORY FILTER BUTTONS
// ==========================================

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        selectedCategory = button.dataset.category;

        categoryButtons.forEach(btn => {

            btn.classList.remove("active");

        });

        button.classList.add("active");

        renderProducts();

    });

});


// ==========================================
// PRODUCT SEARCH
// ==========================================

searchInput.addEventListener("input", () => {

    renderProducts();

});


// ==========================================
// ADD PRODUCT TO CART
// ==========================================

function addToCart(product) {

    // CHECK IF PRODUCT IS ALREADY IN CART

    const existingItem = cart.find(item =>
        item.product_id === product.product_id
    );

    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({

            product_id: product.product_id,

            product_name: product.product_name,

            price: Number(product.price),

            quantity: 1

        });

    }

    updateCartCount();

    console.log("Cart:", cart);

}


// ==========================================
// UPDATE CART COUNT
// ==========================================

function updateCartCount() {

    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = totalQuantity;

}


// ==========================================
// DISPLAY CART
// ==========================================

function renderCart() {

    cartItems.replaceChildren();

    if (cart.length === 0) {

        emptyCart.hidden = false;

        cartItems.hidden = true;

        cartSummary.hidden = true;

        updateCartCount();

        return;
    }

    emptyCart.hidden = true;

    cartItems.hidden = false;

    cartSummary.hidden = false;

    // CREATE CART ROWS

    cart.forEach(item => {

        const row = document.createElement("div");
        row.className = "cart-row";

        const info = document.createElement("div");
        info.className = "cart-row-info";

        const name = document.createElement("strong");
        name.textContent = item.product_name;

        const details = document.createElement("span");

        details.textContent =
            `₱${item.price.toFixed(2)} × ${item.quantity}`;

        info.appendChild(name);
        info.appendChild(details);

        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.className = "remove-cart-btn";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {

            removeFromCart(item.product_id);

        });

        row.appendChild(info);
        row.appendChild(removeButton);

        cartItems.appendChild(row);

    });

    // CALCULATE TOTAL

    const total = cart.reduce(
        (sum, item) =>
            sum + item.price * item.quantity,
        0
    );

    cartTotal.textContent = total.toFixed(2);

    updateCartCount();

}


// ==========================================
// REMOVE PRODUCT FROM CART
// ==========================================

function removeFromCart(productId) {

    cart = cart.filter(item =>
        item.product_id !== productId
    );

    updateCartCount();

    renderCart();

}


// ==========================================
// CHECKOUT PLACEHOLDER
// ==========================================

document.getElementById("checkout-button")
    .addEventListener("click", () => {

        if (cart.length === 0) {

            alert("Your cart is empty.");

            return;
        }

        alert(
            "Checkout functionality will be available soon."
        );

    });


// ==========================================
// LOGOUT FUNCTION
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        const confirmed = confirm(
            "Are you sure you want to log out?"
        );

        if (!confirmed) return;

        logoutButton.disabled = true;

        logoutButton.textContent = "Logging out...";

        try {

            const { error } =
                await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            window.location.replace("./index.html");

        } catch (error) {

            console.error(
                "Logout Error:",
                error
            );

            alert(
                "Unable to log out. Please try again."
            );

            logoutButton.disabled = false;

            logoutButton.textContent = "Log Out";

        }

    });

}


// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

async function initializeDashboard() {

    await loadProducts();

    updateCartCount();

    console.log(
        "Café Portal Student / Faculty Menu Ready!"
    );

}

initializeDashboard();