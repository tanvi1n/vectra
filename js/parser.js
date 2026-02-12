// Parser Module - Extract physics parameters from natural language

// Smart type inference from available parameters
function inferTypeFromData(params) {
    const { mass, force, distance, velocity, height, angle, radius, friction, acceleration, time } = params;
    
    // Circular motion: has radius + velocity
    if (radius !== null && velocity !== null) {
        return 'circular';
    }
    
    // Incline: has angle + friction OR angle + mass
    if (angle !== null && friction !== null) {
        return 'incline';
    }
    if (angle !== null && mass !== null && distance !== null) {
        return 'incline';
    }
    
    // Projectile: has angle + velocity (no friction)
    if (angle !== null && velocity !== null && friction === null) {
        return 'projectile';
    }
    
    // Work: has force + distance
    if (force !== null && distance !== null) {
        return 'work';
    }
    
    // Kinetic energy: has mass + velocity (no height, no force)
    if (mass !== null && velocity !== null && height === null && force === null) {
        return 'kinetic';
    }
    
    // Potential energy: has mass + height (no velocity)
    if (mass !== null && height !== null && velocity === null) {
        return 'potential';
    }
    
    // Uniform acceleration: has acceleration + time
    if (acceleration !== null && time !== null) {
        return 'uniform_acceleration';
    }
    
    // Free fall: has height, no velocity
    if (height !== null && velocity === null) {
        return 'freefall';
    }
    
    // Vertical motion: has velocity + no angle + no radius
    if (velocity !== null && angle === null && radius === null && height === null) {
        return 'vertical';
    }
    
    return null;
}

function parsePhysicsProblem(text) {
    text = text.toLowerCase().trim();
    
    if (!text) return { error: true, message: 'Please enter a physics problem.' };
    
    // NORMALIZATION LAYER - Standardize language
    const normalizations = {
        'released from rest': 'dropped from rest',
        'allowed to fall': 'dropped',
        'let go': 'dropped',
        'falls freely': 'dropped',
        'thrown upwards': 'thrown upward',
        'thrown vertically up': 'thrown upward',
        'projected at': 'thrown at',
        'launched at': 'thrown at',
        'at an inclination of': 'incline',
        'on a slope of': 'incline',
        'slides down': 'incline',
        'moves in a circle': 'circular motion',
        'revolves': 'circular motion',
        'rotates': 'circular motion',
        'from rest': 'initial velocity 0',
        'starting from rest': 'initial velocity 0',
        'initially at rest': 'initial velocity 0'
    };
    
    for (const [phrase, replacement] of Object.entries(normalizations)) {
        text = text.replace(new RegExp(phrase, 'gi'), replacement);
    }
    
    // Detect problem type
    let type = null;
    
    // PRIORITY: Check what user is explicitly asking for
    if (text.includes('pendulum')) {
        type = 'pendulum';
    } else if (text.includes('find potential energy') || text.includes('calculate potential energy') || text.includes('potential energy of')) {
        type = 'potential';
    } else if (text.includes('kinetic energy at ground') || text.includes('kinetic energy at bottom') || text.includes('velocity at ground') || (text.includes('kinetic energy') && (text.includes('falls') || text.includes('drops') || text.includes('dropped') || text.includes('fall from') || text.includes('drop from')))) {
        type = 'conservation';
    } else if ((text.includes('find kinetic energy') || text.includes('calculate kinetic energy')) && (text.includes('at ground') || text.includes('at bottom') || text.includes('falls') || text.includes('fall from'))) {
        type = 'conservation';
    } else if (text.includes('find kinetic energy') || text.includes('calculate kinetic energy') || text.includes('kinetic energy of')) {
        type = 'kinetic';
    } else if (text.includes('find work') || text.includes('calculate work') || text.includes('work done by')) {
        type = 'work';
    } else if (text.includes('find power') || text.includes('calculate power')) {
        type = 'power';
    } else if (text.includes('pendulum') || text.includes('swings') || text.includes('oscillates')) {
        type = 'pendulum';
    } else if (text.includes('total distance') || (text.includes('walked') && text.includes('distance'))) {
        type = 'distance';
    } else if (text.includes('uniform acceleration') || text.includes('uniformly accelerated') || text.includes('constant acceleration')) {
        type = 'uniform_acceleration';
    } else if (text.includes('circular') || text.includes('circle') || text.includes('centripetal') || text.includes('angular')) {
        type = 'circular';
    } else if (text.includes('incline') || text.includes('inclined') || text.includes('slope') || text.includes('ramp')) {
        type = 'incline';
    } else if (text.includes('angle') || text.includes('launched') || text.includes('projectile') || text.includes('degrees') || text.includes('°')) {
        type = 'projectile';
    } else if (text.includes('horizontally') && (text.includes('thrown') || text.includes('throw') || text.includes('launch'))) {
        type = 'horizontal_projectile';
    } else if (text.includes('dropped') || text.includes('drop') || text.includes('free fall') || text.includes('freefall') || text.includes('falls freely')) {
        type = 'freefall';
    } else if (text.includes('thrown upward') || text.includes('throw upward') || text.includes('thrown up') || text.includes('upward') || text.includes('straight up') || text.includes('vertically up') || text.includes('upwards') || text.includes('tossed up') || (text.includes('up') && text.includes('vertical'))) {
        type = 'vertical';
    } else if (text.includes('thrown downward') || text.includes('throw downward') || text.includes('thrown down') || text.includes('downward') || text.includes('straight down') || text.includes('vertically down')) {
        type = 'vertical_down';
    } else if (text.includes('horizontal') && (text.includes('motion') || text.includes('moving') || text.includes('travels') || text.includes('velocity'))) {
        type = 'horizontal';
    } else if (text.includes('work') || (text.includes('force') && text.includes('distance'))) {
        type = 'work';
    } else if (text.includes('kinetic energy') || text.includes('ke')) {
        type = 'kinetic';
    } else if (text.includes('potential energy') || text.includes('pe')) {
        type = 'potential';
    } else if (text.includes('power')) {
        type = 'power';
    } else if (text.includes('conservation') || (text.includes('energy') && (text.includes('convert') || text.includes('transform')))) {
        type = 'conservation';
    } else {
        // Extract parameters first for inference
        const massMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilograms?)/i);
        const mass = massMatch ? parseFloat(massMatch[1]) : null;
        
        const velocityMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:m\/s|mps|meters?\s*per\s*second)/i);
        const velocity = velocityMatch ? parseFloat(velocityMatch[1]) : null;
        
        const heightMatch = text.match(/(?:height|from|at)\s+(?:of\s+|a\s+height\s+of\s+)?(\d+(?:\.\d+)?)\s*(?:m|meters?|metres?)(?:\s|$|\.)/i);
        const height = heightMatch ? parseFloat(heightMatch[1]) : null;
        
        const angleMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:degrees?|°|deg)/i);
        const angle = angleMatch ? parseFloat(angleMatch[1]) : null;
        
        const radiusMatch = text.match(/radius\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:m|meters?|metres?)/i);
        const radius = radiusMatch ? parseFloat(radiusMatch[1]) : null;
        
        const forceMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:n|newtons?)/i);
        const force = forceMatch ? parseFloat(forceMatch[1]) : null;
        
        let distanceMatch = text.match(/(?:distance|pushed|pulled|moved|travels?)\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:m|meters?|metres?)/i);
        if (!distanceMatch) {
            distanceMatch = text.match(/(?:over|across|for)\s+(\d+(?:\.\d+)?)\s*(?:m|meters?|metres?)/i);
        }
        const distance = distanceMatch ? parseFloat(distanceMatch[1]) : null;
        
        const frictionMatch = text.match(/(?:friction|coefficient|μ|mu)\s*(?:=|of|is)?\s*(\d+(?:\.\d+)?)/i) || text.match(/coefficient\s+of\s+friction\s+(\d+(?:\.\d+)?)/i);
        const friction = frictionMatch ? parseFloat(frictionMatch[1]) : null;
        
        const accelerationMatch = text.match(/(?:acceleration|accelerates)\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:m\/s²|m\/s2|ms2)/i);
        const acceleration = accelerationMatch ? parseFloat(accelerationMatch[1]) : null;
        
        const timeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:s|sec|seconds?)/i);
        const time = timeMatch ? parseFloat(timeMatch[1]) : null;
        
        // FALLBACK: Smart type inference from available data
        type = inferTypeFromData({ mass, force, distance, velocity, height, angle, radius, friction, acceleration, time });
        
        if (!type) {
            return { error: true, message: 'Problem type not recognized. Try: projectile, free fall, work, energy, circular motion, or inclined plane.' };
        }
    }
    
    // Extract mass (kg) - support variations
    const massMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilograms?)/i);
    const mass = massMatch ? parseFloat(massMatch[1]) : null;
    
    // Extract force (N) - support variations
    const forceMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:n|newtons?)/i);
    const force = forceMatch ? parseFloat(forceMatch[1]) : null;
    
    // Extract distance (m) - support variations
    let distanceMatch = text.match(/(?:distance|pushed|pulled|moved|travels?)\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:m|meters?|metres?)/i);
    if (!distanceMatch) {
        distanceMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:m|meters?|metres?)\s+(?:away|far|horizontally)/i);
    }
    if (!distanceMatch) {
        distanceMatch = text.match(/(?:over|across|for)\s+(\d+(?:\.\d+)?)\s*(?:m|meters?|metres?)/i);
    }
    const distance = distanceMatch ? parseFloat(distanceMatch[1]) : null;
    
    // Extract velocity (m/s) - support variations
    let velocityMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:m\/s|mps|meters?\s*per\s*second)/i);
    if (!velocityMatch) {
        velocityMatch = text.match(/(?:speed|velocity)\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:m\/s|mps)/i);
    }
    if (!velocityMatch && (text.includes('thrown') || text.includes('moving') || text.includes('speed') || text.includes('velocity'))) {
        // Fallback: just number near velocity keywords
        velocityMatch = text.match(/(?:thrown|moving|speed|velocity)\s+(?:at|of|with)?\s*(\d+(?:\.\d+)?)/i);
    }
    const velocity = velocityMatch ? parseFloat(velocityMatch[1]) : null;
    
    // Extract height (m) - support variations (but not for pendulum)
    let heightMatch = null;
    if (!text.includes('pendulum') && !text.includes('swings') && !text.includes('oscillates')) {
        heightMatch = text.match(/(?:height|from|at)\s+(?:of\s+|a\s+height\s+of\s+)?(\d+(?:\.\d+)?)\s*(?:m|meters?|metres?)/i);
        if (!heightMatch) {
            heightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:m|meters?|metres?)\s+(?:high|tall|above)/i);
        }
        if (!heightMatch) {
            // Try just number + m pattern
            heightMatch = text.match(/(\d+(?:\.\d+)?)\s*m(?:\s|$|\.)/i);
        }
    }
    const height = heightMatch ? parseFloat(heightMatch[1]) : null;
    
    // Extract time (s) - support variations
    const timeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:s|sec|seconds?)/i);
    const time = timeMatch ? parseFloat(timeMatch[1]) : null;
    
    // Extract angle (degrees) - support variations
    const angleMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:degrees?|°|deg)/i);
    const angle = angleMatch ? parseFloat(angleMatch[1]) : null;
    
    // Extract length (m) - for pendulum
    const lengthMatch = text.match(/length\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:m|meters?|metres?)/i);
    const length = lengthMatch ? parseFloat(lengthMatch[1]) : null;
    
    // Extract radius (m) - support variations
    const radiusMatch = text.match(/radius\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:m|meters?|metres?)/i);
    const radius = radiusMatch ? parseFloat(radiusMatch[1]) : null;
    
    // Extract friction coefficient - support variations
    const frictionMatch = text.match(/(?:friction|coefficient|μ|mu)\s*(?:=|of|is)?\s*(\d+(?:\.\d+)?)/i) || text.match(/coefficient\s+of\s+friction\s+(\d+(?:\.\d+)?)/i);
    const friction = frictionMatch ? parseFloat(frictionMatch[1]) : null;
    
    // Extract acceleration (m/s²) - support variations
    const accelerationMatch = text.match(/(?:acceleration|accelerates)\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:m\/s²|m\/s2|ms2)/i);
    const acceleration = accelerationMatch ? parseFloat(accelerationMatch[1]) : null;
    
    // Extract initial velocity (u) - support variations
    const initialVelocityMatch = text.match(/(?:initial velocity|starts with|from rest|u\s*=)\s*(\d+(?:\.\d+)?)/i);
    const initialVelocity = initialVelocityMatch ? parseFloat(initialVelocityMatch[1]) : (text.includes('from rest') ? 0 : null);
    
    // Extract final velocity (v) - support variations
    const finalVelocityMatch = text.match(/(?:final velocity|reaches|v\s*=)\s*(\d+(?:\.\d+)?)/i);
    const finalVelocity = finalVelocityMatch ? parseFloat(finalVelocityMatch[1]) : null;
    
    // Extract gravity (optional, default 9.8)
    const gravityMatch = text.match(/g\s*=\s*(\d+(?:\.\d+)?)/);
    const gravity = gravityMatch ? parseFloat(gravityMatch[1]) : 9.8;
    
    // Validate physically impossible values
    if (mass !== null && mass < 0) {
        return { error: true, message: 'Mass cannot be negative.' };
    }
    if (mass !== null && mass > 1e6) {
        return { error: true, message: 'Mass value too large (max 1,000,000 kg).' };
    }
    if (velocity !== null && velocity < 0) {
        return { error: true, message: 'Velocity cannot be negative.' };
    }
    if (velocity !== null && velocity > 3e8) {
        return { error: true, message: 'Velocity cannot exceed speed of light.' };
    }
    if (height !== null && height < 0) {
        return { error: true, message: 'Height cannot be negative.' };
    }
    if (distance !== null && distance < 0) {
        return { error: true, message: 'Distance cannot be negative.' };
    }
    if (radius !== null && radius <= 0) {
        return { error: true, message: 'Radius must be greater than zero.' };
    }
    if (angle !== null && (angle < 0 || angle > 360)) {
        return { error: true, message: 'Angle must be between 0 and 360 degrees.' };
    }
    if (friction !== null && (friction < 0 || friction > 1)) {
        return { error: true, message: 'Friction coefficient must be between 0 and 1.' };
    }
    if (time !== null && time < 0) {
        return { error: true, message: 'Time cannot be negative.' };
    }
    
    // Determine what user is asking for
    const required = [];
    if (text.includes('find acceleration') || text.includes('calculate acceleration') || text.includes('what will be the acceleration')) {
        required.push('acceleration');
    }
    if (text.includes('find distance') || text.includes('calculate distance') || text.includes('total distance')) {
        required.push('distance');
    }
    if (text.includes('find force') || text.includes('calculate force') || text.includes('find centripetal force') || text.includes('what will be the centripetal force') || text.includes('what will be the force')) {
        required.push('force');
    }
    if (text.includes('period')) {
        required.push('period');
    }
    if (text.includes('frequency')) {
        required.push('frequency');
    }
    if (text.includes('find work') || text.includes('calculate work') || text.includes('work done')) {
        required.push('work');
    }
    if (text.includes('find kinetic energy') || text.includes('calculate kinetic energy')) {
        required.push('kinetic');
    }
    if (text.includes('find potential energy') || text.includes('calculate potential energy')) {
        required.push('potential');
    }
    if (text.includes('find power') || text.includes('calculate power')) {
        required.push('power');
    }
    if (text.includes('find velocity') || text.includes('calculate velocity') || text.includes('find speed') || text.includes('calculate speed') || text.includes('find maximum speed') || text.includes('maximum speed') || text.includes('what is the maximum speed')) {
        required.push('velocity');
    }
    if (text.includes('find height') || text.includes('calculate height') || text.includes('maximum height')) {
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
        if (type === 'uniform_acceleration') {
            required.push('distance', 'velocity', 'time');
        } else if (type === 'circular') {
            required.push('force', 'acceleration', 'period');
        } else if (type === 'incline') {
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
    if (length !== null) given.length = length;
    if (radius !== null) given.radius = radius;
    if (acceleration !== null) given.acceleration = acceleration;
    if (initialVelocity !== null) given.initialVelocity = initialVelocity;
    if (finalVelocity !== null) given.finalVelocity = finalVelocity;
    given.gravity = gravity;
    
    const data = {
        type: type,
        given: given,
        deduced: {},
        required: required
    };
    
    // Calculate physics
    return calculatePhysics(data);
}

// Calculate physics based on problem type
function calculatePhysics(data) {
    const { type, given } = data;
    const g = given.gravity || 9.8;
    const deduced = {};
    
    if (type === 'uniform_acceleration') {
        const u = given.initialVelocity !== undefined ? given.initialVelocity : given.velocity || 0;
        const v = given.finalVelocity || null;
        const a = given.acceleration || 0;
        const t = given.time || null;
        const s = given.distance || null;
        
        // Use kinematic equations: v = u + at, s = ut + 0.5at², v² = u² + 2as
        
        // If we have u, a, t -> find v and s
        if (u !== null && a !== null && t !== null) {
            deduced.finalVelocity = u + a * t;
            deduced.distance = u * t + 0.5 * a * t * t;
            deduced.timeOfFlight = t;
        }
        // If we have u, a, s -> find v and t
        else if (u !== null && a !== null && s !== null) {
            const vSquared = u * u + 2 * a * s;
            deduced.finalVelocity = vSquared >= 0 ? Math.sqrt(vSquared) : 0;
            deduced.distance = s;
            if (a !== 0) {
                deduced.timeOfFlight = (deduced.finalVelocity - u) / a;
            } else {
                deduced.timeOfFlight = s / u;
            }
        }
        // If we have u, v, a -> find s and t
        else if (u !== null && v !== null && a !== null) {
            deduced.finalVelocity = v;
            if (a !== 0) {
                deduced.timeOfFlight = (v - u) / a;
                deduced.distance = u * deduced.timeOfFlight + 0.5 * a * deduced.timeOfFlight * deduced.timeOfFlight;
            } else {
                deduced.timeOfFlight = 0;
                deduced.distance = 0;
            }
        }
        // If we have u, v, s -> find a and t
        else if (u !== null && v !== null && s !== null) {
            if (s !== 0) {
                deduced.acceleration = (v * v - u * u) / (2 * s);
                deduced.timeOfFlight = (2 * s) / (u + v);
            }
            deduced.finalVelocity = v;
            deduced.distance = s;
        }
        // If we have u, v, t -> find a and s
        else if (u !== null && v !== null && t !== null) {
            if (t !== 0) {
                deduced.acceleration = (v - u) / t;
            }
            deduced.distance = (u + v) * t / 2;
            deduced.finalVelocity = v;
            deduced.timeOfFlight = t;
        }
        
        deduced.initialVelocity = u;
        if (deduced.acceleration === undefined) deduced.acceleration = a;
        
    } else if (type === 'circular') {
        const m = given.mass || 0;
        const v = given.velocity || 0;
        const r = given.radius || 1;
        
        console.log('Circular calc:', { m, v, r });
        
        // Validate inputs
        if (r <= 0) {
            return { error: true, message: 'Radius must be greater than zero.' };
        }
        if (v < 0) {
            return { error: true, message: 'Velocity cannot be negative.' };
        }
        if (m < 0) {
            return { error: true, message: 'Mass cannot be negative.' };
        }
        
        // If velocity not given, calculate max speed at top of hill
        if (v === 0 && r > 0) {
            console.log('Calculating max speed for radius:', r);
            deduced.maxSpeed = Math.sqrt(g * r);
            deduced.centripetalAcceleration = g;
            deduced.centripetalForce = m * g;
            console.log('Max speed:', deduced.maxSpeed);
        } else {
            deduced.centripetalAcceleration = (v * v) / r;
            deduced.centripetalForce = m * deduced.centripetalAcceleration;
            deduced.angularVelocity = v / r;
            deduced.period = v > 0 ? (2 * Math.PI * r) / v : 0;
            deduced.frequency = deduced.period > 0 ? 1 / deduced.period : 0;
        }
        
    } else if (type === 'pendulum') {
        const L = given.length || given.distance || given.radius || 1;
        const theta0 = (given.angle || 10) * Math.PI / 180;
        const m = given.mass || 0;
        
        if (L <= 0) {
            return { error: true, message: 'Pendulum length must be greater than zero.' };
        }
        
        deduced.period = 2 * Math.PI * Math.sqrt(L / g);
        deduced.frequency = 1 / deduced.period;
        deduced.maxHeight = L * (1 - Math.cos(theta0));
        deduced.maxVelocity = Math.sqrt(2 * g * deduced.maxHeight);
        
        if (m > 0) {
            deduced.potentialEnergy = m * g * deduced.maxHeight;
            deduced.kineticEnergy = 0.5 * m * deduced.maxVelocity * deduced.maxVelocity;
            deduced.totalEnergy = deduced.potentialEnergy;
        }
        
        deduced.amplitude = theta0 * 180 / Math.PI;
        deduced.length = L;
        
    } else if (type === 'incline') {
        const m = given.mass || 0;
        const theta = (given.angle || 30) * Math.PI / 180;
        const mu = given.friction || 0;
        const d = given.distance || 0;
        const v0 = given.velocity || 0;
        
        // Validate inputs
        if (m < 0) {
            return { error: true, message: 'Mass cannot be negative.' };
        }
        if (given.angle !== undefined && (given.angle < 0 || given.angle > 90)) {
            return { error: true, message: 'Incline angle must be between 0 and 90 degrees.' };
        }
        if (mu < 0 || mu > 1) {
            return { error: true, message: 'Friction coefficient must be between 0 and 1.' };
        }
        if (d < 0) {
            return { error: true, message: 'Distance cannot be negative.' };
        }
        
        // Forces
        deduced.normalForce = m * g * Math.cos(theta);
        deduced.frictionForce = mu * deduced.normalForce;
        deduced.parallelForce = m * g * Math.sin(theta);
        deduced.netForce = deduced.parallelForce - deduced.frictionForce;
        
        // Acceleration
        deduced.acceleration = m > 0 ? deduced.netForce / m : 0;
        
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
        const mu = given.friction || 0;
        const m = given.mass || 0;
        
        deduced.work = F * d;
        if (mu > 0 && m > 0) {
            const N = m * 9.8;
            deduced.frictionForce = mu * N;
            deduced.workByFriction = -deduced.frictionForce * d;
        }
        
    } else if (type === 'kinetic') {
        const m = given.mass || 0;
        const v = given.velocity || 0;
        
        if (m <= 0) {
            return { error: true, message: 'Kinetic energy requires mass greater than zero.' };
        }
        
        deduced.kineticEnergy = 0.5 * m * v * v;
        
    } else if (type === 'potential') {
        const m = given.mass || 0;
        const h = given.height || 0;
        
        if (m <= 0) {
            return { error: true, message: 'Potential energy requires mass greater than zero.' };
        }
        if (h < 0) {
            return { error: true, message: 'Height cannot be negative.' };
        }
        
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
        
        if (m <= 0) {
            return { error: true, message: 'Conservation of energy requires mass greater than zero.' };
        }
        
        deduced.potentialEnergy = m * g * h;
        deduced.kineticEnergy = 0.5 * m * v * v;
        deduced.totalEnergy = deduced.potentialEnergy + deduced.kineticEnergy;
        
        if (h > 0 && v === 0) {
            // Object at height, find velocity at ground
            deduced.finalVelocity = Math.sqrt(2 * g * h);
            deduced.finalKineticEnergy = m * g * h;
        } else if (v > 0 && h === 0) {
            // Object moving, find max height
            deduced.maxHeight = (v * v) / (2 * g);
            deduced.finalPotentialEnergy = 0.5 * m * v * v;
        }
        
    } else if (type === 'projectile') {
        let u = given.velocity || 0;
        const theta = (given.angle || 45) * Math.PI / 180;
        const h0 = given.height || 0;
        const t = given.time || 0;
        
        // If velocity not given but time to max height is given, calculate velocity
        if (u === 0 && t > 0) {
            // At max height, vertical velocity = 0, so: 0 = u*sin(theta) - g*t
            u = (g * t) / Math.sin(theta);
            deduced.initialVelocity = u;
        }
        
        if (u <= 0) {
            return { error: true, message: 'Projectile motion requires initial velocity or time to max height.' };
        }
        
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
        
        if (h < 0) {
            return { error: true, message: 'Height cannot be negative for freefall.' };
        }
        
        deduced.timeOfFlight = h > 0 ? Math.sqrt((2 * h) / g) : 0;
        deduced.maxHeight = h;
        deduced.range = 0;
        deduced.finalVelocity = h > 0 ? Math.sqrt(2 * g * h) : 0;
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
        
    } else if (type === 'distance') {
        // Simple distance/displacement calculation
        const d = given.distance || 0;
        deduced.totalDistance = d;
        deduced.distance = d;
    }
    
    data.deduced = deduced;
    return data;
}
