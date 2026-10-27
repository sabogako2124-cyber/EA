
const sampleProducts = [
    { id: 1, name: "Product Name 1", category: "Meals", price: 135 },
    { id: 2, name: "Product Name 2", category: "Snacks", price: 75 },
    { id: 3, name: "Product Name 3", category: "Snacks", price: 65 },
    { id: 4, name: "Product Name 4", category: "Drinks", price: 110 },
    { id: 5, name: "Product Name 5", category: "Drinks", price: 115 },
    { id: 6, name: "Product Name 6", category: "Drinks", price: 90 },
    { id: 7, name: "Product Name 7", category: "Drinks", price: 85 },
    { id: 8, name: "Product Name 8", category: "Desserts", price: 110 }
];

let cart = [];
let selectedCategory = "All";

const productList = document.getElementById("product-list");
const searchInput = document.getElementById("product-search");

function renderProducts() {
    const searchText = searchInput.value.toLowerCase();

    const filteredProducts = sampleProducts.filter(product => {
        const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory;

        const matchesSearch =
            product.name.toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;
    });

    document.getElementById("item-count").textContent =
        `${filteredProducts.length} product(s) available`;

    if (filteredProducts.length === 0) {
        productList.innerHTML = "<p>No products found.</p>";
        return;
    }

    productList.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">▧</div>
            <h3>${product.name}</h3>
            <span class="product-category">${product.category}</span>
            <p class="product-price">₱${product.price.toFixed(2)}</p>
            <button class="primary-btn" data-add="${product.id}">
                🛒 Add to Cart
            </button>
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

    if (product) {
        cart.push(product);
        updateCartCount();
        button.textContent = "✓ Added!";
    }
});

function updateCartCount() {
    document.getElementById("cart-count").textContent = cart.length;
}

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cartItems.innerHTML = cart.map((product, index) => `
            <div class="cart-row">
                <span>${product.name} — ₱${product.price.toFixed(2)}</span>
                <button data-remove="${index}">Remove</button>
            </div>
        `).join("");
    }

    const total = cart.reduce((sum, product) => sum + product.price, 0);
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
