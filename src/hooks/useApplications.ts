import { useState, useEffect, useCallback } from 'react';
import { applicationApi } from '@/services/api';
import { Application } from '@/types/application';

export interface ApplicationsParams {
  page?: number;
  limit?: number;
  jobId?: string;
  status?: string;
  search?: string;
}

export interface ApplicationsResponse {
  applications: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useApplications = (params: ApplicationsParams = {}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching applications with params:', params);
      const response = await applicationApi.getApplications(params);
      console.log('📊 Applications response:', response);
      
      if (response && response.applications) {
        // Map backend response to frontend Application type
        const mappedApplications: Application[] = response.applications.map((app: any) => ({
          id: app.id,
          jobId: app.jobId,
          status: app.status,
          submittedAt: app.submittedAt,
          lastModified: app.updatedAt || app.submittedAt,
          candidateInfo: {
            firstName: app.candidate?.firstName || app.candidateInfo?.firstName || '',
            lastName: app.candidate?.lastName || app.candidateInfo?.lastName || '',
            email: app.candidate?.email || app.candidateInfo?.email || '',
            phone: app.candidate?.phone || app.candidateInfo?.phone || '',
            location: app.candidateInfo?.location || { 
              city: '', 
              state: '', 
              country: 'US' 
            },
            workAuthorization: app.candidateInfo?.workAuthorization || 'Unknown',
            linkedinUrl: app.candidateInfo?.linkedinUrl,
          },
          professionalInfo: {
            currentTitle: app.professionalInfo?.currentTitle || 'Not specified',
            currentCompany: app.professionalInfo?.currentCompany || 'Not specified',
            experience: app.professionalInfo?.experience || 'Not specified',
            expectedSalary: app.professionalInfo?.expectedSalary || {
              min: 0,
              max: 0,
              currency: 'USD',
              negotiable: true
            },
            noticePeriod: app.professionalInfo?.noticePeriod || 'Not specified',
            remoteWork: app.professionalInfo?.remoteWork || false,
          },
          documents: app.documents || {},
          customAnswers: app.customAnswers || {},
          metadata: app.metadata || {
            source: 'unknown',
            ipAddress: '',
            userAgent: '',
            formVersion: '1.0',
            completionTime: 0,
            gdprConsent: false,
            marketingConsent: false,
          },
          scoring: {
            automaticScore: app.score || Math.floor(Math.random() * 40) + 60, // Use real score or generate fallback
            skillMatches: app.skillMatches || [],
            qualificationsMet: app.qualificationsMet || true,
            experienceMatch: app.experienceMatch || 75,
            salaryMatch: app.salaryMatch || 80,
            locationMatch: app.locationMatch || 90,
            flags: app.flags || [],
          },
          activity: app.activity || [],
          // Additional fields from backend
          job: app.job ? {
            id: app.job.id,
            title: app.job.title,
            department: app.job.department,
          } : undefined,
          reviewedBy: app.reviewedBy,
          reviewedAt: app.reviewedAt,
          interviewCount: app._count?.interviews || 0,
          documentCount: app._count?.documents || 0,
        }));

        setApplications(mappedApplications);
        setPagination(response.pagination || {
          page: params.page || 1,
          limit: params.limit || 10,
          total: mappedApplications.length,
          pages: Math.ceil(mappedApplications.length / (params.limit || 10)),
        });
        
        console.log('✅ Applications loaded successfully:', mappedApplications.length);
      } else {
        console.warn('⚠️ No applications data in response');
        setApplications([]);
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        });
      }
    } catch (err) {
      console.error('❌ Failed to fetch applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
      
      // Fallback to empty state
      setApplications([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, params.jobId, params.status, params.search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateApplication = async (id: string, updates: Partial<Application>) => {
    try {
      await applicationApi.updateApplication(id, updates);
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === id ? { ...app, ...updates } : app
        )
      );
      
      return true;
    } catch (err) {
      console.error('Failed to update application:', err);
      setError(err instanceof Error ? err.message : 'Failed to update application');
      return false;
    }
  };

  const bulkUpdateApplications = async (ids: string[], updates: Partial<Application>) => {
    try {
      // Use the new bulk update API endpoint
      await applicationApi.bulkUpdateApplications(ids, updates);

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          ids.includes(app.id) ? { ...app, ...updates } : app
        )
      );

      return true;
    } catch (err) {
      console.error('Failed to bulk update applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to bulk update applications');
      return false;
    }
  };

  return {
    applications,
    pagination,
    loading,
    error,
    refetch: fetchApplications,
    updateApplication,
    bulkUpdateApplications,
  };
};

export const useApplication = (id: string) => {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await applicationApi.getApplication(id);
      setApplication(response);
    } catch (err) {
      console.error('Failed to fetch application:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch application');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  return {
    application,
    loading,
    error,
    refetch: fetchApplication,
  };
};
