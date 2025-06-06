import React from 'react';
import { VirtualTable } from '@/components/ui/VirtualList';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Mail, Phone, MapPin } from 'lucide-react';
import { Candidate } from '@/hooks/queries/useCandidatesQuery';

interface VirtualCandidateListProps {
  candidates: Candidate[];
  height?: number;
  onCandidateClick?: (candidate: Candidate, index: number) => void;
  onCandidateAction?: (candidate: Candidate, action: string) => void;
  className?: string;
}

/**
 * Virtualized candidate list for handling large datasets efficiently
 */
export const VirtualCandidateList: React.FC<VirtualCandidateListProps> = ({
  candidates,
  height = 600,
  onCandidateClick,
  onCandidateAction,
  className,
}) => {
  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'screening':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'offer':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-1 text-xs text-gray-500">({rating})</span>
      </div>
    );
  };

  const columns = [
    {
      key: 'candidate',
      header: 'Candidate',
      width: 280,
      render: (candidate: Candidate) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={candidate.avatarUrl} alt={`${candidate.firstName} ${candidate.lastName}`} />
            <AvatarFallback>
              {candidate.firstName[0]}{candidate.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {candidate.firstName} {candidate.lastName}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Mail className="h-3 w-3" />
              <span className="truncate">{candidate.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      width: 200,
      render: (candidate: Candidate) => (
        <div className="space-y-1">
          {candidate.phone && (
            <div className="flex items-center text-xs text-gray-600">
              <Phone className="h-3 w-3 mr-1" />
              <span>{candidate.phone}</span>
            </div>
          )}
          {candidate.location && (
            <div className="flex items-center text-xs text-gray-600">
              <MapPin className="h-3 w-3 mr-1" />
              <span>
                {candidate.location.city && candidate.location.state
                  ? `${candidate.location.city}, ${candidate.location.state}`
                  : candidate.location.city || candidate.location.state || candidate.location.country
                }
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'skills',
      header: 'Skills',
      width: 250,
      render: (candidate: Candidate) => (
        <div className="flex flex-wrap gap-1">
          {candidate.skills.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {candidate.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{candidate.skills.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'stage',
      header: 'Stage',
      width: 120,
      render: (candidate: Candidate) => (
        <Badge className={`text-xs ${getStageColor(candidate.stage)}`}>
          {candidate.stage}
        </Badge>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      width: 120,
      render: (candidate: Candidate) => getRatingStars(candidate.rating),
    },
    {
      key: 'applied',
      header: 'Applied',
      width: 100,
      render: (candidate: Candidate) => (
        <span className="text-xs text-gray-500">
          {new Date(candidate.appliedDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      width: 100,
      render: (candidate: Candidate) => (
        <Badge variant="outline" className="text-xs capitalize">
          {candidate.source}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 60,
      render: (candidate: Candidate) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onCandidateAction?.(candidate, 'menu');
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <VirtualTable
      items={candidates}
      columns={columns}
      height={height}
      rowHeight={64}
      className={className}
      getRowKey={(candidate) => candidate.id}
      onRowClick={onCandidateClick}
      rowClassName="hover:bg-blue-50 transition-colors"
      headerClassName="bg-gray-50 border-b"
    />
  );
};

/**
 * Performance metrics component for virtual list
 */
interface VirtualListMetricsProps {
  totalItems: number;
  visibleItems: number;
  renderTime?: number;
}

export const VirtualListMetrics: React.FC<VirtualListMetricsProps> = ({
  totalItems,
  visibleItems,
  renderTime,
}) => {
  const performanceGain = totalItems > 0 ? ((totalItems - visibleItems) / totalItems * 100).toFixed(1) : '0';

  return (
    <div className="text-xs text-gray-500 p-2 bg-gray-50 border-t">
      <div className="flex justify-between items-center">
        <span>
          Showing {visibleItems} of {totalItems} items
        </span>
        <span>
          Performance gain: {performanceGain}%
        </span>
        {renderTime && (
          <span>
            Render time: {renderTime.toFixed(2)}ms
          </span>
        )}
      </div>
    </div>
  );
};
