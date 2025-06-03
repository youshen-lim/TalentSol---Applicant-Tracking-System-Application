# TalentSol Unified Data Architecture

## 🎯 **Core Problem**
The Dashboard shows no data because we have:
- Multiple disconnected database systems
- Placeholder database credentials
- No unified data model with candidate_ID as primary entity
- Missing data population

## 🏗️ **Unified Data Model Design**

### **Primary Entity: Candidate (candidate_ID)**
```
CANDIDATE (Primary Entity)
├── candidate_id (UUID) - PRIMARY KEY
├── personal_info (JSONB)
├── professional_info (JSONB)
├── contact_info (JSONB)
├── preferences (JSONB)
└── metadata (JSONB)

APPLICATIONS (candidate_id → applications)
├── application_id (UUID)
├── candidate_id (FK to CANDIDATE)
├── job_id (FK to JOB)
├── status_history (JSONB Array)
├── scoring_data (JSONB)
└── timeline_events (JSONB Array)

INTERVIEWS (candidate_id → applications → interviews)
├── interview_id (UUID)
├── application_id (FK to APPLICATION)
├── candidate_id (Derived from application)
├── interview_data (JSONB)
└── feedback (JSONB)

JOBS (Referenced by applications)
├── job_id (UUID)
├── company_id (FK to COMPANY)
├── job_details (JSONB)
└── requirements (JSONB)

ANALYTICS_CACHE (Candidate-centric aggregations)
├── cache_key (String)
├── candidate_metrics (JSONB)
├── time_series_data (JSONB)
└── computed_at (Timestamp)
```

## 🔧 **Implementation Strategy**

### 1. **Database Setup & Connection**
- Fix database credentials
- Ensure PostgreSQL is running
- Create unified connection pool
- Set up Redis for caching

### 2. **Candidate-Centric Data Flow**
```
Frontend Request
    ↓
API Endpoint (/analytics/dashboard)
    ↓
CachedAnalyticsService
    ↓
Candidate-based Queries
    ↓
Aggregated Metrics
    ↓
Redis Cache
    ↓
Frontend Dashboard
```

### 3. **Data Population Strategy**
- Create realistic candidate profiles
- Generate applications linked to candidates
- Create interview schedules
- Populate job openings
- Generate historical data for trends

## 📊 **Unified Data Queries**

### **Dashboard Metrics (All Candidate-Centric)**
```sql
-- Total Candidates (Primary metric)
SELECT COUNT(DISTINCT candidate_id) FROM candidates 
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Applications per Candidate
SELECT c.candidate_id, COUNT(a.application_id) as app_count
FROM candidates c
LEFT JOIN applications a ON c.candidate_id = a.candidate_id
GROUP BY c.candidate_id;

-- Time to Hire (Candidate journey)
SELECT 
  c.candidate_id,
  a.application_id,
  a.hired_at - a.submitted_at as time_to_hire
FROM candidates c
JOIN applications a ON c.candidate_id = a.candidate_id
WHERE a.status = 'hired';

-- Interview Success Rate (Per Candidate)
SELECT 
  c.candidate_id,
  COUNT(i.interview_id) as total_interviews,
  COUNT(CASE WHEN a.status IN ('offer', 'hired') THEN 1 END) as successful
FROM candidates c
JOIN applications a ON c.candidate_id = a.candidate_id
LEFT JOIN interviews i ON a.application_id = i.application_id
GROUP BY c.candidate_id;
```

## 🚀 **Quick Fix Implementation**

### Step 1: Fix Database Connection
### Step 2: Create Unified Data Service
### Step 3: Populate Candidate-Centric Data
### Step 4: Update Dashboard to Use Unified Model

## 📈 **Benefits of Unified Model**

1. **Single Source of Truth**: All metrics trace back to candidate_ID
2. **Consistent Data**: No discrepancies between different data sources
3. **Scalable**: Easy to add new metrics without data fragmentation
4. **Performance**: Optimized queries with proper indexing
5. **Maintainable**: Clear data relationships and dependencies

## 🔄 **Data Synchronization**

### **Real-time Updates**
- Application status changes update candidate metrics
- Interview scheduling updates candidate pipeline
- Job posting changes affect candidate matching

### **Batch Processing**
- Daily aggregation of candidate metrics
- Weekly trend calculations
- Monthly reporting data generation

## 🎯 **Next Steps**

1. **Immediate**: Fix database connection and populate data
2. **Short-term**: Implement unified data service
3. **Long-term**: Add real-time synchronization and advanced analytics

This unified approach ensures all dashboard data flows from candidate entities, providing consistent and accurate metrics across the entire TalentSol ATS system.
