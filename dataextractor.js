// ==========================================
// AEGIS - Personnel Stress & Welfare Assessment
// ==========================================

const questions = [
    ["How would you rate your current workload?", "workload"],
    ["How often have you felt exhausted recently?", "exhaustion"],
    ["How often have you experienced physical tension, such as headaches or tight shoulders?", "physical_tension"],
    ["How often have you found it difficult to make decisions recently?", "decision_difficulty"],
    ["How often have you experienced difficulty remembering things?", "forgetfulness"],
    ["How often have you felt irritable, anxious, or angry over minor inconveniences?", "irritability"],
    ["How often have you felt constantly on edge or unable to relax?", "restlessness"],
    ["How would you rate your sleep quality recently?", "sleep_quality"]
];


// ==========================================
// GET QUESTIONNAIRE ANSWERS
// ==========================================

function getAnswers() {

    const answers = {};

    questions.forEach(([question, variable]) => {

        const selected = document.querySelector(
            `input[name="${variable}"]:checked`
        );

        if (!selected) {
            throw new Error(
                `No answer selected for: ${variable}`
            );
        }

        answers[variable] = Number(selected.value);
    });

    return answers;
}


// ==========================================
// CALCULATE SELF-ASSESSMENT RISK
// ==========================================

function calculateRisk(answers) {

    const total =
        answers.workload +
        answers.exhaustion +
        answers.physical_tension +
        answers.decision_difficulty +
        answers.forgetfulness +
        answers.irritability +
        answers.restlessness +
        answers.sleep_quality;


    // 8 questions × maximum 5 = 40

    const score = Math.round(
        (total / 40) * 100
    );


    let level;

    if (score < 40) {
        level = "LOW";
    }
    else if (score < 70) {
        level = "MODERATE";
    }
    else {
        level = "HIGH";
    }


    return {
        total,
        score,
        level
    };
}


// ==========================================
// FINAL COMBINED RISK
// ==========================================

function calculateFinalRisk(aiRisk, assessmentRisk) {

    // Prototype weighting:
    // AI prediction = 60%
    // Self-assessment = 40%

    const finalRisk = Math.round(
        (aiRisk * 0.60) +
        (assessmentRisk * 0.40)
    );


    let level;

    if (finalRisk < 40) {
        level = "LOW";
    }
    else if (finalRisk < 70) {
        level = "MODERATE";
    }
    else {
        level = "HIGH";
    }


    return {
        score: finalRisk,
        level: level
    };
}


// ==========================================
// DISPLAY AI INFORMATION
// ==========================================

function displayAIInformation() {

    const aiRisk =
        localStorage.getItem("aegisAIRisk");

    const aiLevel =
        localStorage.getItem("aegisAIRiskLevel");

    const aiTrend =
        localStorage.getItem("aegisAITrend");

    const aiFactors =
        JSON.parse(
            localStorage.getItem("aegisAIFactors") || "[]"
        );

    const aiRecommendation =
        localStorage.getItem("aegisAIRecommendation");


    const aiRiskElement =
        document.getElementById("aiRisk");

    const aiLevelElement =
        document.getElementById("aiRiskLevel");

    const aiTrendElement =
        document.getElementById("aiTrend");

    const aiFactorsElement =
        document.getElementById("aiFactors");

    const aiRecommendationElement =
        document.getElementById("aiRecommendation");


    if (aiRiskElement && aiRisk !== null) {
        aiRiskElement.textContent =
            aiRisk + "%";
    }


    if (aiLevelElement && aiLevel !== null) {
        aiLevelElement.textContent =
            aiLevel;
    }


    if (aiTrendElement && aiTrend !== null) {
        aiTrendElement.textContent =
            aiTrend.replaceAll("_", " ");
    }


    if (aiFactorsElement) {

        aiFactorsElement.innerHTML = "";

        aiFactors.forEach(factor => {

            const li = document.createElement("li");

            li.textContent = factor;

            aiFactorsElement.appendChild(li);
        });
    }


    if (
        aiRecommendationElement &&
        aiRecommendation
    ) {
        aiRecommendationElement.textContent =
            aiRecommendation;
    }
}


// ==========================================
// ASSESS RISK
// ==========================================

function assessRisk() {

    try {

        // Get questionnaire answers
        const answers = getAnswers();


        // Calculate self-assessment risk
        const result =
            calculateRisk(answers);


        // Get AI risk from login
        const aiRiskValue =
            localStorage.getItem("aegisAIRisk");


        if (aiRiskValue === null) {

            alert(
                "AI risk prediction is unavailable. Please log in again."
            );

            return;
        }


        const aiRisk =
            Number(aiRiskValue);


        // Combine AI + self assessment
        const finalResult =
            calculateFinalRisk(
                aiRisk,
                result.score
            );


        // ==========================================
        // UPDATE SCORE DISPLAY
        // ==========================================

        const percent =
            document.getElementById(
                "stressScorePercent"
            );

        const rawScore =
            document.getElementById(
                "rawScore"
            );


        if (percent) {

            percent.textContent =
                finalResult.score + "%";
        }


        if (rawScore) {

            rawScore.textContent =
                result.total + " / 40";
        }


        // ==========================================
        // OPTIONAL FINAL RISK ELEMENTS
        // ==========================================

        const finalRiskElement =
            document.getElementById(
                "finalRisk"
            );

        const finalLevelElement =
            document.getElementById(
                "finalRiskLevel"
            );

        const selfAssessmentElement =
            document.getElementById(
                "selfAssessmentRisk"
            );


        if (finalRiskElement) {

            finalRiskElement.textContent =
                finalResult.score + "%";
        }


        if (finalLevelElement) {

            finalLevelElement.textContent =
                finalResult.level;
        }


        if (selfAssessmentElement) {

            selfAssessmentElement.textContent =
                result.score + "%";
        }


        // ==========================================
        // SAVE FINAL RESULT
        // ==========================================

        localStorage.setItem(
            "aegisSelfAssessmentRisk",
            result.score
        );

        localStorage.setItem(
            "aegisFinalRisk",
            finalResult.score
        );

        localStorage.setItem(
            "aegisFinalRiskLevel",
            finalResult.level
        );
        // ==========================================
// SHOW RESULTS
// ==========================================

// Fill AI panel with backend data
displayAIInformation();

// Show AI panel
const aiPanel = document.querySelector(".ai-risk-panel");

if (aiPanel) {
    aiPanel.classList.add("show");
}

// Show final result panel
const finalPanel = document.querySelector(".final-risk-panel");

if (finalPanel) {
    finalPanel.classList.add("show");
}

        // ==========================================
        // DEBUG / CONSOLE
        // ==========================================

        console.log(
            "AI Risk:",
            aiRisk + "%"
        );

        console.log(
            "Self Assessment:",
            result.score + "%"
        );

        console.log(
            "Final Risk:",
            finalResult.score + "%"
        );

        console.log(
            "Final Level:",
            finalResult.level
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Please select an answer for every question before assessing."
        );
    }
}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem(
        "aegisLoggedIn"
    );

    localStorage.removeItem(
        "aegisPersonnelId"
    );

    localStorage.removeItem(
        "aegisUserName"
    );

    localStorage.removeItem(
        "aegisRole"
    );

    localStorage.removeItem(
        "aegisAIRisk"
    );

    localStorage.removeItem(
        "aegisAIRiskLevel"
    );

    localStorage.removeItem(
        "aegisAITrend"
    );

    localStorage.removeItem(
        "aegisAIFactors"
    );

    localStorage.removeItem(
        "aegisAIRecommendation"
    );

    localStorage.removeItem(
        "aegisSelfAssessmentRisk"
    );

    localStorage.removeItem(
        "aegisFinalRisk"
    );

    localStorage.removeItem(
        "aegisFinalRiskLevel"
    );


    window.location.href =
        "index.html";
}


// ==========================================
// PAGE INITIALIZATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Remove developer-facing elements
        document
            .querySelectorAll(".variable-badge")
            .forEach(element => {
                element.remove();
            });


        document
            .querySelectorAll(".qa-format-display")
            .forEach(element => {
                element.remove();
            });


        // Display AI information
        


        // Logout button
        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );

        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                logout
            );
        }


        // Copy button, if it still exists
        const copyButton =
            document.getElementById(
                "copySummaryBtn"
            );

        if (copyButton) {

            copyButton.addEventListener(
                "click",
                async () => {

                    const summary =
                        document.getElementById(
                            "formattedSummaryOutput"
                        );

                    if (
                        !summary ||
                        !summary.textContent.trim()
                    ) {

                        alert(
                            "Please run the assessment first."
                        );

                        return;
                    }


                    try {

                        await navigator.clipboard.writeText(
                            summary.textContent
                        );


                        const toast =
                            document.getElementById(
                                "toast"
                            );

                        const toastMsg =
                            document.getElementById(
                                "toastMsg"
                            );


                        if (toastMsg) {

                            toastMsg.textContent =
                                "Assessment summary copied to clipboard!";
                        }


                        if (toast) {

                            toast.classList.add(
                                "show"
                            );

                            setTimeout(
                                () => {
                                    toast.classList.remove(
                                        "show"
                                    );
                                },
                                2500
                            );
                        }

                    }

                    catch (error) {

                        console.error(
                            "Clipboard error:",
                            error
                        );

                        alert(
                            "Unable to copy the summary."
                        );
                    }
                }
            );
        }
    }
);
