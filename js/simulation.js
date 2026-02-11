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
    const elapsed = (Date.now() - startTime) / 1000;
    const totalTime = deduced.timeOfFlight || 0;
    
    // Loop animation
    let t = elapsed % (totalTime + 0.5);
    if (t > totalTime) t = totalTime;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate position
    const position = getPosition(t, simulationData);
    
    // Scale to canvas
    const scale = calculateScale(simulationData, canvas);
    const offsetX = 50;
    const offsetY = canvas.height - 50;
    
    // Draw ground line
    drawGround(ctx, canvas, offsetY);
    
    // Draw trajectory path
    drawTrajectory(ctx, simulationData, scale, offsetX, offsetY);
    
    // Draw projectile
    drawProjectile(ctx, position, scale, offsetX, offsetY);
    
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
        
        x = vx * t;
        y = vy * t - 0.5 * g * t * t;
        
    } else if (type === 'freefall') {
        const h = given.height || 0;
        x = 0;
        y = h - 0.5 * g * t * t;
        
    } else if (type === 'vertical') {
        const u = given.velocity || 0;
        x = 0;
        y = u * t - 0.5 * g * t * t;
    }
    
    return { x: Math.max(0, x), y: Math.max(0, y) };
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
    ctx.strokeStyle = '#2a0033';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, offsetY);
    ctx.lineTo(canvas.width, offsetY);
    ctx.stroke();
    
    // Ground label
    ctx.fillStyle = '#c4b5fd';
    ctx.font = '12px Inter';
    ctx.fillText('Ground', 10, offsetY + 20);
}

function drawTrajectory(ctx, data, scale, offsetX, offsetY) {
    const { deduced } = data;
    const totalTime = deduced.timeOfFlight || 0;
    
    if (totalTime === 0) return;
    
    ctx.strokeStyle = 'rgba(255, 102, 232, 0.3)';
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
    
    // Draw glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff2bd6';
    
    // Draw ball
    ctx.fillStyle = '#ff2bd6';
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw position indicator
    ctx.fillStyle = '#c4b5fd';
    ctx.font = '10px Inter';
    ctx.fillText(`(${position.x.toFixed(1)}m, ${position.y.toFixed(1)}m)`, x + 15, y - 10);
}

function stopSimulation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}
