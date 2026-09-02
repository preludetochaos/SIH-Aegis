function getAnswers() {

    const answers = {
        workload: Number(document.getElementById("workload").value),
        exhaustion: Number(document.getElementById("exhaustion").value),
        physical_tension: Number(document.getElementById("physical_tension").value),
        decision_difficulty: Number(document.getElementById("decision_difficulty").value),
        forgetfulness: Number(document.getElementById("forgetfulness").value),
        irritability: Number(document.getElementById("irritability").value),
        restlessness: Number(document.getElementById("restlessness").value),
        sleep_quality: Number(document.getElementById("sleep_quality").value)
    };

    return answers;
}


// Calculate risk score
function calculateRisk(answers) {

    // Sleep quality:
    // 1 = Very Poor → 5 = Very Good
    // Therefore, reverse it so higher = greater risk
    const sleepRisk = 6 - answers.sleep_quality;

    const total =
        answers.workload +
        answers.exhaustion +
        answers.physical_tension +
        answers.decision_difficulty +
        answers.forgetfulness +
        answers.irritability +
        answers.restlessness +
        sleepRisk;

    // Convert 1–5 scores into a 0–100 risk score
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
        score: Math.round(score),
        level: level
    };
}


// Run the assessment
function assessRisk() {

    const answers = getAnswers();

    const result = calculateRisk(answers);

    console.log("Answers:", answers);
    console.log("Risk Score:", result.score);
    console.log("Risk Level:", result.level);

    // Display result on webpage
    document.getElementById("result").innerHTML =
        "Risk Score: " + result.score +
        "<br>Risk Level: " + result.level;
}
