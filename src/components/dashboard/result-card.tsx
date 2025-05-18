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
  Trophy,
  FileText,
  Briefcase,
  GraduationCap,
  BrainCircuit,
  Zap,
  Target,
  HelpCircle,
  Star,
} from "lucide-react";
import type { AnalysisResult } from "./hire-view-dashboard";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  result: AnalysisResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-accent"; // Green
    if (score >= 50) return "bg-yellow-500"; // Yellow (custom, not from theme for distinction)
    return "bg-destructive"; // Red
  };

  const getStatusIcon = () => {
    if (result.favorite) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (result.rejected)
      return <XCircle className="h-5 w-5 text-destructive" />;
    if (result.matchScore >= 75)
      return <CheckCircle2 className="h-5 w-5 text-accent" />;
    if (result.matchScore >= 50)
      return <Info className="h-5 w-5 text-yellow-500" />;
    return <AlertTriangle className="h-5 w-5 text-destructive" />;
  };

  const getStatusBadge = () => {
    if (result.rejected) {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (result.favorite || result.status === "shortlisted") {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">Shortlisted</Badge>
      );
    }
    if (result.status === "reviewed") {
      return (
        <Badge variant="outline" className="border-blue-400 text-blue-500">
          Reviewed
        </Badge>
      );
    }
    if (result.status === "pending") {
      return <Badge variant="secondary">Pending Review</Badge>;
    }
    // Fallback based on score if status is not explicitly set
    if (result.matchScore >= 75) {
      return <Badge variant="default">High Match</Badge>;
    }
    if (result.matchScore >= 50) {
      return <Badge variant="secondary">Medium Match</Badge>;
    }
    return <Badge variant="destructive">Low Match</Badge>;
  };

  return (
    <Card
      className={`shadow-lg flex flex-col h-full ${
        result.rejected
          ? "bg-destructive/5 border-destructive/40"
          : result.favorite
          ? "bg-yellow-500/5 border-yellow-500/40"
          : ""
      }`}
    >
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {getStatusIcon()}
          {result.candidateName}
        </CardTitle>
        <CardDescription className="flex flex-wrap justify-between items-center gap-2">
          <span>Match Score: {result.matchScore}%</span>
          <div className="flex gap-1 flex-wrap">
            {getStatusBadge()}
            {result.experienceLevel && (
              <Badge variant="outline" className="ml-2">
                {result.experienceLevel}
              </Badge>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <Progress
            value={result.matchScore}
            className={cn(
              "h-3 [&>*]:rounded-full",
              getScoreColor(result.matchScore)
            )}
          />
        </div>

        {/* Score Breakdown */}
        {(result.educationMatch !== undefined ||
          result.experienceMatch !== undefined ||
          result.skillsMatch !== undefined) && (
          <div className="grid grid-cols-3 gap-2 my-3">
            {result.educationMatch !== undefined && (
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  Education
                </div>
                <div className="flex justify-center">
                  <Badge
                    variant={
                      result.educationMatch >= 75
                        ? "default"
                        : result.educationMatch >= 50
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {result.educationMatch}%
                  </Badge>
                </div>
              </div>
            )}
            {result.experienceMatch !== undefined && (
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  Experience
                </div>
                <div className="flex justify-center">
                  <Badge
                    variant={
                      result.experienceMatch >= 75
                        ? "default"
                        : result.experienceMatch >= 50
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {result.experienceMatch}%
                  </Badge>
                </div>
              </div>
            )}
            {result.skillsMatch !== undefined && (
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Skills</div>
                <div className="flex justify-center">
                  <Badge
                    variant={
                      result.skillsMatch >= 75
                        ? "default"
                        : result.skillsMatch >= 50
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {result.skillsMatch}%
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

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

          {result.keyStrengths && result.keyStrengths.length > 0 && (
            <AccordionItem value="strengths">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <Star className="h-4 w-4 mr-2 text-yellow-500" /> Key Strengths
              </AccordionTrigger>
              <AccordionContent className="p-2 bg-secondary/30 rounded-md">
                <div className="flex flex-wrap gap-2">
                  {result.keyStrengths.map((strength, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-yellow-500/10 border-yellow-500/30 text-foreground"
                    >
                      {strength}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {result.developmentAreas && result.developmentAreas.length > 0 && (
            <AccordionItem value="development">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <Target className="h-4 w-4 mr-2 text-primary" /> Development
                Areas
              </AccordionTrigger>
              <AccordionContent className="p-2 bg-secondary/30 rounded-md">
                <div className="flex flex-wrap gap-2">
                  {result.developmentAreas.map((area, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-primary/30 bg-primary/10"
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {result.recommendedQuestions &&
            result.recommendedQuestions.length > 0 && (
              <AccordionItem value="questions">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  <HelpCircle className="h-4 w-4 mr-2 text-primary" />{" "}
                  Recommended Questions
                </AccordionTrigger>
                <AccordionContent className="p-2 bg-secondary/30 rounded-md">
                  <ul className="space-y-2 text-sm">
                    {result.recommendedQuestions.map((question, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="font-bold">{index + 1}.</span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}

          {result.detailedNotes && (
            <AccordionItem value="notes">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <FileText className="h-4 w-4 mr-2 text-primary" /> Review Notes
              </AccordionTrigger>
              <AccordionContent className="p-2 bg-secondary/30 rounded-md">
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {result.detailedNotes}
                </p>
              </AccordionContent>
            </AccordionItem>
          )}

          {result.rejected && result.rejectionReason && (
            <AccordionItem value="rejection">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <XCircle className="h-4 w-4 mr-2 text-destructive" /> Rejection
                Reason
              </AccordionTrigger>
              <AccordionContent className="p-2 bg-destructive/10 rounded-md">
                <p className="text-sm text-destructive-foreground">
                  {result.rejectionReason}
                </p>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          ID: {result.id.substring(0, 8)}
        </p>
        {result.reviewDate && (
          <p className="text-xs text-muted-foreground">
            {new Date(result.reviewDate).toLocaleDateString()}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
