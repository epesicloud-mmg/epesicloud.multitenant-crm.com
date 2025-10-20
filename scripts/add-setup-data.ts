import { db } from '../server/db';
import { 
  interestLevels
} from '../shared/schema';
import { eq } from 'drizzle-orm';

async function addSetupData() {
  console.log('🔧 Adding missing Setup data...');

  // Use demo tenant ID
  const tenantId = 3;

  try {
    // 1. Create Interest Levels
    console.log('Creating Interest Levels...');
    const interestLevelData = [
      {
        level: 'Hot',
        description: 'Ready to buy, actively searching for property',
        color: '#EF4444', // Red
        tenantId,
      },
      {
        level: 'Warm',
        description: 'Interested buyer, needs more information',
        color: '#F59E0B', // Orange
        tenantId,
      },
      {
        level: 'Cold',
        description: 'Initial interest, long-term prospect',
        color: '#3B82F6', // Blue
        tenantId,
      },
      {
        level: 'Qualified',
        description: 'Financially qualified buyer, ready to move forward',
        color: '#10B981', // Green
        tenantId,
      },
      {
        level: 'Unqualified',
        description: 'Not currently qualified or not serious',
        color: '#6B7280', // Gray
        tenantId,
      },
    ];

    const createdInterestLevels = await db.insert(interestLevels).values(interestLevelData).returning();
    console.log(`✓ Created ${createdInterestLevels.length} Interest Levels`);

    console.log('\n✅ Successfully added all Setup data!');
    console.log('\nSummary:');
    console.log(`- ${createdInterestLevels.length} Interest Levels`);
    
  } catch (error) {
    console.error('❌ Error adding setup data:', error);
    throw error;
  }
}

addSetupData()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
