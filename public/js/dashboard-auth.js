import { supabase } from "./supabase-config.js";

// Verify Student / Faculty access
async function checkDashboardAccess() {

    try {

        const { data: { user }, error: authError } =
            await supabase.auth.getUser();

        if (authError || !user) {
            window.location.replace("./index.html");
            return;
        }

        const { data: profile, error: profileError } =
            await supabase
                .from("users")
                .select("full_name, email, role")
                .eq("user_id", user.id)
                .single();

        if (profileError || !profile) {
            window.location.replace("./index.html");
            return;
        }

        if (profile.role !== "Student / Faculty") {
            window.location.replace("./index.html");
            return;
        }

        // Display the dashboard
        document.getElementById("main-navbar").hidden = false;
        document.getElementById("main-content").hidden = false;

        console.log("Student / Faculty Dashboard Loaded!");

    } catch (error) {

        console.error("Dashboard Error:", error);

        window.location.replace("./index.html");
    }
}

checkDashboardAccess();