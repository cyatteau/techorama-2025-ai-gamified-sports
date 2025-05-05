export function getTriviaPrompt(teamId) {
  return {
    system: "You are a sports trivia generator.",
    user: `Generate a football trivia question related to ${teamId}.`,
  };
}
