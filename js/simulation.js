// Simulation Engine - HTML5 Canvas Animation

let animationId = null;
let simulationData = null;
let startTime = null;

function startSimulation(data) {
    // Stop any existing animation
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    simulationData = data;
    startTime = Date.now();
    
    // For incline, calculate animation duration
    if (data.type === "incline") {
        const d = data.given.distance || 10;
        const a = data.deduced.acceleration || 1;
        const v0 = data.given.velocity || 0;
        if (a > 0.1) {
            const duration = Math.sqrt(2 * d / a);
            data.animationDuration = Math.min(duration, 5); // Cap at 5 seconds
        } else if (v0 > 0) {
            data.animationDuration = d / v0;
        } else {
            data.animationDuration = 3;
        }
    }
    
    // Start animation loop
    animate();
}

function animate() {
    if (!simulationData) return;
    
    const canvas = document.getElementById('simulationCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { type, given, deduced } = simulationData;
    
    // Calculate elapsed time
    
    // Work-energy visualizations (static)
    if (type === 'work' || type === 'kinetic' || type === 'potential' || type === 'power' || type === 'conservation' || type === 'incline' || type === 'circular' || type === 'pendulum') {
        drawWorkEnergyVisualization(ctx, canvas, simulationData);
        return;
    }
    const elapsed = (Date.now() - startTime) / 1000;
    const totalTime = deduced.timeOfFlight || 0;
    
    // Scale to canvas (needed for both running and final frame)
    const scale = calculateScale(simulationData, canvas);
    const offsetX = 60;
    const offsetY = canvas.height - 60;
    
    // Stop animation when complete
    let t = elapsed;
    if (t > totalTime) {
        t = totalTime;
        // Animation complete - draw final frame and stop
        drawFinalFrame(ctx, canvas, simulationData, t, totalTime, scale, offsetX, offsetY);
        stopSimulation();
        return;
    
    // Limit frame rate to 60fps
    const now = Date.now();
    if (simulationData.lastFrameTime && (now - simulationData.lastFrameTime) < 16) {
        animationId = requestAnimationFrame(animate);
        return;
    }
    simulationData.lastFrameTime = now;
    }
    
    // Clear canvas
    ctx.fillStyle = '#0d0b14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate position and velocity
    const position = getPosition(t, simulationData);
    const velocity = getVelocity(t, simulationData);
    
    // Draw ground line
    drawGround(ctx, canvas, offsetY);
    
    // Draw trajectory path
    drawTrajectory(ctx, simulationData, scale, offsetX, offsetY);
    
    // Draw key points (launch, max height, landing)
    drawKeyPoints(ctx, simulationData, scale, offsetX, offsetY);
    
    // Draw velocity vector
    drawVelocityVector(ctx, position, velocity, scale, offsetX, offsetY);
    
    // Draw projectile
    drawProjectile(ctx, position, scale, offsetX, offsetY);
    
    // Draw info panel
    drawInfoPanel(ctx, canvas, t, totalTime, position, velocity);
    
    // Continue animation
    animationId = requestAnimationFrame(animate);
}

function getPosition(t, data) {
    const { type, given, deduced } = data;
    const g = given.gravity || 9.8;
    
    let x = 0;
    let y = 0;
    
    if (type === 'projectile') {
        const vx = deduced.vx || 0;
        const vy = deduced.vy || 0;
        const h0 = given.height || 0;
        
        x = vx * t;
        y = h0 + vy * t - 0.5 * g * t * t;
        
    } else if (type === 'freefall') {
        const h = given.height || 0;
        x = 0;
        y = h - 0.5 * g * t * t;
        
    } else if (type === 'vertical') {
        const u = given.velocity || 0;
        const h0 = given.height || 0;
        x = 0;
        y = h0 + u * t - 0.5 * g * t * t;
        
    } else if (type === 'vertical_down') {
        const u = given.velocity || 0;
        const h = given.height || 0;
        x = 0;
        y = h - u * t - 0.5 * g * t * t;
        
    } else if (type === 'horizontal_projectile') {
        const u = given.velocity || 0;
        const h = given.height || 0;
        x = u * t;
        y = h - 0.5 * g * t * t;
        
    } else if (type === 'horizontal') {
        const u = given.velocity || 0;
        x = u * t;
        y = 0;
    }
    
    return { x: Math.max(0, x), y: Math.max(0, y) };
}

function getVelocity(t, data) {
    const { type, given, deduced } = data;
    const g = given.gravity || 9.8;
    
    let vx = 0;
    let vy = 0;
    
    if (type === 'projectile') {
        vx = deduced.vx || 0;
        vy = (deduced.vy || 0) - g * t;
        
    } else if (type === 'freefall') {
        vx = 0;
        vy = -g * t;
        
    } else if (type === 'vertical') {
        vx = 0;
        vy = (given.velocity || 0) - g * t;
        
    } else if (type === 'vertical_down') {
        vx = 0;
        vy = -(given.velocity || 0) - g * t;
        
    } else if (type === 'horizontal_projectile') {
        vx = given.velocity || 0;
        vy = -g * t;
        
    } else if (type === 'horizontal') {
        vx = given.velocity || 0;
        vy = 0;
    }
    
    const magnitude = Math.sqrt(vx * vx + vy * vy);
    return { vx, vy, magnitude };
}

function calculateScale(data, canvas) {
    const { deduced } = data;
    const maxRange = Math.max(deduced.range || 10, 10);
    const maxHeight = Math.max(deduced.maxHeight || 10, 10);
    
    const scaleX = (canvas.width - 100) / maxRange;
    const scaleY = (canvas.height - 100) / maxHeight;
    
    return Math.min(scaleX, scaleY);
}

function drawGround(ctx, canvas, offsetY) {
    ctx.strokeStyle = '#3d3650';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, offsetY);
    ctx.lineTo(canvas.width, offsetY);
    ctx.stroke();
    
    // Ground label
    ctx.fillStyle = '#b8b3c9';
    ctx.font = '12px Inter';
    ctx.fillText('Ground', 10, offsetY + 20);
}

function drawTrajectory(ctx, data, scale, offsetX, offsetY) {
    const { deduced } = data;
    const totalTime = deduced.timeOfFlight || 0;
    
    if (totalTime === 0) return;
    
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    
    for (let i = 0; i <= 100; i++) {
        const t = (i / 100) * totalTime;
        const pos = getPosition(t, data);
        const px = offsetX + pos.x * scale;
        const py = offsetY - pos.y * scale;
        
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawProjectile(ctx, position, scale, offsetX, offsetY) {
    const x = offsetX + position.x * scale;
    const y = offsetY - position.y * scale;
    
    // Draw outer ring for emphasis
    ctx.strokeStyle = '#FF4DC4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw ball
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
}

function drawKeyPoints(ctx, data, scale, offsetX, offsetY) {
    const { type, given, deduced } = data;
    
    // Launch point
    const h0 = given.height || 0;
    const launchX = offsetX;
    const launchY = offsetY - h0 * scale;
    
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(launchX, launchY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#c084fc';
    ctx.font = '11px Inter';
    ctx.fillText('Launch', launchX - 20, launchY - 10);
    
    // Max height point (if applicable)
    if (type !== 'horizontal') {
        const maxHeight = deduced.maxHeight || 0;
        let maxHeightX = offsetX;
        
        if (type === 'projectile' || type === 'horizontal_projectile') {
            const timeToMaxHeight = (deduced.vy || 0) / (given.gravity || 9.8);
            if (timeToMaxHeight > 0) {
                const posAtMax = getPosition(timeToMaxHeight, data);
                maxHeightX = offsetX + posAtMax.x * scale;
            }
        }
        
        const maxHeightY = offsetY - maxHeight * scale;
        
        ctx.fillStyle = '#FF2FA3';
        ctx.beginPath();
        ctx.arc(maxHeightX, maxHeightY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FF2FA3';
        ctx.font = '11px Inter';
        ctx.fillText(`Max: ${maxHeight.toFixed(1)}m`, maxHeightX + 10, maxHeightY - 5);
    }
    
    // Landing point
    const range = deduced.range || 0;
    const landingX = offsetX + range * scale;
    const landingY = offsetY;
    
    ctx.fillStyle = '#FF4DC4';
    ctx.beginPath();
    ctx.arc(landingX, landingY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FF4DC4';
    ctx.font = '11px Inter';
    ctx.fillText('Landing', landingX - 25, landingY + 20);
}

function drawVelocityVector(ctx, position, velocity, scale, offsetX, offsetY) {
    const x = offsetX + position.x * scale;
    const y = offsetY - position.y * scale;
    
    // Scale velocity for display (make it visible but not too large)
    const vectorScale = 3;
    const vxScaled = velocity.vx * vectorScale;
    const vyScaled = -velocity.vy * vectorScale; // Negative because canvas Y is inverted
    
    // Draw velocity vector arrow
    ctx.strokeStyle = '#FF8AD6';
    ctx.fillStyle = '#FF8AD6';
    ctx.lineWidth = 2;
    
    // Arrow shaft
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + vxScaled, y + vyScaled);
    ctx.stroke();
    
    // Arrow head
    const angle = Math.atan2(vyScaled, vxScaled);
    const headLength = 8;
    
    ctx.beginPath();
    ctx.moveTo(x + vxScaled, y + vyScaled);
    ctx.lineTo(
        x + vxScaled - headLength * Math.cos(angle - Math.PI / 6),
        y + vyScaled - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        x + vxScaled - headLength * Math.cos(angle + Math.PI / 6),
        y + vyScaled - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(x + vxScaled, y + vyScaled);
    ctx.fill();
    
    // Velocity label
    ctx.fillStyle = '#FF8AD6';
    ctx.font = '10px Inter';
    ctx.fillText(`v=${velocity.magnitude.toFixed(1)}m/s`, x + vxScaled + 5, y + vyScaled - 5);
}

function drawInfoPanel(ctx, canvas, t, totalTime, position, velocity) {
    // Background panel
    const panelWidth = 180;
    const panelHeight = 100;
    const panelX = 10;
    const panelY = 10;
    
    ctx.fillStyle = 'rgba(58, 10, 92, 0.9)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    ctx.strokeStyle = '#2A0E44';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Text content
    ctx.fillStyle = '#CFA7FF';
    ctx.font = '12px Inter';
    
    const lineHeight = 18;
    let yOffset = panelY + 20;
    
    ctx.fillText(`Time: ${t.toFixed(2)}s / ${totalTime.toFixed(2)}s`, panelX + 10, yOffset);
    yOffset += lineHeight;
    
    ctx.fillText(`Position: (${position.x.toFixed(1)}, ${position.y.toFixed(1)})m`, panelX + 10, yOffset);
    yOffset += lineHeight;
    
    ctx.fillText(`Velocity: ${velocity.magnitude.toFixed(1)} m/s`, panelX + 10, yOffset);
    yOffset += lineHeight;
    
    ctx.fillText(`vx: ${velocity.vx.toFixed(1)} m/s`, panelX + 10, yOffset);
    yOffset += lineHeight;
    
    ctx.fillText(`vy: ${velocity.vy.toFixed(1)} m/s`, panelX + 10, yOffset);
}

function drawFinalFrame(ctx, canvas, data, t, totalTime, scale, offsetX, offsetY) {
    // Clear canvas
    ctx.fillStyle = '#0d0b14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const position = getPosition(t, data);
    const velocity = getVelocity(t, data);
    
    // Draw all elements for final frame
    drawGround(ctx, canvas, offsetY);
    drawTrajectory(ctx, data, scale, offsetX, offsetY);
    drawKeyPoints(ctx, data, scale, offsetX, offsetY);
    drawVelocityVector(ctx, position, velocity, scale, offsetX, offsetY);
    drawProjectile(ctx, position, scale, offsetX, offsetY);
    drawInfoPanel(ctx, canvas, t, totalTime, position, velocity);
    
    // Add "Complete" indicator
    ctx.fillStyle = '#FF2FA3';
    ctx.font = 'bold 14px Inter';
    ctx.fillText('SIMULATION COMPLETE', canvas.width / 2 - 90, 30);
}

function stopSimulation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    simulationData = null;
    startTime = null;
}


function drawWorkEnergyVisualization(ctx, canvas, data) {
    const { type, given, deduced } = data;
    
    // Circular motion visualization
    if (type === 'circular') {
        drawCircularMotion(ctx, canvas, data);
        return;
    }
    
    // Pendulum visualization
    if (type === 'pendulum') {
        drawPendulum(ctx, canvas, data);
        return;
    }
    
    // Inclined plane visualization
    if (type === 'incline') {
        drawInclinedPlane(ctx, canvas, data);
        return;
    }
    
    // Title
    ctx.fillStyle = '#FF2FA3';
    ctx.font = 'bold 20px "Press Start 2P", monospace';
    ctx.fillText('Work & Energy', canvas.width / 2 - 150, 50);
    
    // Draw bar chart for energies
    const barWidth = 80;
    const barSpacing = 120;
    const baseY = canvas.height - 100;
    const maxBarHeight = 300;
    
    let bars = [];
    
    if (deduced.work !== undefined) {
        bars.push({ label: 'Work', value: deduced.work, color: '#FF4DC4' });
    }
    if (deduced.kineticEnergy !== undefined) {
        bars.push({ label: 'KE', value: deduced.kineticEnergy, color: '#FF8AD6' });
    }
    if (deduced.potentialEnergy !== undefined) {
        bars.push({ label: 'PE', value: deduced.potentialEnergy, color: '#CFA7FF' });
    }
    if (deduced.totalEnergy !== undefined) {
        bars.push({ label: 'Total', value: deduced.totalEnergy, color: '#FF2FA3' });
    }
    
    const maxValue = Math.max(...bars.map(b => b.value), 1);
    const startX = (canvas.width - (bars.length * barSpacing)) / 2;
    
    bars.forEach((bar, i) => {
        const x = startX + i * barSpacing;
        const barHeight = (bar.value / maxValue) * maxBarHeight;
        const y = baseY - barHeight;
        
        // Draw bar
        ctx.fillStyle = bar.color;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw border
        ctx.strokeStyle = '#2A0E44';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Draw label
        ctx.fillStyle = '#CFA7FF';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText(bar.label, x + 10, baseY + 30);
        
        // Draw value
        ctx.fillStyle = '#FF8AD6';
        ctx.font = '10px Inter';
        ctx.fillText(`${bar.value.toFixed(1)} J`, x + 5, y - 10);
    });
    
    // Draw base line
    ctx.strokeStyle = '#3d3650';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(canvas.width, baseY);
    ctx.stroke();
    
    // Additional info
    if (deduced.finalVelocity !== undefined) {
        ctx.fillStyle = '#CFA7FF';
        ctx.font = '12px Inter';
        ctx.fillText(`Final Velocity: ${deduced.finalVelocity.toFixed(2)} m/s`, 50, canvas.height - 30);
    }
    if (deduced.power !== undefined) {
        ctx.fillStyle = '#CFA7FF';
        ctx.font = '12px Inter';
        ctx.fillText(`Power: ${deduced.power.toFixed(2)} W`, 50, canvas.height - 10);
    }
}

function drawInclinedPlane(ctx, canvas, data) {
    try {
        const { given, deduced } = data;
        
        // Clear canvas first
        ctx.fillStyle = '#0d0b14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate animation progress
        const elapsed = (Date.now() - startTime) / 1000;
        const duration = data.animationDuration || 3;
        let progress = Math.min(elapsed / duration, 1);
        
        console.log('Drawing incline:', { elapsed, duration, progress });
        
        // Title
        ctx.fillStyle = '#FF2FA3';
        ctx.font = 'bold 18px "Press Start 2P", monospace';
        ctx.fillText('Inclined Plane', canvas.width / 2 - 130, 40);
    
    // Draw incline
    const baseX = 100;
    const baseY = canvas.height - 100;
    const length = 300;
    const angle = (given.angle || 30) * Math.PI / 180;
    const endX = baseX + length * Math.cos(angle);
    const endY = baseY - length * Math.sin(angle);
    
    // Incline surface
    ctx.strokeStyle = '#3d3650';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Base
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(endX, baseY);
    ctx.stroke();
    
    // Height line
    ctx.strokeStyle = '#FF8AD6';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(endX, baseY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw block (animated) - moving DOWN the incline (from top to bottom)
    const blockSize = 30;
    const blockX = endX - length * progress * Math.cos(angle) - blockSize / 2;
    const blockY = endY + length * progress * Math.sin(angle) - blockSize / 2;
    
    ctx.save();
    ctx.translate(blockX + blockSize / 2, blockY + blockSize / 2);
    ctx.rotate(angle);
    ctx.fillStyle = '#FF4DC4';
    ctx.fillRect(-blockSize / 2, -blockSize / 2, blockSize, blockSize);
    ctx.strokeStyle = '#2A0E44';
    ctx.lineWidth = 2;
    ctx.strokeRect(-blockSize / 2, -blockSize / 2, blockSize, blockSize);
    ctx.restore();
    
    // Draw force vectors
    const vectorX = blockX + blockSize / 2;
    const vectorY = blockY + blockSize / 2;
    const scale = 0.5;
    
    // Weight (mg)
    drawArrow(ctx, vectorX, vectorY, 0, 50, '#CFA7FF', 'mg');
    
    // Normal force
    const normalX = -deduced.normalForce * scale * Math.sin(angle);
    const normalY = -deduced.normalForce * scale * Math.cos(angle);
    drawArrow(ctx, vectorX, vectorY, normalX, normalY, '#FF8AD6', 'N');
    
    // Friction
    if (deduced.frictionForce > 0) {
        const frictionX = -deduced.frictionForce * scale * Math.cos(angle);
        const frictionY = deduced.frictionForce * scale * Math.sin(angle);
        drawArrow(ctx, vectorX, vectorY, frictionX, frictionY, '#FF2FA3', 'f');
    }
    
    // Labels
    ctx.fillStyle = '#CFA7FF';
    ctx.font = '14px Inter';
    ctx.fillText(`θ = ${given.angle || 30}°`, baseX + 40, baseY - 10);
    
    if (deduced.heightChange) {
        ctx.fillText(`h = ${deduced.heightChange.toFixed(2)} m`, endX + 10, (baseY + endY) / 2);
    }
    
    // Info panel
    const panelX = canvas.width - 250;
    const panelY = 80;
    const panelWidth = 230;
    const panelHeight = 220;
    
    ctx.fillStyle = 'rgba(58, 10, 92, 0.9)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = '#2A0E44';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    ctx.fillStyle = '#CFA7FF';
    ctx.font = '11px Inter';
    let yPos = panelY + 20;
    const lineHeight = 18;
    
    ctx.fillText(`Time: ${elapsed.toFixed(2)}s / ${duration.toFixed(2)}s`, panelX + 10, yPos);
    yPos += lineHeight;
    
    const distance = (given.distance || 10) * progress;
    ctx.fillText(`Distance: ${distance.toFixed(2)} m`, panelX + 10, yPos);
    yPos += lineHeight;
    
    if (deduced.acceleration !== undefined) {
        ctx.fillText(`Acceleration: ${deduced.acceleration.toFixed(2)} m/s²`, panelX + 10, yPos);
        yPos += lineHeight;
    }
    if (deduced.normalForce !== undefined) {
        ctx.fillText(`Normal Force: ${deduced.normalForce.toFixed(2)} N`, panelX + 10, yPos);
        yPos += lineHeight;
    }
    if (deduced.frictionForce !== undefined) {
        ctx.fillText(`Friction: ${deduced.frictionForce.toFixed(2)} N`, panelX + 10, yPos);
        yPos += lineHeight;
    }
    if (deduced.netForce !== undefined) {
        ctx.fillText(`Net Force: ${deduced.netForce.toFixed(2)} N`, panelX + 10, yPos);
        yPos += lineHeight;
    }
    if (deduced.workNet !== undefined) {
        const currentWork = deduced.workNet * progress;
        ctx.fillText(`Work (Net): ${currentWork.toFixed(2)} J`, panelX + 10, yPos);
        yPos += lineHeight;
    }
    if (deduced.finalVelocity !== undefined) {
        const v0 = given.velocity || 0;
        const a = deduced.acceleration || 0;
        const d = distance;
        const currentV = Math.sqrt(Math.max(0, v0 * v0 + 2 * a * d));
        ctx.fillText(`Velocity: ${currentV.toFixed(2)} m/s`, panelX + 10, yPos);
        yPos += lineHeight;
    }
    
    // Continue animation if not complete
    if (progress < 1) {
        animationId = requestAnimationFrame(animate);
    } else {
        ctx.fillStyle = '#FF2FA3';
        ctx.font = 'bold 12px Inter';
        ctx.fillText('COMPLETE', panelX + 80, panelY + panelHeight + 20);
        console.log('Animation complete');
    }
    } catch (error) {
        console.error('Error in drawInclinedPlane:', error);
        ctx.fillStyle = '#FF2FA3';
        ctx.font = '14px Inter';
        ctx.fillText('Error: ' + error.message, 50, 50);
    }
}

function drawArrow(ctx, x, y, dx, dy, color, label) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    
    // Arrow shaft
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.stroke();
    
    // Arrow head
    const angle = Math.atan2(dy, dx);
    const headLength = 8;
    
    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(
        x + dx - headLength * Math.cos(angle - Math.PI / 6),
        y + dy - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        x + dx - headLength * Math.cos(angle + Math.PI / 6),
        y + dy - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(x + dx, y + dy);
    ctx.fill();
    
    // Label
    ctx.font = '12px Inter';
    ctx.fillText(label, x + dx + 5, y + dy - 5);
}

function drawCircularMotion(ctx, canvas, data) {
    const { given, deduced } = data;
    
    // Clear canvas
    ctx.fillStyle = '#0d0b14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate animation
    const elapsed = (Date.now() - startTime) / 1000;
    const period = deduced.period || 2;
    const angle = (elapsed / period) * 2 * Math.PI;
    
    // Title
    ctx.fillStyle = '#FF2FA3';
    ctx.font = 'bold 18px "Press Start 2P", monospace';
    ctx.fillText('Circular Motion', canvas.width / 2 - 140, 40);
    
    // Circle center and radius
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.25;
    
    // Draw circle path
    ctx.strokeStyle = '#3d3650';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw center point
    ctx.fillStyle = '#CFA7FF';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Object position
    const objX = centerX + radius * Math.cos(angle);
    const objY = centerY + radius * Math.sin(angle);
    
    // Draw object
    ctx.fillStyle = '#FF4DC4';
    ctx.beginPath();
    ctx.arc(objX, objY, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#2A0E44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(objX, objY, 15, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw velocity vector (tangent)
    const v = given.velocity || 0;
    const vScale = 3;
    const vx = -v * Math.sin(angle) * vScale;
    const vy = v * Math.cos(angle) * vScale;
    drawArrow(ctx, objX, objY, vx, vy, '#FF8AD6', 'v');
    
    // Draw centripetal force vector (toward center)
    const fc = deduced.centripetalForce || 0;
    const fcScale = 0.5;
    const fcx = -(objX - centerX) * fcScale;
    const fcy = -(objY - centerY) * fcScale;
    drawArrow(ctx, objX, objY, fcx, fcy, '#FF2FA3', 'Fc');
    
    // Draw radius line
    ctx.strokeStyle = '#CFA7FF';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(objX, objY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Info panel
    const panelX = 20;
    const panelY = 80;
    const panelWidth = 250;
    const panelHeight = 200;
    
    ctx.fillStyle = 'rgba(58, 10, 92, 0.9)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = '#2A0E44';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    ctx.fillStyle = '#CFA7FF';
    ctx.font = '11px Inter';
    let yPos = panelY + 20;
    const lineHeight = 18;
    
    ctx.fillText(`Time: ${elapsed.toFixed(2)} s`, panelX + 10, yPos);
    yPos += lineHeight;
    
    if (given.velocity !== undefined) {
        ctx.fillText(`Velocity: ${given.velocity} m/s`, panelX + 10, yPos);
        yPos += lineHeight;
    }
    if (given.radius !== undefined) {
        ctx.fillText(`Radius: ${given.radius} m`, panelX + 10, yPos);
        yPos += lineHeight;
    }
    if (deduced.centripetalAcceleration !== undefined) {
        ctx.fillText(`Centripetal Acc: ${deduced.centripetalAcceleration.toFixed(2)} m/s²`, panelX + 10, yPos);
        yPos += lineHeight;
    }
    if (deduced.centripetalForce !== undefined) {
        ctx.fillText(`Centripetal Force: ${deduced.centripetalForce.toFixed(2)} N`, panelX + 10, yPos);
        yPos += lineHeight;
    }
    if (deduced.angularVelocity !== undefined) {
        ctx.fillText(`Angular Velocity: ${deduced.angularVelocity.toFixed(2)} rad/s`, panelX + 10, yPos);
        yPos += lineHeight;
    }
    if (deduced.period !== undefined) {
        ctx.fillText(`Period: ${deduced.period.toFixed(2)} s`, panelX + 10, yPos);
        yPos += lineHeight;
    }
    if (deduced.frequency !== undefined) {
        ctx.fillText(`Frequency: ${deduced.frequency.toFixed(2)} Hz`, panelX + 10, yPos);
        yPos += lineHeight;
    }
    
    // Continue animation
    animationId = requestAnimationFrame(animate);
}


function drawPendulum(ctx, canvas, data) {
    try {
        const { given, deduced } = data;
        
        ctx.fillStyle = '#0d0b14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const elapsed = (Date.now() - startTime) / 1000;
        const period = deduced.period || 2;
        const progress = (elapsed % period) / period;
        
        ctx.fillStyle = '#FF2FA3';
        ctx.font = 'bold 18px "Press Start 2P", monospace';
        ctx.fillText('Simple Pendulum', canvas.width / 2 - 140, 40);
        
        const pivotX = canvas.width / 2;
        const pivotY = 100;
        const length = Math.min(deduced.length * 50, 250);
        const amplitude = (deduced.amplitude || 10) * Math.PI / 180;
        const currentAngle = amplitude * Math.cos(2 * Math.PI * progress);
        const bobX = pivotX + length * Math.sin(currentAngle);
        const bobY = pivotY + length * Math.cos(currentAngle);
        
        ctx.fillStyle = '#3d3650';
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#CFA7FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();
        
        ctx.fillStyle = '#FF4DC4';
        ctx.beginPath();
        ctx.arc(bobX, bobY, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#2A0E44';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.strokeStyle = '#3d3650';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(pivotX, pivotY + length + 20);
        ctx.stroke();
        ctx.setLineDash([]);
        
        const panelX = canvas.width - 250;
        const panelY = 80;
        const panelWidth = 230;
        const panelHeight = 200;
        
        ctx.fillStyle = 'rgba(58, 10, 92, 0.9)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        ctx.strokeStyle = '#2A0E44';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        ctx.fillStyle = '#CFA7FF';
        ctx.font = '11px Inter';
        let yPos = panelY + 20;
        const lineHeight = 18;
        
        ctx.fillText(`Time: ${elapsed.toFixed(2)} s`, panelX + 10, yPos);
        yPos += lineHeight;
        ctx.fillText(`Angle: ${(currentAngle * 180 / Math.PI).toFixed(1)}°`, panelX + 10, yPos);
        yPos += lineHeight;
        
        if (deduced.length) {
            ctx.fillText(`Length: ${deduced.length.toFixed(2)} m`, panelX + 10, yPos);
            yPos += lineHeight;
        }
        if (deduced.amplitude) {
            ctx.fillText(`Amplitude: ${deduced.amplitude.toFixed(1)}°`, panelX + 10, yPos);
            yPos += lineHeight;
        }
        if (deduced.period) {
            ctx.fillText(`Period: ${deduced.period.toFixed(2)} s`, panelX + 10, yPos);
            yPos += lineHeight;
        }
        if (deduced.frequency) {
            ctx.fillText(`Frequency: ${deduced.frequency.toFixed(2)} Hz`, panelX + 10, yPos);
            yPos += lineHeight;
        }
        if (deduced.maxVelocity) {
            ctx.fillText(`Max Velocity: ${deduced.maxVelocity.toFixed(2)} m/s`, panelX + 10, yPos);
            yPos += lineHeight;
        }
        if (deduced.totalEnergy) {
            ctx.fillText(`Total Energy: ${deduced.totalEnergy.toFixed(2)} J`, panelX + 10, yPos);
        }
        
        animationId = requestAnimationFrame(animate);
        
    } catch (error) {
        console.error('Error in drawPendulum:', error);
    }
}
