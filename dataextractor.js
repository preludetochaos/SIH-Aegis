// ==========================================
// AEGIS - Personnel Stress Assessment
// ==========================================

// Get the selected answers from the radio buttons
function getAnswers() {

    const answers = {
        workload: Number(document.querySelector('input[name="workload"]:checked').value),
        exhaustion: Number(document.querySelector('input[name="exhaustion"]:checked').value),
        physical_tension: Number(document.querySelector('input[name="physical_tension"]:checked').value),
        decision_difficulty: Number(document.querySelector('input[name="decision_difficulty"]:checked').value),
        forgetfulness: Number(document.querySelector('input[name="forgetfulness"]:checked').value),
        irritability: Number(document.querySelector('input[name="irritability"]:checked').value),
        restlessness: Number(document.querySelector('input[name="restlessness"]:checked').value),
        sleep_quality: Number(document.querySelector('input[name="sleep_quality"]:checked').value)
    };

    return answers;
}


// Calculate the stress score
function calculateRisk(answers) {

    // In the HTML:
    // 1 = Very Good sleep
    // 5 = Very Poor sleep
    // Therefore, higher value = higher risk
    const sleepRisk = answers.sleep_quality;

    const total =
        answers.workload +
        answers.exhaustion +
        answers.physical_tension +
        answers.decision_difficulty +
        answers.forgetfulness +
        answers.irritability +
        answers.restlessness +
        sleepRisk;

    // Minimum total = 8
    // Maximum total = 40
    // Convert to 0–100%
    const score = ((total - 8) / 32) * 100;

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
        score: Math.round(score),
        level: level
    };
}


// Update the existing score section
function assessRisk() {

    const answers = getAnswers();
    const result = calculateRisk(answers);

    console.log("Answers:", answers);
    console.log("Raw Score:", result.total + " / 40");
    console.log("Risk Percentage:", result.score + "%");
    console.log("Risk Level:", result.level);

    // Update existing percentage
    document.getElementById("stressScorePercent").textContent =
        result.score + "%";

    // Update existing raw score
    document.getElementById("rawScore").textContent =
        result.total;

    // Update the formatted output area
    const formattedOutput =
        "1. How would you rate your current workload?\nAnswer: " + answers.workload +
        "\n\n" +

        "2. How often have you felt exhausted recently?\nAnswer: " + answers.exhaustion +
        "\n\n" +

        "3. How often have you experienced physical tension, such as headaches or tight shoulders?\nAnswer: " + answers.physical_tension +
        "\n\n" +

        "4. How often have you found it difficult to make decisions recently?\nAnswer: " + answers.decision_difficulty +
        "\n\n" +

        "5. How often have you experienced difficulty remembering things?\nAnswer: " + answers.forgetfulness +
        "\n\n" +

        "6. How often have you felt irritable, anxious, or angry over minor inconveniences?\nAnswer: " + answers.irritability +
        "\n\n" +

        "7. How often have you felt constantly on edge or unable to relax?\nAnswer: " + answers.restlessness +
        "\n\n" +

        "8. How would you rate your sleep quality recently?\nAnswer: " + answers.sleep_quality;

    document.getElementById("formattedSummaryOutput").textContent =
        formattedOutput;
}
