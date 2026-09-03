// ==========================================
// AEGIS - Personnel Login
// ==========================================
if (localStorage.getItem("aegisLoggedIn") !== "true") {
    window.location.href = "login.html";
}
const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("aegisLoggedIn");
        localStorage.removeItem("aegisPersonnelId");
        localStorage.removeItem("aegisUserName");
        localStorage.removeItem("aegisRole");

        window.location.href = "index.html";
    });
}
// ------------------------------------------
// Convert CSV text into user objects
// ------------------------------------------

function parseCSV(csvText) {

    const lines = csvText
        .trim()
        .split("\n");

    const headers = lines[0]
        .split(",")
        .map(header => header.trim());

    const users = [];

    for (let i = 1; i < lines.length; i++) {

        const values = lines[i]
            .split(",")
            .map(value => value.trim());

        const user = {};

        headers.forEach((header, index) => {
            user[header] = values[index];
        });

        users.push(user);
    }

    return users;
}


// ------------------------------------------
// Login
// ------------------------------------------

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    errorMessage.classList.remove("show");


    const personnelId =
        document.getElementById("personnelId").value.trim();

    const password =
        document.getElementById("password").value;


    try {

        // Load CSV
        const response = await fetch("users.csv");

        if (!response.ok) {
            throw new Error("Unable to load users.csv");
        }

        const csvText = await response.text();

        // Convert CSV to objects
        const users = parseCSV(csvText);


        // Find matching user
        const user = users.find(
            person =>
                person.personnel_id === personnelId &&
                person.password === password
        );


        // Invalid login
        if (!user) {

            errorMessage.textContent =
                "Invalid Personnel ID or password.";

            errorMessage.classList.add("show");

            return;
        }


        // ----------------------------------
        // Successful login
        // ----------------------------------

        localStorage.setItem(
            "aegisLoggedIn",
            "true"
        );

        localStorage.setItem(
            "aegisPersonnelId",
            user.personnel_id
        );

        localStorage.setItem(
            "aegisUserName",
            user.name
        );

        localStorage.setItem(
            "aegisRole",
            user.role
        );


        console.log("Login successful:", user);


        // Go to assessment page
        window.location.href = "assesment.html";


    } catch (error) {

        console.error("Login error:", error);

        errorMessage.textContent =
            "Unable to connect to the login system.";

        errorMessage.classList.add("show");
    }

});
