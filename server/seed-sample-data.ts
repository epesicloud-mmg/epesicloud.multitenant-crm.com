import { db } from "./db";
import { companies, contacts, products, deals, activities } from "@shared/schema";

async function seedSampleData() {
  console.log("🌱 Starting comprehensive sample data seeding...");

  try {
    // 1. Create sample companies
    const companiesData = [
      {
        name: "TechCorp Solutions",
        industry: "Technology",
        phone: "+1-555-0123",
        email: "info@techcorp.com",
        website: "https://techcorp.com",
        address: "123 Tech Street, Silicon Valley, CA 94101",
        tenantId: 1,
      },
      {
        name: "Unga Group",
        industry: "Manufacturing",
        phone: "+254-20-123456",
        email: "info@unga.co.ke",
        website: "https://unga.co.ke",
        address: "Unga House, Enterprise Road, Nairobi, Kenya",
        tenantId: 1,
      },
      {
        name: "Global Logistics Ltd",
        industry: "Logistics",
        phone: "+1-555-0456",
        email: "contact@globallogistics.com",
        website: "https://globallogistics.com",
        address: "789 Warehouse Blvd, Houston, TX 77001",
        tenantId: 1,
      },
      {
        name: "Medical Supplies Co",
        industry: "Healthcare",
        phone: "+1-555-0789",
        email: "sales@medsupplies.com",
        website: "https://medsupplies.com",
        address: "456 Health Plaza, Boston, MA 02101",
        tenantId: 1,
      },
      {
        name: "Green Energy Systems",
        industry: "Energy",
        phone: "+1-555-0321",
        email: "info@greenenergy.com",
        website: "https://greenenergy.com",
        address: "321 Solar Drive, Austin, TX 78701",
        tenantId: 1,
      },
      {
        name: "Financial Advisors Inc",
        industry: "Finance",
        phone: "+1-555-0654",
        email: "contact@finadvisors.com",
        website: "https://finadvisors.com",
        address: "987 Wall Street, New York, NY 10005",
        tenantId: 1,
      }
    ];

    const insertedCompanies = await db.insert(companies).values(companiesData).returning();
    console.log(`✅ Created ${insertedCompanies.length} companies`);

    // 2. Create sample contacts
    const contactsData = [
      {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@techcorp.com",
        phone: "+1-555-0124",
        jobTitle: "CTO",
        companyId: insertedCompanies[0].id,
        tenantId: 1,
      },
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@techcorp.com",
        phone: "+1-555-0125",
        jobTitle: "VP of Sales",
        companyId: insertedCompanies[0].id,
        tenantId: 1,
      },
      {
        firstName: "David",
        lastName: "Mwangi",
        email: "david.mwangi@unga.co.ke",
        phone: "+254-20-123457",
        jobTitle: "General Manager",
        companyId: insertedCompanies[1].id,
        tenantId: 1,
      },
      {
        firstName: "Grace",
        lastName: "Wanjiku",
        email: "grace.wanjiku@unga.co.ke",
        phone: "+254-20-123458",
        jobTitle: "Procurement Manager",
        companyId: insertedCompanies[1].id,
        tenantId: 1,
      },
      {
        firstName: "Michael",
        lastName: "Rodriguez",
        email: "michael.rodriguez@globallogistics.com",
        phone: "+1-555-0457",
        jobTitle: "Operations Director",
        companyId: insertedCompanies[2].id,
        tenantId: 1,
      },
      {
        firstName: "Emily",
        lastName: "Chen",
        email: "emily.chen@medsupplies.com",
        phone: "+1-555-0790",
        jobTitle: "Head of Purchasing",
        companyId: insertedCompanies[3].id,
        tenantId: 1,
      },
      {
        firstName: "Robert",
        lastName: "Thompson",
        email: "robert.thompson@greenenergy.com",
        phone: "+1-555-0322",
        jobTitle: "Project Manager",
        companyId: insertedCompanies[4].id,
        tenantId: 1,
      },
      {
        firstName: "Lisa",
        lastName: "Wilson",
        email: "lisa.wilson@finadvisors.com",
        phone: "+1-555-0655",
        jobTitle: "Senior Partner",
        companyId: insertedCompanies[5].id,
        tenantId: 1,
      },
      {
        firstName: "James",
        lastName: "Miller",
        email: "james.miller@techstartup.com",
        phone: "+1-555-0999",
        jobTitle: "Founder",
        companyId: null,
        tenantId: 1,
      },
      {
        firstName: "Anna",
        lastName: "Davis",
        email: "anna.davis@consultingfirm.com",
        phone: "+1-555-0888",
        jobTitle: "Senior Consultant",
        companyId: null,
        tenantId: 1,
      }
    ];

    const insertedContacts = await db.insert(contacts).values(contactsData).returning();
    console.log(`✅ Created ${insertedContacts.length} contacts`);

    // 3. Create additional products
    const additionalProducts = [
      {
        name: "Digital Marketing Suite",
        title: "Complete Digital Marketing Platform",
        description: "Comprehensive digital marketing tools including SEO, social media management, and analytics",
        category: "Software",
        salePrice: "2500.00",
        featuredPhoto: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
        salesPipelineId: 6, // Assuming Service pipeline
        tenantId: 1,
      },
      {
        name: "Enterprise CRM System",
        title: "Custom CRM Solution",
        description: "Tailored CRM system for large enterprises with custom integrations",
        category: "Software",
        salePrice: "15000.00",
        featuredPhoto: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
        salesPipelineId: 6,
        tenantId: 1,
      },
      {
        name: "Solar Panel Installation",
        title: "Commercial Solar Panel System",
        description: "Complete solar panel installation for commercial buildings including maintenance",
        category: "Energy",
        salePrice: "45000.00",
        featuredPhoto: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400",
        salesPipelineId: 6,
        tenantId: 1,
      },
      {
        name: "Medical Equipment Package",
        title: "Hospital Equipment Suite",
        description: "Complete medical equipment package for hospitals and clinics",
        category: "Healthcare",
        salePrice: "85000.00",
        featuredPhoto: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400",
        salesPipelineId: 6,
        tenantId: 1,
      },
      {
        name: "Logistics Management Software",
        title: "Fleet Management System",
        description: "Advanced logistics and fleet management software with real-time tracking",
        category: "Software",
        salePrice: "8500.00",
        featuredPhoto: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400",
        salesPipelineId: 6,
        tenantId: 1,
      }
    ];

    const insertedProducts = await db.insert(products).values(additionalProducts).returning();
    console.log(`✅ Created ${insertedProducts.length} additional products`);

    // 4. Create sample deals
    const dealsData = [
      {
        title: "TechCorp CRM Implementation",
        value: "15000.00",
        stage: "qualification",

        contactId: insertedContacts[0].id, // John Smith
        companyId: insertedCompanies[0].id, // TechCorp
        productId: insertedProducts[1].id, // Enterprise CRM
        interestLevelId: 1, // Hot
        expectedCloseDate: new Date("2025-03-15"),
        tenantId: 1,
      },
      {
        title: "Unga Digital Marketing Campaign",
        value: "2500.00",
        stage: "prospecting",

        contactId: insertedContacts[2].id, // David Mwangi
        companyId: insertedCompanies[1].id, // Unga Group
        productId: insertedProducts[0].id, // Digital Marketing Suite
        interestLevelId: 2, // Warm
        expectedCloseDate: new Date("2025-02-28"),
        tenantId: 1,
      },
      {
        title: "Global Logistics Fleet Management",
        value: "8500.00",
        stage: "proposal",

        contactId: insertedContacts[4].id, // Michael Rodriguez
        companyId: insertedCompanies[2].id, // Global Logistics
        productId: insertedProducts[4].id, // Logistics Software
        interestLevelId: 1, // Hot
        expectedCloseDate: new Date("2025-04-10"),
        tenantId: 1,
      },
      {
        title: "Medical Supplies Equipment Upgrade",
        value: "85000.00",
        stage: "negotiation",

        contactId: insertedContacts[5].id, // Emily Chen
        companyId: insertedCompanies[3].id, // Medical Supplies Co
        productId: insertedProducts[3].id, // Medical Equipment
        interestLevelId: 1, // Hot
        expectedCloseDate: new Date("2025-05-20"),
        tenantId: 1,
      },
      {
        title: "Green Energy Solar Installation",
        value: "45000.00",
        stage: "proposal",

        contactId: insertedContacts[6].id, // Robert Thompson
        companyId: insertedCompanies[4].id, // Green Energy
        productId: insertedProducts[2].id, // Solar Panel Installation
        interestLevelId: 2, // Warm
        expectedCloseDate: new Date("2025-06-15"),
        tenantId: 1,
      },
      {
        title: "Financial Advisors CRM Setup",
        value: "15000.00",
        stage: "prospecting",

        contactId: insertedContacts[7].id, // Lisa Wilson
        companyId: insertedCompanies[5].id, // Financial Advisors
        productId: insertedProducts[1].id, // Enterprise CRM
        interestLevelId: 3, // Cool
        expectedCloseDate: new Date("2025-07-30"),
        tenantId: 1,
      },
      {
        title: "Tech Startup Marketing Package",
        value: "2500.00",
        stage: "qualification",

        contactId: insertedContacts[8].id, // James Miller
        companyId: null,
        productId: insertedProducts[0].id, // Digital Marketing
        interestLevelId: 2, // Warm
        expectedCloseDate: new Date("2025-03-01"),
        tenantId: 1,
      },
      {
        title: "Consulting Firm Software Solution",
        value: "8500.00",
        stage: "closed-won",

        contactId: insertedContacts[9].id, // Anna Davis
        companyId: null,
        productId: insertedProducts[4].id, // Logistics Software
        interestLevelId: 1, // Hot
        expectedCloseDate: new Date("2025-01-15"),
        tenantId: 1,
      }
    ];

    const insertedDeals = await db.insert(deals).values(dealsData).returning();
    console.log(`✅ Created ${insertedDeals.length} deals`);

    // 5. Create sample activities
    const activitiesData = [
      {
        type: "call",
        subject: "Initial Discovery Call with TechCorp",
        description: "Discussed CRM requirements and current pain points. John mentioned they need better lead tracking and reporting capabilities.",
        contactId: insertedContacts[0].id,
        dealId: insertedDeals[0].id,
        userId: 1,
        scheduledAt: new Date("2025-01-20T10:00:00Z"),
        completedAt: new Date("2025-01-20T10:30:00Z"),
        tenantId: 1,
      },
      {
        type: "email",
        subject: "CRM Proposal Follow-up",
        description: "Sent detailed proposal with pricing and implementation timeline. Awaiting feedback from John and his team.",
        contactId: insertedContacts[0].id,
        dealId: insertedDeals[0].id,
        userId: 1,
        scheduledAt: new Date("2025-01-21T14:00:00Z"),
        completedAt: new Date("2025-01-21T14:15:00Z"),
        tenantId: 1,
      },
      {
        type: "meeting",
        subject: "Unga Group Marketing Strategy Meeting",
        description: "Discussed digital marketing strategy for East African market expansion. Grace showed strong interest in social media management tools.",
        contactId: insertedContacts[3].id,
        dealId: insertedDeals[1].id,
        userId: 1,
        scheduledAt: new Date("2025-01-22T15:00:00Z"),
        completedAt: null,
        tenantId: 1,
      },
      {
        type: "call",
        subject: "Fleet Management Demo Call",
        description: "Demonstrated real-time tracking capabilities to Michael. He was impressed with the route optimization features.",
        contactId: insertedContacts[4].id,
        dealId: insertedDeals[2].id,
        userId: 1,
        scheduledAt: new Date("2025-01-23T11:00:00Z"),
        completedAt: new Date("2025-01-23T11:45:00Z"),
        tenantId: 1,
      },
      {
        type: "email",
        subject: "Medical Equipment Specifications",
        description: "Sent detailed equipment specifications and compliance certifications. Emily requested additional safety documentation.",
        contactId: insertedContacts[5].id,
        dealId: insertedDeals[3].id,
        userId: 1,
        scheduledAt: new Date("2025-01-24T09:00:00Z"),
        completedAt: new Date("2025-01-24T09:10:00Z"),
        tenantId: 1,
      },
      {
        type: "note",
        subject: "Solar Installation Site Visit Notes",
        description: "Visited Green Energy facility to assess installation requirements. Roof structure is suitable for proposed solar panel configuration.",
        contactId: insertedContacts[6].id,
        dealId: insertedDeals[4].id,
        userId: 1,
        scheduledAt: new Date("2025-01-25T13:00:00Z"),
        completedAt: new Date("2025-01-25T16:00:00Z"),
        tenantId: 1,
      },
      {
        type: "meeting",
        subject: "Financial Services CRM Requirements",
        description: "Meeting scheduled to discuss compliance requirements and integration with existing financial systems.",
        contactId: insertedContacts[7].id,
        dealId: insertedDeals[5].id,
        userId: 1,
        scheduledAt: new Date("2025-01-27T10:00:00Z"),
        completedAt: null,
        tenantId: 1,
      },
      {
        type: "call",
        subject: "Startup Marketing Budget Discussion",
        description: "James explained budget constraints for early-stage startup. Discussed phased implementation approach.",
        contactId: insertedContacts[8].id,
        dealId: insertedDeals[6].id,
        userId: 1,
        scheduledAt: new Date("2025-01-26T16:00:00Z"),
        completedAt: new Date("2025-01-26T16:30:00Z"),
        tenantId: 1,
      },
      {
        type: "email",
        subject: "Project Completion Confirmation",
        description: "Confirmed successful deployment of logistics software. Anna provided positive feedback on training and support.",
        contactId: insertedContacts[9].id,
        dealId: insertedDeals[7].id,
        userId: 1,
        scheduledAt: new Date("2025-01-15T12:00:00Z"),
        completedAt: new Date("2025-01-15T12:05:00Z"),
        tenantId: 1,
      },
      {
        type: "note",
        subject: "Competitive Analysis Notes",
        description: "Researched competitor offerings in CRM space. Our solution offers better customization and integration capabilities.",
        contactId: null,
        dealId: null,
        userId: 1,
        scheduledAt: new Date("2025-01-28T14:00:00Z"),
        completedAt: new Date("2025-01-28T15:30:00Z"),
        tenantId: 1,
      }
    ];

    const insertedActivities = await db.insert(activities).values(activitiesData).returning();
    console.log(`✅ Created ${insertedActivities.length} activities`);

    console.log("🎉 All comprehensive sample data seeded successfully!");
    console.log(`
📊 Summary:
- Companies: ${insertedCompanies.length}
- Contacts: ${insertedContacts.length}
- Products: ${insertedProducts.length}
- Deals: ${insertedDeals.length}
- Activities: ${insertedActivities.length}
    `);

  } catch (error) {
    console.error("❌ Error seeding sample data:", error);
    throw error;
  }
}

// Execute if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedSampleData()
    .then(() => {
      console.log("✅ Sample data seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Sample data seeding failed:", error);
      process.exit(1);
    });
}

export { seedSampleData };