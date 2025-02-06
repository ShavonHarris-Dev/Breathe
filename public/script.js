// Make sure the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {

    const calmingMusic = new Audio('public/calming-music.mp3');
    calmingMusic.loop = true;
    calmingMusic.volume = 0.5; // Adjust volume as needed
    
    window.addEventListener('scroll', function startMusicOnScroll() {
        calmingMusic.play()
            .then(() => {
                console.log("Music started on scroll");
                window.removeEventListener('scroll', startMusicOnScroll);
            })
            .catch(error => console.error('Error starting music on scroll:', error));
    });

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
                positions[i] = radius * Math.sin(phi) * Math.cos(theta);
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

            // Handle window resize
            window.addEventListener('resize', () => this.resize());
        }
  
        startBreathing() {
            this.isBreathing = true;
            this.breathePhase = 0; // Reset phase when starting
        }
  
        stopBreathing() {
            this.isBreathing = false;
        }
  
        animate = () => {
            requestAnimationFrame(this.animate);
  
            if (this.isBreathing) {
                this.breathePhase += 0.01;
                const scale = 1 + Math.sin(this.breathePhase) * 0.3;
                this.particles.scale.set(scale, scale, scale);
            }
  
            this.particles.rotation.x += 0.001;
            this.particles.rotation.y += 0.002;
  
            this.renderer.render(this.scene, this.camera);
        }
  
        resize() {
            if (this.container) {
                const width = this.container.clientWidth;
                const height = this.container.clientHeight;
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(width, height);
            }
        }
    }

    // Initialize both particle visualizations
    let heroViz = null;
    let breathingViz = null;

    const heroContainer = document.getElementById('hero-particles');
    const breathingContainer = document.getElementById('breathing-container');

    if (heroContainer) {
        heroViz = new ParticleBreathing('hero-particles');
        heroViz.startBreathing(); // Auto-start the hero visualization
    }

    if (breathingContainer) {
        breathingViz = new ParticleBreathing('breathing-container');
        breathingContainer.particleBreathing = breathingViz;
    }

    // Breathing exercise durations (in milliseconds)
    const inhaleDuration = 3000;
    const holdDuration = 3000;
    const exhaleDuration = 3000;

    let exerciseActive = false;

    // Breathing Exercise Functions
    async function startBreathingExercise() {
        exerciseActive = true;
        const instructions = document.getElementById("breathing-instructions");
        
        // Start the visualization
        if (breathingViz) {
            breathingViz.startBreathing();
        }
        
        while (exerciseActive) {
            // Inhale phase
            instructions.textContent = "Inhale...";
            instructions.className = "breathing-text inhale-state";
            await new Promise(resolve => setTimeout(resolve, inhaleDuration));
            
            if (!exerciseActive) break;
            
            // Hold phase
            instructions.textContent = "Hold...";
            instructions.className = "breathing-text hold-state";
            await new Promise(resolve => setTimeout(resolve, holdDuration));
            
            if (!exerciseActive) break;
            
            // Exhale phase
            instructions.textContent = "Exhale...";
            instructions.className = "breathing-text exhale-state";
            await new Promise(resolve => setTimeout(resolve, exhaleDuration));
        }
        
        // Reset when exercise ends
        instructions.textContent = "Breathing exercise ended.";
        instructions.className = "breathing-text";
        
        if (breathingViz) {
            breathingViz.stopBreathing();
        }
    }

    function endBreathingExercise() {
        exerciseActive = false;
        if (breathingViz) {
            breathingViz.stopBreathing();
        }
    }



    

    // AI and Anxiety Tracking Functions
    async function fetchAffirmation() {
        const anxietyLevel = document.getElementById("anxietyLevel").value;
        const outputDiv = document.getElementById("affirmation-output");

        // Update UI to show loading state
        outputDiv.innerHTML = `
            <div class="affirmation-status">
                <div class="pulse-dot"></div>
                Generating your affirmation...
            </div>
        `;

        try {
            const response = await fetch('/generate-affirmation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ anxietyLevel: parseInt(anxietyLevel) })
            });

            const data = await response.json();
            if (response.ok) {
                outputDiv.innerHTML = `
                    <div class="affirmation-status">
                        <div class="pulse-dot"></div>
                        AI-generated affirmation
                    </div>
                    <p class="affirmation-text">${data.affirmation}</p>
                    <small class="affirmation-note">Based on anxiety level: ${anxietyLevel}</small>
                `;
            } else {
                outputDiv.innerHTML = `
                    <div class="affirmation-status error">
                        Error: ${data.error || 'Failed to generate affirmation'}
                    </div>
                `;
            }
        } catch (error) {
            outputDiv.innerHTML = `
                <div class="affirmation-status error">
                    Error: Could not connect to the server
                </div>
            `;
            console.error("Error:", error);
        }
    }

    // Anxiety Chart Functions
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
    let anxietyChart;
    function updateChart(anxietyLevels, timestamps) {
        const ctx = document.getElementById('anxietyChart')?.getContext('2d');
        if (!ctx) return;
        
        if (anxietyChart) {
            anxietyChart.data.labels = timestamps;
            anxietyChart.data.datasets[0].data = anxietyLevels;
            anxietyChart.update();
        } else {
            anxietyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: timestamps,
                    datasets: [{
                        label: 'Anxiety Level Over Time',
                        data: anxietyLevels,
                        borderColor: 'rgba(137, 182, 165, 1)',
                        borderWidth: 2,
                        fill: true,
                        backgroundColor: 'rgba(137, 182, 165, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }

    // Event Listeners
    const startBreathingButton = document.getElementById('startBreathingExerciseButton');
    const endBreathingButton = document.getElementById('endBreathingExerciseButton');
    const getAffirmationButton = document.getElementById('getAffirmationButton');
    const anxietySlider = document.getElementById("anxietyLevel");
    const anxietyLevelValue = document.getElementById("anxiety-level-value");

    if (startBreathingButton) {
        startBreathingButton.addEventListener('click', startBreathingExercise);
    }

    if (endBreathingButton) {
        endBreathingButton.addEventListener('click', endBreathingExercise);
    }

    if (getAffirmationButton) {
        getAffirmationButton.addEventListener('click', fetchAffirmation);
    }

    if (anxietySlider && anxietyLevelValue) {
        anxietySlider.oninput = function() {
            anxietyLevelValue.textContent = this.value;
        }
    }
// Function to log anxiety and print a console message with today's timestamp
async function logAnxiety() {
    const anxietySlider = document.getElementById('anxietyLevel');
    const level = anxietySlider.value;
    try {
        const response = await fetch('/log-anxiety', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ anxietyLevel: level })
        });
        const data = await response.json();
        if (response.ok) {
            console.log(`Logged anxiety level ${level} at ${new Date().toLocaleString()}`);
        } else {
            console.error('Error logging anxiety:', data.error);
        }
    } catch (error) {
        console.error('Error logging anxiety:', error);
    }
}

// Function to fetch and update anxiety data in the chart
async function fetchAnxietyData() {
    try {
        const response = await fetch('/get-anxiety-data');
        const data = await response.json();
        if (response.ok) {
            // Assumed updateChart() function exists that updates your Chart.js chart
            const anxietyLevels = data.map(log => log.anxiety_level);
            const timestamps = data.map(log => new Date(log.timestamp).toLocaleString());
            updateChart(anxietyLevels, timestamps);
        } else {
            console.error("Error fetching anxiety data:", data.error);
        }
    } catch (error) {
        console.error("Error fetching anxiety data:", error);
    }
}

// Attach event listener for anxiety slider change
if (anxietySlider && anxietyLevelValue) {
    anxietySlider.addEventListener('change', () => {
        anxietyLevelValue.textContent = anxietySlider.value;
        logAnxiety();         // Log new anxiety level
        fetchAnxietyData();   // Refresh chart with updated data
    });
}


    // Initialize anxiety data
    fetchAnxietyData();
});





