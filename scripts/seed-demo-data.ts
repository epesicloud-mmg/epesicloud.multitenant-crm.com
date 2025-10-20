import { db } from '../server/db';
import { 
  tenants, 
  roles, 
  users, 
  tenantUsers,
  salesPipelines,
  salesStages,
  products,
  productTypes,
  productCategories,
  leadSources,
  activityTypes,
  customerTypes,
  meetingTypes,
  meetingCancellationReasons,
  paymentMethods,
  paymentItems,
  contacts,
  companies,
  deals
} from '../shared/schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting demo data seeding...');

  try {
    // 1. Create or Get Tenant
    console.log('Checking for existing tenant: Comfort Urban Residence');
    let tenant = await db.select().from(tenants).where(eq(tenants.subdomain, 'comfort-urban')).limit(1);
    
    if (tenant.length === 0) {
      console.log('Creating new tenant: Comfort Urban Residence');
      const [newTenant] = await db.insert(tenants).values({
        name: 'Comfort Urban Residence',
        subdomain: 'comfort-urban',
      }).returning();
      tenant = [newTenant];
      console.log(`✓ Tenant created with ID: ${newTenant.id}`);
    } else {
      console.log(`✓ Using existing tenant with ID: ${tenant[0].id}`);
    }
    
    const tenantId = tenant[0].id;

    // 2. Create or Get Super Admin Role
    console.log('Checking for Super Admin role');
    let role = await db.select().from(roles).where(eq(roles.name, 'Super Admin')).where(eq(roles.tenantId, tenantId)).limit(1);
    
    if (role.length === 0) {
      console.log('Creating Super Admin role');
      const [newRole] = await db.insert(roles).values({
        name: 'Super Admin',
        level: 100,
        permissions: ['manage_users', 'manage_roles', 'view_reports', 'manage_deals', 'manage_contacts', 'manage_products'],
        description: 'Full system access',
        modules: ['crm', 'sales', 'setup', 'reports'],
        isActive: true,
        tenantId,
      }).returning();
      role = [newRole];
      console.log(`✓ Role created with ID: ${newRole.id}`);
    } else {
      console.log(`✓ Using existing role with ID: ${role[0].id}`);
    }

    // 3. Create or Get User
    console.log('Checking for user: hello@epesicloud.com');
    let user = await db.select().from(users).where(eq(users.email, 'hello@epesicloud.com')).limit(1);
    
    if (user.length === 0) {
      console.log('Creating user: hello@epesicloud.com');
      const hashedPassword = await bcrypt.hash('Hello123???', 10);
      
      const [newUser] = await db.insert(users).values({
        username: 'hello',
        password: hashedPassword,
        email: 'hello@epesicloud.com',
        firstName: 'Demo',
        lastName: 'User',
        roleId: role[0].id,
        isActive: true,
        tenantId,
        department: 'Sales',
        phone: '+1-555-0100',
      }).returning();
      user = [newUser];
      console.log(`✓ User created with ID: ${newUser.id}`);

      // 4. Link User to Tenant
      await db.insert(tenantUsers).values({
        tenantId,
        userId: newUser.id,
        roleId: role[0].id,
      });
      console.log('✓ User linked to tenant');
    } else {
      console.log(`✓ Using existing user with ID: ${user[0].id}`);
    }

    // 5. Create or Get Sales Pipeline with 7 Stages
    console.log('Checking for sales pipeline');
    let pipeline = await db.select().from(salesPipelines)
      .where(eq(salesPipelines.tenantId, tenantId))
      .where(eq(salesPipelines.isDefault, true))
      .limit(1);
    
    if (pipeline.length === 0) {
      console.log('Creating sales pipeline with 7 stages');
      const [newPipeline] = await db.insert(salesPipelines).values({
        title: 'Real Estate Sales Pipeline',
        description: 'Standard real estate sales workflow',
        isDefault: true,
        tenantId,
      }).returning();
      pipeline = [newPipeline];
      console.log(`✓ Pipeline created with ID: ${newPipeline.id}`);

      const stages = [
        { title: 'Lead Generation', order: 1 },
        { title: 'Lead Qualification', order: 2 },
        { title: 'Property Presentation', order: 3 },
        { title: 'Negotiation', order: 4 },
        { title: 'Contract Signing', order: 5 },
        { title: 'Payment & Closing', order: 6 },
        { title: 'Referral & Reinvestment', order: 7 },
      ];

      for (const stage of stages) {
        await db.insert(salesStages).values({
          ...stage,
          salePipelineId: pipeline[0].id,
          tenantId,
        });
      }
      console.log(`✓ Created ${stages.length} sales stages`);
    } else {
      console.log(`✓ Using existing pipeline with ID: ${pipeline[0].id}`);
    }

    // 6. Create Product Types
    console.log('Creating product types');
    const productTypeData = [
      { name: 'Residential Unit', description: 'Residential property units', tenantId },
      { name: 'Commercial Space', description: 'Commercial property spaces', tenantId },
    ];
    
    const createdProductTypes = await db.insert(productTypes).values(productTypeData).returning();
    console.log(`✓ Created ${createdProductTypes.length} product types`);

    // 7. Create Product Categories
    console.log('Creating product categories');
    const categoryData = [
      { name: 'Studio', description: 'Studio apartments', tenantId },
      { name: '1 Bedroom', description: 'One bedroom units', tenantId },
      { name: '2 Bedroom', description: 'Two bedroom units', tenantId },
      { name: '3 Bedroom', description: 'Three bedroom units', tenantId },
      { name: 'Penthouse', description: 'Premium penthouse units', tenantId },
    ];
    
    const createdCategories = await db.insert(productCategories).values(categoryData).returning();
    console.log(`✓ Created ${createdCategories.length} product categories`);

    // 8. Create Products (Property Units)
    console.log('Creating property products');
    const productData = [
      {
        name: 'Studio Unit - 450 sqft',
        title: 'Studio Unit - 450 sqft',
        sku: 'STUDIO-001',
        salePrice: '1900000.00',
        categoryId: createdCategories[0].id,
        productTypeId: createdProductTypes[0].id,
        salesPipelineId: pipeline[0].id,
        description: 'Compact studio unit with modern amenities, perfect for singles or young professionals',
        tenantId,
      },
      {
        name: '1 Bed Unit - 720 sqft',
        title: '1 Bed Unit - 720 sqft',
        sku: '1BED-001',
        salePrice: '2950000.00',
        categoryId: createdCategories[1].id,
        productTypeId: createdProductTypes[0].id,
        salesPipelineId: pipeline[0].id,
        description: 'Spacious one-bedroom unit with balcony and premium finishes',
        tenantId,
      },
      {
        name: '2 Bed Convertible - 1100 sqft',
        title: '2 Bed Convertible - 1100 sqft',
        sku: '2BED-CONV-001',
        salePrice: '9000000.00',
        categoryId: createdCategories[2].id,
        productTypeId: createdProductTypes[0].id,
        salesPipelineId: pipeline[0].id,
        description: 'Flexible two-bedroom convertible unit with panoramic city views',
        tenantId,
      },
      {
        name: '3 Bed Premium - 1550 sqft',
        title: '3 Bed Premium - 1550 sqft',
        sku: '3BED-001',
        salePrice: '11000000.00',
        categoryId: createdCategories[3].id,
        productTypeId: createdProductTypes[0].id,
        salesPipelineId: pipeline[0].id,
        description: 'Luxury three-bedroom unit with master suite and home office space',
        tenantId,
      },
    ];
    
    const createdProducts = await db.insert(products).values(productData).returning();
    console.log(`✓ Created ${createdProducts.length} products`);

    // 9. Create Lead Sources
    console.log('Creating lead sources');
    const leadSourceData = [
      { sourceName: 'Website', category: 'Digital Marketing', description: 'Leads from company website', tenantId },
      { sourceName: 'Walk-In', category: 'Offline', description: 'Direct walk-in visitors', tenantId },
      { sourceName: 'Phone Inquiry', category: 'Offline', description: 'Phone call inquiries', tenantId },
      { sourceName: 'Referral', category: 'Referral', description: 'Customer referrals', tenantId },
      { sourceName: 'Social Media', category: 'Social Media', description: 'Facebook, Instagram, LinkedIn', tenantId },
      { sourceName: 'Email Campaign', category: 'Digital Marketing', description: 'Email marketing campaigns', tenantId },
      { sourceName: 'Property Portal', category: 'Digital Marketing', description: 'Property listing websites', tenantId },
      { sourceName: 'Agent Referral', category: 'Referral', description: 'Real estate agent referrals', tenantId },
      { sourceName: 'Event', category: 'Offline', description: 'Property showcase events', tenantId },
      { sourceName: 'Advertisement', category: 'Digital Marketing', description: 'Paid advertising campaigns', tenantId },
    ];
    
    await db.insert(leadSources).values(leadSourceData);
    console.log(`✓ Created ${leadSourceData.length} lead sources`);

    // 10. Create Activity Types
    console.log('Creating activity types');
    const activityTypeData = [
      { typeName: 'Call', description: 'Phone call', tenantId },
      { typeName: 'Email', description: 'Email communication', tenantId },
      { typeName: 'SMS', description: 'Text message', tenantId },
      { typeName: 'Site Visit', description: 'Property site visit', tenantId },
      { typeName: 'Meeting', description: 'In-person meeting', tenantId },
      { typeName: 'Follow-up', description: 'Follow-up activity', tenantId },
      { typeName: 'Presentation', description: 'Property presentation', tenantId },
      { typeName: 'Document Submission', description: 'Document submission', tenantId },
      { typeName: 'Contract Review', description: 'Contract review meeting', tenantId },
      { typeName: 'Payment', description: 'Payment transaction', tenantId },
      { typeName: 'Viewing Appointment', description: 'Scheduled property viewing', tenantId },
      { typeName: 'Negotiation', description: 'Price negotiation session', tenantId },
      { typeName: 'Video Call', description: 'Virtual meeting or tour', tenantId },
    ];
    
    await db.insert(activityTypes).values(activityTypeData);
    console.log(`✓ Created ${activityTypeData.length} activity types`);

    // 11. Create Customer Types
    console.log('Creating customer types');
    const customerTypeData = [
      { typeName: 'First-Time Buyer', description: 'First property purchase', tenantId },
      { typeName: 'Investor', description: 'Investment property buyer', tenantId },
      { typeName: 'Upgrader', description: 'Upgrading from current property', tenantId },
      { typeName: 'Downsizer', description: 'Downsizing property', tenantId },
    ];
    
    await db.insert(customerTypes).values(customerTypeData);
    console.log(`✓ Created ${customerTypeData.length} customer types`);

    // 12. Create Meeting Types
    console.log('Creating meeting types');
    const meetingTypeData = [
      { typeName: 'Initial Consultation', description: 'First meeting with client', tenantId },
      { typeName: 'Property Viewing', description: 'Scheduled property tour', tenantId },
      { typeName: 'Negotiation Meeting', description: 'Price and terms discussion', tenantId },
      { typeName: 'Contract Signing', description: 'Contract execution meeting', tenantId },
    ];
    
    await db.insert(meetingTypes).values(meetingTypeData);
    console.log(`✓ Created ${meetingTypeData.length} meeting types`);

    // 13. Create Cancellation Reasons
    console.log('Creating meeting cancellation reasons');
    const cancellationData = [
      { reason: 'Client Request', description: 'Client requested cancellation', tenantId },
      { reason: 'Schedule Conflict', description: 'Scheduling conflict', tenantId },
      { reason: 'Property Unavailable', description: 'Property no longer available', tenantId },
      { reason: 'Weather', description: 'Adverse weather conditions', tenantId },
    ];
    
    await db.insert(meetingCancellationReasons).values(cancellationData);
    console.log(`✓ Created ${cancellationData.length} cancellation reasons`);

    // 14. Create Payment Methods
    console.log('Creating payment methods');
    const paymentMethodData = [
      { methodName: 'Bank Transfer', description: 'Direct bank transfer', tenantId },
      { methodName: 'Check', description: 'Check payment', tenantId },
      { methodName: 'Cash', description: 'Cash payment', tenantId },
      { methodName: 'Credit Card', description: 'Credit card payment', tenantId },
    ];
    
    await db.insert(paymentMethods).values(paymentMethodData);
    console.log(`✓ Created ${paymentMethodData.length} payment methods`);

    // 15. Create Dummy Companies
    console.log('Creating dummy companies');
    const companyData = [
      { name: 'Tech Solutions Inc', industry: 'Technology', website: 'techsolutions.example', phone: '+1-555-0101', address: '123 Tech Street, Silicon Valley', tenantId },
      { name: 'Global Investments Ltd', industry: 'Finance', website: 'globalinvest.example', phone: '+1-555-0102', address: '456 Finance Ave, New York', tenantId },
      { name: 'Smith Family Trust', industry: 'Private', website: null, phone: '+1-555-0103', address: '789 Trust Lane, Boston', tenantId },
      { name: 'Green Energy Corp', industry: 'Energy', website: 'greenenergy.example', phone: '+1-555-0104', address: '321 Solar Blvd, Austin', tenantId },
      { name: 'Healthcare Partners', industry: 'Healthcare', website: 'healthpartners.example', phone: '+1-555-0105', address: '654 Medical Center, Chicago', tenantId },
      { name: 'Real Estate Holdings', industry: 'Real Estate', website: 'reholdings.example', phone: '+1-555-0106', address: '987 Property Plaza, Miami', tenantId },
      { name: 'Retail Ventures LLC', industry: 'Retail', website: 'retailventures.example', phone: '+1-555-0107', address: '147 Commerce St, Seattle', tenantId },
      { name: 'Manufacturing Corp', industry: 'Manufacturing', website: 'mfgcorp.example', phone: '+1-555-0108', address: '258 Industrial Park, Detroit', tenantId },
    ];
    
    const createdCompanies = await db.insert(companies).values(companyData).returning();
    console.log(`✓ Created ${createdCompanies.length} companies`);

    // 16. Create Dummy Contacts
    console.log('Creating dummy contacts');
    const contactData = [
      { firstName: 'John', lastName: 'Anderson', email: 'j.anderson@techsolutions.example', phone: '+1-555-1001', jobTitle: 'CEO', companyId: createdCompanies[0].id, tenantId },
      { firstName: 'Sarah', lastName: 'Mitchell', email: 's.mitchell@globalinvest.example', phone: '+1-555-1002', jobTitle: 'Investment Manager', companyId: createdCompanies[1].id, tenantId },
      { firstName: 'Robert', lastName: 'Smith', email: 'robert.smith@email.example', phone: '+1-555-1003', jobTitle: 'Trustee', companyId: createdCompanies[2].id, tenantId },
      { firstName: 'Emily', lastName: 'Johnson', email: 'e.johnson@greenenergy.example', phone: '+1-555-1004', jobTitle: 'Director', companyId: createdCompanies[3].id, tenantId },
      { firstName: 'Michael', lastName: 'Brown', email: 'm.brown@healthpartners.example', phone: '+1-555-1005', jobTitle: 'Partner', companyId: createdCompanies[4].id, tenantId },
      { firstName: 'Jennifer', lastName: 'Davis', email: 'j.davis@reholdings.example', phone: '+1-555-1006', jobTitle: 'Investor', companyId: createdCompanies[5].id, tenantId },
      { firstName: 'David', lastName: 'Wilson', email: 'd.wilson@retailventures.example', phone: '+1-555-1007', jobTitle: 'VP Operations', companyId: createdCompanies[6].id, tenantId },
      { firstName: 'Lisa', lastName: 'Taylor', email: 'l.taylor@mfgcorp.example', phone: '+1-555-1008', jobTitle: 'CFO', companyId: createdCompanies[7].id, tenantId },
      { firstName: 'James', lastName: 'Martinez', email: 'james.martinez@email.example', phone: '+1-555-1009', jobTitle: 'Entrepreneur', companyId: null, tenantId },
      { firstName: 'Patricia', lastName: 'Garcia', email: 'p.garcia@email.example', phone: '+1-555-1010', jobTitle: 'Consultant', companyId: null, tenantId },
      { firstName: 'Christopher', lastName: 'Rodriguez', email: 'c.rodriguez@email.example', phone: '+1-555-1011', jobTitle: 'Private Investor', companyId: null, tenantId },
      { firstName: 'Linda', lastName: 'Hernandez', email: 'l.hernandez@email.example', phone: '+1-555-1012', jobTitle: 'Doctor', companyId: null, tenantId },
      { firstName: 'Daniel', lastName: 'Lopez', email: 'd.lopez@email.example', phone: '+1-555-1013', jobTitle: 'Lawyer', companyId: null, tenantId },
      { firstName: 'Barbara', lastName: 'Gonzalez', email: 'b.gonzalez@email.example', phone: '+1-555-1014', jobTitle: 'Business Owner', companyId: null, tenantId },
      { firstName: 'Thomas', lastName: 'Perez', email: 't.perez@email.example', phone: '+1-555-1015', jobTitle: 'Architect', companyId: null, tenantId },
    ];
    
    const createdContacts = await db.insert(contacts).values(contactData).returning();
    console.log(`✓ Created ${createdContacts.length} contacts`);

    // 17. Create Dummy Deals
    console.log('Creating dummy deals');
    // Query pipeline stages with explicit ordering to ensure consistent indexing
    const pipelineStages = await db.select().from(salesStages)
      .where(eq(salesStages.salePipelineId, pipeline[0].id))
      .orderBy(salesStages.order);
    
    const dealData = [
      {
        title: 'Studio Unit - John Anderson',
        value: '1900000.00',
        stageId: pipelineStages[3].id, // Negotiation
        contactId: createdContacts[0].id,
        productId: createdProducts[0].id,
        probability: 75,
        assignedToId: user[0].id,
        expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        tenantId,
      },
      {
        title: '1 Bed Unit - Sarah Mitchell',
        value: '2950000.00',
        stageId: pipelineStages[4].id, // Contract Signing
        contactId: createdContacts[1].id,
        productId: createdProducts[1].id,
        probability: 90,
        assignedToId: user[0].id,
        expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        tenantId,
      },
      {
        title: '2 Bed Convertible - Robert Smith',
        value: '9000000.00',
        stageId: pipelineStages[2].id, // Property Presentation
        contactId: createdContacts[2].id,
        productId: createdProducts[2].id,
        probability: 60,
        assignedToId: user[0].id,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        tenantId,
      },
      {
        title: '3 Bed Premium - Emily Johnson',
        value: '11000000.00',
        stageId: pipelineStages[1].id, // Lead Qualification
        contactId: createdContacts[3].id,
        productId: createdProducts[3].id,
        probability: 40,
        assignedToId: user[0].id,
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        tenantId,
      },
      {
        title: 'Studio Unit - Michael Brown',
        value: '1900000.00',
        stageId: pipelineStages[5].id, // Payment & Closing
        contactId: createdContacts[4].id,
        productId: createdProducts[0].id,
        probability: 95,
        assignedToId: user[0].id,
        expectedCloseDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        tenantId,
      },
      {
        title: '1 Bed Unit - Jennifer Davis',
        value: '2950000.00',
        stageId: pipelineStages[0].id, // Lead Generation
        contactId: createdContacts[5].id,
        productId: createdProducts[1].id,
        probability: 30,
        assignedToId: user[0].id,
        expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        tenantId,
      },
      {
        title: '2 Bed Convertible - David Wilson',
        value: '9000000.00',
        stageId: pipelineStages[3].id, // Negotiation
        contactId: createdContacts[6].id,
        productId: createdProducts[2].id,
        probability: 70,
        assignedToId: user[0].id,
        expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days
        tenantId,
      },
      {
        title: '3 Bed Premium - Lisa Taylor',
        value: '11000000.00',
        stageId: pipelineStages[2].id, // Property Presentation
        contactId: createdContacts[7].id,
        productId: createdProducts[3].id,
        probability: 55,
        assignedToId: user[0].id,
        expectedCloseDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days
        tenantId,
      },
      {
        title: 'Studio Unit - James Martinez',
        value: '1900000.00',
        stageId: pipelineStages[1].id, // Lead Qualification
        contactId: createdContacts[8].id,
        productId: createdProducts[0].id,
        probability: 45,
        assignedToId: user[0].id,
        expectedCloseDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days
        tenantId,
      },
      {
        title: '1 Bed Unit - Patricia Garcia',
        value: '2950000.00',
        stageId: pipelineStages[4].id, // Contract Signing
        contactId: createdContacts[9].id,
        productId: createdProducts[1].id,
        probability: 85,
        assignedToId: user[0].id,
        expectedCloseDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        tenantId,
      },
      {
        title: '2 Bed Convertible - Christopher Rodriguez',
        value: '9000000.00',
        stageId: pipelineStages[0].id, // Lead Generation
        contactId: createdContacts[10].id,
        productId: createdProducts[2].id,
        probability: 25,
        assignedToId: user[0].id,
        expectedCloseDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days
        tenantId,
      },
      {
        title: '3 Bed Premium - Linda Hernandez',
        value: '11000000.00',
        stageId: pipelineStages[3].id, // Negotiation
        contactId: createdContacts[11].id,
        productId: createdProducts[3].id,
        probability: 65,
        assignedToId: user[0].id,
        expectedCloseDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days
        tenantId,
      },
    ];
    
    const createdDeals = await db.insert(deals).values(dealData).returning();
    console.log(`✓ Created ${createdDeals.length} deals`);
    
    // Get final stage count
    const finalStageCount = await db.select().from(salesStages).where(eq(salesStages.salePipelineId, pipeline[0].id));
    
    console.log('✓ Setup complete!');
    console.log('\n📊 Summary:');
    console.log(`   Tenant: ${tenant[0].name} (ID: ${tenantId})`);
    console.log(`   User: ${user[0].email}`);
    console.log(`   Products: ${createdProducts.length}`);
    console.log(`   Companies: ${createdCompanies.length}`);
    console.log(`   Contacts: ${createdContacts.length}`);
    console.log(`   Deals: ${createdDeals.length}`);
    console.log(`   Sales Stages: ${finalStageCount.length}`);
    console.log('\n✅ Demo data seeding complete!');
    console.log('\n🔐 Login Credentials:');
    console.log('   Email: hello@epesicloud.com');
    console.log('   Password: Hello123???');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// Import eq for query
import { eq } from 'drizzle-orm';

seed()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
