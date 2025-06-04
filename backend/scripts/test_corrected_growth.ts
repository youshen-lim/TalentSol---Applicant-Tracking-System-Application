import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCorrectedGrowth() {
  console.log('🔍 Testing Corrected Growth Calculation...');
  
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get candidates created in different periods
    const [totalCandidates, newCandidatesThisMonth] = await Promise.all([
      prisma.candidate.count({
        where: {
          applications: {
            some: {
              job: { companyId: 'comp_1' }
            }
          }
        }
      }),
      prisma.candidate.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          applications: {
            some: {
              job: { companyId: 'comp_1' }
            }
          }
        }
      })
    ]);
    
    const previousPeriodCandidates = Math.max(totalCandidates - newCandidatesThisMonth, 1);
    
    console.log(`\n📊 Data Summary:`);
    console.log(`   Total candidates: ${totalCandidates}`);
    console.log(`   New candidates this month: ${newCandidatesThisMonth}`);
    console.log(`   Previous period candidates: ${previousPeriodCandidates}`);
    
    // OLD (INCORRECT) CALCULATION
    const oldCalculation = Math.round((newCandidatesThisMonth / previousPeriodCandidates) * 100);
    console.log(`\n❌ OLD (Incorrect) Calculation:`);
    console.log(`   Formula: (${newCandidatesThisMonth} ÷ ${previousPeriodCandidates}) × 100`);
    console.log(`   Result: ${oldCalculation}% (This is a ratio, not growth!)`);
    
    // NEW (CORRECT) CALCULATION
    const newCalculation = Math.round(((newCandidatesThisMonth - previousPeriodCandidates) / previousPeriodCandidates) * 100);
    console.log(`\n✅ NEW (Correct) Calculation:`);
    console.log(`   Formula: ((${newCandidatesThisMonth} - ${previousPeriodCandidates}) ÷ ${previousPeriodCandidates}) × 100`);
    console.log(`   Result: ${newCalculation}%`);
    
    // Interpretation
    console.log(`\n💡 Interpretation:`);
    if (newCalculation > 0) {
      console.log(`   📈 ${newCalculation}% INCREASE in new candidates`);
      console.log(`   You gained ${newCandidatesThisMonth - previousPeriodCandidates} more candidates this month vs. previous period`);
    } else if (newCalculation < 0) {
      console.log(`   📉 ${Math.abs(newCalculation)}% DECREASE in new candidates`);
      console.log(`   You gained ${Math.abs(newCandidatesThisMonth - previousPeriodCandidates)} fewer candidates this month vs. previous period`);
    } else {
      console.log(`   ➡️  No change in candidate acquisition rate`);
    }
    
    // Example with your suggested numbers
    console.log(`\n🎯 Example with your suggested numbers:`);
    const exampleCurrent = 14;
    const examplePrevious = 36;
    const exampleGrowth = Math.round(((exampleCurrent - examplePrevious) / examplePrevious) * 100);
    console.log(`   Current: ${exampleCurrent}, Previous: ${examplePrevious}`);
    console.log(`   Growth: ((${exampleCurrent} - ${examplePrevious}) ÷ ${examplePrevious}) × 100 = ${exampleGrowth}%`);
    console.log(`   This would show a ${Math.abs(exampleGrowth)}% decrease in candidate acquisition`);
    
  } catch (error) {
    console.error('❌ Error testing growth calculation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCorrectedGrowth();
