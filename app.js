
function showPage(pageId) {
    const pages = document.querySelectorAll("main > section");

    pages.forEach(function(page) {
        page.hidden = true;
    });

    const selectedPage = document.getElementById(pageId + "-page");

    if (selectedPage) {
        selectedPage.hidden = false;
    }
}

const buttons = document.querySelectorAll("[data-page]");

buttons.forEach(function(button) {
    button.addEventListener("click", function() {
        showPage(button.getAttribute("data-page"));
    });
});

async function loadProducts() {
    const productList = document.getElementById("product-list");
    const itemCount = document.getElementById("item-count");

    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        const products = await response.json();

        productList.replaceChildren();

        if (products.length === 0) {
            productList.textContent = "No products available.";
            itemCount.textContent = "0 items";
            return;
        }

        products.forEach(function(product) {
            const card = document.createElement("div");
            const name = document.createElement("h4");
            const price = document.createElement("p");

            name.textContent = product.name;
            price.textContent = "₱" + Number(product.price).toFixed(2);

            card.appendChild(name);
            card.appendChild(price);
            productList.appendChild(card);
        });

        itemCount.textContent = products.length + " items";

    } catch (error) {
        console.error("Error loading products:", error);
        productList.textContent =
            "Unable to load products. Please check the server.";
    }
}

loadProducts();
