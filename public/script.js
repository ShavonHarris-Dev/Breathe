// Make sure the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  
    // ParticleBreathing class definition
    class ParticleBreathing {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.scene = new THREE.Scene();
            
            // Set up camera
            this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
            this.camera.position.z = 30;
  
            // Set up renderer
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.container.appendChild(this.renderer.domElement);
  
            // Create particles
            const geometry = new THREE.BufferGeometry();
            const particles = 1500;
            const positions = new Float32Array(particles * 3);
            const colors = new Float32Array(particles * 3);
  
            for (let i = 0; i < particles * 3; i += 3) {
                // Create sphere
                const radius = 10;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                positions[i]     = radius * Math.sin(phi) * Math.cos(theta);
                positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i + 2] = radius * Math.cos(phi);
  
                // Add colors (soft blue)
                colors[i] = 0.5;
                colors[i + 1] = 0.8;
                colors[i + 2] = 1;
            }
  
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
            const material = new THREE.PointsMaterial({
                size: 0.2,
                vertexColors: true,
                transparent: true,
                opacity: 0.8
            });
  
            this.particles = new THREE.Points(geometry, material);
            this.scene.add(this.particles);
  
            // Animation properties
            this.breathePhase = 0;
            this.isBreathing = false;
            
            // Start animation
            this.animate();
        }
  
        startBreathing() {
            this.isBreathing = true;
        }
  
        stopBreathing() {
            this.isBreathing = false;
        }
  
        animate = () => {
            requestAnimationFrame(this.animate);
  
            if (this.isBreathing) {
                this.breathePhase += 0.02;
                const scale = 1 + Math.sin(this.breathePhase) * 0.3;
                this.particles.scale.set(scale, scale, scale);
            }
  
            this.particles.rotation.x += 0.001;
            this.particles.rotation.y += 0.002;
  
            this.renderer.render(this.scene, this.camera);
        }
  
        resize() {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        }
    }
  
    // Initialize the ParticleBreathing visualization
    const breathingViz = new ParticleBreathing('breathing-container');
  
    // Connect to breathing exercise button for toggling breathing
    document.getElementById('startBreathingExerciseButton').addEventListener('click', () => {
        if (!breathingViz.isBreathing) {
            breathingViz.startBreathing();
        } else {
            breathingViz.stopBreathing();
        }
    });
  
    // Handle window resize to update the visualization
    window.addEventListener('resize', () => breathingViz.resize());
  });




// Update anxiety level display when slider moves
const anxietySlider = document.getElementById("anxietyLevel");
const anxietyLevelValue = document.getElementById("anxiety-level-value");

anxietySlider.oninput = function () {
    anxietyLevelValue.textContent = this.value;
}

// Fetch affirmation from the backend
async function fetchAffirmation() {
    const anxietyLevel = document.getElementById("anxietyLevel").value;
    const outputDiv = document.getElementById("affirmation-output");

    outputDiv.innerText = "Generating affirmation..."

    try {
        const response = await fetch('/generate-affirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ anxietyLevel: parseInt(anxietyLevel)})
        });

        const data = await response.json();
        if (response.ok) {
            outputDiv.innerText = data.affirmation;
        } else {
            outputDiv.innerText = "Error: " + (data.error || 'Failed to generate affirmation');
        }
    } catch (error) {
        outputDiv.innerText = "Error: Could not connect to the server";
        console.log("Error: error")
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

// Function to play voice instruction
async function playVoiceInstruction(instruction) {
    const audio = new Audio(`/breathing-voice?instruction=${instruction}`);
    audio.play();
}

// Breathing exercise with voice guidance
async function startBreathingExercise() {
    document.getElementById("breathing-instructions").innerText = "Inhale...";
    await playVoiceInstruction("Inhale");
    
    await new Promise(resolve => setTimeout(resolve, inhaleDuration));
    document.getElementById("breathing-instructions").innerText = "Hold...";
    await playVoiceInstruction("Hold");

    await new Promise(resolve => setTimeout(resolve, holdDuration));
    document.getElementById("breathing-instructions").innerText = "Exhale...";
    await playVoiceInstruction("Exhale");

    await new Promise(resolve => setTimeout(resolve, exhaleDuration));
    document.getElementById("breathing-instructions").innerText = "Breathing exercise complete.";
}


// Attach event listener to start the breathing exercise
document.getElementById('startBreathingExerciseButton').addEventListener('click', startBreathingExercise);





