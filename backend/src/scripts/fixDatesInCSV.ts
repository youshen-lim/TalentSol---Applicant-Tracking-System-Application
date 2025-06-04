import fs from 'fs';
import path from 'path';

/**
 * Fix Dates in CSV Script
 * Fixes the date inconsistencies in the TalentSol CSV file
 * - Makes hired_at dates AFTER submitted_date
 * - Updates interview dates to be recent/upcoming
 */

const CSV_PATH = path.join(__dirname, '../../data/talentsol_with_synthetic_data.csv');

function getRandomDateBetween(startDate: Date, endDate: Date): Date {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDateTime(date: Date): string {
  return date.toISOString();
}

async function fixDatesInCSV() {
  console.log('🔧 Fixing date inconsistencies in CSV file...');

  try {
    // Read the CSV file
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    console.log(`📄 Processing ${lines.length - 1} data rows...`);

    // Find column indices
    const submittedDateIndex = headers.indexOf('submitted_date');
    const hiredAtIndex = headers.indexOf('hired_at');
    const interviewScheduledIndex = headers.indexOf('interview_scheduled_date');
    
    if (submittedDateIndex === -1 || hiredAtIndex === -1) {
      throw new Error('Required date columns not found in CSV');
    }

    // Process each data row
    const fixedLines = [lines[0]]; // Keep header
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const columns = lines[i].split(',');
      
      // Get current dates
      const submittedDateStr = columns[submittedDateIndex];
      const hiredAtStr = columns[hiredAtIndex];
      const interviewDateStr = columns[interviewScheduledIndex];
      
      if (submittedDateStr) {
        const submittedDate = new Date(submittedDateStr);
        
        // Fix hired_at date if it exists and is before submitted_date
        if (hiredAtStr && hiredAtStr.trim()) {
          const hiredDate = new Date(hiredAtStr);
          
          if (hiredDate < submittedDate) {
            // Set hired date to be 7-45 days after submission
            const daysToAdd = 7 + Math.random() * 38; // 7-45 days
            const newHiredDate = new Date(submittedDate);
            newHiredDate.setDate(newHiredDate.getDate() + daysToAdd);
            
            columns[hiredAtIndex] = formatDateTime(newHiredDate);
            console.log(`✅ Fixed hired date for row ${i}: ${hiredAtStr} → ${formatDateTime(newHiredDate)}`);
          }
        }
        
        // Fix interview date if it exists and is in the past
        if (interviewDateStr && interviewDateStr.trim()) {
          const interviewDate = new Date(interviewDateStr);
          const now = new Date();
          
          if (interviewDate < now) {
            // Set interview date to be within next 2 weeks
            const daysToAdd = Math.random() * 14; // 0-14 days from now
            const newInterviewDate = new Date(now);
            newInterviewDate.setDate(newInterviewDate.getDate() + daysToAdd);
            
            // Set to business hours (9 AM - 5 PM)
            newInterviewDate.setHours(9 + Math.random() * 8);
            newInterviewDate.setMinutes(Math.random() * 60);
            newInterviewDate.setSeconds(0);
            
            columns[interviewScheduledIndex] = formatDateTime(newInterviewDate);
            console.log(`✅ Fixed interview date for row ${i}: ${interviewDateStr} → ${formatDateTime(newInterviewDate)}`);
          }
        }
      }
      
      fixedLines.push(columns.join(','));
    }
    
    // Write the fixed CSV back
    const fixedContent = fixedLines.join('\n');
    fs.writeFileSync(CSV_PATH, fixedContent, 'utf-8');
    
    console.log('✅ CSV file dates fixed successfully!');
    console.log(`📄 Updated file: ${CSV_PATH}`);
    console.log('\n💡 Now run the import script to update the database:');
    console.log('   npx tsx src/scripts/importFromCSV.ts');
    
  } catch (error) {
    console.error('❌ Error fixing CSV dates:', error);
    throw error;
  }
}

// Run the script
fixDatesInCSV();
