import { StateCreator } from 'zustand';

// Filter interfaces
export interface CandidateFilters {
  search: string;
  stage: string[];
  skills: string[];
  sources: string[];
  rating: number | null;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  lastActivity: string;
}

export interface JobFilters {
  search: string;
  status: string[];
  departments: string[];
  locations: string[];
  employmentTypes: string[];
  experienceLevel: string[];
  salaryRange: [number, number];
  postedDateRange: string;
  applicationCount: [number, number];
}

export interface ApplicationFilters {
  search: string;
  status: string[];
  jobId: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  source: string[];
  rating: number | null;
}

export interface InterviewFilters {
  search: string;
  status: string[];
  type: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  interviewer: string[];
}

export interface FiltersSlice {
  // State
  candidateFilters: CandidateFilters;
  jobFilters: JobFilters;
  applicationFilters: ApplicationFilters;
  interviewFilters: InterviewFilters;
  
  // Actions
  setCandidateFilters: (filters: Partial<CandidateFilters>) => void;
  setJobFilters: (filters: Partial<JobFilters>) => void;
  setApplicationFilters: (filters: Partial<ApplicationFilters>) => void;
  setInterviewFilters: (filters: Partial<InterviewFilters>) => void;
  clearCandidateFilters: () => void;
  clearJobFilters: () => void;
  clearApplicationFilters: () => void;
  clearInterviewFilters: () => void;
  clearAllFilters: () => void;
}

// Default filter values
const defaultCandidateFilters: CandidateFilters = {
  search: '',
  stage: [],
  skills: [],
  sources: [],
  rating: null,
  dateRange: { from: undefined, to: undefined },
  lastActivity: 'all',
};

const defaultJobFilters: JobFilters = {
  search: '',
  status: [],
  departments: [],
  locations: [],
  employmentTypes: [],
  experienceLevel: [],
  salaryRange: [0, 200000],
  postedDateRange: 'all',
  applicationCount: [0, 100],
};

const defaultApplicationFilters: ApplicationFilters = {
  search: '',
  status: [],
  jobId: [],
  dateRange: { from: undefined, to: undefined },
  source: [],
  rating: null,
};

const defaultInterviewFilters: InterviewFilters = {
  search: '',
  status: [],
  type: [],
  dateRange: { from: undefined, to: undefined },
  interviewer: [],
};

export const filtersSlice: StateCreator<
  FiltersSlice,
  [['zustand/immer', never], ['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  FiltersSlice
> = (set) => ({
  // Initial state
  candidateFilters: defaultCandidateFilters,
  jobFilters: defaultJobFilters,
  applicationFilters: defaultApplicationFilters,
  interviewFilters: defaultInterviewFilters,

  // Actions
  setCandidateFilters: (filters: Partial<CandidateFilters>) => {
    set((state) => {
      state.candidateFilters = { ...state.candidateFilters, ...filters };
    });
  },

  setJobFilters: (filters: Partial<JobFilters>) => {
    set((state) => {
      state.jobFilters = { ...state.jobFilters, ...filters };
    });
  },

  setApplicationFilters: (filters: Partial<ApplicationFilters>) => {
    set((state) => {
      state.applicationFilters = { ...state.applicationFilters, ...filters };
    });
  },

  setInterviewFilters: (filters: Partial<InterviewFilters>) => {
    set((state) => {
      state.interviewFilters = { ...state.interviewFilters, ...filters };
    });
  },

  clearCandidateFilters: () => {
    set((state) => {
      state.candidateFilters = defaultCandidateFilters;
    });
  },

  clearJobFilters: () => {
    set((state) => {
      state.jobFilters = defaultJobFilters;
    });
  },

  clearApplicationFilters: () => {
    set((state) => {
      state.applicationFilters = defaultApplicationFilters;
    });
  },

  clearInterviewFilters: () => {
    set((state) => {
      state.interviewFilters = defaultInterviewFilters;
    });
  },

  clearAllFilters: () => {
    set((state) => {
      state.candidateFilters = defaultCandidateFilters;
      state.jobFilters = defaultJobFilters;
      state.applicationFilters = defaultApplicationFilters;
      state.interviewFilters = defaultInterviewFilters;
    });
  },
});
