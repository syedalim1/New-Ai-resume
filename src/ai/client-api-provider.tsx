"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";

interface ApiContextType {
  getApiKey: () => string;
}

// Default Gemini API key
const DEFAULT_GEMINI_API_KEY = "AIzaSyAXP4kBBXRl6vgqsVYGXm9XNzAozjZnnt8";

// Create context
const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider = ({ children }: { children: ReactNode }) => {
  const [apiKey, setApiKey] = useState<string>(DEFAULT_GEMINI_API_KEY);

  useEffect(() => {
    // Check for a custom API key in localStorage
    const storedApiKey = localStorage.getItem("gemini-api-key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }

    // Listen for changes to the API key
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "gemini-api-key") {
        setApiKey(e.newValue || DEFAULT_GEMINI_API_KEY);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("apiKeyUpdated", () => {
      const newKey = localStorage.getItem("gemini-api-key");
      setApiKey(newKey || DEFAULT_GEMINI_API_KEY);
    });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("apiKeyUpdated", () => {});
    };
  }, []);

  const getApiKey = () => apiKey;

  // Store API key in a global variable for server components to access
  if (typeof window !== "undefined") {
    (window as any).__GEMINI_API_KEY = apiKey;
  }

  return (
    <ApiContext.Provider value={{ getApiKey }}>{children}</ApiContext.Provider>
  );
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

// Function to get API key that can be imported by server components
export function getServerApiKey(): string {
  if (typeof window !== "undefined") {
    return (window as any).__GEMINI_API_KEY || DEFAULT_GEMINI_API_KEY;
  }
  return DEFAULT_GEMINI_API_KEY;
}
