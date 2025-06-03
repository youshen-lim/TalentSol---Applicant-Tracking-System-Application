# TalentSol CSV Data Import Guide

## 🎯 **Overview**
This guide provides instructions for manually populating TalentSol ATS data using a single CSV file approach. The CSV contains all necessary data for the reduced dataset: 50 candidates, 50 applications, 10 interviews, and 3 jobs.

## 📊 **CSV File Structure**

### **File Location**
```
backend/data/talentsol_complete_data.csv
```

### **Data Volumes**
```
📊 Complete Data Ecosystem:
👥 Candidates: 50 (Primary entities with candidate_ID)
📝 Applications: 50 (1 per candidate, distributed across 3 jobs)
🎯 Interviews: 10 (Selected applications with interview progression)
💼 Jobs: 3 (Senior Frontend Developer, Product Manager, UX/UI Designer)
```

### **CSV Columns**
The CSV file contains the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| `entity_type` | Type of record (candidate, job, application, interview) | candidate |
| `entity_id` | Unique ID for the entity | 1 |
| `candidate_id` | Reference to candidate | 1 |
| `job_id` | Reference to job | 1 |
| `application_id` | Reference to application | 1 |
| `interview_id` | Reference to interview | 1 |
| `first_name` | Candidate first name | Sarah |
| `last_name` | Candidate last name | Chen |
| `email` | Candidate email | sarah.chen@email.com |
| `phone` | Candidate phone | +1-555-0001 |
| `job_title` | Job title | Senior Frontend Developer |
| `department` | Job department | Engineering |
| `application_status` | Application status | applied, screening, interview, etc. |
| `interview_type` | Interview type | technical, behavioral, panel |
| `interview_date` | Interview scheduled date | 2024-01-24 |
| `submitted_date` | Application submission date | 2024-01-15 |
| `hired_date` | Hire date (if hired) | 2024-02-15 |
| `source` | Application source | linkedin, indeed, company_website |
| `score` | Application score | 85 |
| `skills` | Relevant skills | React,TypeScript,JavaScript |
| `location_city` | Location city | San Francisco |
| `location_state` | Location state | CA |
| `current_company` | Current employer | TechCorp |
| `experience_level` | Experience level | 3-5, 5-10 |
| `expected_salary_min` | Minimum salary expectation | 90000 |
| `expected_salary_max` | Maximum salary expectation | 120000 |
| `remote_work` | Remote work preference | true, false |
| `notice_period` | Notice period | 2 weeks, 4 weeks |

## 🚀 **Quick Import Process**

### **Option 1: Direct CSV Import (Recommended)**
```bash
# Navigate to backend
cd backend

# Import data from CSV
npm run import-csv
```

### **Option 2: Manual Database Setup + CSV Import**
```bash
# 1. Setup database schema
npm run db:push

# 2. Import CSV data
npm run import-csv

# 3. Validate data
npm run validate-data
```

## 📝 **Manual Data Editing**

### **Editing the CSV File**
You can manually edit the CSV file to:

1. **Add more candidates**: Copy existing candidate rows and modify details
2. **Change application statuses**: Update the `application_status` column
3. **Add more interviews**: Create new interview rows with unique `interview_id`
4. **Modify job details**: Update job titles, departments, or requirements
5. **Adjust dates**: Change submission, interview, or hire dates
6. **Update scores**: Modify application scores and skills

### **Application Status Options**
- `applied` - Initial application
- `screening` - Under review
- `interview` - Interview scheduled/completed
- `assessment` - Technical assessment
- `offer` - Offer extended
- `hired` - Successfully hired
- `rejected` - Application rejected

### **Interview Type Options**
- `technical` - Technical interview
- `behavioral` - Behavioral interview
- `panel` - Panel interview
- `phone_screen` - Phone screening
- `final` - Final interview
- `cultural_fit` - Culture fit interview

### **Source Options**
- `linkedin` - LinkedIn
- `indeed` - Indeed
- `company_website` - Company website
- `referral` - Employee referral
- `glassdoor` - Glassdoor

## 🔧 **Data Relationships**

### **Entity Relationships**
```
CANDIDATE (candidate_id)
├── APPLICATION (application_id, candidate_id, job_id)
│   └── INTERVIEW (interview_id, application_id)
└── JOB (job_id)
```

### **Key Constraints**
1. Each candidate must have a unique `candidate_id`
2. Each application must reference a valid `candidate_id` and `job_id`
3. Each interview must reference a valid `application_id`
4. Dates should be in YYYY-MM-DD format
5. Boolean fields should be "true" or "false"

## 📊 **Current Data Distribution**

### **Jobs (3 total)**
- **Job 1**: Senior Frontend Developer (Engineering)
- **Job 2**: Product Manager (Product)
- **Job 3**: UX/UI Designer (Design)

### **Applications (50 total)**
- **Job 1**: 17 applications (candidates 1,4,7,10,13,16,19,22,25,28,31,34,37,40,43,46,49)
- **Job 2**: 17 applications (candidates 2,5,8,11,14,17,20,23,26,29,32,35,38,41,44,47,50)
- **Job 3**: 16 applications (candidates 3,6,9,12,15,18,21,24,27,30,33,36,39,42,45,48)

### **Application Status Distribution**
- `applied`: 25 applications (50%)
- `screening`: 8 applications (16%)
- `interview`: 6 applications (12%)
- `assessment`: 3 applications (6%)
- `offer`: 3 applications (6%)
- `hired`: 3 applications (6%)
- `rejected`: 2 applications (4%)

### **Interviews (10 total)**
- **Technical**: 4 interviews
- **Behavioral**: 3 interviews
- **Panel**: 3 interviews

## 🎯 **Customization Examples**

### **Adding a New Candidate**
```csv
candidate,51,51,,,John,Doe,john.doe@email.com,+1-555-0051,,,,,,,,,,,,"Dallas",TX,,,,,,
application,251,51,1,51,,John,Doe,john.doe@email.com,+1-555-0051,Senior Frontend Developer,Engineering,applied,,,2024-03-06,,linkedin,75,"React,JavaScript","Dallas",TX,TechStart,3-5,85000,115000,true,2 weeks
```

### **Adding an Interview**
```csv
interview,311,51,1,51,11,John,Doe,john.doe@email.com,+1-555-0051,Senior Frontend Developer,Engineering,interview,technical,2024-03-13,2024-03-06,,linkedin,75,"React,JavaScript","Dallas",TX,TechStart,3-5,85000,115000,true,2 weeks
```

### **Changing Application Status**
Find the application row and change the `application_status` column:
```csv
# Before
application,201,1,1,1,,Sarah,Chen,sarah.chen@email.com,+1-555-0001,Senior Frontend Developer,Engineering,applied,...

# After (promoted to interview)
application,201,1,1,1,,Sarah,Chen,sarah.chen@email.com,+1-555-0001,Senior Frontend Developer,Engineering,interview,...
```

## ✅ **Validation**

### **After Import Verification**
The import script will automatically verify:
- ✅ Correct number of entities imported
- ✅ All relationships properly linked
- ✅ No orphaned records
- ✅ Data integrity maintained

### **Expected Results**
```
📊 Import Verification:
👥 Candidates: 50 (Target: 50)
📝 Applications: 50 (Target: 50)
🎯 Interviews: 10 (Target: 10)
💼 Jobs: 3 (Target: 3)

✅ Import Status: SUCCESS
🔗 Candidates with applications: 50/50
```

## 🚨 **Troubleshooting**

### **Common Issues**
1. **CSV Format Errors**: Ensure no extra commas or line breaks
2. **Date Format**: Use YYYY-MM-DD format for all dates
3. **Missing References**: Ensure all `candidate_id`, `job_id` references exist
4. **Duplicate IDs**: Each entity must have a unique ID

### **Data Validation**
```bash
# Run validation after import
npm run validate-data
```

### **Database Reset**
```bash
# If you need to start over
npm run db:reset
npm run db:push
npm run import-csv
```

## 🎉 **Next Steps**

After successful CSV import:

1. **Start Backend**: `npm run dev`
2. **Start Frontend**: `npm run dev` (in root directory)
3. **Visit Dashboard**: `http://localhost:8080`
4. **Verify Data**: Check all dashboard components show real data

The CSV approach provides complete control over the data while ensuring the unified candidate-centric architecture is maintained. All dashboard metrics will be calculated from this real data, eliminating any hardcoded mock data dependencies.
