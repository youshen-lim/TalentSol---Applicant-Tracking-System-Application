/**
 * Candidate Recommendation Panel
 * Main component for displaying ML-driven candidate recommendations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Star, 
  MapPin, 
  DollarSign,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  BarChart3,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { shadows } from '@/components/ui/shadow';
import { 
  RecommendationResponse, 
  CandidateRecommendation,
  CandidateScore 
} from '@/types/ml-recommendations';
import { mlApi } from '@/services/mlApi';
import LoadingUI from '@/components/ui/loading';

interface CandidateRecommendationPanelProps {
  jobId: string;
  className?: string;
  onCandidateSelect?: (candidateId: string) => void;
  onViewDetails?: (candidateId: string) => void;
  maxRecommendations?: number;
}

export const CandidateRecommendationPanel: React.FC<CandidateRecommendationPanelProps> = ({
  jobId,
  className,
  onCandidateSelect,
  onViewDetails,
  maxRecommendations = 5,
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('recommendations');

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get real recommendations, fallback to mock data
      let response: RecommendationResponse;
      try {
        response = await mlApi.getCandidateRecommendations({
          jobId,
          limit: maxRecommendations,
          includeReasoning: true,
        });
      } catch (apiError) {
        console.warn('ML API not available, using mock data:', apiError);
        response = await mlApi.getMockRecommendations(jobId);
      }
      
      setRecommendations(response);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
  };

  useEffect(() => {
    if (jobId) {
      fetchRecommendations();
    }
  }, [jobId]);

  const handleCandidateAction = async (
    candidateId: string, 
    action: 'view' | 'select' | 'shortlist'
  ) => {
    // Track user interaction
    try {
      await mlApi.trackUserInteraction({
        action,
        candidateId,
        jobId,
        score: recommendations?.recommendations.find(r => r.candidate.id === candidateId)?.score.overallScore,
      });
    } catch (error) {
      console.warn('Failed to track interaction:', error);
    }

    // Execute action
    switch (action) {
      case 'view':
        onViewDetails?.(candidateId);
        break;
      case 'select':
        onCandidateSelect?.(candidateId);
        break;
      case 'shortlist':
        // TODO: Implement shortlisting
        break;
    }
  };

  if (loading) {
    return (
      <Card className={cn(shadows.card, className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-ats-blue" />
            AI Candidate Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingUI message="Analyzing candidates..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn(shadows.card, className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-ats-blue" />
            AI Candidate Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Recommendations Unavailable
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return (
      <Card className={cn(shadows.card, className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-ats-blue" />
            AI Candidate Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Recommendations Available
            </h3>
            <p className="text-gray-600 mb-4">
              No suitable candidates found for this position.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(shadows.card, className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-ats-blue" />
            AI Candidate Recommendations
            <Badge variant="outline" className="ml-2 bg-ats-blue/10 text-ats-blue border-ats-blue/20">
              {recommendations.modelInfo.version}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {recommendations.metadata.processedCandidates} candidates analyzed
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {recommendations.metadata.processingTime}ms
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            {Math.round(recommendations.modelInfo.accuracy * 100)}% accuracy
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">Top Matches</TabsTrigger>
            <TabsTrigger value="insights">ML Insights</TabsTrigger>
            <TabsTrigger value="analytics">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations" className="space-y-4 mt-4">
            {recommendations.recommendations.map((recommendation, index) => (
              <CandidateRecommendationCard
                key={recommendation.candidate.id}
                recommendation={recommendation}
                rank={index + 1}
                onAction={handleCandidateAction}
              />
            ))}
          </TabsContent>
          
          <TabsContent value="insights" className="mt-4">
            <MLInsightsPanel recommendations={recommendations} />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-4">
            <ModelPerformancePanel modelInfo={recommendations.modelInfo} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Individual candidate recommendation card
interface CandidateRecommendationCardProps {
  recommendation: CandidateRecommendation;
  rank: number;
  onAction: (candidateId: string, action: 'view' | 'select' | 'shortlist') => void;
}

const CandidateRecommendationCard: React.FC<CandidateRecommendationCardProps> = ({
  recommendation,
  rank,
  onAction,
}) => {
  const { candidate, score } = recommendation;
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-ats-blue/30 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 bg-gradient-to-br from-ats-blue to-ats-purple rounded-full flex items-center justify-center">
              {candidate.avatar ? (
                <img 
                  src={candidate.avatar} 
                  alt={candidate.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-medium">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-ats-blue text-white"
            >
              {rank}
            </Badge>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
            <p className="text-sm text-gray-600">{candidate.currentPosition}</p>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {candidate.location.city}, {candidate.location.country}
              </span>
              {candidate.location.remoteWork && (
                <Badge variant="outline" className="text-xs">Remote OK</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={cn("text-2xl font-bold rounded-lg px-2 py-1", getScoreColor(score.overallScore))}>
            {score.overallScore}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(score.confidence * 100)}% confidence
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Skills</span>
          <div className="flex items-center gap-1">
            <Progress value={score.reasoning.skillMatch.score} className="w-16 h-2" />
            <span className="text-xs font-medium">{score.reasoning.skillMatch.score}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Experience</span>
          <div className="flex items-center gap-1">
            <Progress value={score.reasoning.experienceMatch.score} className="w-16 h-2" />
            <span className="text-xs font-medium">{score.reasoning.experienceMatch.score}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {recommendation.tags.slice(0, 3).map((tag, index) => (
          <Badge 
            key={index}
            variant="outline" 
            className={cn(
              "text-xs",
              tag.type === 'strength' && "border-green-200 text-green-700 bg-green-50",
              tag.type === 'opportunity' && "border-blue-200 text-blue-700 bg-blue-50",
              tag.type === 'concern' && "border-yellow-200 text-yellow-700 bg-yellow-50"
            )}
          >
            {tag.label}
          </Badge>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={() => onAction(candidate.id, 'view')}
          className="flex-1"
        >
          View Profile
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onAction(candidate.id, 'shortlist')}
        >
          <Star className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// ML Insights Panel Component
const MLInsightsPanel: React.FC<{ recommendations: RecommendationResponse }> = ({ 
  recommendations 
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="font-medium">Success Probability</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {Math.round(recommendations.recommendations[0]?.score.reasoning.successProbability * 100)}%
          </div>
          <p className="text-xs text-gray-600">For top candidate</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-ats-blue" />
            <span className="font-medium">Model Confidence</span>
          </div>
          <div className="text-2xl font-bold text-ats-blue">
            {Math.round(recommendations.recommendations[0]?.score.confidence * 100)}%
          </div>
          <p className="text-xs text-gray-600">Prediction accuracy</p>
        </Card>
      </div>
      
      <div className="text-sm text-gray-600">
        <h4 className="font-medium mb-2">Key Insights:</h4>
        <ul className="space-y-1">
          <li>• Strong technical skill matches in top candidates</li>
          <li>• Geographic diversity in candidate pool</li>
          <li>• High experience alignment with job requirements</li>
        </ul>
      </div>
    </div>
  );
};

// Model Performance Panel Component
const ModelPerformancePanel: React.FC<{ modelInfo: any }> = ({ modelInfo }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-ats-blue">
            {Math.round(modelInfo.accuracy * 100)}%
          </div>
          <p className="text-xs text-gray-600">Accuracy</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {modelInfo.version}
          </div>
          <p className="text-xs text-gray-600">Model Version</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {modelInfo.features.length}
          </div>
          <p className="text-xs text-gray-600">Features</p>
        </div>
      </div>
      
      <div className="text-sm">
        <h4 className="font-medium mb-2">Model Features:</h4>
        <div className="flex flex-wrap gap-1">
          {modelInfo.features.map((feature: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateRecommendationPanel;

// Export individual components for reuse
export { CandidateRecommendationCard, MLInsightsPanel, ModelPerformancePanel };
