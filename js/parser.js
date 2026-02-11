// Parser Module - Extract physics parameters from natural language

function parsePhysicsProblem(text) {
    text = text.toLowerCase().trim();
    
    if (!text) return null;
    
    // Detect problem type
    let type = null;
    if (text.includes('incline') || text.includes('inclined') || text.includes('slope') || text.includes('ramp')) {
        type = 'incline';
    } else if (text.includes('work') || text.includes('force') && text.includes('distance')) {
        type = 'work';
    } else if (text.includes('kinetic energy') || text.includes('ke')) {
        type = 'kinetic';
    } else if (text.includes('potential energy') || text.includes('pe')) {
        type = 'potential';
    } else if (text.includes('power')) {
        type = 'power';
    } else if (text.includes('conservation') || (text.includes('energy') && (text.includes('convert') || text.includes('transform')))) {
        type = 'conservation';
    } else if (text.includes('horizontally') && (text.includes('thrown') || text.includes('throw') || text.includes('launch'))) {
        type = 'horizontal_projectile';
    } else if (text.includes('dropped') || text.includes('drop') || text.includes('free fall') || text.includes('freefall') || text.includes('falls freely')) {
        type = 'freefall';
    } else if (text.includes('thrown upward') || text.includes('throw upward') || text.includes('thrown up') || text.includes('upward') || text.includes('straight up') || text.includes('vertically up') || text.includes('upwards') || text.includes('tossed up') || (text.includes('up') && text.includes('vertical'))) {
        type = 'vertical';
    } else if (text.includes('thrown downward') || text.includes('throw downward') || text.includes('thrown down') || text.includes('downward') || text.includes('straight down') || text.includes('vertically down')) {
        type = 'vertical_down';
    } else if (text.includes('angle') || text.includes('launched') || text.includes('projectile') || text.includes('degrees') || text.includes('°')) {
        type = 'projectile';
    } else if (text.includes('horizontal') && (text.includes('motion') || text.includes('moving') || text.includes('travels') || text.includes('velocity'))) {
        type = 'horizontal';
    } else {
        return null;
    }
    
    // Extract mass (kg)
    const massMatch = text.match(/(\d+(?:\.\d+)?)\s*kg/);
    const mass = massMatch ? parseFloat(massMatch[1]) : null;
    
    // Extract force (N)
    const forceMatch = text.match(/(\d+(?:\.\d+)?)\s*n(?:\s|$|\.)/i);
    const force = forceMatch ? parseFloat(forceMatch[1]) : null;
    
    // Extract distance (m)
    let distanceMatch = text.match(/(?:distance|pushed|pulled|moved)\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*m/);
    if (!distanceMatch) {
        distanceMatch = text.match(/(\d+(?:\.\d+)?)\s*m\s+(?:away|far|horizontally)/);
    }
    const distance = distanceMatch ? parseFloat(distanceMatch[1]) : null;
    
    // Extract velocity (m/s)
    let velocityMatch = text.match(/(\d+(?:\.\d+)?)\s*m\/s/);
    if (!velocityMatch) {
        velocityMatch = text.match(/(?:speed|velocity)\s+of\s+(\d+(?:\.\d+)?)\s*m\/s/);
    }
    const velocity = velocityMatch ? parseFloat(velocityMatch[1]) : null;
    
    // Extract height (m)
    let heightMatch = text.match(/(?:height|from|at)\s+(?:of\s+|a\s+height\s+of\s+)?(\d+(?:\.\d+)?)\s*m(?:\s|$|\.)/i);
    if (!heightMatch) {
        heightMatch = text.match(/(\d+(?:\.\d+)?)\s*m\s+(?:high|tall|above)/);
    }
    const height = heightMatch ? parseFloat(heightMatch[1]) : null;
    
    // Extract time (s)
    const timeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:s|sec|seconds?)(?:\s|$|\.)/i);
    const time = timeMatch ? parseFloat(timeMatch[1]) : null;
    
    // Extract angle (degrees)
    const angleMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:degrees|°|deg)/);
    const angle = angleMatch ? parseFloat(angleMatch[1]) : null;
    
    // Extract friction coefficient
    const frictionMatch = text.match(/(?:friction|μ|mu)\s*=?\s*(\d+(?:\.\d+)?)/);
    const friction = frictionMatch ? parseFloat(frictionMatch[1]) : null;
    
    // Extract gravity (optional, default 9.8)
    const gravityMatch = text.match(/g\s*=\s*(\d+(?:\.\d+)?)/);
    const gravity = gravityMatch ? parseFloat(gravityMatch[1]) : 9.8;
    
    // Determine what user is asking for
    const required = [];
    if (text.includes('acceleration')) {
        required.push('acceleration');
    }
    if (text.includes('force')) {
        required.push('force');
    }
    if (text.includes('work done') || text.includes('work')) {
        required.push('work');
    }
    if (text.includes('kinetic energy') || text.includes('ke')) {
        required.push('kinetic');
    }
    if (text.includes('potential energy') || text.includes('pe')) {
        required.push('potential');
    }
    if (text.includes('power')) {
        required.push('power');
    }
    if (text.includes('velocity') || text.includes('final velocity') || text.includes('speed')) {
        required.push('velocity');
    }
    if (text.includes('maximum height') || text.includes('max height')) {
        required.push('height');
    }
    if (text.includes('time')) {
        required.push('time');
    }
    if (text.includes('range') || text.includes('distance')) {
        required.push('range');
    }
    
    // If nothing specific requested, show all relevant
    if (required.length === 0) {
        if (type === 'incline') {
            required.push('acceleration', 'force', 'work');
        } else if (type === 'work' || type === 'kinetic' || type === 'potential' || type === 'power' || type === 'conservation') {
            required.push('work', 'kinetic', 'potential');
        } else {
            required.push('height', 'time', 'range');
        }
    }
    
    // Build given parameters
    const given = {};
    if (mass !== null) given.mass = mass;
    if (force !== null) given.force = force;
    if (distance !== null) given.distance = distance;
    if (velocity !== null) given.velocity = velocity;
    if (height !== null) given.height = height;
    if (time !== null) given.time = time;
    if (angle !== null) given.angle = angle;
    if (friction !== null) given.friction = friction;
    given.gravity = gravity;
    
    return {
        type: type,
        given: given,
        deduced: {},
        required: required
    };
}

// Calculate physics based on problem type
function calculatePhysics(data) {
    const { type, given } = data;
    const g = given.gravity || 9.8;
    const deduced = {};
    
    if (type === 'incline') {
        const m = given.mass || 0;
        const theta = (given.angle || 30) * Math.PI / 180;
        const mu = given.friction || 0;
        const d = given.distance || 0;
        const v0 = given.velocity || 0;
        
        // Forces
        deduced.normalForce = m * g * Math.cos(theta);
        deduced.frictionForce = mu * deduced.normalForce;
        deduced.parallelForce = m * g * Math.sin(theta);
        deduced.netForce = deduced.parallelForce - deduced.frictionForce;
        
        // Acceleration
        deduced.acceleration = deduced.netForce / m;
        
        // Work and energy
        if (d > 0) {
            deduced.workGravity = deduced.parallelForce * d;
            deduced.workFriction = -deduced.frictionForce * d;
            deduced.workNet = deduced.netForce * d;
            
            // Final velocity using work-energy theorem
            if (v0 >= 0) {
                const vf2 = v0 * v0 + 2 * deduced.acceleration * d;
                deduced.finalVelocity = vf2 > 0 ? Math.sqrt(vf2) : 0;
            }
        }
        
        // Height change
        if (d > 0) {
            deduced.heightChange = d * Math.sin(theta);
        }
        
    } else if (type === 'work') {
        const F = given.force || 0;
        const d = given.distance || 0;
        const m = given.mass || 0;
        const v = given.velocity || 0;
        
        deduced.work = F * d;
        if (m > 0 && v > 0) {
            deduced.kineticEnergy = 0.5 * m * v * v;
            deduced.finalVelocity = Math.sqrt(v * v + (2 * deduced.work) / m);
        } else if (m > 0 && deduced.work > 0) {
            deduced.finalVelocity = Math.sqrt((2 * deduced.work) / m);
            deduced.kineticEnergy = deduced.work;
        }
        
    } else if (type === 'kinetic') {
        const m = given.mass || 0;
        const v = given.velocity || 0;
        
        deduced.kineticEnergy = 0.5 * m * v * v;
        
    } else if (type === 'potential') {
        const m = given.mass || 0;
        const h = given.height || 0;
        
        deduced.potentialEnergy = m * g * h;
        
    } else if (type === 'power') {
        const W = given.work || 0;
        const t = given.time || 0;
        const F = given.force || 0;
        const d = given.distance || 0;
        
        if (W > 0 && t > 0) {
            deduced.power = W / t;
        } else if (F > 0 && d > 0 && t > 0) {
            deduced.work = F * d;
            deduced.power = deduced.work / t;
        }
        
    } else if (type === 'conservation') {
        const m = given.mass || 0;
        const h = given.height || 0;
        const v = given.velocity || 0;
        
        deduced.potentialEnergy = m * g * h;
        deduced.kineticEnergy = 0.5 * m * v * v;
        deduced.totalEnergy = deduced.potentialEnergy + deduced.kineticEnergy;
        
        if (h > 0 && v === 0) {
            deduced.finalVelocity = Math.sqrt(2 * g * h);
            deduced.finalKineticEnergy = m * g * h;
        } else if (v > 0 && h === 0) {
            deduced.maxHeight = (v * v) / (2 * g);
            deduced.finalPotentialEnergy = 0.5 * m * v * v;
        }
        
    } else if (type === 'projectile') {
        const u = given.velocity || 0;
        const theta = (given.angle || 45) * Math.PI / 180;
        const h0 = given.height || 0;
        
        deduced.vx = u * Math.cos(theta);
        deduced.vy = u * Math.sin(theta);
        
        const timeToMaxHeight = (u * Math.sin(theta)) / g;
        const maxHeightAboveGround = h0 + (u * u * Math.sin(theta) * Math.sin(theta)) / (2 * g);
        const timeFromMaxToGround = Math.sqrt((2 * maxHeightAboveGround) / g);
        
        deduced.timeOfFlight = timeToMaxHeight + timeFromMaxToGround;
        deduced.maxHeight = maxHeightAboveGround;
        deduced.range = u * Math.cos(theta) * deduced.timeOfFlight;
        
    } else if (type === 'freefall') {
        const h = given.height || 0;
        
        deduced.timeOfFlight = Math.sqrt((2 * h) / g);
        deduced.maxHeight = h;
        deduced.range = 0;
        deduced.finalVelocity = Math.sqrt(2 * g * h);
        deduced.vx = 0;
        deduced.vy = 0;
        
    } else if (type === 'vertical') {
        const u = given.velocity || 0;
        const h0 = given.height || 0;
        
        const timeToMaxHeight = u / g;
        const maxHeight = h0 + (u * u) / (2 * g);
        const timeFromMaxToGround = Math.sqrt((2 * maxHeight) / g);
        
        deduced.timeOfFlight = timeToMaxHeight + timeFromMaxToGround;
        deduced.maxHeight = maxHeight;
        deduced.range = 0;
        deduced.finalVelocity = Math.sqrt(2 * g * maxHeight);
        deduced.vx = 0;
        deduced.vy = u;
        
    } else if (type === 'vertical_down') {
        const u = given.velocity || 0;
        const h = given.height || 0;
        
        const a = 0.5 * g;
        const b = u;
        const c = -h;
        const discriminant = b * b - 4 * a * c;
        
        if (discriminant >= 0) {
            deduced.timeOfFlight = (-b + Math.sqrt(discriminant)) / (2 * a);
        } else {
            deduced.timeOfFlight = 0;
        }
        
        deduced.maxHeight = h;
        deduced.range = 0;
        deduced.finalVelocity = u + g * deduced.timeOfFlight;
        deduced.vx = 0;
        deduced.vy = -u;
        
    } else if (type === 'horizontal_projectile') {
        const u = given.velocity || 0;
        const h = given.height || 0;
        
        deduced.timeOfFlight = Math.sqrt((2 * h) / g);
        deduced.maxHeight = h;
        deduced.range = u * deduced.timeOfFlight;
        deduced.finalVelocity = Math.sqrt(u * u + Math.pow(g * deduced.timeOfFlight, 2));
        deduced.vx = u;
        deduced.vy = 0;
        
    } else if (type === 'horizontal') {
        const u = given.velocity || 0;
        const d = given.distance || 0;
        const t = given.time || 0;
        
        if (t > 0) {
            deduced.range = u * t;
            deduced.timeOfFlight = t;
        } else if (d > 0) {
            deduced.range = d;
            deduced.timeOfFlight = d / u;
        } else {
            deduced.range = 0;
            deduced.timeOfFlight = 0;
        }
        
        deduced.maxHeight = 0;
        deduced.finalVelocity = u;
        deduced.vx = u;
        deduced.vy = 0;
    }
    
    data.deduced = deduced;
    return data;
}
