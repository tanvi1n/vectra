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
                        errorMessage.textContent = 'Currently supports free fall, vertical motion, and projectile motion problems only.';
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
    
    if (given.velocity !== undefined) {
        html += `<div class="param-item"><span class="param-label">Initial Velocity:</span><span class="param-value">${given.velocity} m/s</span></div>`;
    }
    if (given.angle !== undefined) {
        html += `<div class="param-item"><span class="param-label">Launch Angle:</span><span class="param-value">${given.angle}°</span></div>`;
    }
    if (given.height !== undefined) {
        html += `<div class="param-item"><span class="param-label">Initial Height:</span><span class="param-value">${given.height} m</span></div>`;
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
    
    html += '</div>';
    container.innerHTML = html;
}

function displayRequiredResults(deduced, required) {
    const container = document.getElementById('requiredResults');
    if (!container) return;
    
    let html = '<div class="param-list">';
    
    if (required.includes('time') && deduced.timeOfFlight !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Time of Flight:</span><span class="param-value">${deduced.timeOfFlight.toFixed(2)} s</span></div>`;
    }
    if (required.includes('height') && deduced.maxHeight !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Maximum Height:</span><span class="param-value">${deduced.maxHeight.toFixed(2)} m</span></div>`;
    }
    if (required.includes('range') && deduced.range !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Range:</span><span class="param-value">${deduced.range.toFixed(2)} m</span></div>`;
    }
    if (required.includes('velocity') && deduced.finalVelocity !== undefined) {
        html += `<div class="param-item highlight"><span class="param-label">Final Velocity:</span><span class="param-value">${deduced.finalVelocity.toFixed(2)} m/s</span></div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

