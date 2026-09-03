// ==========================================
// AEGIS - Personnel Stress & Welfare Assessment
// ==========================================
// Protect assessment page
if (localStorage.getItem("aegisLoggedIn") !== "true") {
    window.location.href = "login.html";
}
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


// Get selected answers
function getAnswers() {

    const answers = {};

    questions.forEach(([question, variable]) => {

        const selected = document.querySelector(
            `input[name="${variable}"]:checked`
        );

        if (!selected) {
            throw new Error(`No answer selected for: ${variable}`);
        }

        answers[variable] = Number(selected.value);
    });

    return answers;
}


// Calculate risk score
function calculateRisk(answers) {

    // Sleep:
    // 1 = Very Good
    // 5 = Very Poor
    // Therefore higher value = higher risk

    const total =
        answers.workload +
        answers.exhaustion +
        answers.physical_tension +
        answers.decision_difficulty +
        answers.forgetfulness +
        answers.irritability +
        answers.restlessness +
        answers.sleep_quality;

    // 8 questions × maximum score 5 = 40
    // Example:
    // All 1s = 8/40 = 20%
    // All 3s = 24/40 = 60%
    // All 4s = 32/40 = 80%
    // All 5s = 40/40 = 100%

    const score = Math.round((total / 40) * 100);

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
        total: total,
        score: score,
        level: level
    };
}


// Generate assessment summary
function generateSummary(answers) {

    return questions.map(([question, variable], index) => {

        return `${index + 1}. ${question}\nAnswer: ${answers[variable]}`;

    }).join("\n\n");
}


// Run assessment
function assessRisk() {

    try {

        const answers = getAnswers();
        const result = calculateRisk(answers);

        // Update existing percentage
        const percent = document.getElementById("stressScorePercent");

        if (percent) {
            percent.textContent = result.score + "%";
        }

        // Update existing raw score
        const rawScore = document.getElementById("rawScore");

        if (rawScore) {
            rawScore.textContent = result.total;
        }

        // Update existing summary

        console.log("Assessment:", answers);
        console.log("Score:", result.total + "/40");
        console.log("Risk:", result.score + "%");
        console.log("Level:", result.level);

    }

    catch (error) {

        console.error(error);

        alert(
            "Please select an answer for every question before assessing."
        );
    }
}


// Remove unnecessary developer/debug elements
document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".variable-badge").forEach(element => {
        element.remove();
    });

    document.querySelectorAll(".qa-format-display").forEach(element => {
        element.remove();
    });

});


// Copy assessment summary
document.addEventListener("DOMContentLoaded", () => {

    const copyButton = document.getElementById("copySummaryBtn");

    if (!copyButton) {
        return;
    }

    copyButton.addEventListener("click", async () => {

        const summary = document.getElementById(
            "formattedSummaryOutput"
        );

        if (!summary || !summary.textContent.trim()) {

            alert("Please run the assessment first.");

            return;
        }

        try {

            await navigator.clipboard.writeText(
                summary.textContent
            );

            const toast = document.getElementById("toast");
            const toastMsg = document.getElementById("toastMsg");

            if (toastMsg) {
                toastMsg.textContent =
                    "Assessment summary copied to clipboard!";
            }

            if (toast) {

                toast.classList.add("show");

                setTimeout(() => {
                    toast.classList.remove("show");
                }, 2500);

            }

        }

        catch (error) {

            console.error("Clipboard error:", error);

            alert("Unable to copy the summary.");
        }

    });

});
