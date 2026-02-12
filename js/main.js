// VECTRA - Main JavaScript

// Chapter Search Functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('chapterSearch');
    const chapterCards = document.querySelectorAll('.chapter-card');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            chapterCards.forEach(card => {
                const keywords = card.getAttribute('data-keywords') || '';
                const title = card.querySelector('.chapter-subtitle')?.textContent.toLowerCase() || '';
                const description = card.querySelector('.chapter-description')?.textContent.toLowerCase() || '';
                
                const searchableText = `${keywords} ${title} ${description}`;
                
                if (searchTerm === '' || searchableText.includes(searchTerm)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    }
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all animatable elements
    document.querySelectorAll('.fade-in-on-scroll').forEach(el => {
        observer.observe(el);
    });
    
    // Stagger animation for chapter cards
    const cards = document.querySelectorAll('.chapter-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Chapter Page Input UX
    const problemInput = document.getElementById('problemInput');
    const visualizeBtn = document.getElementById('visualizeBtn');
    const charCount = document.getElementById('charCount');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    
    if (problemInput && visualizeBtn) {
        // Character count and button enable/disable
        problemInput.addEventListener('input', () => {
            const length = problemInput.value.length;
            if (charCount) {
                charCount.textContent = length;
            }
            
            // Enable/disable button based on input
            if (problemInput.value.trim().length > 0) {
                visualizeBtn.disabled = false;
            } else {
                visualizeBtn.disabled = true;
            }
        });
        
        // Loading state on button click
        visualizeBtn.addEventListener('click', () => {
            if (!visualizeBtn.disabled) {
                visualizeBtn.classList.add('loading');
                if (btnText) btnText.style.display = 'none';
                if (btnLoader) btnLoader.style.display = 'inline-block';
                
                // Parse the problem
                const problemText = problemInput.value;
                console.log('Parsing:', problemText);
                console.log('parsePhysicsProblem exists?', typeof parsePhysicsProblem);
                
                const parsedData = parsePhysicsProblem(problemText);
                console.log('Parsed data:', parsedData);
                
                const errorMessage = document.getElementById('errorMessage');
                
                if (!parsedData || parsedData.error) {
                    // Show error
                    if (errorMessage) {
                        errorMessage.textContent = parsedData?.message || 'Unable to parse problem. Please check your input.';
                    }
                    
                    // Reset button
                    visualizeBtn.classList.remove('loading');
                    if (btnText) btnText.style.display = 'inline';
                    if (btnLoader) btnLoader.style.display = 'none';
                    return;
                }
                
                // Clear error
                if (errorMessage) {
                    errorMessage.textContent = '';
                }
                
                // Calculate physics
                const calculatedData = parsedData;
                
                // Store for parameter updates
                currentCalculationData = calculatedData;
                
                // Display results
                displayGivenParameters(calculatedData.given);
                displayDeducedParameters(calculatedData.deduced);
                displayRequiredResults(calculatedData.deduced, calculatedData.required);
                
                // Start simulation
                startSimulation(calculatedData);
                
                // Reset button after processing
                setTimeout(() => {
                    visualizeBtn.classList.remove('loading');
                    if (btnText) btnText.style.display = 'inline';
                    if (btnLoader) btnLoader.style.display = 'none';
                }, 500);
            }
        });
    }
});

// Display functions
function displayGivenParameters(given) {
    const container = document.getElementById('givenParams');
    if (!container) return;
    
    let html = '<div class="param-list">';
    
    if (given.mass !== undefined) {
        html += `
            <div class="param-item editable">
                <span class="param-label">Mass:</span>
                <input type="number" class="param-input" data-param="mass" value="${given.mass}" min="0" step="0.1">
                <span class="param-unit">kg</span>
            </div>`;
    }
    if (given.force !== undefined) {
        html += `
            <div class="param-item editable">
                <span class="param-label">Force:</span>
                <input type="number" class="param-input" data-param="force" value="${given.force}" min="0" step="1">
                <span class="param-unit">N</span>
            </div>`;
    }
    if (given.distance !== undefined) {
        html += `
            <div class="param-item editable">
                <span class="param-label">Distance:</span>
                <input type="number" class="param-input" data-param="distance" value="${given.distance}" min="0" step="0.1">
                <span class="param-unit">m</span>
            </div>`;
    }
    if (given.velocity !== undefined) {
        html += `
            <div class="param-item editable">
                <span class="param-label">Initial Velocity:</span>
                <input type="number" class="param-input" data-param="velocity" value="${given.velocity}" min="0" step="0.1">
                <span class="param-unit">m/s</span>
            </div>`;
    }
    if (given.angle !== undefined) {
        html += `
            <div class="param-item editable">
                <span class="param-label">Angle:</span>
                <input type="number" class="param-input" data-param="angle" value="${given.angle}" min="0" max="90" step="1">
                <span class="param-unit">°</span>
            </div>`;
    }
    if (given.height !== undefined) {
        html += `
            <div class="param-item editable">
                <span class="param-label">Height:</span>
                <input type="number" class="param-input" data-param="height" value="${given.height}" min="0" step="0.1">
                <span class="param-unit">m</span>
            </div>`;
    }
    if (given.time !== undefined) {
        html += `
            <div class="param-item editable">
                <span class="param-label">Time:</span>
                <input type="number" class="param-input" data-param="time" value="${given.time}" min="0" step="0.1">
                <span class="param-unit">s</span>
            </div>`;
    }
    if (given.friction !== undefined) {
        html += `
            <div class="param-item editable">
                <span class="param-label">Friction (μ):</span>
                <input type="number" class="param-input" data-param="friction" value="${given.friction}" min="0" max="1" step="0.01">
                <span class="param-unit"></span>
            </div>`;
    }
    if (given.radius !== undefined) {
    if (given.length !== undefined) {
        html += `
            <div class="param-item editable">
                <span class="param-label">Length:</span>
                <input type="number" class="param-input" data-param="length" value="${given.length}" min="0.1" step="0.1">
                <span class="param-unit">m</span>
            </div>`;
    }
        html += `
            <div class="param-item editable">
                <span class="param-label">Radius:</span>
                <input type="number" class="param-input" data-param="radius" value="${given.radius}" min="0.1" step="0.1">
                <span class="param-unit">m</span>
            </div>`;
    }
    if (given.acceleration !== undefined) {
        html += `
            <div class="param-item editable">
                <span class="param-label">Acceleration:</span>
                <input type="number" class="param-input" data-param="acceleration" value="${given.acceleration}" step="0.1">
                <span class="param-unit">m/s²</span>
            </div>`;
    }
    if (given.initialVelocity !== undefined) {
        html += `
            <div class="param-item editable">
                <span class="param-label">Initial Velocity:</span>
                <input type="number" class="param-input" data-param="initialVelocity" value="${given.initialVelocity}" min="0" step="0.1">
                <span class="param-unit">m/s</span>
            </div>`;
    }
    if (given.finalVelocity !== undefined) {
        html += `
            <div class="param-item editable">
                <span class="param-label">Final Velocity:</span>
                <input type="number" class="param-input" data-param="finalVelocity" value="${given.finalVelocity}" min="0" step="0.1">
                <span class="param-unit">m/s</span>
            </div>`;
    }
    html += `<div class="param-item"><span class="param-label">Gravity:</span><span class="param-value">${given.gravity} m/s²</span></div>`;
    
    html += '</div>';
    html += '<button class="btn btn-block btn-update" id="updateBtn" style="margin-top: 10px;">Update Simulation</button>';
    
    container.innerHTML = html;
    
    // Add event listeners to inputs
    const updateBtn = document.getElementById('updateBtn');
    if (updateBtn) {
        updateBtn.addEventListener('click', updateParameters);
    }
}

function displayDeducedParameters(deduced) {
    const container = document.getElementById('deducedParams');
    if (!container) return;
    
    let html = '<div class="param-list">';
    
    const formatValue = (value) => {
        if (value === undefined || value === null || isNaN(value)) return 'N/A';
        if (!isFinite(value)) return 'Infinity';
        if (Math.abs(value) > 1e6) return value.toExponential(2);
        if (Math.abs(value) < 1e-3 && value !== 0) return value.toExponential(2);
        return value.toFixed(2);
    };
    
    if (deduced.vx !== undefined) {
        html += `<div class="param-item"><span class="param-label">Horizontal Velocity:</span><span class="param-value">${formatValue(deduced.vx)} m/s</span></div>`;
    }
    if (deduced.vy !== undefined) {
        html += `<div class="param-item"><span class="param-label">Vertical Velocity:</span><span class="param-value">${formatValue(deduced.vy)} m/s</span></div>`;
    }
    if (deduced.work !== undefined) {
        html += `<div class="param-item"><span class="param-label">Work Done:</span><span class="param-value">${formatValue(deduced.work)} J</span></div>`;
    }
    if (deduced.workNet !== undefined) {
        html += `<div class="param-item"><span class="param-label">Net Work:</span><span class="param-value">${formatValue(deduced.workNet)} J</span></div>`;
    }
    if (deduced.workGravity !== undefined) {
        html += `<div class="param-item"><span class="param-label">Work by Gravity:</span><span class="param-value">${formatValue(deduced.workGravity)} J</span></div>`;
    }
    if (deduced.workFriction !== undefined) {
        html += `<div class="param-item"><span class="param-label">Work by Friction:</span><span class="param-value">${formatValue(deduced.workFriction)} J</span></div>`;
    }
    if (deduced.kineticEnergy !== undefined) {
        html += `<div class="param-item"><span class="param-label">Kinetic Energy:</span><span class="param-value">${formatValue(deduced.kineticEnergy)} J</span></div>`;
    }
    if (deduced.finalKineticEnergy !== undefined) {
        html += `<div class="param-item"><span class="param-label">Kinetic Energy at Ground:</span><span class="param-value">${formatValue(deduced.finalKineticEnergy)} J</span></div>`;
    }
    if (deduced.potentialEnergy !== undefined) {
        html += `<div class="param-item"><span class="param-label">Potential Energy:</span><span class="param-value">${formatValue(deduced.potentialEnergy)} J</span></div>`;
    }
    if (deduced.totalEnergy !== undefined) {
        html += `<div class="param-item"><span class="param-label">Total Energy:</span><span class="param-value">${formatValue(deduced.totalEnergy)} J</span></div>`;
    }
    if (deduced.power !== undefined) {
        html += `<div class="param-item"><span class="param-label">Power:</span><span class="param-value">${formatValue(deduced.power)} W</span></div>`;
    }
    if (deduced.acceleration !== undefined) {
        html += `<div class="param-item"><span class="param-label">Acceleration:</span><span class="param-value">${formatValue(deduced.acceleration)} m/s²</span></div>`;
    }
    if (deduced.normalForce !== undefined) {
        html += `<div class="param-item"><span class="param-label">Normal Force:</span><span class="param-value">${formatValue(deduced.normalForce)} N</span></div>`;
    }
    if (deduced.frictionForce !== undefined) {
        html += `<div class="param-item"><span class="param-label">Friction Force:</span><span class="param-value">${formatValue(deduced.frictionForce)} N</span></div>`;
    }
    if (deduced.netForce !== undefined) {
        html += `<div class="param-item"><span class="param-label">Net Force:</span><span class="param-value">${formatValue(deduced.netForce)} N</span></div>`;
    }
    if (deduced.centripetalAcceleration !== undefined) {
        html += `<div class="param-item"><span class="param-label">Centripetal Acceleration:</span><span class="param-value">${formatValue(deduced.centripetalAcceleration)} m/s²</span></div>`;
    }
    if (deduced.centripetalForce !== undefined) {
        html += `<div class="param-item"><span class="param-label">Centripetal Force:</span><span class="param-value">${formatValue(deduced.centripetalForce)} N</span></div>`;
    }
    if (deduced.angularVelocity !== undefined) {
        html += `<div class="param-item"><span class="param-label">Angular Velocity:</span><span class="param-value">${formatValue(deduced.angularVelocity)} rad/s</span></div>`;
    }
    if (deduced.period !== undefined) {
        html += `<div class="param-item"><span class="param-label">Period:</span><span class="param-value">${formatValue(deduced.period)} s</span></div>`;
    }
    if (deduced.frequency !== undefined) {
        html += `<div class="param-item"><span class="param-label">Frequency:</span><span class="param-value">${formatValue(deduced.frequency)} Hz</span></div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function displayRequiredResults(deduced, required) {
    const container = document.getElementById('requiredResults');
    if (!container) return;
    
    let html = '<div class="param-list">';
    
    if (required.includes('work')) {
        if (deduced.work !== undefined) {
            html += `<div class="param-item highlight"><span class="param-label">Work Done:</span><span class="param-value">${deduced.work.toFixed(2)} J</span></div>`;
        } else if (deduced.workNet !== undefined) {
            html += `<div class="param-item highlight"><span class="param-label">Net Work:</span><span class="param-value">${deduced.workNet.toFixed(2)} J</span></div>`;
        }
    }
    if (required.includes('kinetic') && deduced.kineticEnergy !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Kinetic Energy:</span><span class="param-value">${deduced.kineticEnergy.toFixed(2)} J</span></div>`;
    }
    if (required.includes('kinetic') && deduced.finalKineticEnergy !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Kinetic Energy at Ground:</span><span class="param-value">${deduced.finalKineticEnergy.toFixed(2)} J</span></div>`;
    }
    if (required.includes('potential') && deduced.potentialEnergy !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Potential Energy:</span><span class="param-value">${deduced.potentialEnergy.toFixed(2)} J</span></div>`;
    }
    if (required.includes('power') && deduced.power !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Power:</span><span class="param-value">${deduced.power.toFixed(2)} W</span></div>`;
    }
    if (required.includes('velocity') && deduced.finalVelocity !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Final Velocity:</span><span class="param-value">${deduced.finalVelocity.toFixed(2)} m/s</span></div>`;
    }
    if (required.includes('velocity') && deduced.maxSpeed !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Maximum Speed:</span><span class="param-value">${deduced.maxSpeed.toFixed(2)} m/s</span></div>`;
    }
    if (required.includes('time') && deduced.timeOfFlight !== undefined) {
    if (required.includes('period') && deduced.period !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Period:</span><span class="param-value">${deduced.period.toFixed(2)} s</span></div>`;
    }
    if (required.includes('frequency') && deduced.frequency !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Frequency:</span><span class="param-value">${deduced.frequency.toFixed(2)} Hz</span></div>`;
    }
        html += `<div class="param-item highlight"><span class="param-label">Time of Flight:</span><span class="param-value">${deduced.timeOfFlight.toFixed(2)} s</span></div>`;
    }
    if (required.includes('height') && deduced.maxHeight !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Maximum Height:</span><span class="param-value">${deduced.maxHeight.toFixed(2)} m</span></div>`;
    }
    if (required.includes('range') && deduced.range !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Range:</span><span class="param-value">${deduced.range.toFixed(2)} m</span></div>`;
    }
    if (required.includes('distance') && deduced.distance !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Distance:</span><span class="param-value">${deduced.distance.toFixed(2)} m</span></div>`;
    }
    if (required.includes('acceleration') && deduced.acceleration !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Acceleration:</span><span class="param-value">${deduced.acceleration.toFixed(2)} m/s²</span></div>`;
    }
    if (required.includes('force') && deduced.netForce !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Net Force:</span><span class="param-value">${deduced.netForce.toFixed(2)} N</span></div>`;
    }
    if (required.includes('force') && deduced.centripetalForce !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Centripetal Force:</span><span class="param-value">${deduced.centripetalForce.toFixed(2)} N</span></div>`;
    }
    if (required.includes('period') && deduced.period !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Period:</span><span class="param-value">${deduced.period.toFixed(2)} s</span></div>`;
    }
    if (required.includes('frequency') && deduced.frequency !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Frequency:</span><span class="param-value">${deduced.frequency.toFixed(2)} Hz</span></div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}



// Store current calculation data globally
let currentCalculationData = null;

// Update parameters function
function updateParameters() {
    if (!currentCalculationData) return;
    
    // Stop current simulation first
    if (typeof stopSimulation === 'function') {
        stopSimulation();
    }
    
    // Get all parameter inputs
    const inputs = document.querySelectorAll('.param-input');
    inputs.forEach(input => {
        const param = input.dataset.param;
        const value = parseFloat(input.value);
        if (!isNaN(value)) {
            currentCalculationData.given[param] = value;
        }
    });
    
    // Recalculate physics
    const recalculated = calculatePhysics(currentCalculationData);
    
    // Check for errors
    if (recalculated.error) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = recalculated.message;
        }
        return;
    }
    
    // Clear error
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = '';
    }
    
    // Update displays
    currentCalculationData = recalculated;
    displayGivenParameters(recalculated.given);
    displayDeducedParameters(recalculated.deduced);
    displayRequiredResults(recalculated.deduced, recalculated.required);
    
    // Clear canvas before restarting
    const canvas = document.getElementById('simulationCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0d0b14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Restart simulation with fresh state
    setTimeout(() => {
        startSimulation(recalculated);
    }, 100);
}
