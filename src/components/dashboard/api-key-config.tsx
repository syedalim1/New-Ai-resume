"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Key, Save, Check } from "lucide-react";

interface ApiKeyConfigProps {
  onKeySaved?: () => void;
}

export default function ApiKeyConfig({ onKeySaved }: ApiKeyConfigProps) {
  const [apiKey, setApiKey] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const { toast } = useToast();

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini-api-key");
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a Gemini API key.",
        variant: "destructive",
      });
      return;
    }

    try {
      localStorage.setItem("gemini-api-key", apiKey);
      setIsSaved(true);
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved successfully.",
      });

      // Call the callback if provided
      if (onKeySaved) {
        onKeySaved();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-md border border-border">
      <CardHeader className="bg-muted p-4 rounded-t-md">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-primary">
          <Key className="h-5 w-5" />
          Gemini API Configuration
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your Google Gemini API key to enable AI resume analysis
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm font-medium">
              Gemini API Key
            </Label>
            <div className="flex">
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="Enter your Gemini API key"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Get your key at{" "}
              <a
                href="https://ai.google.dev/gemini-api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 p-4 flex justify-end rounded-b-md border-t">
        <Button
          variant="default"
          onClick={handleSaveKey}
          className="flex items-center gap-2"
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save API Key
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
