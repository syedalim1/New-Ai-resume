"use server";

import { cookies } from "next/headers";

// Default Gemini API key
const DEFAULT_API_KEY = "AIzaSyAXP4kBBXRl6vgqsVYGXm9XNzAozjZnnt8";

// Function to set API key in cookies
export async function setApiKey(key: string) {
  cookies().set("gemini-api-key", key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

// Function to get API key from cookies
export async function getApiKey(): Promise<string> {
  const apiKey = cookies().get("gemini-api-key")?.value;
  return apiKey || DEFAULT_API_KEY;
}

// Function to clear API key
export async function clearApiKey() {
  cookies().delete("gemini-api-key");
}
