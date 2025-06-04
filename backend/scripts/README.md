# TalentSol ATS - Synthetic Data Generator

This script generates synthetic data to fix the Dashboard metrics that are showing zero:
- **Time to Hire**: Creates applications with `hired` status and `hiredAt` dates
- **Interviews This Week**: Creates upcoming interviews scheduled for the next 7 days

## Prerequisites

1. **Python 3.7+** installed on your system
2. **PostgreSQL database** running with TalentSol ATS data
3. **Database connection** configured (default: localhost:5432)

## Database Configuration

The script uses these default database settings:
```python
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'talentsol_user',
    'password': 'talentsol_password',
    'database': 'talentsol_ats'
}
```

If your database settings are different, edit `generate_synthetic_data.py` and update the `DB_CONFIG` dictionary.

## Usage

### Windows
```bash
cd backend/scripts
run_synthetic_data_generator.bat
```

### Linux/macOS
```bash
cd backend/scripts
chmod +x run_synthetic_data_generator.sh
./run_synthetic_data_generator.sh
```

### Manual Python Execution
```bash
cd backend/scripts
pip install -r requirements.txt
python generate_synthetic_data.py
```

**Note**: The script now uses `psycopg2-binary` instead of `asyncpg` to avoid compilation issues on Windows.

## What the Script Does

### 1. Time to Hire Data
- Updates 5 existing applications to `status: 'hired'`
- Sets `hired_at` dates 15-45 days after `submitted_at`
- Calculates realistic time-to-hire metrics

### 2. Interviews This Week Data
- Creates 8 new interview records
- Schedules interviews within the next 7 days
- Uses realistic interview types: technical, behavioral, panel, etc.
- Sets random times between 9 AM - 5 PM

### 3. Application Status Updates
- Updates 5 applications to `status: 'interview'`
- Creates consistency between applications and interviews

## Expected Output

```
🚀 TalentSol ATS - Synthetic Data Generator
==================================================
✅ Connected to TalentSol database
🔍 Fetching existing data...
📊 Found 20 applications and 3 users
🎯 Creating hired applications for Time to Hire metric...
  ✅ Updated application app_123 - hired after 23 days
  ✅ Updated application app_124 - hired after 31 days
  ...
📅 Creating upcoming interviews for Interviews This Week metric...
  ✅ Created technical interview on 2024-12-19 10:00
  ✅ Created behavioral interview on 2024-12-20 14:30
  ...
🔍 Verifying created data...
📊 Verification Results:
  - Hired applications: 5
  - Upcoming interviews (next 7 days): 8
🎉 Synthetic data generation completed successfully!
```

## Verification

After running the script:

1. **Check Dashboard**: Both metrics should now show non-zero values
2. **Time to Hire**: Should display average days (15-45 range)
3. **Interviews This Week**: Should show count of upcoming interviews

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in the script
- Verify the database name exists

### Permission Issues
- Make sure the database user has INSERT/UPDATE permissions
- Check if the applications and interviews tables exist

### Python Issues
- Install Python 3.7 or higher
- Install asyncpg: `pip install asyncpg`

## Files

- `generate_synthetic_data.py` - Main Python script
- `requirements.txt` - Python dependencies
- `run_synthetic_data_generator.bat` - Windows batch script
- `run_synthetic_data_generator.sh` - Unix/Linux shell script
- `README.md` - This documentation
