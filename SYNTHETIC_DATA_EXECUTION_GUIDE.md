# TalentSol Synthetic Data Generation - Complete Execution Guide

## 🎯 **Overview**
This guide provides step-by-step instructions for generating comprehensive synthetic data for the TalentSol ATS with unified candidate-centric architecture.

## 📊 **What Will Be Generated**

### **Core Data (Candidate-Centric)**
- **500 Candidates** (Primary entities with candidate_ID)
- **1,200+ Applications** (2-4 per candidate, linked to candidate_ID)
- **600+ Interviews** (Linked via applications)
- **20 Job Openings** (Referenced by applications)
- **300+ Documents** (Resumes, cover letters, portfolios)
- **200+ Notifications** (Application updates, interview schedules)

### **Analytics & Metrics**
- **Real-time Dashboard Data** (Computed from candidate entities)
- **Source Analytics** (LinkedIn, Indeed, referrals, etc.)
- **Department Metrics** (Engineering, Design, Product, etc.)
- **Performance Metrics** (Month-over-month changes)
- **Time-to-Hire Calculations** (From actual candidate journeys)

### **Advanced Features**
- **ML Predictions** (Candidate scoring and prioritization)
- **Audit Trails** (Status change history)
- **Business Metrics** (Historical trends and forecasts)
- **Cache Optimization** (Pre-computed dashboard data)

## 🚀 **Quick Start (5 Minutes)**

### **Option 1: Full Automated Generation**
```bash
# Navigate to backend
cd backend

# Run complete data generation (recommended)
npm run data-full
```

This single command will:
1. ✅ Check database connection
2. ✅ Generate 500 candidates in 20 batches
3. ✅ Create applications, interviews, documents
4. ✅ Validate data integrity

### **Option 2: Step-by-Step Generation**
```bash
# 1. Check database setup
npm run db:check

# 2. Generate core synthetic data
npm run generate-batch
```

## 🔧 **Detailed Setup Instructions**

### **Step 1: Database Preparation**
```bash
# Check current database status
npm run db:check
```

**If database connection fails:**
1. Install PostgreSQL (if not installed)
2. Create database and user
3. Update .env file
4. Run database migrations

**Database Setup Commands:**
```sql
-- Create database
sudo -u postgres psql
CREATE DATABASE talentsol_ats;
CREATE USER talentsol_user WITH PASSWORD 'talentsol_password';
GRANT ALL PRIVILEGES ON DATABASE talentsol_ats TO talentsol_user;
\q
```

**Update .env file:**
```
DATABASE_URL="postgresql://talentsol_user:talentsol_password@localhost:5432/talentsol_ats"
```

**Initialize schema:**
```bash
npm run db:push
```

### **Step 2: Batch Data Generation**
```bash
# Generate comprehensive synthetic data
npm run generate-batch
```

**This will create:**
- 20 batches × 25 candidates = 500 total candidates
- Realistic application timelines (last 12 months)
- Interview scheduling and feedback
- Document uploads (resumes, cover letters)
- Notification history
- ML predictions and scoring

### **Step 3: Verify Data Generation**
```bash
# Validate the generated data
npm run validate-data
```

**This verifies:**
- Database connection and schema
- Data volume requirements
- Relationship integrity
- Dashboard API functionality

## 📊 **Batch Configuration Options**

### **Default Configuration**
```typescript
{
  totalCandidates: 500,
  batchSize: 25,
  includeMLData: true,
  includeDocuments: true,
  includeNotifications: true,
  timeRangeMonths: 12,
  cleanExistingData: false
}
```

### **Custom Configuration**
To modify the generation parameters, edit `backend/src/scripts/batchDataGeneration.ts`:

```typescript
const batchGenerator = new BatchDataGeneration({
  totalCandidates: 1000,    // Generate more candidates
  batchSize: 50,            // Larger batches
  timeRangeMonths: 24,      // 2 years of data
  cleanExistingData: true   // Clean before generating
});
```

## 🔍 **Data Verification**

### **Check Data Counts**
```bash
# View database in browser
npm run db:studio
```

### **Expected Results**
After successful generation, you should see:
```
📊 Final Data Summary:
👥 Candidates: 500 (Primary entities)
📝 Applications: 1,200+ (2.4 avg per candidate)
🎯 Interviews: 600+ (50% of applications)
💼 Jobs: 20 (Active positions)
🔔 Notifications: 200+
📄 Documents: 300+

✅ Data Integrity Check:
- Candidates with applications: 500/500 (100%)
- Orphaned applications: 0
- Data consistency: ✅ PASS
```

## 🎯 **Dashboard Integration**

### **Start Backend**
```bash
npm run dev
```

### **Test Dashboard API**
```bash
# Test unified dashboard endpoint
curl http://localhost:3001/api/analytics/dashboard
```

### **Expected Dashboard Data**
The Dashboard should now show:
- ✅ **Real candidate counts** (not "0" or hardcoded values)
- ✅ **Dynamic time-to-hire** (calculated from actual data)
- ✅ **Live change percentages** (month-over-month comparisons)
- ✅ **Actual interview schedules** (from generated data)
- ✅ **Real job application counts** (linked to candidates)
- ✅ **Source analytics** (LinkedIn, Indeed, referrals breakdown)

## 🔄 **Batch Processing Details**

### **Phase 1: Database Preparation**
- ✅ Connection validation
- ✅ Schema verification
- ✅ Optional data cleaning

### **Phase 2: Core Data Generation (Batched)**
- 🔄 **Batch 1-20**: 25 candidates each
- 📝 **Applications**: 1-4 per candidate
- 🎯 **Interviews**: Based on application status
- 📊 **Realistic progression**: Applied → Screening → Interview → Hire

### **Phase 3: Supplementary Data**
- 🔔 **Notifications**: Application updates, interview schedules
- 📄 **Documents**: Resumes, cover letters, portfolios
- 🤖 **ML Data**: Candidate scoring and predictions
- 📈 **Business Metrics**: Historical trends

### **Phase 4: Validation**
- ✅ **Data Integrity**: All relationships verified
- 📊 **Count Validation**: Expected data volumes
- 🔗 **Candidate-Centric**: All data linked to candidate_ID

## 🚨 **Troubleshooting**

### **Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Test connection manually
psql -h localhost -U talentsol_user -d talentsol_ats
```

### **Generation Errors**
```bash
# Check logs for specific errors
npm run generate-batch 2>&1 | tee generation.log

# Clean and retry
npm run db:reset
npm run db:push
npm run data-full
```

### **Performance Issues**
- Reduce batch size: Edit `batchSize: 10` in configuration
- Reduce total candidates: Edit `totalCandidates: 100`
- Disable optional features: Set `includeMLData: false`

## 📈 **Performance Metrics**

### **Generation Speed**
- **Small Dataset** (100 candidates): ~30 seconds
- **Medium Dataset** (500 candidates): ~2-3 minutes
- **Large Dataset** (1000 candidates): ~5-7 minutes

### **Database Size**
- **500 candidates**: ~50MB database size
- **1000 candidates**: ~100MB database size
- **Includes**: Full text data, JSON fields, relationships

## ✅ **Success Criteria**

Your data generation is successful when:
- ✅ All batch phases complete without errors
- ✅ Data integrity check passes (100% candidates with applications)
- ✅ Dashboard shows real data (no "0" values)
- ✅ API endpoints return actual data
- ✅ Time-to-hire shows calculated values
- ✅ Charts display realistic trends
- ✅ All metrics trace back to candidate_ID

## 🎉 **Next Steps**

After successful data generation:
1. **Start Backend**: `npm run dev`
2. **Start Frontend**: `npm run dev` (in root directory)
3. **Visit Dashboard**: `http://localhost:8080`
4. **Explore Data**: Check all dashboard components
5. **Test Features**: Try filtering, searching, analytics

---

**🚀 Result**: A fully populated TalentSol ATS with 500+ candidates, 1,200+ applications, comprehensive analytics, and unified candidate-centric data architecture ready for production-like testing and demonstration.
