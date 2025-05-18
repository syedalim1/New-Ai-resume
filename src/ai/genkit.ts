import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

// Default Gemini API key
const GEMINI_API_KEY = "AIzaSyAXP4kBBXRl6vgqsVYGXm9XNzAozjZnnt8";

// Create a function to get the API key that will work in both client and server contexts
// This will be called when making the API request, not just at initialization
const getApiKey = () => {
  // In the browser, check for the global variable first
  if (typeof window !== "undefined" && (window as any).__GEMINI_API_KEY) {
    return (window as any).__GEMINI_API_KEY;
  }

  // Then check environment variables
  if (process.env.GOOGLE_GEMINI_API_KEY) {
    return process.env.GOOGLE_GEMINI_API_KEY;
  }

  // Fall back to the default key
  return GEMINI_API_KEY;
};

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: getApiKey(),
    }),
  ],
  model: "googleai/gemini-2.5-flash-preview-04-17",
});
