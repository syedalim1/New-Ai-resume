"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2,
  XCircle,
  ListChecks,
  AlertTriangle,
  Info,
} from "lucide-react";
import type { AnalysisResult } from "./hire-view-dashboard";

interface ResultCardProps {
  result: AnalysisResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-accent"; // Green
    if (score >= 50) return "bg-yellow-500"; // Yellow (custom, not from theme for distinction)
    return "bg-destructive"; // Red
  };

  return (
    <Card className="shadow-lg flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {result.matchScore >= 75 ? (
            <CheckCircle2 className="h-6 w-6 text-accent" />
          ) : result.matchScore >= 50 ? (
            <Info className="h-6 w-6 text-yellow-500" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-destructive" />
          )}
          {result.candidateName}
        </CardTitle>
        <CardDescription>Match Score: {result.matchScore}%</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <Progress
            value={result.matchScore}
            className="h-3 [&>*]:rounded-full"
            indicatorClassName={getScoreColor(result.matchScore)}
          />
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="insights">
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              <Info className="h-4 w-4 mr-2 text-primary" /> AI Insights
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground p-2 bg-secondary/30 rounded-md">
              {result.insights}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="top-skills">
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              <ListChecks className="h-4 w-4 mr-2 text-accent" /> Top Skills
            </AccordionTrigger>
            <AccordionContent className="p-2 bg-secondary/30 rounded-md">
              {result.topSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.topSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-accent/20 text-accent-foreground hover:bg-accent/30"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No specific top skills identified.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="missing-skills">
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              <XCircle className="h-4 w-4 mr-2 text-destructive" /> Missing
              Skills
            </AccordionTrigger>
            <AccordionContent className="p-2 bg-secondary/30 rounded-md">
              {result.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="destructive"
                      className="bg-destructive/20 text-destructive-foreground hover:bg-destructive/30"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No critical missing skills identified.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">ID: {result.id}</p>
      </CardFooter>
    </Card>
  );
}
