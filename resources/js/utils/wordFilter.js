/**
 * Nexa Word Filter
 * Daftar kata-kata terlarang dalam percakapan.
 * Kata-kata ini dicocokkan secara case-insensitive dan mengabaikan spasi/tanda baca di dalamnya.
 */

const BANNED_WORDS = [
    // Alat kelamin & seksual
    'memek', 'kontol', 'penis', 'vagina', 'titit', 'titit', 'toket',
    'ngentot', 'entot', 'ngentotin', 'ewe', 'ewean', 'nyepong', 'sepong',
    'jembut', 'colmek', 'coli', 'ngocok', 'bokep', 'porno', 'seks bebas',
    'cabul', 'mesum', 'birahi', 'nafsu bejat', 'ml', 'making love',
    // Kata kasar umum
    'anjing', 'babi', 'bangsat', 'bajingan', 'keparat', 'brengsek',
    'kampret', 'goblok', 'tolol', 'idiot', 'bodoh', 'dungu', 'asu',
    'sialan', 'bedebah', 'celeng', 'tai', 'tahi', 'setan', 'iblis',
    'laknat', 'terkutuk', 'jahanam',
    // Rasis / SARA
    'negro', 'nigga', 'nigger', 'cina goblok', 'china babi', 'kafir',
    'pribumi', 'anti islam', 'anti kristen', 'anti hindu', 'anti buddha',
    // Bahasa Inggris kasar
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick',
    'pussy', 'whore', 'slut', 'motherfucker', 'faggot', 'retard',
    // Variasi umum (leet-speak sederhana)
    'f4ck', 'f**k', 'sh1t', 'b1tch', 'a55',
];

/**
 * Normalizes a string to detect obfuscation tricks.
 * e.g. "k o n t o l", "k*nt*l", "k0nt0l" → "kontol"
 */
function normalize(text) {
    return text
        .toLowerCase()
        .replace(/0/g, 'o')
        .replace(/1/g, 'i')
        .replace(/3/g, 'e')
        .replace(/4/g, 'a')
        .replace(/5/g, 's')
        .replace(/[^a-z]/g, ''); // strip all non-alpha chars
}

/**
 * Returns true if text contains any banned word.
 * @param {string} text
 * @returns {boolean}
 */
export function containsBannedWord(text) {
    if (!text) return false;
    const normalizedText = normalize(text);
    return BANNED_WORDS.some((word) => normalizedText.includes(normalize(word)));
}

/**
 * Returns the first banned word found in the text, or null.
 * @param {string} text
 * @returns {string|null}
 */
export function findBannedWord(text) {
    if (!text) return null;
    const normalizedText = normalize(text);
    return BANNED_WORDS.find((word) => normalizedText.includes(normalize(word))) ?? null;
}
