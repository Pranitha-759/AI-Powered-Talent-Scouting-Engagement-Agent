/**
 * Candidate Matching Engine
 * Computes Match Score based on skills, experience, and semantic similarity.
 */

const calculateMatchScore = (jd, candidate) => {
    // 1. Skill Overlap (40%)
    const jdSkills = jd.skills.map(s => s.toLowerCase());
    const candidateSkills = candidate.skills.map(s => s.toLowerCase());
    
    const overlap = jdSkills.filter(skill => candidateSkills.includes(skill));
    const skillScore = (overlap.length / jdSkills.length) * 100 || 0;

    // 2. Experience Match (30%)
    const jdExp = parseInt(jd.experience) || 0;
    const candExp = candidate.experience || 0;
    let expScore = 0;
    if (candExp >= jdExp) expScore = 100;
    else if (candExp >= jdExp * 0.7) expScore = 70;
    else expScore = 40;

    // 3. Semantic Similarity (30%) - Simulated dynamic score
    // Higher if the candidate has projects or high experience
    const semanticScore = candidate.projects ? Math.min(70 + (candidate.projects.length * 5), 95) : 60;

    const totalScore = (skillScore * 0.4) + (expScore * 0.3) + (semanticScore * 0.3);

    const missingSkills = jdSkills.filter(skill => !candidateSkills.includes(skill));
    
    let reason = "";
    if (totalScore > 80) {
        reason = `Top tier match! Expert in ${overlap.slice(0, 3).join(", ")} with a solid background in ${candidate.projects?.join(", ") || 'relevant projects'}.`;
    } else if (totalScore > 60) {
        reason = `Strong fit. Good coverage of ${overlap.join(", ")}. Could improve on ${missingSkills.slice(0, 2).join(", ") || 'niche skills'}.`;
    } else if (totalScore > 40) {
        reason = `Potential match. Has core skills in ${overlap.join(", ")}, but lacks experience in ${missingSkills.slice(0, 3).join(", ")}.`;
    } else {
        reason = `Limited match. Focuses more on ${candidateSkills.slice(0, 3).join(", ")} which doesn't align closely with this JD.`;
    }

    return {
        match_score: Math.round(totalScore),
        reason: reason
    };
};

module.exports = { calculateMatchScore };
