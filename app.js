// Function to display the selected page
function showPage(pageId) {

    // Get all pages
    const pages = document.querySelectorAll("main > section");

    // Hide all pages
    pages.forEach(function(page) {
        page.hidden = true;
    });

    // Show the selected page
    document.getElementById(pageId + "-page").hidden = false;
}

// Detect navigation button clicks
const buttons = document.querySelectorAll("[data-page]");

buttons.forEach(function(button) {

    button.addEventListener("click", function() {

        const page = button.getAttribute("data-page");

        showPage(page);

    });

});