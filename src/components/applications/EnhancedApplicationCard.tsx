import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Mail,
  Phone,
  Clock,
  Star,
  Brain,
  ChevronDown,
  ChevronUp,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Eye,
  MessageSquare,
  Calendar,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { shadows } from '@/components/ui/shadow';
import { MLProcessingStatus, MLStatusIndicator } from '@/components/ml/MLProcessingStatus';

export interface ApplicationWithML {
  id: string;
  candidateInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
  };
  jobTitle: string;
  status: string;
  submittedAt: string;
  score?: number;
  mlProcessing?: {
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'not_started';
    confidence?: number;
    reasoning?: string[];
    skillsExtracted?: Array<{
      skill: string;
      confidence: number;
      category: 'technical' | 'soft' | 'domain';
    }>;
    recommendedActions?: string[];
    processingTime?: number;
    error?: string;
  };
  professionalInfo?: {
    experience?: string;
    education?: string;
    skills?: string[];
  };
}

interface EnhancedApplicationCardProps {
  application: ApplicationWithML;
  onViewDetails?: (applicationId: string) => void;
  onStatusChange?: (applicationId: string, newStatus: string) => void;
  onScheduleInterview?: (applicationId: string) => void;
  className?: string;
  showMLInsights?: boolean;
}

/**
 * Enhanced Application Card with ML Integration
 * Follows Figma UI Design Principles and Don Norman's Design Principles
 * - Hierarchy: ML scores prominently displayed
 * - Visibility: ML features clearly discoverable
 * - Feedback: Clear ML processing status
 * - Consistency: Maintains TalentSol design system
 */
export const EnhancedApplicationCard: React.FC<EnhancedApplicationCardProps> = ({
  application,
  onViewDetails,
  onStatusChange,
  onScheduleInterview,
  className,
  showMLInsights = true
}) => {
  const [isMLExpanded, setIsMLExpanded] = useState(false);

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700' },
      screening: { label: 'Screening', color: 'bg-yellow-100 text-yellow-700' },
      interview: { label: 'Interview', color: 'bg-purple-100 text-purple-700' },
      offer: { label: 'Offer', color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
      hired: { label: 'Hired', color: 'bg-emerald-100 text-emerald-700' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.applied;
    return (
      <Badge className={cn('text-xs font-medium', config.color)}>
        {config.label}
      </Badge>
    );
  };

  const candidateName = `${application.candidateInfo.firstName} ${application.candidateInfo.lastName}`;
  const candidateInitials = `${application.candidateInfo.firstName[0]}${application.candidateInfo.lastName[0]}`;

  return (
    <Card className={cn(shadows.card, 'hover:shadow-md transition-all duration-200', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {/* Candidate Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidateName}`} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                {candidateInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{candidateName}</h3>
              <p className="text-sm text-gray-600 truncate">{application.jobTitle}</p>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(application.submittedAt).toLocaleDateString()}</span>
                </div>
                {application.candidateInfo.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{application.candidateInfo.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status and ML Score */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {getStatusBadge(application.status)}
            {showMLInsights && application.mlProcessing && (
              <MLStatusIndicator 
                status={application.mlProcessing.status}
                score={application.score}
              />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-3 w-3" />
            <span className="truncate">{application.candidateInfo.email}</span>
          </div>
          {application.candidateInfo.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-3 w-3" />
              <span>{application.candidateInfo.phone}</span>
            </div>
          )}
        </div>

        {/* ML Insights Section */}
        {showMLInsights && application.mlProcessing && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">AI Screening</span>
                {application.score && (
                  <Badge variant="outline" className={cn('text-xs', getScoreColor(application.score))}>
                    {application.score}/100
                  </Badge>
                )}
              </div>
              {application.mlProcessing.reasoning && application.mlProcessing.reasoning.length > 0 && (
                <Collapsible open={isMLExpanded} onOpenChange={setIsMLExpanded}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      {isMLExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              )}
            </div>

            <MLProcessingStatus
              status={application.mlProcessing.status}
              confidence={application.mlProcessing.confidence}
              score={application.score}
              processingTime={application.mlProcessing.processingTime}
              error={application.mlProcessing.error}
              className="mt-2"
            />

            {/* Expandable ML Details */}
            {application.mlProcessing.reasoning && (
              <Collapsible open={isMLExpanded} onOpenChange={setIsMLExpanded}>
                <CollapsibleContent className="mt-3 space-y-3">
                  {/* AI Reasoning */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-xs font-medium text-blue-900 mb-2 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Decision Tree Analysis
                    </h4>
                    <ul className="space-y-1">
                      {application.mlProcessing.reasoning.map((reason, index) => (
                        <li key={index} className="text-xs text-blue-800 flex items-start gap-1">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-blue-700 mt-2 italic">
                      Based on text matching between resume content and job description
                    </p>
                  </div>

                  {/* Recommended Actions */}
                  {application.mlProcessing.recommendedActions && application.mlProcessing.recommendedActions.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h4 className="text-xs font-medium text-green-900 mb-2">Recommended Actions</h4>
                      <ul className="space-y-1">
                        {application.mlProcessing.recommendedActions.map((action, index) => (
                          <li key={index} className="text-xs text-green-800 flex items-start gap-1">
                            <span className="text-green-400 mt-0.5">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(application.id)}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onScheduleInterview?.(application.id)}
            className="flex-1"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedApplicationCard;
