import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CalendarIcon,
  CheckCircle,
  Clock,
  MailIcon,
  PhoneIcon,
  StarIcon,
  Tag,
  UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  photo?: string; // Alternative name for avatar
  position: string;
  status?: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  stage?: string; // Alternative name for status
  rating?: number;
  tags?: string[];
  appliedDate?: Date;
  lastContact?: Date;
  lastActivity?: string; // Alternative format for last contact
}

interface CandidateCardProps {
  candidate: Candidate;
  onView?: ((candidate: Candidate) => void) | ((id: string) => void);
  onEdit?: (candidate: Candidate) => void;
  onStatusChange?: (candidate: Candidate, newStatus: Candidate['status']) => void;
  className?: string;
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  applied: 'bg-blue-100 text-blue-700',
  screening: 'bg-blue-100 text-blue-800',
  interview: 'bg-blue-100 text-blue-800',
  assessment: 'bg-indigo-100 text-indigo-700',
  offer: 'bg-green-100 text-green-800',
  hired: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusLabels = {
  new: 'New',
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  assessment: 'Assessment',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
};

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onView,
  onEdit,
  onStatusChange,
  className = '',
}) => {
  // Extract all possible properties with fallbacks
  const {
    id,
    name,
    email,
    phone,
    position,
    rating,
    // Handle both avatar and photo properties
    avatar,
    photo,
    // Handle both status and stage properties
    status,
    stage,
    // Handle both tags arrays
    tags = [],
    // Handle different date formats
    appliedDate,
    lastContact,
    lastActivity
  } = candidate;

  // Determine which image source to use
  const imageSrc = photo || avatar;

  // Determine which status/stage to use
  const candidateStatus = status || stage?.toLowerCase() || 'new';

  // Get the appropriate status color
  const getStatusColor = () => {
    if (status && statusColors[status]) {
      return statusColors[status];
    } else if (stage) {
      const stageKey = stage.toLowerCase();
      if (statusColors[stageKey as keyof typeof statusColors]) {
        return statusColors[stageKey as keyof typeof statusColors];
      }
      // Use the function from the new code for any custom stages
      switch (stage.toLowerCase()) {
        case 'applied':
          return 'bg-blue-100 text-blue-700';
        case 'screening':
          return 'bg-blue-100 text-blue-700';
        case 'interview':
          return 'bg-blue-100 text-blue-700';
        case 'assessment':
          return 'bg-indigo-100 text-indigo-700';
        case 'offer':
          return 'bg-green-100 text-green-700';
        case 'rejected':
          return 'bg-red-100 text-red-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    }
    return 'bg-gray-100 text-gray-700';
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Format date consistently
  const formatDate = (date?: Date | string) => {
    if (!date) return '';

    if (date instanceof Date) {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    }

    return date; // If it's already a string
  };

  // Handle the view action with different callback signatures
  const handleView = () => {
    if (!onView) return;

    if (typeof onView === 'function') {
      // Check if the function expects an id or the whole candidate
      // This is a bit of a hack but works for our use case
      if (onView.toString().includes('id:')) {
        (onView as (id: string) => void)(id);
      } else {
        (onView as (candidate: Candidate) => void)(candidate);
      }
    }
  };

  // Render rating stars
  const renderRating = (rating?: number) => {
    if (!rating) return null;

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <CheckCircle
            key={i}
            className={cn(
              "h-4 w-4",
              i < rating ? "text-ats-blue fill-current" : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  };

  // Modern responsive card design
  return (
    <Card className={cn("w-full shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
              {imageSrc ? <AvatarImage src={imageSrc} alt={name} /> : null}
              <AvatarFallback className="bg-ats-blue text-white text-xs sm:text-sm">{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-lg truncate">{name}</CardTitle>
              <CardDescription className="text-xs sm:text-sm truncate">{position}</CardDescription>
            </div>
          </div>
          <Badge className={cn(getStatusColor(), "flex-shrink-0 text-xs")}>
            {stage || statusLabels[status || 'new']}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 sm:pb-3 space-y-2 sm:space-y-3">
        {/* Contact Information */}
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <MailIcon className="h-3 w-3 text-ats-blue flex-shrink-0" />
            <span className="truncate">{email}</span>
          </div>
          {phone && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <PhoneIcon className="h-3 w-3 text-ats-blue flex-shrink-0" />
              <span className="truncate">{phone}</span>
            </div>
          )}
        </div>

        {/* Last Activity */}
        {(lastActivity || lastContact || appliedDate) && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-gray-50 rounded-md p-1.5 sm:p-2">
            <Clock className="h-3 w-3 text-ats-purple flex-shrink-0" />
            <span className="text-xs truncate">
              {lastActivity || (appliedDate ? `Applied: ${formatDate(appliedDate)}` : formatDate(lastContact))}
            </span>
          </div>
        )}

        {/* Rating */}
        {rating && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5 sm:gap-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {rating}/5
            </span>
          </div>
        )}

        {/* Tags/Skills */}
        {tags && tags.length > 0 && (
          <div className="space-y-1 sm:space-y-2">
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-1.5 sm:px-2 py-0.5 bg-ats-blue/10 text-ats-blue border-ats-blue/20"
                >
                  {tag}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1.5 sm:px-2 py-0.5 text-gray-500">
                  +{tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 sm:pt-3 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleView}
          className="w-full text-ats-blue hover:text-ats-dark-blue hover:bg-ats-blue/10 text-xs sm:text-sm"
        >
          <UserIcon className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>View Profile</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CandidateCard;
