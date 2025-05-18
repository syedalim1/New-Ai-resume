"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalysisResult } from "./hire-view-dashboard";

interface ComparisonViewProps {
  compareResults: AnalysisResult[];
}

export default function ComparisonView({
  compareResults,
}: ComparisonViewProps) {
  if (compareResults.length !== 2) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Resume Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <p>Select 2 resumes to compare them side by side.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Resume Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div></div>
          {compareResults.map((result) => (
            <div key={result.id} className="text-center">
              <h3 className="font-bold">{result.candidateName}</h3>
              <Badge
                className={
                  result.matchScore >= 75
                    ? "bg-accent"
                    : result.matchScore >= 50
                    ? "bg-yellow-500"
                    : "bg-destructive"
                }
              >
                {result.matchScore}% Match
              </Badge>
              {result.experienceLevel && (
                <Badge variant="outline" className="ml-2">
                  {result.experienceLevel}
                </Badge>
              )}
            </div>
          ))}

          <div className="font-medium">Overall Match</div>
          {compareResults.map((result) => (
            <div key={`score-${result.id}`} className="text-center">
              <span
                className={`font-bold ${
                  result.matchScore >= 75
                    ? "text-accent"
                    : result.matchScore >= 50
                    ? "text-yellow-500"
                    : "text-destructive"
                }`}
              >
                {result.matchScore}%
              </span>
            </div>
          ))}

          {compareResults.some((r) => r.educationMatch !== undefined) && (
            <>
              <div className="font-medium">Education</div>
              {compareResults.map((result) => (
                <div key={`education-${result.id}`} className="text-center">
                  <span
                    className={`font-bold ${
                      result.educationMatch && result.educationMatch >= 75
                        ? "text-accent"
                        : result.educationMatch && result.educationMatch >= 50
                        ? "text-yellow-500"
                        : "text-destructive"
                    }`}
                  >
                    {result.educationMatch !== undefined
                      ? `${result.educationMatch}%`
                      : "N/A"}
                  </span>
                </div>
              ))}
            </>
          )}

          {compareResults.some((r) => r.experienceMatch !== undefined) && (
            <>
              <div className="font-medium">Experience</div>
              {compareResults.map((result) => (
                <div key={`experience-${result.id}`} className="text-center">
                  <span
                    className={`font-bold ${
                      result.experienceMatch && result.experienceMatch >= 75
                        ? "text-accent"
                        : result.experienceMatch && result.experienceMatch >= 50
                        ? "text-yellow-500"
                        : "text-destructive"
                    }`}
                  >
                    {result.experienceMatch !== undefined
                      ? `${result.experienceMatch}%`
                      : "N/A"}
                  </span>
                </div>
              ))}
            </>
          )}

          {compareResults.some((r) => r.skillsMatch !== undefined) && (
            <>
              <div className="font-medium">Skills</div>
              {compareResults.map((result) => (
                <div key={`skills-match-${result.id}`} className="text-center">
                  <span
                    className={`font-bold ${
                      result.skillsMatch && result.skillsMatch >= 75
                        ? "text-accent"
                        : result.skillsMatch && result.skillsMatch >= 50
                        ? "text-yellow-500"
                        : "text-destructive"
                    }`}
                  >
                    {result.skillsMatch !== undefined
                      ? `${result.skillsMatch}%`
                      : "N/A"}
                  </span>
                </div>
              ))}
            </>
          )}

          <div className="font-medium">Top Skills</div>
          {compareResults.map((result) => (
            <div
              key={`skills-${result.id}`}
              className="flex flex-wrap gap-1 justify-center"
            >
              {result.topSkills.map((skill, i) => (
                <Badge key={i} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          ))}

          <div className="font-medium">Missing Skills</div>
          {compareResults.map((result) => (
            <div
              key={`missing-${result.id}`}
              className="flex flex-wrap gap-1 justify-center"
            >
              {result.missingSkills.map((skill, i) => (
                <Badge key={i} variant="destructive">
                  {skill}
                </Badge>
              ))}
            </div>
          ))}

          {compareResults.some(
            (r) => r.keyStrengths && r.keyStrengths.length > 0
          ) && (
            <>
              <div className="font-medium">Key Strengths</div>
              {compareResults.map((result) => (
                <div
                  key={`strengths-${result.id}`}
                  className="flex flex-wrap gap-1 justify-center"
                >
                  {result.keyStrengths?.map((strength, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="bg-yellow-500/10 border-yellow-500/30"
                    >
                      {strength}
                    </Badge>
                  )) || (
                    <span className="text-sm text-muted-foreground">
                      None identified
                    </span>
                  )}
                </div>
              ))}
            </>
          )}

          {compareResults.some(
            (r) => r.developmentAreas && r.developmentAreas.length > 0
          ) && (
            <>
              <div className="font-medium">Development Areas</div>
              {compareResults.map((result) => (
                <div
                  key={`development-${result.id}`}
                  className="flex flex-wrap gap-1 justify-center"
                >
                  {result.developmentAreas?.map((area, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="border-primary/30 bg-primary/10"
                    >
                      {area}
                    </Badge>
                  )) || (
                    <span className="text-sm text-muted-foreground">
                      None identified
                    </span>
                  )}
                </div>
              ))}
            </>
          )}

          <div className="font-medium">Insights</div>
          {compareResults.map((result) => (
            <div
              key={`insight-${result.id}`}
              className="text-sm text-muted-foreground"
            >
              {result.insights}
            </div>
          ))}

          <div className="font-medium">Notes</div>
          {compareResults.map((result) => (
            <div key={`notes-${result.id}`} className="text-sm">
              {result.detailedNotes || "No detailed notes available"}
            </div>
          ))}

          <div className="font-medium">Status</div>
          {compareResults.map((result) => (
            <div key={`status-${result.id}`}>
              <Badge
                variant={
                  result.status === "shortlisted"
                    ? "default"
                    : result.status === "rejected"
                    ? "destructive"
                    : "outline"
                }
              >
                {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
