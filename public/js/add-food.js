/* ==========================================
   CAFÉ PORTAL - ADD FOOD ITEM
   SUPABASE INTEGRATION
   ========================================== */

import { supabase } from "./supabase-config.js";

document.addEventListener("DOMContentLoaded", async () => {

    // =====================================
    // HTML ELEMENTS
    // =====================================

    const addFoodForm =
        document.getElementById("add-food-form");

    const foodName =
        document.getElementById("food-name");

    const foodDescription =
        document.getElementById("food-description");

    const foodPrice =
        document.getElementById("food-price");

    const categoryList =
        document.getElementById("category-list");

    const selectedCategory =
        document.getElementById("selected-category");

    const addCategoryBtn =
        document.getElementById("add-category-btn");

    const foodImage =
        document.getElementById("food-image");

    const imagePreview =
        document.getElementById("image-preview");

    const imagePlaceholder =
        document.getElementById("image-upload-placeholder");

    const foodAvailable =
        document.getElementById("food-available");

    const submitFoodBtn =
        document.getElementById("submit-food-btn");

    const formMessage =
        document.getElementById("form-message");


    // =====================================
    // CONFIGURATION
    // =====================================

    const STORAGE_BUCKET = "product-images";

    const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

    const ALLOWED_IMAGE_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    let categories = [];

    let previewUrl = null;

    let isSubmitting = false;


    // =====================================
    // DISPLAY MESSAGES
    // =====================================

    function showMessage(message, type = "") {

        formMessage.textContent = message;

        formMessage.className = "form-message";

        if (type) {
            formMessage.classList.add(type);
        }
    }


    // =====================================
    // CHECK STAFF AUTHENTICATION
    // =====================================

    async function getStaffUser() {

        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser();

        if (authError || !user) {
            throw new Error(
                "You must log in before adding food."
            );
        }

        const {
            data: profile,
            error: profileError
        } = await supabase
            .from("users")
            .select("role")
            .eq("user_id", user.id)
            .single();

        if (profileError || !profile) {
            throw new Error(
                "Unable to verify your account."
            );
        }

        if (profile.role !== "Staff") {
            throw new Error(
                "Only Staff accounts can add food products."
            );
        }

        return user;
    }


    // =====================================
    // LOAD CATEGORIES FROM SUPABASE
    // =====================================

    async function loadCategories() {

        try {
            // To add items to supabase Table

            const { data, error } = await supabase
                .from("categories")
                .select("category_id, category_name")
                .order("category_name", {
                    ascending: true
                });

            if (error) {
                throw error;
            }

            categories = data || [];

            console.log(
                "Categories loaded:",
                categories
            );

            updateCategoryButtons();

        } catch (error) {

            console.error(
                "Load Categories Error:",
                error
            );

            showMessage(
                "Unable to load food categories.",
                "error"
            );
        }
    }


    // =====================================
    // UPDATE CATEGORY BUTTONS
    // =====================================

    function updateCategoryButtons() {

        const categoryButtons =
            categoryList.querySelectorAll(".category-btn");

        categoryButtons.forEach(button => {

            const categoryName =
                button.dataset.category;

            const category = categories.find(item =>
                item.category_name.toLowerCase() ===
                categoryName.toLowerCase()
            );

            if (category) {

                button.dataset.categoryId =
                    category.category_id;

                button.disabled = false;

            } else {

                button.removeAttribute("data-category-id");

                button.disabled = true;
            }
        });

        // Add buttons for custom categories
        categories.forEach(category => {

            const existingButton = Array.from(
                categoryList.querySelectorAll(".category-btn")
            ).find(button =>
                button.dataset.categoryId ===
                category.category_id
            );

            if (existingButton) return;

            const button =
                document.createElement("button");

            button.type = "button";

            button.className = "category-btn";

            button.dataset.category =
                category.category_name;

            button.dataset.categoryId =
                category.category_id;

            button.setAttribute(
                "aria-pressed",
                "false"
            );

            button.textContent =
                category.category_name;

            categoryList.insertBefore(
                button,
                addCategoryBtn
            );
        });
    }


    // =====================================
    // SELECT CATEGORY
    // =====================================

    categoryList.addEventListener("click", event => {

        const button =
            event.target.closest(".category-btn");

        if (!button || button.disabled) return;

        const categoryId =
            button.dataset.categoryId;

        if (!categoryId) {

            showMessage(
                "Category is not available.",
                "error"
            );

            return;
        }

        categoryList
            .querySelectorAll(".category-btn")
            .forEach(categoryButton => {

                categoryButton.classList.remove(
                    "active"
                );

                categoryButton.setAttribute(
                    "aria-pressed",
                    "false"
                );
            });

        button.classList.add("active");

        button.setAttribute(
            "aria-pressed",
            "true"
        );

        selectedCategory.value = categoryId;

        showMessage("");

        console.log(
            "Selected Category ID:",
            categoryId
        );
    });


    // =====================================
    // CREATE NEW CATEGORY
    // =====================================

    addCategoryBtn.addEventListener(
        "click",
        async () => {

            const categoryName = prompt(
                "Enter new food category:"
            );

            if (categoryName === null) return;

            const name = categoryName.trim();

            if (!name) {

                showMessage(
                    "Category name cannot be empty.",
                    "error"
                );

                return;
            }

            if (name.length > 100) {

                showMessage(
                    "Category name is too long.",
                    "error"
                );

                return;
            }

            const existingCategory = categories.find(
                item =>
                    item.category_name.toLowerCase() ===
                    name.toLowerCase()
            );

            if (existingCategory) {

                showMessage(
                    "This category already exists.",
                    "error"
                );

                return;
            }

            addCategoryBtn.disabled = true;

            try {

                await getStaffUser();

                const { data, error } = await supabase
                    .from("categories")
                    .insert({
                        category_name: name
                    })
                    .select(
                        "category_id, category_name"
                    )
                    .single();

                if (error) {
                    throw error;
                }

                categories.push(data);

                updateCategoryButtons();

                const newButton = Array.from(
                    categoryList.querySelectorAll(
                        ".category-btn"
                    )
                ).find(button =>
                    button.dataset.categoryId ===
                    data.category_id
                );

                if (newButton) {
                    newButton.click();
                }

                showMessage(
                    "New category created successfully!",
                    "success"
                );

            } catch (error) {

                console.error(
                    "Create Category Error:",
                    error
                );

                showMessage(
                    error.message ||
                    "Unable to create category.",
                    "error"
                );

            } finally {

                addCategoryBtn.disabled = false;
            }
        }
    );


    // =====================================
    // RESET IMAGE PREVIEW
    // =====================================

    function resetImagePreview() {

        if (previewUrl) {

            URL.revokeObjectURL(previewUrl);

            previewUrl = null;
        }

        imagePreview.hidden = true;

        imagePreview.removeAttribute("src");

        imagePlaceholder.hidden = false;
    }


    // =====================================
    // VALIDATE IMAGE
    // =====================================

    function validateImage(file) {

        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {

            throw new Error(
                "Please select a JPG, PNG, or WEBP image."
            );
        }

        if (file.size > MAX_IMAGE_SIZE) {

            throw new Error(
                "Food image must not exceed 2 MB."
            );
        }
    }


    // =====================================
    // IMAGE PREVIEW
    // =====================================

    foodImage.addEventListener("change", () => {

        const file = foodImage.files[0];

        resetImagePreview();

        if (!file) return;

        try {

            validateImage(file);

            previewUrl = URL.createObjectURL(file);

            imagePreview.src = previewUrl;

            imagePreview.hidden = false;

            imagePlaceholder.hidden = true;

            showMessage("");

        } catch (error) {

            foodImage.value = "";

            resetImagePreview();

            showMessage(
                error.message,
                "error"
            );
        }
    });


    // =====================================
    // UPLOAD IMAGE TO SUPABASE
    // =====================================

    async function uploadFoodImage(file) {

        if (!file) {
            return null;
        }

        validateImage(file);

        const extensions = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp"
        };

        const extension = extensions[file.type];

        const fileName =
            `${crypto.randomUUID()}.${extension}`;

        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(fileName, file, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            throw error;
        }

        return fileName;
    }


    // =====================================
    // SAVE FOOD PRODUCT
    // =====================================

    async function saveFoodProduct(productData) {

        const { data, error } = await supabase
            .from("products")
            .insert(productData)
            .select("product_id")
            .single();

        if (error) {
            throw error;
        }

        return data;
    }


    // =====================================
    // RESET FORM
    // =====================================

    function resetForm() {

        addFoodForm.reset();

        selectedCategory.value = "";

        categoryList
            .querySelectorAll(".category-btn")
            .forEach(button => {

                button.classList.remove("active");

                button.setAttribute(
                    "aria-pressed",
                    "false"
                );
            });

        resetImagePreview();

        foodAvailable.checked = true;
    }


    // =====================================
    // FORM SUBMISSION
    // =====================================

    addFoodForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (isSubmitting) return;

            showMessage("");

            const productName =
                foodName.value.trim();

            const description =
                foodDescription.value.trim();

            const price =
                Number(foodPrice.value);

            const categoryId =
                selectedCategory.value;

            const isAvailable =
                foodAvailable.checked;

            const imageFile =
                foodImage.files[0] || null;


            // =================================
            // VALIDATE FORM
            // =================================

            if (!productName) {

                showMessage(
                    "Please enter the food name.",
                    "error"
                );

                foodName.focus();

                return;
            }

            if (
                !foodPrice.value ||
                !Number.isFinite(price) ||
                price <= 0
            ) {

                showMessage(
                    "Please enter a valid price.",
                    "error"
                );

                foodPrice.focus();

                return;
            }

            if (!categoryId) {

                showMessage(
                    "Please select a food category.",
                    "error"
                );

                return;
            }

            try {

                validateImage(imageFile);

            } catch (error) {

                showMessage(
                    error.message,
                    "error"
                );

                return;
            }


            // =================================
            // START SUBMISSION
            // =================================

            isSubmitting = true;

            submitFoodBtn.disabled = true;

            submitFoodBtn.textContent =
                "Adding Food Item...";

            let uploadedImagePath = null;

            try {

                // Verify Staff account
                const user = await getStaffUser();


                // =================================
                // UPLOAD IMAGE (OPTIONAL)
                // =================================

                if (imageFile) {

                    uploadedImagePath =
                        await uploadFoodImage(
                            imageFile
                        );
                }


                // =================================
                // PREPARE PRODUCT DATA
                // =================================

                const productData = {

                    product_name: productName,

                    description: description || null,

                    price: price,

                    category_id: categoryId,

                    image_path: uploadedImagePath,

                    is_available: isAvailable,

                    created_by: user.id

                };


                // =================================
                // SAVE TO SUPABASE
                // =================================

                const savedProduct =
                    await saveFoodProduct(
                        productData
                    );

                console.log(
                    "Food Added Successfully:",
                    savedProduct
                );


                // =================================
                // SUCCESS
                // =================================

                resetForm();

                showMessage(
                    "Food item added successfully!",
                    "success"
                );

                // Return to Staff Food Management after saving
                setTimeout(() => {
                    window.location.replace("./Staff.html#foods");
                }, 
                1000);

            } catch (error) {

                console.error(
                    "Add Food Error:",
                    error
                );

                // Remove uploaded image if
                // saving the product failed.
                if (uploadedImagePath) {

                    const { error: cleanupError } =
                        await supabase.storage
                            .from(STORAGE_BUCKET)
                            .remove([
                                uploadedImagePath
                            ]);

                    if (cleanupError) {

                        console.error(
                            "Image Cleanup Error:",
                            cleanupError
                        );
                    }
                }

                showMessage(
                    error.message ||
                    "Unable to add food item.",
                    "error"
                );

            } finally {

                isSubmitting = false;

                submitFoodBtn.disabled = false;

                submitFoodBtn.textContent =
                    "+ Add Food Item";
            }
        }
    );


    // =====================================
    // CLEAN UP IMAGE PREVIEW
    // =====================================

    window.addEventListener("pagehide", () => {

        if (previewUrl) {

            URL.revokeObjectURL(
                previewUrl
            );
        }
    });


    // =====================================
    // INITIALIZE
    // =====================================

    await loadCategories();

    console.log(
        "Café Portal Add Food is ready!"
    );

});