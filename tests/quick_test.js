// Quick test of parser
const text = "A ball is dropped from 50 m";

// Simulate the parsing
const normalized = text.toLowerCase()
    .replace('released from rest', 'dropped from rest')
    .replace('allowed to fall', 'dropped')
    .replace('let go', 'dropped')
    .replace('falls freely', 'dropped');

console.log("Original:", text);
console.log("Normalized:", normalized);
console.log("Has 'dropped':", normalized.includes('dropped'));
console.log("Has '50':", /50/.test(normalized));
console.log("Has 'm':", /\d+\s*m/.test(normalized));
