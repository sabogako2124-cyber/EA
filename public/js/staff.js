/* ==========================================
   CAFÉ PORTAL
   STAFF DASHBOARD + FOOD MANAGEMENT
   ========================================== */

import { supabase } from "./supabase-config.js";


// ==========================================
// CONFIGURATION
// ==========================================

const STORAGE_BUCKET = "product-images";

const DEFAULT_IMAGE =
    "../public/Assets/images/food-placeholder.png";


// ==========================================
// NAVIGATION ELEMENTS
// ==========================================

const homeView = document.getElementById("homeView");
const foodsView = document.getElementById("foodsView");

const homeNav = document.getElementById("homeNav");
const foodsNav = document.getElementById("foodsNav");

const topEyebrow = document.getElementById("topEyebrow");
const topTitle = document.getElementById("topTitle");


// ==========================================
// FOOD ELEMENTS
// ==========================================

const foodList = document.getElementById("staffFoodList");

const emptyState = document.getElementById("staffEmptyState");

const foodMessage = document.getElementById("foodMessage");

const filterButtons =
    document.querySelectorAll(".food-filters .filter");


// ==========================================
// EDIT ELEMENTS
// ==========================================

const editModal = document.getElementById("editFoodModal");

const editForm = document.getElementById("editFoodForm");

const editName = document.getElementById("editFoodName");

const editDescription =
    document.getElementById("editFoodDescription");

const editPrice = document.getElementById("editFoodPrice");

const editCategory =
    document.getElementById("editFoodCategory");

const editAvailable =
    document.getElementById("editFoodAvailable");

const editFoodImage =
    document.getElementById("editFoodImage");

const editFoodImagePreview =
    document.getElementById("editFoodImagePreview");

const editMessage =
    document.getElementById("editFoodMessage");

const saveButton =
    document.getElementById("saveEditFood");


// ==========================================
// APPLICATION DATA
// ==========================================

let products = [];

let categories = [];

let selectedFilter = "all";

let editingProductId = null;

let loadingProducts = false;


// ==========================================
// NAVIGATION
// ==========================================

function showView(view) {

    const isHome = view === "home";
    const isFoods = view === "foods";
    const isProfile = view === "profile";

    homeView.classList.toggle("hidden", !isHome);
    foodsView.classList.toggle("hidden", !isFoods);

    document.getElementById("profileView")
        .classList.toggle("hidden", !isProfile);

    const profileNav = document.getElementById("profileNav");

    homeNav.classList.toggle("active", isHome);
    foodsNav.classList.toggle("active", isFoods);
    profileNav.classList.toggle("active", isProfile);

    homeNav.setAttribute(
        "aria-current",
        isHome ? "page" : "false"
    );

    foodsNav.setAttribute(
        "aria-current",
        isFoods ? "page" : "false"
    );

    profileNav.setAttribute(
        "aria-current",
        isProfile ? "page" : "false"
    );

    topEyebrow.textContent =
        isHome ? "CANTEEN STAFF" : "STAFF";

    topTitle.textContent =
        isFoods ? "Food Management"
        : isProfile ? "My Profile"
        : "Staff Dashboard";

    window.scrollTo(0, 0);

    if (isFoods) {
        loadProducts();
    }

    if (isProfile) {
        loadStaffProfile();
    }
}



function navigateTo(view) {

    const hash = `#${view}`;

    if (window.location.hash === hash) {
        showView(view);
    } else {
        window.location.hash = hash;
    }
}


function loadViewFromURL() {

    const hash = window.location.hash;

    if (hash === "#foods") {
        showView("foods");
    } else if (hash === "#profile") {
        showView("profile");
    } else {
        showView("home");
    }
}

document.getElementById("profileNav")
    .addEventListener("click", () => {
        navigateTo("profile");
    });
// Bottom-left Staff profile shortcut
document.getElementById("staffProfileShortcut")
    .addEventListener("click", () => {
        navigateTo("profile");
    });

homeNav.addEventListener("click", () => {
    navigateTo("home");
});

foodsNav.addEventListener("click", () => {
    navigateTo("foods");
});

document.getElementById("foodManagementBtn")
    .addEventListener("click", () => {
        navigateTo("foods");
    });

document.getElementById("backHome")
    .addEventListener("click", () => {
        navigateTo("home");
    });

document.getElementById("addFoodBtn")
    .addEventListener("click", () => {
        window.location.href = "add-food.html";
    });

window.addEventListener("hashchange", loadViewFromURL);


// ==========================================
// STAFF AUTHORIZATION
// ==========================================

async function requireStaff() {

    const { data, error } =
        await supabase.auth.getUser();

    if (error || !data.user) {
        throw new Error("Please log in as Staff.");
    }

    const { data: profile, error: profileError } =
        await supabase
            .from("users")
            .select("role")
            .eq("user_id", data.user.id)
            .single();

    if (profileError || profile?.role !== "Staff") {
        throw new Error("Only Staff can manage products.");
    }

    return data.user;

}


// ==========================================
// PRODUCT IMAGES
// ==========================================

function getProductImage(path) {

    if (!path) {
        return DEFAULT_IMAGE;
    }

    const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path);

    return data.publicUrl || DEFAULT_IMAGE;

}


// ==========================================
// LOAD CATEGORIES
// ==========================================

async function loadCategories() {

    const { data, error } = await supabase
        .from("categories")
        .select("category_id, category_name")
        .order("category_name");

    if (error) {
        throw error;
    }

    categories = data || [];

}


// ==========================================
// LOAD FOOD PRODUCTS
// ==========================================

async function loadProducts() {

    if (loadingProducts) return;

    loadingProducts = true;

    foodMessage.textContent = "Loading food products...";

    try {

        await requireStaff();

        const { data, error } = await supabase
            .from("products")
            .select(`
                product_id,
                product_name,
                description,
                price,
                category_id,
                image_path,
                is_available,
                categories (
                    category_name
                )
            `)
            .order("created_at", {
                ascending: false
            });

        if (error) {
            throw error;
        }

        products = data || [];

        foodMessage.textContent = "";

        updateFoodCounts();

        renderFoods();

    } catch (error) {

        console.error("Load Foods Error:", error);

        foodMessage.textContent =
            error.message || "Unable to load food products.";

    } finally {

        loadingProducts = false;

    }

}


// ==========================================
// FILTER COUNTS
// ==========================================

function updateFoodCounts() {

    const available = products.filter(
        product => product.is_available
    ).length;

    const off = products.length - available;

    document.getElementById("allFoodCount").textContent =
        products.length;

    document.getElementById("availableFoodCount").textContent =
        available;

    document.getElementById("offFoodCount").textContent =
        off;

}


// ==========================================
// FILTER PRODUCTS
// ==========================================

function getFilteredFoods() {

    if (selectedFilter === "available") {

        return products.filter(
            product => product.is_available
        );

    }

    if (selectedFilter === "off") {

        return products.filter(
            product => !product.is_available
        );

    }

    return products;

}


// ==========================================
// CREATE FOOD ROW
// ==========================================

function createFoodRow(product) {

    const row = document.createElement("div");

    row.className =
        "staff-food-row " +
        (product.is_available ? "available" : "unavailable");


    // PRODUCT IMAGE

    const image = document.createElement("img");

    image.className = "staff-food-image";

    image.src = getProductImage(product.image_path);

    image.alt = product.product_name;

    image.onerror = () => {

        image.onerror = null;
        image.src = DEFAULT_IMAGE;

    };


    // PRODUCT DETAILS

    const details = document.createElement("div");

    details.className = "staff-food-details";

    const name = document.createElement("strong");

    name.textContent = product.product_name;

    const category = document.createElement("small");

    category.textContent =
        product.categories?.category_name || "Others";

    const price = document.createElement("b");

    price.textContent =
        `₱${Number(product.price).toFixed(2)}`;

    details.append(name, category, price);


    // ACTIONS

    const actions = document.createElement("div");

    actions.className = "staff-food-actions";


    // AVAILABILITY TOGGLE

    const toggle = document.createElement("button");

    toggle.type = "button";

    toggle.className =
        "availability-toggle " +
        (product.is_available ? "on" : "off");

    toggle.setAttribute(
        "aria-label",
        `Toggle availability for ${product.product_name}`
    );

    toggle.setAttribute(
        "aria-pressed",
        String(product.is_available)
    );

    toggle.addEventListener("click", async () => {

        await toggleAvailability(product);

    });


    // EDIT BUTTON

    const editButton = document.createElement("button");

    editButton.type = "button";

    editButton.className = "staff-edit-btn";

    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {

        openEditModal(product);

    });


    // DELETE BUTTON

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className = "staff-delete-btn";

    deleteButton.textContent = "🗑";

    deleteButton.setAttribute(
        "aria-label",
        `Delete ${product.product_name}`
    );

    deleteButton.addEventListener("click", async () => {

        await deleteFood(product);

    });


    const actionButtons = document.createElement("div");

    actionButtons.className = "staff-action-buttons";

    actionButtons.append(editButton, deleteButton);

    actions.append(toggle, actionButtons);

    row.append(image, details, actions);

    return row;

}


// ==========================================
// RENDER FOOD LIST
// ==========================================

function renderFoods() {

    foodList.replaceChildren();

    const filtered = getFilteredFoods();

    if (filtered.length === 0) {

        emptyState.classList.remove("hidden");

        const title = emptyState.querySelector("h3");

        title.textContent = products.length === 0
            ? "No food products yet"
            : "No products in this category";

        return;

    }

    emptyState.classList.add("hidden");

    const fragment = document.createDocumentFragment();

    filtered.forEach(product => {

        fragment.appendChild(createFoodRow(product));

    });

    foodList.appendChild(fragment);

}


// ==========================================
// FILTER BUTTONS
// ==========================================

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        selectedFilter = button.dataset.filter;

        filterButtons.forEach(filter => {
            filter.classList.remove("selected");
        });

        button.classList.add("selected");

        renderFoods();

    });

});


// ==========================================
// TOGGLE AVAILABILITY
// ==========================================

async function toggleAvailability(product) {

    const newStatus = !product.is_available;

    try {

        await requireStaff();

        const { data, error } = await supabase
            .from("products")
            .update({
                is_available: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq("product_id", product.product_id)
            .select("product_id")
            .single();

        if (error || !data) {
            throw error || new Error("Product was not updated.");
        }

        await loadProducts();

    } catch (error) {

        alert(
            "Unable to update availability: " +
            error.message
        );

    }

}


// ==========================================
// OPEN EDIT MODAL
// ==========================================

async function openEditModal(product) {

    try {

        await requireStaff();

        if (categories.length === 0) {
            await loadCategories();
        }

        editingProductId = product.product_id;

        editName.value = product.product_name;

        editDescription.value = product.description || "";

        editPrice.value = product.price;

        editAvailable.checked = product.is_available;

        // Show the existing image until a new photo is selected.
        editFoodImage.value = "";
        editFoodImagePreview.src = getProductImage(product.image_path);

        editCategory.replaceChildren();

        categories.forEach(category => {

            const option = document.createElement("option");

            option.value = category.category_id;

            option.textContent = category.category_name;

            editCategory.appendChild(option);

        });

        editCategory.value = product.category_id;

        editMessage.textContent = "";

        editModal.classList.remove("hidden");

        editName.focus();

    } catch (error) {

        alert("Unable to edit product: " + error.message);

    }

}
editFoodImage.addEventListener("change", () => {

    const file = editFoodImage.files[0];

    if (!file) {
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        alert("Only JPG, PNG, and WEBP images are allowed.");
        editFoodImage.value = "";
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        alert("The image must not exceed 2 MB.");
        editFoodImage.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = event => {
        editFoodImagePreview.src = event.target.result;
    };

    reader.readAsDataURL(file);

});



// ==========================================
// CLOSE EDIT MODAL
// ==========================================

function closeEditModal() {

    editModal.classList.add("hidden");

    editingProductId = null;

    editForm.reset();

}


document.getElementById("cancelEditFood")
    .addEventListener("click", closeEditModal);


// ==========================================
// SAVE EDITED FOOD (INCLUDING OPTIONAL PHOTO)
// ==========================================

editForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!editingProductId) return;

    const name = editName.value.trim();
    const price = Number(editPrice.value);
    if (!name || !Number.isFinite(price) || price <= 0) {
        editMessage.textContent = "Enter a valid food name and price.";
        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
    editMessage.textContent = "";

    let newUploadedPath = null;
    let productSaved = false;

    try {
        await requireStaff();

        const originalProduct = products.find(
            product => product.product_id === editingProductId
        );
        if (!originalProduct) throw new Error("Product not found. Refresh the food list.");

        let imagePath = originalProduct.image_path;
        const file = editFoodImage.files[0];

        if (file) {
            const types = {
                "image/jpeg": "jpg",
                "image/png": "png",
                "image/webp": "webp"
            };
            if (!types[file.type]) throw new Error("Only JPG, PNG, or WEBP images are allowed.");
            if (file.size > 2 * 1024 * 1024) throw new Error("Image must not exceed 2 MB.");

            newUploadedPath = `${crypto.randomUUID()}.${types[file.type]}`;
            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(newUploadedPath, file, { contentType: file.type });
            if (uploadError) throw uploadError;
            imagePath = newUploadedPath;
        }

        const { data, error } = await supabase
            .from("products")
            .update({
                product_name: name,
                description: editDescription.value.trim(),
                price,
                category_id: editCategory.value,
                image_path: imagePath,
                is_available: editAvailable.checked,
                updated_at: new Date().toISOString()
            })
            .eq("product_id", editingProductId)
            .select("product_id")
            .single();

        if (error || !data) throw error || new Error("Product was not updated.");
        productSaved = true;
        closeEditModal();
        await loadProducts();
    } catch (error) {
        console.error("Edit Product Error:", error);
        editMessage.textContent = "Unable to save changes: " + error.message;
        if (newUploadedPath && !productSaved) {
            // Best effort: don't leave a newly uploaded file orphaned on a failed update.
            const { error: cleanupError } = await supabase.storage
                .from(STORAGE_BUCKET).remove([newUploadedPath]);
            if (cleanupError) console.warn("Image cleanup failed:", cleanupError);
        }
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Save Changes";
    }
});


// ==========================================
// DELETE FOOD
// ==========================================

async function deleteFood(product) {
    const confirmed = confirm(
        `Are you sure you want to delete "${product.product_name}"?\n\n` +
        "This action cannot be undone."
    );
    if (!confirmed) return;

    try {
        await requireStaff();
        const { data, error } = await supabase
            .from("products")
            .delete()
            .eq("product_id", product.product_id)
            .select("product_id");

        if (error) throw error;
        if (!data || data.length === 0) throw new Error("Product was not deleted.");
        await loadProducts();
    } catch (error) {
        console.error("Delete Food Error:", error);
        alert(
            "Unable to delete this product.\n\n" +
            "If it has existing orders, mark it unavailable instead.\n\n" +
            error.message
        );
    }
}


// ==========================================
// INITIALIZE STAFF DASHBOARD
// ==========================================

loadViewFromURL();

// ==========================================
// STAFF PROFILE
// ==========================================

async function loadStaffProfile() {

    try {

        const user = await requireStaff();

        const { data: profile, error } = await supabase
            .from("users")
            .select("full_name, email, role")
            .eq("user_id", user.id)
            .single();

        if (error) {
            throw error;
        }

        const fullName = profile.full_name || "Staff";
        const email = profile.email || user.email || "Not available";

        // Get initials
        const initials = fullName
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(word => word.charAt(0).toUpperCase())
            .join("");

        // Main profile
        document.getElementById("staffProfileName")
            .textContent = fullName;

        document.getElementById("staffFullName")
            .textContent = fullName;

        document.getElementById("staffEmail")
            .textContent = email;

        document.getElementById("staffProfileAvatar")
            .textContent = initials || "ST";

        // Sidebar profile
        document.getElementById("staffSidebarName")
            .textContent = fullName;

        document.getElementById("staffSidebarAvatar")
            .textContent = initials || "ST";

    } catch (error) {

        console.error("Staff Profile Error:", error);

        document.getElementById("staffFullName")
            .textContent = "Unable to load";

        document.getElementById("staffEmail")
            .textContent = "Unable to load";
    }
}


// ==========================================
// EDIT PROFILE PLACEHOLDER
// ==========================================

document.getElementById("staffEditProfileBtn")
    .addEventListener("click", () => {

        alert("Edit Profile will be available soon!");

    });


// ==========================================
// STAFF PROFILE LOGOUT
// ==========================================

document.getElementById("staffProfileLogout")
    .addEventListener("click", async () => {

        const confirmed = confirm(
            "Are you sure you want to log out?"
        );

        if (!confirmed) return;

        const logoutButton =
            document.getElementById("staffProfileLogout");

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