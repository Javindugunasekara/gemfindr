import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateAiAnswer({ userMessage, contextText }) {
  const response = await client.responses.create({
    // pick a model you have access to (check OpenAI “models” page in your account)
    model: "gpt-5.2",
    input: [
      {
        role: "system",
        content:
          "You are GemFindr, a helpful gemstone assistant. " +
          "Answer ONLY using the provided context. " +
          "If context is insufficient, ask a follow-up question. " +
          "Keep answers clear and structured.",
      },
      {
        role: "user",
        content:
          `User question:\n${userMessage}\n\n` +
          `Context (from database):\n${contextText}\n\n` +
          `Now answer the user.`,
      },
    ],
  });

  return response.output_text || "No AI response.";
}
