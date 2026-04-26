/**
 * Bias Detection Module
 * Scans JD and matching logic for potential biases (gendered language, ageism, etc.)
 */

const detectBias = (jdText) => {
    const biasedTerms = {
        gender: ["ninja", "rockstar", "guru", "manpower", "he/she"],
        age: ["recent graduate", "young", "energetic", "digital native"],
    };

    const foundBiases = [];
    
    Object.keys(biasedTerms).forEach(category => {
        biasedTerms[category].forEach(term => {
            if (jdText.toLowerCase().includes(term.toLowerCase())) {
                foundBiases.push({
                    category: category,
                    term: term,
                    suggestion: `Consider using more inclusive language instead of "${term}".`
                });
            }
        });
    });

    return foundBiases;
};

module.exports = { detectBias };
