import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir } from "fs/promises";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse";

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["application/pdf"];

// Default Gemini API key
const DEFAULT_GEMINI_API_KEY = "AIzaSyAXP4kBBXRl6vgqsVYGXm9XNzAozjZnnt8";

// PDF text extraction function using pdf-parse
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfData = await pdfParse(buffer);
    return pdfData.text || "";
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "";
  }
}

// Analyze resume using Gemini AI
async function analyzeResumeWithGemini(
  text: string,
  apiKey: string
): Promise<{
  skills: string[];
  experience: string;
  education: string;
}> {
  try {
    console.log("Initializing Gemini AI with API key...");
    // Initialize Gemini with the provided API key
    const genAI = new GoogleGenerativeAI(apiKey);

    // Define the prompt for Gemini
    const prompt = `
    You are an expert resume analyzer. Analyze the following resume text and extract the following information:
    1. Skills: Identify technical and soft skills mentioned in the resume. Return as a comma-separated list.
    2. Experience: Identify the years of experience and seniority level (e.g., Entry-level, Mid-level, Senior, Executive). 
    3. Education: Identify the highest level of education and field of study.

    Format your response exactly as follows, with no additional text:
    Skills: skill1, skill2, skill3
    Experience: X years (Level)
    Education: Degree in Field

    Resume text:
    ${text}
    `;

    console.log("Sending request to Gemini API...");
    // Generate content with Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-04-17",
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    console.log("Received response from Gemini API");

    // Parse the response
    const skillsMatch = responseText.includes("Skills:")
      ? responseText.split("Skills:")[1].split("Experience:")[0].trim()
      : "";
    const experienceMatch = responseText.includes("Experience:")
      ? responseText.split("Experience:")[1].split("Education:")[0].trim()
      : "";
    const educationMatch = responseText.includes("Education:")
      ? responseText.split("Education:")[1].trim()
      : "";

    const skills = skillsMatch
      ? skillsMatch
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : ["No skills detected"];

    const experience = experienceMatch
      ? experienceMatch
      : "Experience level unclear";

    const education = educationMatch ? educationMatch : "Education not found";

    return {
      skills,
      experience,
      education,
    };
  } catch (error) {
    console.error("Error analyzing resume with Gemini:", error);

    // Fallback to keyword analysis if Gemini fails
    return fallbackResumeAnalysis(text);
  }
}

// Fallback analysis using keyword matching (in case Gemini API fails)
function fallbackResumeAnalysis(text: string): {
  skills: string[];
  experience: string;
  education: string;
} {
  try {
    // Simple keyword-based analysis
    const skillKeywords = [
      "javascript",
      "python",
      "java",
      "c#",
      "c++",
      "react",
      "angular",
      "vue",
      "node.js",
      "express",
      "django",
      "flask",
      "spring",
      "asp.net",
      "sql",
      "mysql",
      "postgresql",
      "mongodb",
      "oracle",
      "firebase",
      "aws",
      "azure",
      "gcp",
      "docker",
      "kubernetes",
      "terraform",
      "git",
      "ci/cd",
      "jenkins",
      "github actions",
      "gitlab",
      "html",
      "css",
      "sass",
      "less",
      "bootstrap",
      "tailwind",
      "typescript",
      "redux",
      "graphql",
      "rest",
      "soap",
      "agile",
      "scrum",
      "kanban",
      "jira",
      "trello",
      "machine learning",
      "ai",
      "deep learning",
      "nlp",
      "computer vision",
      "data analysis",
      "pandas",
      "numpy",
      "tensorflow",
      "pytorch",
      "mobile",
      "ios",
      "android",
      "react native",
      "flutter",
      "swift",
    ];

    const text_lower = text.toLowerCase();
    const foundSkills = skillKeywords.filter((skill) =>
      text_lower.includes(skill.toLowerCase())
    );

    // Simple years of experience extraction
    const expRegex = /(\d+)\s*(?:years?|yrs?)\s+(?:of\s+)?experience/i;
    const expMatch = text.match(expRegex);
    let experience = "";

    if (expMatch && expMatch[1]) {
      const years = parseInt(expMatch[1]);
      const level =
        years <= 2
          ? "Entry-level"
          : years <= 5
          ? "Mid-level"
          : years <= 8
          ? "Senior"
          : "Executive";
      experience = `${years} years (${level})`;
    } else {
      // If we couldn't find a clear years of experience, make an estimate
      const seniorityKeywords = {
        junior: 0,
        senior: 0,
        lead: 0,
        manager: 0,
        director: 0,
        vp: 0,
        chief: 0,
        cto: 0,
        ceo: 0,
      };

      Object.keys(seniorityKeywords).forEach((key) => {
        const regex = new RegExp(key, "gi");
        const matches = text_lower.match(regex);
        if (matches) {
          seniorityKeywords[key as keyof typeof seniorityKeywords] =
            matches.length;
        }
      });

      // Determine seniority based on keyword frequency
      if (
        seniorityKeywords.ceo > 0 ||
        seniorityKeywords.cto > 0 ||
        seniorityKeywords.chief > 0
      ) {
        experience = "Executive level (10+ years estimated)";
      } else if (seniorityKeywords.vp > 0 || seniorityKeywords.director > 0) {
        experience = "Senior leadership (8+ years estimated)";
      } else if (seniorityKeywords.manager > 0 || seniorityKeywords.lead > 0) {
        experience = "Team leader (5-8 years estimated)";
      } else if (seniorityKeywords.senior > 0) {
        experience = "Senior (3-5 years estimated)";
      } else if (seniorityKeywords.junior > 0) {
        experience = "Junior (1-2 years estimated)";
      } else {
        experience = "Experience level unclear";
      }
    }

    // Education extraction
    const educationKeywords = [
      "bachelor",
      "master",
      "phd",
      "doctorate",
      "mba",
      "bs",
      "ba",
      "ms",
      "ma",
      "bsc",
      "msc",
      "b.s.",
      "m.s.",
      "computer science",
      "engineering",
      "information technology",
      "business",
      "management",
      "university",
      "college",
      "school",
    ];

    let education = "Unknown education";

    // Try to extract education information
    for (const keyword of educationKeywords) {
      const index = text_lower.indexOf(keyword.toLowerCase());
      if (index !== -1) {
        // Extract a chunk of text around the match to capture the full degree
        const start = Math.max(0, index - 30);
        const end = Math.min(text_lower.length, index + 70);
        const chunk = text.substring(start, end).replace(/\s+/g, " ").trim();

        // If we found something meaningful, use it
        if (chunk.length > keyword.length + 5) {
          education = chunk;
          break;
        }
      }
    }

    return {
      skills: foundSkills.length > 0 ? foundSkills : ["No skills detected"],
      experience,
      education,
    };
  } catch (error) {
    console.error("Error in fallback resume analysis:", error);
    return {
      skills: ["Error analyzing skills"],
      experience: "Error analyzing experience",
      education: "Error analyzing education",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("resumes") as File[];
    const clientApiKey = formData.get("apiKey") as string;

    // Use client API key if provided, otherwise use default
    const apiKey = clientApiKey || DEFAULT_GEMINI_API_KEY;

    console.log("API endpoint called - files received:", files.length);
    console.log(
      "Using API key:",
      apiKey ? "Key is configured" : "No API key available"
    );

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is required" },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate each file before processing
    const invalidFiles = files.filter(
      (file) =>
        !ALLOWED_FILE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE
    );

    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles.map((file) => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          return `${file.name}: Invalid file type`;
        } else if (file.size > MAX_FILE_SIZE) {
          return `${file.name}: File too large (max ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB)`;
        }
        return `${file.name}: Unknown error`;
      });

      return NextResponse.json(
        {
          error: "Invalid files",
          details: errorMessages,
        },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error("Error creating upload directory:", error);
    }

    console.log("Processing files...");
    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
          const filepath = path.join(uploadDir, filename);

          await writeFile(filepath, buffer);

          // Extract text from PDF
          console.log(`Extracting text from ${file.name}...`);
          const extractedText = await extractTextFromPDF(buffer);

          if (!extractedText) {
            return {
              fileName: file.name,
              status: "error" as const,
              message: "Failed to extract text from PDF",
            };
          }

          console.log(`Analyzing resume ${file.name} with Gemini...`);
          // Analyze the extracted text with Gemini AI, passing the API key
          const analysis = await analyzeResumeWithGemini(extractedText, apiKey);

          return {
            fileName: file.name,
            status: "success" as const,
            message: "Successfully analyzed resume with Gemini AI",
            skills: analysis.skills,
            experience: analysis.experience,
            education: analysis.education,
          };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return {
            fileName: file.name,
            status: "error" as const,
            message:
              error instanceof Error
                ? error.message
                : "Failed to process resume",
          };
        }
      })
    );

    console.log("All files processed. Returning results.");
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to upload files";
    return NextResponse.json(
      { error: "Failed to upload files", message: errorMessage },
      { status: 500 }
    );
  }
}
