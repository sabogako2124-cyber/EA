// ========================================
// CAFE PORTAL - SUPABASE AUTHENTICATION
// ========================================

import { supabase } from "./supabase-config.js";

console.log("Cafe Portal Authentication Loaded!");

// ========================================
// HTML ELEMENTS
// ========================================

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("login-error");

// ========================================
// LOGIN FUNCTION
// ========================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const loginButton = loginForm.querySelector("button");

    loginError.textContent = "";

    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    try {

        // STEP 1: Authenticate user through Supabase
        const { data, error } =
            await supabase.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            throw error;
        }

        // STEP 2: Retrieve user profile
        const { data: profile, error: profileError } =
            await supabase
                .from("users")
                .select("user_id, full_name, email, role")
                .eq("user_id", data.user.id)
                .single();

        if (profileError || !profile) {
            throw new Error("Unable to retrieve account information.");
        }

        console.log("Login Successful!");
        console.log("Email:", profile.email);
        console.log("Role:", profile.role);

        // STEP 3: Check account role and redirect

        if (profile.role === "Student / Faculty") {

            console.log("Redirecting to Student / Faculty Dashboard...");

            window.location.replace("./student-faculty.html");

            return;

        }
        else if (profile.role === "Staff") {

            console.log("Redirecting to Staff Dashboard...");

            window.location.replace("./Staff.html");

            return;

        }
        else {

            throw new Error("Unsupported account role.");

        }

    }
    catch (error) {

        console.error("Login Error:", error);

        loginError.textContent =
            "Unable to log in. Please check your credentials and try again.";

    }
    finally {

        loginButton.disabled = false;
        loginButton.textContent = "Log In";

    }

});