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

  // Modern card design combining elements from both versions
  return (
    <Card className={cn("w-full max-w-md shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {imageSrc ? <AvatarImage src={imageSrc} alt={name} /> : null}
              <AvatarFallback className="bg-ats-blue text-white">{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription className="text-sm">{position}</CardDescription>
            </div>
          </div>
          <Badge className={cn(getStatusColor())}>
            {stage || statusLabels[status || 'new']}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MailIcon className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{email}</span>
          </div>
          {phone && (
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 text-muted-foreground" />
              <span>{phone}</span>
            </div>
          )}
          {appliedDate && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>Applied: {formatDate(appliedDate)}</span>
            </div>
          )}
          {(lastContact || lastActivity) && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Last Activity: {lastActivity || formatDate(lastContact)}</span>
            </div>
          )}
          {renderRating(rating)}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag, index) => (
                <div key={index} className="inline-flex items-center text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={handleView}>
          View Profile
        </Button>
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(candidate)}>
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CandidateCard;
