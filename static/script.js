// Update anxiety level display when slider moves
const anxietySlider = document.getElementById("anxietyLevel");
const anxietyLevelValue = document.getElementById("anxiety-level-value");

anxietySlider.oninput = function () {
    anxietyLevelValue.textContent = this.value;
}

// Fetch affirmation from the backend
async function fetchAffirmation() {
    const anxietyLevel = document.getElementById("anxietyLevel").value;

    try {
        const response = await fetch('/generate-affirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ anxietyLevel: anxietyLevel })
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById("affirmation-output").innerText = data.affirmation;
        } else {
            document.getElementById("affirmation-output").innerText = "Error: " + data.error;
        }
    } catch (error) {
        document.getElementById("affirmation-output").innerText = "Error: " + error.message;
    }
}

// Attach event listener to the button
document.getElementById('getAffirmationButton').addEventListener('click', fetchAffirmation);

// Initialize the Chart.js chart
let anxietyChart;

async function fetchAnxietyData() {
    try {
        const response = await fetch('/get-anxiety-data');
        const data = await response.json();

        // Extract anxiety levels and timestamps
        const anxietyLevels = data.map(log => log.anxiety_level);
        const timestamps = data.map(log => new Date(log.timestamp).toLocaleString());

        // Update the chart with the new data
        updateChart(anxietyLevels, timestamps);
    } catch (error) {
        console.error("Error fetching anxiety data:", error);
    }
}

// Update or initialize the anxiety chart
function updateChart(anxietyLevels, timestamps) {
    const ctx = document.getElementById('anxietyChart').getContext('2d');
    
    if (anxietyChart) {
        // Update the existing chart
        anxietyChart.data.labels = timestamps;
        anxietyChart.data.datasets[0].data = anxietyLevels;
        anxietyChart.update();
    } else {
        // Create a new chart
        anxietyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timestamps,
                datasets: [{
                    label: 'Anxiety Level Over Time',
                    data: anxietyLevels,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Fetch anxiety data when the page loads
window.onload = function() {
    fetchAnxietyData();
};

// Breathing exercise durations (in milliseconds)
const inhaleDuration = 4000;
const holdDuration = 4000;
const exhaleDuration = 4000;

async function startBreathingExercise() {
    document.getElementById("breathing-instructions").innerText = "Inhale...";

    await new Promise(resolve => setTimeout(resolve, inhaleDuration));
    document.getElementById("breathing-instructions").innerText = "Hold...";

    await new Promise(resolve => setTimeout(resolve, holdDuration));
    document.getElementById("breathing-instructions").innerText = "Exhale...";

    await new Promise(resolve => setTimeout(resolve, exhaleDuration));
    document.getElementById("breathing-instructions").innerText = "Breathing exercise complete.";
}

// Attach event listener to start the breathing exercise
document.getElementById('startBreathingExerciseButton').addEventListener('click', startBreathingExercise);


