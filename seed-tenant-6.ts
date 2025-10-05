import { seedRealEstateData } from './server/seed-real-estate-data';

async function seedTenant6() {
  try {
    console.log('Starting seed for tenant 6 (Real Estate Company)...');
    await seedRealEstateData(6);
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedTenant6();
