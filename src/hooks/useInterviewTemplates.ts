import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

interface InterviewTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  duration: number;
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
  timeAllocation: number;
}

interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  scale: number;
}

interface CreateTemplateData {
  name: string;
  description?: string;
  type: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  interviewers?: string[];
  questions?: InterviewQuestion[];
  evaluationCriteria?: EvaluationCriteria[];
  instructions?: string;
  isDefault?: boolean;
}

export const useInterviewTemplates = () => {
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Get auth headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Fetch all templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interview-templates`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(errorMessage);
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Create new template
  const createTemplate = useCallback(async (templateData: CreateTemplateData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interview-templates`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create template: ${response.statusText}`);
      }

      const data = await response.json();
      setTemplates(prev => [...prev, data.template]);
      
      toast({
        title: 'Template Created',
        description: `Interview template "${templateData.name}" has been created successfully.`,
      });

      return data.template;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Update template
  const updateTemplate = useCallback(async (id: string, updates: Partial<CreateTemplateData>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interview-templates/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update template: ${response.statusText}`);
      }

      const data = await response.json();
      setTemplates(prev => prev.map(template => 
        template.id === id ? data.template : template
      ));
      
      toast({
        title: 'Template Updated',
        description: 'Interview template has been updated successfully.',
      });

      return data.template;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Delete template
  const deleteTemplate = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interview-templates/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete template: ${response.statusText}`);
      }

      setTemplates(prev => prev.filter(template => template.id !== id));
      
      toast({
        title: 'Template Deleted',
        description: 'Interview template has been deleted successfully.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Duplicate template
  const duplicateTemplate = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interview-templates/${id}/duplicate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to duplicate template: ${response.statusText}`);
      }

      const data = await response.json();
      setTemplates(prev => [...prev, data.template]);
      
      toast({
        title: 'Template Duplicated',
        description: 'Interview template has been duplicated successfully.',
      });

      return data.template;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate template';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Bulk operations
  const bulkOperations = useCallback(async (operation: string, templateIds: string[], data?: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interview-templates/bulk-operations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ operation, templateIds, data }),
      });

      if (!response.ok) {
        throw new Error(`Failed to perform bulk operation: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Refresh templates after bulk operation
      await fetchTemplates();
      
      toast({
        title: 'Bulk Operation Complete',
        description: `${operation} operation completed successfully for ${templateIds.length} template(s).`,
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to perform bulk operation';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, fetchTemplates]);

  // Get template by ID
  const getTemplate = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interview-templates/${id}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`);
      }

      const data = await response.json();
      return data.template;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch template';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Filter templates by type
  const getTemplatesByType = useCallback((type: string) => {
    return templates.filter(template => template.type === type);
  }, [templates]);

  // Get default templates
  const getDefaultTemplates = useCallback(() => {
    return templates.filter(template => template.isDefault);
  }, [templates]);

  // Initial fetch
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    bulkOperations,
    getTemplate,
    getTemplatesByType,
    getDefaultTemplates,
    refetch: fetchTemplates,
  };
};

export default useInterviewTemplates;
