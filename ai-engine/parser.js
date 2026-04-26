/**
 * JD Parser Module
 * Extracts skills, experience, and role from raw JD text.
 */

const parseJD = async (text) => {
    // In a real scenario, this would call an LLM (OpenAI)
    // For now, we simulate extraction with logic or simple regex/keyword matching
    // but the backend will call OpenAI if a key is provided.

    const skills_list = [
        "React", "Node.js", "Express", "MongoDB", "MySQL", "Python", "JavaScript", "TypeScript", 
        "AWS", "Docker", "Kubernetes", "Java", "Spring Boot", "Angular", "Vue", "SQL", "NoSQL",
        "C++", "C#", "PHP", "Laravel", "Django", "Flask", "Go", "Rust", "Terraform", "Jenkins",
        "PostgreSQL", "Redis", "GraphQL", "REST API", "Microservices", "Unit Testing", "DevOps"
    ];
    
    const extracted_skills = skills_list.filter(skill => 
        text.toLowerCase().includes(skill.toLowerCase())
    );

    const exp_match = text.match(/(\d+)\+?\s*(years|yr|years of experience)/i);
    const experience = exp_match ? `${exp_match[1]} years` : "Not specified";

    const roles = [
        "Frontend Developer", "Backend Developer", "Full Stack Developer", 
        "Software Engineer", "DevOps Engineer", "Data Scientist", "Data Engineer",
        "Mobile Developer", "QA Engineer", "Product Manager", "UI/UX Designer"
    ];
    const role = roles.find(r => text.toLowerCase().includes(r.toLowerCase())) || "Software Engineer";

    return {
        skills: extracted_skills,
        experience: experience,
        role: role
    };
};

module.exports = { parseJD };
