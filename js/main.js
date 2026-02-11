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
                const parsedData = parsePhysicsProblem(problemText);
                
                const errorMessage = document.getElementById('errorMessage');
                
                if (!parsedData) {
                    // Show error
                    if (errorMessage) {
                        errorMessage.textContent = 'Unable to parse problem. Try: "A ball is dropped from 50m", "thrown at 20 m/s at 45 degrees", "thrown horizontally at 15 m/s from 30m height".';
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
                const calculatedData = calculatePhysics(parsedData);
                
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
        html += `<div class="param-item"><span class="param-label">Mass:</span><span class="param-value">${given.mass} kg</span></div>`;
    }
    if (given.force !== undefined) {
        html += `<div class="param-item"><span class="param-label">Force:</span><span class="param-value">${given.force} N</span></div>`;
    }
    if (given.distance !== undefined) {
        html += `<div class="param-item"><span class="param-label">Distance:</span><span class="param-value">${given.distance} m</span></div>`;
    }
    if (given.velocity !== undefined) {
        html += `<div class="param-item"><span class="param-label">Initial Velocity:</span><span class="param-value">${given.velocity} m/s</span></div>`;
    }
    if (given.angle !== undefined) {
        html += `<div class="param-item"><span class="param-label">Launch Angle:</span><span class="param-value">${given.angle}°</span></div>`;
    }
    if (given.height !== undefined) {
        html += `<div class="param-item"><span class="param-label">Initial Height:</span><span class="param-value">${given.height} m</span></div>`;
    }
    if (given.time !== undefined) {
        html += `<div class="param-item"><span class="param-label">Time:</span><span class="param-value">${given.time} s</span></div>`;
    }
    if (given.friction !== undefined) {
        html += `<div class="param-item"><span class="param-label">Friction (μ):</span><span class="param-value">${given.friction}</span></div>`;
    }
    html += `<div class="param-item"><span class="param-label">Gravity:</span><span class="param-value">${given.gravity} m/s²</span></div>`;
    
    html += '</div>';
    container.innerHTML = html;
}

function displayDeducedParameters(deduced) {
    const container = document.getElementById('deducedParams');
    if (!container) return;
    
    let html = '<div class="param-list">';
    
    if (deduced.vx !== undefined) {
        html += `<div class="param-item"><span class="param-label">Horizontal Velocity:</span><span class="param-value">${deduced.vx.toFixed(2)} m/s</span></div>`;
    }
    if (deduced.vy !== undefined) {
        html += `<div class="param-item"><span class="param-label">Vertical Velocity:</span><span class="param-value">${deduced.vy.toFixed(2)} m/s</span></div>`;
    }
    if (deduced.work !== undefined) {
        html += `<div class="param-item"><span class="param-label">Work Done:</span><span class="param-value">${deduced.work.toFixed(2)} J</span></div>`;
    }
    if (deduced.kineticEnergy !== undefined) {
        html += `<div class="param-item"><span class="param-label">Kinetic Energy:</span><span class="param-value">${deduced.kineticEnergy.toFixed(2)} J</span></div>`;
    }
    if (deduced.potentialEnergy !== undefined) {
        html += `<div class="param-item"><span class="param-label">Potential Energy:</span><span class="param-value">${deduced.potentialEnergy.toFixed(2)} J</span></div>`;
    }
    if (deduced.totalEnergy !== undefined) {
        html += `<div class="param-item"><span class="param-label">Total Energy:</span><span class="param-value">${deduced.totalEnergy.toFixed(2)} J</span></div>`;
    }
    if (deduced.power !== undefined) {
        html += `<div class="param-item"><span class="param-label">Power:</span><span class="param-value">${deduced.power.toFixed(2)} W</span></div>`;
    }
    if (deduced.acceleration !== undefined) {
        html += `<div class="param-item"><span class="param-label">Acceleration:</span><span class="param-value">${deduced.acceleration.toFixed(2)} m/s²</span></div>`;
    }
    if (deduced.normalForce !== undefined) {
        html += `<div class="param-item"><span class="param-label">Normal Force:</span><span class="param-value">${deduced.normalForce.toFixed(2)} N</span></div>`;
    }
    if (deduced.frictionForce !== undefined) {
        html += `<div class="param-item"><span class="param-label">Friction Force:</span><span class="param-value">${deduced.frictionForce.toFixed(2)} N</span></div>`;
    }
    if (deduced.netForce !== undefined) {
        html += `<div class="param-item"><span class="param-label">Net Force:</span><span class="param-value">${deduced.netForce.toFixed(2)} N</span></div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function displayRequiredResults(deduced, required) {
    const container = document.getElementById('requiredResults');
    if (!container) return;
    
    let html = '<div class="param-list">';
    
    if (required.includes('work') && deduced.work !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Work Done:</span><span class="param-value">${deduced.work.toFixed(2)} J</span></div>`;
    }
    if (required.includes('kinetic') && deduced.kineticEnergy !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Kinetic Energy:</span><span class="param-value">${deduced.kineticEnergy.toFixed(2)} J</span></div>`;
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
    if (required.includes('time') && deduced.timeOfFlight !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Time of Flight:</span><span class="param-value">${deduced.timeOfFlight.toFixed(2)} s</span></div>`;
    }
    if (required.includes('height') && deduced.maxHeight !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Maximum Height:</span><span class="param-value">${deduced.maxHeight.toFixed(2)} m</span></div>`;
    }
    if (required.includes('range') && deduced.range !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Range:</span><span class="param-value">${deduced.range.toFixed(2)} m</span></div>`;
    }
    if (required.includes('acceleration') && deduced.acceleration !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Acceleration:</span><span class="param-value">${deduced.acceleration.toFixed(2)} m/s²</span></div>`;
    }
    if (required.includes('force') && deduced.netForce !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Net Force:</span><span class="param-value">${deduced.netForce.toFixed(2)} N</span></div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

