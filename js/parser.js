// Parser Module - Extract physics parameters from natural language

function parsePhysicsProblem(text) {
    text = text.toLowerCase().trim();
    
    if (!text) return null;
    
    // Detect problem type
    let type = null;
    if (text.includes('dropped') || text.includes('drop') || text.includes('fall')) {
        type = 'freefall';
    } else if (text.includes('thrown upward') || text.includes('throw upward') || text.includes('thrown up')) {
        type = 'vertical';
    } else if (text.includes('angle') || text.includes('launched') || text.includes('projectile') || text.includes('degrees') || text.includes('°')) {
        type = 'projectile';
    } else {
        return null; // Unsupported problem type
    }
    
    // Extract velocity (m/s)
    const velocityMatch = text.match(/(\d+(?:\.\d+)?)\s*m\/s/);
    const velocity = velocityMatch ? parseFloat(velocityMatch[1]) : null;
    
    // Extract angle (degrees)
    const angleMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:degrees|°|deg)/);
    const angle = angleMatch ? parseFloat(angleMatch[1]) : null;
    
    // Extract height (m)
    const heightMatch = text.match(/(?:height|from)\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*m(?:\s|$|\.)/);
    const height = heightMatch ? parseFloat(heightMatch[1]) : null;
    
    // Extract gravity (optional, default 9.8)
    const gravityMatch = text.match(/g\s*=\s*(\d+(?:\.\d+)?)/);
    const gravity = gravityMatch ? parseFloat(gravityMatch[1]) : 9.8;
    
    // Determine what user is asking for
    const required = [];
    if (text.includes('maximum height') || text.includes('max height') || text.includes('highest point')) {
        required.push('height');
    }
    if (text.includes('time of flight') || text.includes('total time') || text.includes('time')) {
        required.push('time');
    }
    if (text.includes('range') || text.includes('distance') || text.includes('horizontal distance')) {
        required.push('range');
    }
    if (text.includes('velocity') || text.includes('final velocity') || text.includes('speed')) {
        required.push('velocity');
    }
    
    // If nothing specific requested, show all
    if (required.length === 0) {
        required.push('height', 'time', 'range');
    }
    
    // Build given parameters
    const given = {};
    if (velocity !== null) given.velocity = velocity;
    if (angle !== null) given.angle = angle;
    if (height !== null) given.height = height;
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
    
    if (type === 'projectile') {
        const u = given.velocity || 0;
        const theta = (given.angle || 45) * Math.PI / 180;
        
        deduced.vx = u * Math.cos(theta);
        deduced.vy = u * Math.sin(theta);
        deduced.timeOfFlight = (2 * u * Math.sin(theta)) / g;
        deduced.maxHeight = (u * u * Math.sin(theta) * Math.sin(theta)) / (2 * g);
        deduced.range = (u * u * Math.sin(2 * theta)) / g;
        
    } else if (type === 'freefall') {
        const h = given.height || 0;
        
        deduced.timeOfFlight = Math.sqrt((2 * h) / g);
        deduced.maxHeight = h;
        deduced.range = 0;
        deduced.finalVelocity = Math.sqrt(2 * g * h);
        
    } else if (type === 'vertical') {
        const u = given.velocity || 0;
        
        deduced.timeOfFlight = (2 * u) / g;
        deduced.maxHeight = (u * u) / (2 * g);
        deduced.range = 0;
        deduced.finalVelocity = u;
    }
    
    data.deduced = deduced;
    return data;
}
