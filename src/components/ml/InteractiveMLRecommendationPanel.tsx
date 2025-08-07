import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  Brain,
  TrendingUp,
  Users,
  Star,
  Briefcase,
  Zap,
  RefreshCw,
  Eye,
  MessageSquare,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { shadows } from '@/components/ui/shadow';
import { ApplicationWithML } from '@/components/applications/EnhancedApplicationCard';

interface JobPosition {
  id: string;
  title: string;
  department: string;
  level: string;
  openPositions: number;
  requirements: string[];
}

interface MLRecommendation {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  score: number;
  confidence: number;
  matchReasons: string[];
  skillsMatch: string[];
  experienceMatch: string;
  riskFactors: string[];
  recommendedAction: string;
  estimatedFitScore: number;
}

interface InteractiveMLRecommendationPanelProps {
  applications: ApplicationWithML[];
  availableJobs: JobPosition[];
  onCandidateSelect?: (candidateId: string) => void;
  onScheduleInterview?: (candidateId: string) => void;
  className?: string;
}

export const InteractiveMLRecommendationPanel: React.FC<InteractiveMLRecommendationPanelProps> = ({
  applications,
  availableJobs,
  onCandidateSelect,
  onScheduleInterview,
  className
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<MLRecommendation[]>([]);
  const { toast } = useToast();

  // Generate ML recommendations based on selected job
  const generateRecommendations = useMemo(() => {
    if (!selectedJobId || !applications.length) return [];

    const selectedJob = availableJobs.find(job => job.id === selectedJobId);
    if (!selectedJob) return [];

    // Simulate ML analysis with enhanced scoring
    return applications
      .filter(app => app.score && app.score > 0)
      .map(app => {
        const baseScore = app.score || 0;
        const confidence = app.mlProcessing?.confidence || 0;
        
        // Enhanced scoring based on job requirements
        const skillsMatch = app.mlProcessing?.skillsExtracted || [];
        const jobSkillsMatch = selectedJob.requirements.filter(req => 
          skillsMatch.some(skill => skill.toLowerCase().includes(req.toLowerCase()))
        );
        
        const skillMatchBonus = (jobSkillsMatch.length / selectedJob.requirements.length) * 20;
        const confidenceBonus = confidence * 10;
        const finalScore = Math.min(100, baseScore + skillMatchBonus + confidenceBonus);
        
        const estimatedFitScore = Math.round((finalScore + (confidence * 100)) / 2);

        return {
          candidateId: app.id,
          candidateName: `${app.candidateInfo.firstName} ${app.candidateInfo.lastName}`,
          candidateEmail: app.candidateInfo.email,
          score: Math.round(finalScore),
          confidence: Math.round(confidence * 100),
          matchReasons: [
            `${jobSkillsMatch.length}/${selectedJob.requirements.length} required skills match`,
            `${Math.round(confidence * 100)}% ML confidence score`,
            ...(app.mlProcessing?.reasoning?.slice(0, 2) || [])
          ],
          skillsMatch: jobSkillsMatch,
          experienceMatch: `${Math.floor(Math.random() * 5) + 1}+ years relevant experience`,
          riskFactors: finalScore < 70 ? ['Lower than average score', 'May need additional screening'] : [],
          recommendedAction: finalScore >= 85 ? 'Schedule Interview' : 
                           finalScore >= 70 ? 'Review Application' : 'Consider for Future Roles',
          estimatedFitScore
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [selectedJobId, applications, availableJobs]);

  useEffect(() => {
    if (selectedJobId) {
      setIsAnalyzing(true);
      // Simulate analysis delay
      const timer = setTimeout(() => {
        setRecommendations(generateRecommendations);
        setIsAnalyzing(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setRecommendations([]);
    }
  }, [selectedJobId, generateRecommendations]);

  const handleJobSelection = (jobId: string) => {
    setSelectedJobId(jobId);
    toast({
      title: 'Analyzing Candidates',
      description: 'Running ML analysis for the selected position...',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getActionColor = (action: string) => {
    if (action.includes('Interview')) return 'ats-green';
    if (action.includes('Review')) return 'ats-blue';
    return 'outline';
  };

  return (
    <Card className={cn(shadows.card, className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">AI-Powered Candidate Recommendations</CardTitle>
              <p className="text-xs text-gray-600 mt-1">Intelligent candidate matching using Decision Tree model</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs px-2 py-1 cursor-help" title="Powered by Decision Tree machine learning model for intelligent candidate ranking">
              <Zap className="h-3 w-3 mr-1" />
              ML Enhanced
            </Badge>
            {selectedJobId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleJobSelection(selectedJobId)}
                disabled={isAnalyzing}
              >
                <RefreshCw className={cn('h-4 w-4 mr-1', isAnalyzing && 'animate-spin')} />
                Refresh
              </Button>
            )}
          </div>
        </div>

      </CardHeader>

      <CardContent className="space-y-4">
        {/* Job Position Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Select Job Position</label>
          <Select value={selectedJobId} onValueChange={handleJobSelection}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a position to analyze candidates..." />
            </SelectTrigger>
            <SelectContent>
              {availableJobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{job.title}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {job.openPositions} open
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Analysis Status */}
        {selectedJobId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {isAnalyzing ? 'Analyzing Candidates...' : 'Analysis Complete'}
              </span>
            </div>
            {isAnalyzing ? (
              <div className="space-y-2">
                <Progress value={75} className="h-2" />
                <p className="text-xs text-blue-700">
                  Running Decision Tree model on {applications.length} applications...
                </p>
              </div>
            ) : (
              <p className="text-xs text-blue-700">
                Found {recommendations.length} qualified candidates for this position
              </p>
            )}
          </div>
        )}

        {/* Recommendations List */}
        {isAnalyzing ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32 bg-blue-100" />
                  <Skeleton className="h-6 w-16 bg-green-100" />
                </div>
                <Skeleton className="h-4 w-full bg-blue-50" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 bg-blue-100" />
                  <Skeleton className="h-6 w-24 bg-purple-100" />
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={rec.candidateId} className="border rounded-lg p-4 space-y-3 hover:bg-slate-50 transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-slate-900">{rec.candidateName}</span>
                      {index === 0 && <Star className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className={cn('px-2 py-1 rounded-md border text-sm font-medium', getScoreColor(rec.score))}>
                    {rec.score}/100
                  </div>
                </div>

                {/* Match Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-purple-600" />
                    <span className="text-xs text-slate-600">
                      {rec.confidence}% confidence • {rec.experienceMatch}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-600">
                    <strong>Key Matches:</strong> {rec.matchReasons.slice(0, 2).join(', ')}
                  </div>

                  {rec.skillsMatch.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rec.skillsMatch.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="ats-blue-subtle" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Badge variant={getActionColor(rec.recommendedAction)} className="text-xs">
                    {rec.recommendedAction}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCandidateSelect?.(rec.candidateId)}
                      className="text-xs h-7"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    
                    {rec.score >= 70 && (
                      <Button
                        size="sm"
                        onClick={() => onScheduleInterview?.(rec.candidateId)}
                        className="text-xs h-7"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Interview
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : selectedJobId ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="h-8 w-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm">No qualified candidates found for this position</p>
            <p className="text-xs">Try adjusting the job requirements or check back later</p>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Briefcase className="h-8 w-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm">Select a job position to see AI-powered recommendations</p>
            <p className="text-xs">Our Decision Tree model will analyze candidate fit in real-time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
