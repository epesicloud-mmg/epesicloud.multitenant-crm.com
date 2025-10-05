import { storage } from "./storage";
import type { InsertLeadSource, InsertProductType, InsertProductCategory } from "@shared/schema";

// Real Estate Lead Sources based on the user's requirements
export const DEFAULT_LEAD_SOURCES: Omit<InsertLeadSource, 'tenantId'>[] = [
  // Social Media
  { sourceName: 'Facebook', category: 'Social Media', description: 'Leads from Facebook ads and organic posts', isActive: true },
  { sourceName: 'Instagram', category: 'Social Media', description: 'Leads from Instagram ads and stories', isActive: true },
  { sourceName: 'Twitter', category: 'Social Media', description: 'Leads from Twitter/X posts and ads', isActive: true },
  { sourceName: 'YouTube', category: 'Social Media', description: 'Leads from YouTube video marketing', isActive: true },
  { sourceName: 'LinkedIn', category: 'Social Media', description: 'Professional network leads', isActive: true },
  
  // Digital Marketing
  { sourceName: 'Landing Page', category: 'Digital Marketing', description: 'Website landing page inquiries', isActive: true },
  { sourceName: 'Google Ads', category: 'Digital Marketing', description: 'Google search and display ads', isActive: true },
  { sourceName: 'Email Campaign', category: 'Digital Marketing', description: 'Email marketing campaigns', isActive: true },
  { sourceName: 'SEO/Organic', category: 'Digital Marketing', description: 'Organic search traffic', isActive: true },
  { sourceName: 'Property Portal', category: 'Digital Marketing', description: 'Listings on property websites', isActive: true },
  
  // Referrals
  { sourceName: 'Realtor Referral', category: 'Referrals', description: 'Referrals from other real estate agents', isActive: true },
  { sourceName: 'Client Referral', category: 'Referrals', description: 'Referrals from existing clients', isActive: true },
  { sourceName: 'Partner Referral', category: 'Referrals', description: 'Business partner referrals', isActive: true },
  
  // Offline/Traditional
  { sourceName: 'Walk-in', category: 'Offline', description: 'Direct office walk-ins', isActive: true },
  { sourceName: 'Phone Inquiry', category: 'Offline', description: 'Direct phone calls', isActive: true },
  { sourceName: 'Open House', category: 'Offline', description: 'Open house events', isActive: true },
  { sourceName: 'Billboard/Print', category: 'Offline', description: 'Traditional advertising', isActive: true },
  
  // Events & Activations
  { sourceName: 'Property Exhibition', category: 'Events', description: 'Real estate exhibitions and shows', isActive: true },
  { sourceName: 'Webinar', category: 'Events', description: 'Online property webinars', isActive: true },
  { sourceName: 'Community Event', category: 'Events', description: 'Local community events', isActive: true },
];

// Real Estate Product Types (Room Configurations)
export const DEFAULT_PRODUCT_TYPES: Omit<InsertProductType, 'tenantId'>[] = [
  { name: 'Studio', description: 'Studio apartment - open living space' },
  { name: 'One Bedroom', description: '1 bedroom configuration' },
  { name: 'Two Bedroom', description: '2 bedroom configuration' },
  { name: 'Three Bedroom', description: '3 bedroom configuration' },
  { name: 'Four Bedroom', description: '4 bedroom configuration' },
  { name: 'Penthouse', description: 'Luxury penthouse unit' },
  { name: 'Duplex', description: 'Two-floor unit' },
  { name: 'Loft', description: 'Open-plan loft space' },
];

// Real Estate Product Categories (Property Types)
export const DEFAULT_PRODUCT_CATEGORIES: Omit<InsertProductCategory, 'tenantId'>[] = [
  { name: 'Apartment', description: 'Residential apartment units', color: '#3B82F6' },
  { name: 'Villa', description: 'Standalone villa properties', color: '#10B981' },
  { name: 'Townhouse', description: 'Townhouse properties', color: '#F59E0B' },
  { name: 'Office Space', description: 'Commercial office spaces', color: '#8B5CF6' },
  { name: 'Retail Space', description: 'Commercial retail units', color: '#EF4444' },
  { name: 'Warehouse', description: 'Industrial warehouse spaces', color: '#6B7280' },
  { name: 'Land Plot', description: 'Vacant land for development', color: '#059669' },
  { name: 'Building', description: 'Entire building for sale/rent', color: '#DC2626' },
];

/**
 * Creates default lead sources for a new tenant
 */
export async function createDefaultLeadSources(tenantId: number): Promise<void> {
  try {
    console.log(`Creating default lead sources for tenant ${tenantId}...`);
    
    for (const leadSource of DEFAULT_LEAD_SOURCES) {
      await storage.createLeadSource({
        ...leadSource,
        tenantId,
      });
    }
    
    console.log(`Successfully created ${DEFAULT_LEAD_SOURCES.length} lead sources for tenant ${tenantId}`);
  } catch (error) {
    console.error('Error creating default lead sources:', error);
    throw error;
  }
}

/**
 * Creates default product types for a new tenant
 */
export async function createDefaultProductTypes(tenantId: number): Promise<void> {
  try {
    console.log(`Creating default product types for tenant ${tenantId}...`);
    
    for (const productType of DEFAULT_PRODUCT_TYPES) {
      await storage.createProductType({
        ...productType,
        tenantId,
      });
    }
    
    console.log(`Successfully created ${DEFAULT_PRODUCT_TYPES.length} product types for tenant ${tenantId}`);
  } catch (error) {
    console.error('Error creating default product types:', error);
    throw error;
  }
}

/**
 * Creates default product categories for a new tenant
 */
export async function createDefaultProductCategories(tenantId: number): Promise<void> {
  try {
    console.log(`Creating default product categories for tenant ${tenantId}...`);
    
    for (const category of DEFAULT_PRODUCT_CATEGORIES) {
      await storage.createProductCategory({
        ...category,
        tenantId,
      });
    }
    
    console.log(`Successfully created ${DEFAULT_PRODUCT_CATEGORIES.length} product categories for tenant ${tenantId}`);
  } catch (error) {
    console.error('Error creating default product categories:', error);
    throw error;
  }
}

/**
 * Creates sample real estate products with variations for a new tenant
 */
export async function createSampleProducts(tenantId: number): Promise<void> {
  try {
    console.log(`Creating sample products for tenant ${tenantId}...`);
    
    // Get product types and categories for reference
    const productTypes = await storage.getProductTypes(tenantId);
    const categories = await storage.getProductCategories(tenantId);
    const pipelines = await storage.getSalesPipelines(tenantId);
    
    if (productTypes.length === 0 || categories.length === 0 || pipelines.length === 0) {
      console.log('Skipping sample products - prerequisites not met');
      return;
    }
    
    const defaultPipeline = pipelines.find(p => p.isDefault) || pipelines[0];
    
    // Sample Apartment Products
    const apartmentCategory = categories.find(c => c.name === 'Apartment');
    if (apartmentCategory) {
      const twoBedroomType = productTypes.find(pt => pt.name === 'Two Bedroom');
      if (twoBedroomType) {
        const sunsetTowers = await storage.createProduct({
          name: 'Sunset Towers',
          title: 'Sunset Towers - Luxury Apartments',
          sku: 'ST-APT-001',
          description: 'Modern luxury apartments with panoramic city views',
          productTypeId: twoBedroomType.id,
          categoryId: apartmentCategory.id,
          salesPipelineId: defaultPipeline.id,
          salePrice: '450000',
          tenantId,
        });
        
        // Create variations for Sunset Towers
        await storage.createProductVariation({
          productId: sunsetTowers.id,
          name: 'Unit A - 2BR Corner Unit',
          sku: 'ST-A-2BR',
          price: '475000',
          attributes: JSON.stringify({ floor: '15', view: 'City View', sqft: '1200' }),
          tenantId,
        });
        
        await storage.createProductVariation({
          productId: sunsetTowers.id,
          name: 'Unit B - 2BR Garden View',
          sku: 'ST-B-2BR',
          price: '425000',
          attributes: JSON.stringify({ floor: '3', view: 'Garden View', sqft: '1100' }),
          tenantId,
        });
      }
    }
    
    // Sample Villa Product
    const villaCategory = categories.find(c => c.name === 'Villa');
    if (villaCategory) {
      const threeBedroomType = productTypes.find(pt => pt.name === 'Three Bedroom');
      if (threeBedroomType) {
        const palmValley = await storage.createProduct({
          name: 'Palm Valley Villas',
          title: 'Palm Valley Villas - Exclusive Community',
          sku: 'PV-VIL-001',
          description: 'Exclusive gated community villas with private gardens',
          productTypeId: threeBedroomType.id,
          categoryId: villaCategory.id,
          salesPipelineId: defaultPipeline.id,
          salePrice: '850000',
          tenantId,
        });
        
        // Create variations for Palm Valley
        await storage.createProductVariation({
          productId: palmValley.id,
          name: 'Villa Type A - Corner Plot',
          sku: 'PV-A-3BR',
          price: '895000',
          attributes: JSON.stringify({ plot: 'Corner', sqft: '2800', pool: 'Yes' }),
          tenantId,
        });
        
        await storage.createProductVariation({
          productId: palmValley.id,
          name: 'Villa Type B - Standard',
          sku: 'PV-B-3BR',
          price: '825000',
          attributes: JSON.stringify({ plot: 'Standard', sqft: '2500', pool: 'Yes' }),
          tenantId,
        });
      }
    }
    
    console.log(`Successfully created sample products for tenant ${tenantId}`);
  } catch (error) {
    console.error('Error creating sample products:', error);
    throw error;
  }
}

/**
 * Seeds all real estate data for a new tenant
 * Call this function after tenant registration
 */
export async function seedRealEstateData(tenantId: number): Promise<void> {
  try {
    console.log(`Seeding real estate data for tenant ${tenantId}...`);
    
    await createDefaultLeadSources(tenantId);
    await createDefaultProductTypes(tenantId);
    await createDefaultProductCategories(tenantId);
    await createSampleProducts(tenantId);
    
    console.log(`Successfully seeded all real estate data for tenant ${tenantId}`);
  } catch (error) {
    console.error('Error seeding real estate data:', error);
    throw error;
  }
}
