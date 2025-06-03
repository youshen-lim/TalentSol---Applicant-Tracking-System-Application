// Simple test to run CSV import
import { importFromCSV } from './src/scripts/importFromCSV.ts';

async function runImport() {
  try {
    console.log('🚀 Starting CSV import...');
    await importFromCSV();
    console.log('✅ Import completed successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

runImport();
