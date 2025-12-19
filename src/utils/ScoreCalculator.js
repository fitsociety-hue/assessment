/**
 * Score Calculator Logic
 * Calculates final scores based on weights and inputs.
 */

export const ScoreCalculator = {
    /**
     * Calculate Weighted Score
     * @param {string} role - 'secgen', 'leader', 'member'
     * @param {object} scores - { self: 80, peer: 85, manager: 90, subordinate: 0 }
     * @param {object} weights - { self: 20, peer: 30, manager: 50, subordinate: 0 }
     * @returns {number} Final Weighted Score
     */
    calculateFinalScore: (role, scores, weights) => {
        let totalScore = 0;
        let totalWeight = 0;

        // Iterate through keys: self, peer, manager, subordinate
        ['self', 'peer', 'manager', 'subordinate'].forEach(key => {
            if (weights[key] > 0) {
                const score = scores[key] || 0;
                totalScore += score * (weights[key] / 100);
                totalWeight += weights[key];
            }
        });

        // Normalize if weights don't sum to 100 (optional safeguard)
        if (totalWeight > 0 && totalWeight !== 100) {
            totalScore = (totalScore / totalWeight) * 100;
        }

        return parseFloat(totalScore.toFixed(2));
    },

    /**
     * Map Grade to Score
     * S -> 100, A -> 90, B -> 80, C -> 70, D -> 60
     */
    gradeToScore: (grade) => {
        const mapping = {
            'S': 100,
            'A': 90,
            'B': 80,
            'C': 70,
            'D': 60
        };
        // Handle input like "S (최우수)" -> extract S
        const firstChar = grade.charAt(0).toUpperCase();
        return mapping[firstChar] || 0;
    }
};
