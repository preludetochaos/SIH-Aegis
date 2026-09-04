const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

function parseCSV(csvText) {

    const lines =
        csvText.trim().split("\n");

    const headers =
        lines[0]
            .split(",")
            .map(header => header.trim());

    const users = [];

    for (let i = 1; i < lines.length; i++) {

        const values =
            lines[i]
                .split(",")
                .map(value => value.trim());

        const user = {};

        headers.forEach(
            (header, index) => {
                user[header] =
                    values[index];
            }
        );

        users.push(user);
    }

    return users;
}


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        errorMessage.classList.remove("show");


        const personnelId =
            document
                .getElementById("personnelId")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;


        try {

            // ==========================================
            // STEP 1 — VALIDATE LOGIN
            // ==========================================

            const csvResponse =
                await fetch("users.csv");


            if (!csvResponse.ok) {

                throw new Error(
                    "Unable to load users.csv"
                );
            }


            const csvText =
                await csvResponse.text();


            const users =
                parseCSV(csvText);


            const user =
                users.find(
                    person =>
                        person.personnel_id ===
                            personnelId &&
                        person.password ===
                            password
                );


            if (!user) {

                errorMessage.textContent =
                    "Invalid Personnel ID or password.";

                errorMessage.classList.add(
                    "show"
                );

                return;
            }


            // ==========================================
            // STEP 2 — GET AI PREDICTION
            // ==========================================

            const aiResponse =
                await fetch(
                    "https://sih-aegis.onrender.com/predict-by-personnel-id",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            personnel_id:
                                personnelId
                        })
                    }
                );


            if (!aiResponse.ok) {

                throw new Error(
                    "AI prediction request failed."
                );
            }


            const aiData =
                await aiResponse.json();


            console.log(
                "AI Prediction:",
                aiData
            );


            // ==========================================
            // STEP 3 — STORE USER INFORMATION
            // ==========================================

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


            // ==========================================
            // STORE AI PREDICTION
            // ==========================================

            localStorage.setItem(
                "aegisAIRisk",
                aiData.risk_score
            );

            localStorage.setItem(
                "aegisAIRiskLevel",
                aiData.risk_level
            );

            localStorage.setItem(
                "aegisAITrend",
                aiData.trend
            );

            localStorage.setItem(
                "aegisAIFactors",
                JSON.stringify(
                    aiData.contributing_factors
                )
            );

            localStorage.setItem(
                "aegisAIRecommendation",
                aiData.recommendation
            );


            console.log(
                "Login successful:",
                user
            );

            console.log(
                "AI Risk:",
                aiData.risk_score
            );


            // ==========================================
            // STEP 4 — OPEN ASSESSMENT
            // ==========================================

            window.location.href =
                "assesment.html";

        }

        catch (error) {

            console.error(
                "Login error:",
                error
            );


            errorMessage.textContent =
                "This prototype is dead circa 4/9/26, what brings you here? Go ahead.. look around and leave";


            errorMessage.classList.add(
                "show"
            );
        }

    }
);
