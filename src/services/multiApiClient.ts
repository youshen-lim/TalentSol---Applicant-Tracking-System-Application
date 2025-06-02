// TalentSol ATS - Multi-API Client
// Unified client for interacting with multiple API endpoints

import { GraphQLClient } from 'graphql-request';

// API Configuration
const API_CONFIG = {
  gateway: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:80',
  rest: import.meta.env.VITE_REST_API_URL || 'http://localhost:3000/api',
  graphql: import.meta.env.VITE_GRAPHQL_API_URL || 'http://localhost:4000/graphql',
  sql: import.meta.env.VITE_SQL_API_URL || 'http://localhost:5000',
  ai: import.meta.env.VITE_AI_API_URL || 'http://localhost:8000',
  dax: import.meta.env.VITE_DAX_API_URL || 'http://localhost:6000',
  websocket: import.meta.env.VITE_WS_API_URL || 'ws://localhost:9000',
};

// Types
export interface SQLQuery {
  query: string;
  parameters?: Record<string, any>;
  cache_ttl?: number;
  explain?: boolean;
}

export interface SQLResponse {
  data: Record<string, any>[];
  row_count: number;
  execution_time_ms: number;
  cached: boolean;
  explain_plan?: any[];
  query_hash: string;
  timestamp: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  resume_text: string;
  skills: string[];
  experience_years: number;
  education_level: string;
  location: string;
}

export interface JobRequirements {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_level: string;
  location: string;
  department: string;
}

export interface ScoringRequest {
  candidate: CandidateProfile;
  job: JobRequirements;
  scoring_criteria?: {
    skills_match: number;
    experience_match: number;
    education_match: number;
    location_match: number;
  };
}

export interface ScoringResponse {
  candidate_id: string;
  job_id: string;
  overall_score: number;
  skill_score: number;
  experience_score: number;
  education_score: number;
  location_score: number;
  matching_skills: string[];
  missing_skills: string[];
  recommendations: string[];
  confidence: number;
  processing_time_ms: number;
}

// Base API Client
class BaseApiClient {
  protected baseUrl: string;
  protected headers: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  protected getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  protected getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.headers,
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

// SQL API Client
export class SQLApiClient extends BaseApiClient {
  constructor() {
    super(API_CONFIG.sql);
  }

  async executeQuery(query: SQLQuery): Promise<SQLResponse> {
    return this.request<SQLResponse>('/query', {
      method: 'POST',
      body: JSON.stringify(query),
    });
  }

  async getSchema(): Promise<any> {
    return this.request('/schema');
  }

  async getTableSchema(tableName: string): Promise<any> {
    return this.request(`/table/${tableName}`);
  }

  async getStats(): Promise<any> {
    return this.request('/stats');
  }

  // Convenience methods for common queries
  async getApplicationStats(companyId: string): Promise<any> {
    const query: SQLQuery = {
      query: `
        SELECT 
          COUNT(*) as total_applications,
          COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as new_applications_today,
          AVG(CASE WHEN score IS NOT NULL THEN score END) as average_score,
          COUNT(CASE WHEN status = 'hired' THEN 1 END) * 100.0 / COUNT(*) as conversion_rate
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE j.company_id = $1
      `,
      parameters: { company_id: companyId },
      cache_ttl: 900, // 15 minutes
    };

    return this.executeQuery(query);
  }

  async getTopPerformingJobs(companyId: string, limit: number = 5): Promise<any> {
    const query: SQLQuery = {
      query: `
        SELECT 
          j.id,
          j.title,
          j.department,
          COUNT(a.id) as application_count,
          AVG(a.score) as average_score
        FROM jobs j
        LEFT JOIN applications a ON j.id = a.job_id
        WHERE j.company_id = $1
        GROUP BY j.id, j.title, j.department
        ORDER BY application_count DESC, average_score DESC
        LIMIT $2
      `,
      parameters: { company_id: companyId, limit },
      cache_ttl: 1800, // 30 minutes
    };

    return this.executeQuery(query);
  }
}

// GraphQL API Client
export class GraphQLApiClient {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(API_CONFIG.graphql, {
      headers: () => {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    });
  }

  async getJobs(variables: any = {}) {
    const query = `
      query GetJobs($page: Int, $limit: Int, $filters: JobFilters) {
        jobs(page: $page, limit: $limit, filters: $filters) {
          jobs {
            id
            title
            description
            department
            location
            employmentType
            experienceLevel
            salaryMin
            salaryMax
            status
            applicationCount
            company {
              id
              name
              logo
            }
            createdAt
          }
          total
          page
          limit
          totalPages
        }
      }
    `;

    return this.client.request(query, variables);
  }

  async getJob(id: string) {
    const query = `
      query GetJob($id: String!) {
        job(id: $id) {
          id
          title
          description
          department
          location
          employmentType
          experienceLevel
          salaryMin
          salaryMax
          status
          requiredSkills
          preferredSkills
          applicationCount
          company {
            id
            name
            logo
            website
          }
          applications {
            id
            status
            submittedAt
            candidate {
              id
              firstName
              lastName
              email
            }
          }
          createdAt
          updatedAt
        }
      }
    `;

    return this.client.request(query, { id });
  }

  async createJob(input: any) {
    const mutation = `
      mutation CreateJob($input: CreateJobInput!) {
        createJob(input: $input) {
          id
          title
          status
          createdAt
        }
      }
    `;

    return this.client.request(mutation, { input });
  }

  async updateJob(id: string, input: any) {
    const mutation = `
      mutation UpdateJob($id: String!, $input: UpdateJobInput!) {
        updateJob(id: $id, input: $input) {
          id
          title
          status
          updatedAt
        }
      }
    `;

    return this.client.request(mutation, { id, input });
  }
}

// AI API Client
export class AIApiClient extends BaseApiClient {
  constructor() {
    super(API_CONFIG.ai);
  }

  async scoreCandidate(request: ScoringRequest): Promise<ScoringResponse> {
    return this.request<ScoringResponse>('/score', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async scoreCandidatesBatch(request: {
    candidates: CandidateProfile[];
    job: JobRequirements;
    scoring_criteria?: any;
  }): Promise<any> {
    return this.request('/score/batch', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async parseResume(request: {
    resume_text: string;
    candidate_id?: string;
  }): Promise<any> {
    return this.request('/parse/resume', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async matchJobs(request: {
    candidate: CandidateProfile;
    available_jobs: JobRequirements[];
    max_results?: number;
  }): Promise<any> {
    return this.request('/match/jobs', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

// DAX Analytics API Client
export class DAXApiClient extends BaseApiClient {
  constructor() {
    super(API_CONFIG.dax);
  }

  async getDashboardMetrics(companyId: string): Promise<any> {
    return this.request(`/metrics/dashboard/${companyId}`);
  }

  async getRecruitmentFunnel(companyId: string, period?: string): Promise<any> {
    const params = period ? `?period=${period}` : '';
    return this.request(`/analytics/funnel/${companyId}${params}`);
  }

  async getSourceAnalytics(companyId: string): Promise<any> {
    return this.request(`/analytics/sources/${companyId}`);
  }

  async getTimeToHire(companyId: string): Promise<any> {
    return this.request(`/analytics/time-to-hire/${companyId}`);
  }

  async exportReport(companyId: string, reportType: string, format: string = 'json'): Promise<any> {
    return this.request(`/reports/export/${companyId}/${reportType}?format=${format}`);
  }
}

// WebSocket Client for Real-time Features
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('authToken');
        const wsUrl = `${API_CONFIG.websocket}?token=${token}`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleMessage(data: any) {
    // Handle different message types
    switch (data.type) {
      case 'notification':
        // Handle real-time notifications
        window.dispatchEvent(new CustomEvent('notification', { detail: data.payload }));
        break;
      case 'application_update':
        // Handle application status updates
        window.dispatchEvent(new CustomEvent('applicationUpdate', { detail: data.payload }));
        break;
      case 'job_update':
        // Handle job updates
        window.dispatchEvent(new CustomEvent('jobUpdate', { detail: data.payload }));
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Unified Multi-API Client
export class MultiApiClient {
  public sql: SQLApiClient;
  public graphql: GraphQLApiClient;
  public ai: AIApiClient;
  public dax: DAXApiClient;
  public websocket: WebSocketClient;

  constructor() {
    this.sql = new SQLApiClient();
    this.graphql = new GraphQLApiClient();
    this.ai = new AIApiClient();
    this.dax = new DAXApiClient();
    this.websocket = new WebSocketClient();
  }

  async initialize() {
    try {
      // Initialize WebSocket connection
      await this.websocket.connect();
      console.log('Multi-API client initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize WebSocket, continuing without real-time features:', error);
    }
  }

  // Convenience method to get data from multiple APIs
  async getDashboardData(companyId: string) {
    try {
      const [sqlStats, daxMetrics, graphqlJobs] = await Promise.allSettled([
        this.sql.getApplicationStats(companyId),
        this.dax.getDashboardMetrics(companyId),
        this.graphql.getJobs({ limit: 5 }),
      ]);

      return {
        sqlStats: sqlStats.status === 'fulfilled' ? sqlStats.value : null,
        daxMetrics: daxMetrics.status === 'fulfilled' ? daxMetrics.value : null,
        recentJobs: graphqlJobs.status === 'fulfilled' ? graphqlJobs.value : null,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const multiApiClient = new MultiApiClient();
