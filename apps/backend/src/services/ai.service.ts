// D:\Project\ai-interview-tracker\apps\backend\src\services\ai.service.ts

import axios from "axios";

export const askGroq = async (prompt: string) => {
  try {
    if (!prompt) {
      throw new Error("Prompt is empty");
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error("🔥 GROQ ERROR:", error.response?.data || error.message);
    throw new Error("AI request failed");
  }
};