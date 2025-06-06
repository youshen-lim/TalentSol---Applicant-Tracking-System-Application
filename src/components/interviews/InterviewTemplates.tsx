import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Clock,
  Users,
  MapPin,
  Video,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterviewTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  duration: number; // in minutes
  location?: string;
  meetingLink?: string;
  interviewers: string[];
  questions: InterviewQuestion[];
  evaluationCriteria: EvaluationCriteria[];
  instructions: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswer?: string;
  timeAllocation: number; // in minutes
}

interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // percentage
  scale: number; // 1-5 or 1-10
}

interface InterviewTemplatesProps {
  templates: InterviewTemplate[];
  onCreateTemplate: (template: Omit<InterviewTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTemplate: (id: string, template: Partial<InterviewTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  onDuplicateTemplate: (id: string) => void;
  onUseTemplate: (template: InterviewTemplate) => void;
  loading?: boolean;
}

const InterviewTemplates: React.FC<InterviewTemplatesProps> = ({
  templates,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  onUseTemplate,
  loading = false
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InterviewTemplate | null>(null);
  const [filterType, setFilterType] = useState('all');

  // Default template structure
  const defaultTemplate: Omit<InterviewTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '',
    description: '',
    type: 'technical',
    duration: 60,
    location: '',
    meetingLink: '',
    interviewers: [],
    questions: [],
    evaluationCriteria: [],
    instructions: '',
    isDefault: false
  };

  const [newTemplate, setNewTemplate] = useState(defaultTemplate);

  const interviewTypes = [
    { value: 'technical', label: 'Technical', color: 'bg-blue-500' },
    { value: 'behavioral', label: 'Behavioral', color: 'bg-purple-500' },
    { value: 'cultural_fit', label: 'Cultural Fit', color: 'bg-amber-500' },
    { value: 'final', label: 'Final', color: 'bg-cyan-500' },
    { value: 'screening', label: 'Screening', color: 'bg-green-500' }
  ];

  // Filter templates by type
  const filteredTemplates = templates.filter(template => 
    filterType === 'all' || template.type === filterType
  );

  // Handle create template
  const handleCreateTemplate = useCallback(() => {
    if (!newTemplate.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Template name is required.',
        variant: 'destructive',
      });
      return;
    }

    onCreateTemplate(newTemplate);
    setNewTemplate(defaultTemplate);
    setIsCreateDialogOpen(false);
    
    toast({
      title: 'Template Created',
      description: `Interview template "${newTemplate.name}" has been created successfully.`,
    });
  }, [newTemplate, onCreateTemplate]);

  // Handle edit template
  const handleEditTemplate = useCallback((template: InterviewTemplate) => {
    setEditingTemplate(template);
    setNewTemplate(template);
    setIsCreateDialogOpen(true);
  }, []);

  // Handle update template
  const handleUpdateTemplate = useCallback(() => {
    if (!editingTemplate) return;

    onUpdateTemplate(editingTemplate.id, newTemplate);
    setEditingTemplate(null);
    setNewTemplate(defaultTemplate);
    setIsCreateDialogOpen(false);
    
    toast({
      title: 'Template Updated',
      description: `Interview template "${newTemplate.name}" has been updated successfully.`,
    });
  }, [editingTemplate, newTemplate, onUpdateTemplate]);

  // Handle delete template
  const handleDeleteTemplate = useCallback((template: InterviewTemplate) => {
    if (template.isDefault) {
      toast({
        title: 'Cannot Delete',
        description: 'Default templates cannot be deleted.',
        variant: 'destructive',
      });
      return;
    }

    onDeleteTemplate(template.id);
    
    toast({
      title: 'Template Deleted',
      description: `Interview template "${template.name}" has been deleted.`,
    });
  }, [onDeleteTemplate]);

  // Handle duplicate template
  const handleDuplicateTemplate = useCallback((template: InterviewTemplate) => {
    onDuplicateTemplate(template.id);
    
    toast({
      title: 'Template Duplicated',
      description: `A copy of "${template.name}" has been created.`,
    });
  }, [onDuplicateTemplate]);

  // Add question to template
  const addQuestion = () => {
    const newQuestion: InterviewQuestion = {
      id: `q_${Date.now()}`,
      question: '',
      category: 'technical',
      difficulty: 'medium',
      expectedAnswer: '',
      timeAllocation: 10
    };
    
    setNewTemplate(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  // Remove question from template
  const removeQuestion = (questionId: string) => {
    setNewTemplate(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  // Update question
  const updateQuestion = (questionId: string, updates: Partial<InterviewQuestion>) => {
    setNewTemplate(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  // Add evaluation criteria
  const addEvaluationCriteria = () => {
    const newCriteria: EvaluationCriteria = {
      id: `c_${Date.now()}`,
      name: '',
      description: '',
      weight: 20,
      scale: 5
    };
    
    setNewTemplate(prev => ({
      ...prev,
      evaluationCriteria: [...prev.evaluationCriteria, newCriteria]
    }));
  };

  // Remove evaluation criteria
  const removeEvaluationCriteria = (criteriaId: string) => {
    setNewTemplate(prev => ({
      ...prev,
      evaluationCriteria: prev.evaluationCriteria.filter(c => c.id !== criteriaId)
    }));
  };

  // Update evaluation criteria
  const updateEvaluationCriteria = (criteriaId: string, updates: Partial<EvaluationCriteria>) => {
    setNewTemplate(prev => ({
      ...prev,
      evaluationCriteria: prev.evaluationCriteria.map(c => 
        c.id === criteriaId ? { ...c, ...updates } : c
      )
    }));
  };

  // Reset form
  const resetForm = () => {
    setNewTemplate(defaultTemplate);
    setEditingTemplate(null);
    setIsCreateDialogOpen(false);
  };

  // Render template card
  const renderTemplateCard = (template: InterviewTemplate) => (
    <Card key={template.id} className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {template.name}
              {template.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Default
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUseTemplate(template)}
              disabled={loading}
            >
              Use Template
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDuplicateTemplate(template)}
              disabled={loading}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditTemplate(template)}
              disabled={loading}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {!template.isDefault && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteTemplate(template)}
                disabled={loading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Template Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className={cn(
                "w-3 h-3 rounded-full",
                interviewTypes.find(t => t.value === template.type)?.color || 'bg-gray-400'
              )} />
              <span className="capitalize">{template.type}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{template.duration} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{template.interviewers.length} interviewer(s)</span>
            </div>
          </div>

          {/* Location/Meeting Info */}
          {(template.location || template.meetingLink) && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {template.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{template.location}</span>
                </div>
              )}
              {template.meetingLink && (
                <div className="flex items-center gap-1">
                  <Video className="h-4 w-4" />
                  <span>Video Call</span>
                </div>
              )}
            </div>
          )}

          {/* Questions and Criteria Count */}
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline">
              {template.questions.length} Questions
            </Badge>
            <Badge variant="outline">
              {template.evaluationCriteria.length} Criteria
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interview Templates</h2>
          <p className="text-gray-600">Create and manage reusable interview templates</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create Interview Template'}
              </DialogTitle>
              <DialogDescription>
                {editingTemplate 
                  ? 'Update the interview template details below.'
                  : 'Create a new interview template that can be reused for scheduling interviews.'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Senior Frontend Developer Technical Interview"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Interview Type</Label>
                  <Select
                    value={newTemplate.type}
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {interviewTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", type.color)} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose and scope of this interview template..."
                  rows={3}
                />
              </div>

              {/* Interview Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newTemplate.duration}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    min="15"
                    max="480"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    value={newTemplate.location}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Conference Room A"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
                  <Input
                    id="meetingLink"
                    value={newTemplate.meetingLink}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, meetingLink: e.target.value }))}
                    placeholder="e.g., https://zoom.us/j/..."
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Interview Instructions</Label>
                <Textarea
                  id="instructions"
                  value={newTemplate.instructions}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Provide instructions for interviewers..."
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}>
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Filter by Type:</Label>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {interviewTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", type.color)} />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(renderTemplateCard)}
        
        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">No templates found</p>
            <p className="text-sm">Create your first interview template to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewTemplates;
