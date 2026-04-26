/**
 * Conversational Engagement Agent (Simulated)
 */

const simulateChatInteraction = (candidate, messages) => {
    const signals = [];
    let interest_score = 0;
    let response = "";

    const lastMsg = messages[messages.length - 1].text.toLowerCase();

    if (lastMsg.includes("hi") || lastMsg.includes("hello")) {
        response = `Hello ${candidate.name}! I'm the TalentScout AI. Are you open to new opportunities?`;
    } else if (lastMsg.includes("open") || lastMsg.includes("interested")) {
        signals.push("open_to_switch");
        interest_score += 40;
        response = "That's great! What kind of roles or technologies are you most excited about right now?";
    } else if (lastMsg.includes("salary") || lastMsg.includes("pay")) {
        signals.push("negotiable_salary");
        interest_score += 20;
        response = "We can certainly discuss compensation. Do you have a range in mind, or should we talk about the role first?";
    } else if (lastMsg.includes("remote") || lastMsg.includes("flexible")) {
        signals.push("prefers_remote");
        interest_score += 20;
        response = "This role offers significant flexibility. How important is a remote-first environment to you?";
    } else if (lastMsg.includes("details") || lastMsg.includes("test") || lastMsg.includes("process")) {
        response = "The process usually involves a technical screen and a chat with the team. Would you like to schedule a call?";
    } else {
        response = "I see. Could you tell me more about your recent projects and what you're looking for next?";
    }

    if (interest_score === 0) interest_score = 50; // Neutral base

    return {
        interest_score: interest_score,
        signals: signals,
        response: response
    };
};

module.exports = { simulateChatInteraction };
