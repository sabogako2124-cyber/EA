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
// FOOD DETAILS DATA
// ==========================================

let selectedFood = null;

let selectedQuantity = 1;


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

    if (pageName === "alerts") {
        loadNotifications();
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

// ==========================================
// OPEN FOOD DETAILS
// ==========================================

function openFoodDetails(product) {

    selectedFood = product;
    selectedQuantity = 1;

    document.getElementById("details-food-name")
        .textContent = product.product_name;

    document.getElementById("details-food-price")
        .textContent = `₱${Number(product.price).toFixed(2)}`;

    document.getElementById("details-food-description")
        .textContent =
            product.description || "No description available.";

    document.getElementById("details-food-category")
        .textContent =
            product.categories?.category_name || "Others";

    document.getElementById("details-unit-price")
        .textContent = `₱${Number(product.price).toFixed(2)}`;

    const image = document.getElementById("details-food-image");

    image.src = getProductImage(product.image_path);
    image.alt = product.product_name;

    image.onerror = () => {
        image.onerror = null;
        image.src = DEFAULT_FOOD_IMAGE;
    };

    const status = document.getElementById("details-food-status");

    status.textContent =
        product.is_available ? "● Available" : "● Unavailable";

    status.className =
        product.is_available
            ? "food-status available"
            : "food-status unavailable";

    showPage("food-details");

    updateDetailsCartButton();
}
// ==========================================
// FOOD DETAILS - QUANTITY AND CART
// ==========================================

// Update quantity and total price
function updateDetailsCartButton() {

    if (!selectedFood) return;

    const button = document.getElementById("details-add-cart");
    const quantityDisplay = document.getElementById("food-quantity-value");

    if (!button || !quantityDisplay) return;

    quantityDisplay.textContent = selectedQuantity;

    const total = Number(selectedFood.price) * selectedQuantity;

    button.textContent = `Add to Cart - ₱${total.toFixed(2)}`;

    button.disabled = !selectedFood.is_available;
}


// Decrease quantity
document.getElementById("decrease-quantity")
    ?.addEventListener("click", () => {

        if (selectedQuantity > 1) {
            selectedQuantity--;
        }

        updateDetailsCartButton();
    });


// Increase quantity
document.getElementById("increase-quantity")
    ?.addEventListener("click", () => {

        if (selectedQuantity < 99) {
            selectedQuantity++;
        }

        updateDetailsCartButton();
    });


// Add selected quantity to cart
document.getElementById("details-add-cart")
    ?.addEventListener("click", () => {

        if (!selectedFood || !selectedFood.is_available) {
            return;
        }

        for (let i = 0; i < selectedQuantity; i++) {
            addToCart(selectedFood);
        }

        showPage("home");
    });


// Back to food menu
document.getElementById("food-details-back")
    ?.addEventListener("click", () => {

        showPage("home");
    });
function createProductCard(product) {

    const categoryName =
        product.categories?.category_name || "Others";

    const card = document.createElement("div");
    card.className = "product-card";
    // Open food details when clicking the product card
card.style.cursor = "pointer";

card.addEventListener("click", () => {
    openFoodDetails(product);
});

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

   addButton.addEventListener("click", (event) => {

    // Prevent opening Food Details
    event.stopPropagation();

    // Add one food item to cart
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
// ALERTS (SUPABASE + PER-USER READ STATUS)
// ==========================================

const alertsList = document.getElementById("alerts-list");
const alertCount = document.getElementById("alert-count");
const unreadCount = document.getElementById("unread-count");
const markAllReadButton = document.getElementById("mark-all-read");
let notificationsLoading = false;
let loadedNotifications = [];
let readNotificationIds = new Set();
let deletedNotificationIds = new Set();
let currentNotificationUserId = null;

function formatAlertTime(dateString) {
    const time = new Date(dateString).getTime();
    if (!Number.isFinite(time)) return "";
    const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
    return new Date(time).toLocaleDateString();
}

function updateAlertBadge() {
    const unread = loadedNotifications.filter(item =>
        !readNotificationIds.has(item.notification_id)
    ).length;
    if (alertCount) {
        alertCount.textContent = String(unread);
        alertCount.hidden = unread === 0;
    }
    if (unreadCount) {
        unreadCount.textContent = `${unread} unread`;
    }
    if (markAllReadButton) {
        markAllReadButton.disabled = unread === 0;
    }
}

function renderNotifications() {
    if (!alertsList) return;
    alertsList.replaceChildren();
    if (!loadedNotifications.length) {
        const empty = document.createElement("p");
        empty.textContent = "No notifications yet.";
        alertsList.appendChild(empty);
        return;
    }
    const fragment = document.createDocumentFragment();
    loadedNotifications.forEach(item => {
        const isUnread = !readNotificationIds.has(item.notification_id);
        const card = document.createElement("article");
        card.className = `alert-card${isUnread ? " unread" : ""}`;
        const dot = document.createElement("span");
        dot.className = "alert-dot";
        const details = document.createElement("div");
        details.className = "alert-details";
        const title = document.createElement("h3");
        title.textContent = item.title;
        const message = document.createElement("p");
        message.textContent = item.message;
        const time = document.createElement("small");
        time.textContent = formatAlertTime(item.created_at);
       details.append(title, message, time);

// Create delete button
const deleteButton = document.createElement("button");

deleteButton.type = "button";
deleteButton.className = "delete-notification";
deleteButton.textContent = "×";
deleteButton.title = "Delete notification";

deleteButton.setAttribute(
    "aria-label",
    `Delete notification: ${item.title}`
);

// Delete notification when clicked
deleteButton.addEventListener("click", event => {

    event.stopPropagation();

    deleteNotification(item.notification_id);

});

// Add notification details and delete button
card.append(dot, details, deleteButton);
        if (isUnread) {
            card.tabIndex = 0;
            card.setAttribute("role", "button");
            card.setAttribute("aria-label", `Mark as read: ${item.title}`);
            card.addEventListener("click", () => markNotificationRead(item.notification_id));
            card.addEventListener("keydown", e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    markNotificationRead(item.notification_id);
                }
            });
        }
        fragment.appendChild(card);
    });
    alertsList.appendChild(fragment);
}

async function loadNotifications() {
    if (!alertsList || notificationsLoading) return;
    notificationsLoading = true;
    try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) throw authError || new Error("Not logged in");
        const userId = authData.user.id;
        // Avoid preserving another account's read state when accounts change.
        if (currentNotificationUserId !== userId) {
            currentNotificationUserId = userId;
            loadedNotifications = [];
            readNotificationIds = new Set();
            deletedNotificationIds = new Set();
        }
        const { data: notices, error: noticesError } = await supabase
            .from("notifications")
            .select("notification_id, title, message, notification_type, created_at")
            .order("created_at", { ascending: false })
            .limit(100);
        if (noticesError) throw noticesError;
        const ids = (notices || []).map(n => n.notification_id);
        let readIds = [];
        if (ids.length) {
            const { data: reads, error: readsError } = await supabase
                .from("notification_reads")
                .select("notification_id")
                .eq("user_id", userId)
                .in("notification_id", ids);
            if (readsError) throw readsError;
            readIds = (reads || []).map(r => r.notification_id);
        }
        // Get notifications deleted by the current user
const { data: deletions, error: deletionError } =
    await supabase
        .from("notification_deletions")
        .select("notification_id")
        .eq("user_id", userId);

if (deletionError) {
    throw deletionError;
}

deletedNotificationIds = new Set(
    (deletions || []).map(item => item.notification_id)
);

// Hide deleted notifications
loadedNotifications = (notices || []).filter(
    item => !deletedNotificationIds.has(item.notification_id)
);

readNotificationIds = new Set(readIds);

renderNotifications();
updateAlertBadge();
    } catch (error) {
        console.error("Notifications Error:", error);
        if (document.getElementById("alerts-page")?.hidden === false) {
            const errorLine = document.createElement("p");
            errorLine.textContent = "Unable to load notifications. Check the database setup.";
            alertsList.replaceChildren(errorLine);
        }
    } finally {
        notificationsLoading = false;
    }
}

async function markNotificationRead(notificationId) {
    if (!currentNotificationUserId || readNotificationIds.has(notificationId)) return;
    const { error } = await supabase.from("notification_reads").upsert({
        user_id: currentNotificationUserId,
        notification_id: notificationId
    }, { onConflict: "user_id,notification_id", ignoreDuplicates: true });
    if (error) {
        console.error("Mark notification read failed:", error);
        alert("Unable to mark notification as read.");
        return;
    }
    readNotificationIds.add(notificationId);
    renderNotifications();
    updateAlertBadge();
}
// ==========================================
// DELETE NOTIFICATION FOR CURRENT USER
// ==========================================

async function deleteNotification(notificationId) {

    if (!currentNotificationUserId) return;

    const confirmed = confirm(
        "Are you sure you want to delete this notification?"
    );

    if (!confirmed) return;

    try {

        const { error } = await supabase
            .from("notification_deletions")
            .upsert({
                user_id: currentNotificationUserId,
                notification_id: notificationId
            }, {
                onConflict: "user_id,notification_id",
                ignoreDuplicates: true
            });

        if (error) throw error;

        // Remove notification from displayed list
        deletedNotificationIds.add(notificationId);

        loadedNotifications = loadedNotifications.filter(
            item => item.notification_id !== notificationId
        );

        renderNotifications();
        updateAlertBadge();

    } catch (error) {

        console.error("Delete Notification Error:", error);

        alert("Unable to delete notification.");

    }
}

markAllReadButton?.addEventListener("click", async () => {
    if (!currentNotificationUserId) return;
    const unreadIds = loadedNotifications
        .filter(item => !readNotificationIds.has(item.notification_id))
        .map(item => item.notification_id);
    if (!unreadIds.length) return;
    markAllReadButton.disabled = true;
    const rows = unreadIds.map(notification_id => ({
        notification_id,
        user_id: currentNotificationUserId
    }));
    const { error } = await supabase.from("notification_reads")
        .upsert(rows, { onConflict: "user_id,notification_id", ignoreDuplicates: true });
    if (error) {
        console.error("Mark all read failed:", error);
        alert("Unable to mark all notifications as read.");
        markAllReadButton.disabled = false;
        return;
    }
    unreadIds.forEach(id => readNotificationIds.add(id));
    renderNotifications();
    updateAlertBadge();
});

// Polling works without Supabase Realtime configuration.
// It refreshes the notification count even while browsing the Home page.
setInterval(() => {
    if (!document.hidden) loadNotifications();
}, 12000);


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
// ==========================================
// LOAD STUDENT / FACULTY PROFILE
// ==========================================

async function loadStudentProfile() {

    try {

        // Get currently authenticated user
        const { data: authData, error: authError } =
            await supabase.auth.getUser();

        if (authError || !authData.user) {
            throw new Error("User is not authenticated.");
        }

        const user = authData.user;

        // Fetch profile information from public.users
        const { data: profile, error: profileError } =
            await supabase
                .from("users")
                .select("full_name, email, role")
                .eq("user_id", user.id)
                .single();

        if (profileError) {
            throw profileError;
        }

        // User information
        const fullName =
            profile.full_name || "Student / Faculty";

        const email =
            profile.email || user.email || "Not available";

        const role =
            profile.role || "Student / Faculty";

        // Generate profile initials
        const initials = fullName
    .trim()
    .split(/[\s/]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join("");

        // Main Profile
        document.getElementById("profile-name")
            .textContent = fullName;

        document.getElementById("profile-role")
            .textContent = role;

        document.getElementById("profile-email")
            .textContent = email;

        document.getElementById("profile-account-type")
            .textContent = role;

        document.getElementById("profile-avatar")
            .textContent = initials || "SF";

        // Sidebar Profile
        document.getElementById("sidebar-user-name")
            .textContent = fullName;

        document.getElementById("sidebar-user-role")
            .textContent = role;

        // Sidebar avatar
        document.querySelector(".sidebar-profile .profile-avatar")
            .textContent = initials || "SF";

        // Home welcome message
        document.getElementById("welcome-user-name")
            .textContent = fullName;

        console.log("Student Profile Loaded:", profile);

    } catch (error) {

        console.error("Load Student Profile Error:", error);

        document.getElementById("profile-email")
            .textContent = "Unable to load";

    }

}
// ==========================================
// INITIALIZE STUDENT / FACULTY DASHBOARD
// ==========================================

async function initializeDashboard() {

    // Load the user's profile from Supabase
    await loadStudentProfile();

    // Load available food items
    await loadProducts();

    // Update shopping cart count
    updateCartCount();

    // Load notifications
    await loadNotifications();

    console.log(
        "Café Portal Student / Faculty Dashboard Ready!"
    );

}



initializeDashboard();