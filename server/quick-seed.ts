import { db } from "./db";
import { users, roles, companies, leads, contacts, deals, dealStages, activities } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function quickSeed() {
  try {
    console.log("🌱 Starting quick database seeding...");

    // Clear existing data
    await db.delete(activities);
    await db.delete(deals);
    await db.delete(dealStages);
    await db.delete(contacts);
    await db.delete(leads);
    await db.delete(companies);
    await db.delete(users);
    await db.delete(roles);

    // Create roles
    const roleData = [
      { name: "admin", level: 100, permissions: ["*"], tenantId: 1 },
      { name: "sales_manager", level: 80, permissions: ["manage_users", "manage_leads", "manage_deals", "manage_contacts", "manage_companies", "manage_activities", "view_reports", "view_dashboard"], tenantId: 1 },
      { name: "supervisor", level: 60, permissions: ["manage_leads", "manage_deals", "manage_contacts", "manage_activities", "view_reports", "view_dashboard"], tenantId: 1 },
      { name: "agent", level: 40, permissions: ["manage_leads", "manage_deals", "manage_contacts", "manage_activities", "view_dashboard"], tenantId: 1 }
    ];

    const createdRoles = await db.insert(roles).values(roleData).returning();
    console.log(`✅ Created ${createdRoles.length} roles`);

    // Create users step by step
    const adminRole = createdRoles.find(r => r.name === "admin")!;
    const managerRole = createdRoles.find(r => r.name === "sales_manager")!;
    const supervisorRole = createdRoles.find(r => r.name === "supervisor")!;
    const agentRole = createdRoles.find(r => r.name === "agent")!;

    // Admin user
    const [adminUser] = await db.insert(users).values({
      username: "admin1",
      email: "admin@company.com",
      firstName: "Admin",
      lastName: "User",
      password: "hashed_password",
      roleId: adminRole.id,
      tenantId: 1,
      department: "Management",
      phone: "+1-555-0101",
      isActive: true,
      managerId: null
    }).returning();

    // Manager user
    const [managerUser] = await db.insert(users).values({
      username: "manager1",
      email: "manager1@company.com",
      firstName: "Sarah",
      lastName: "Johnson",
      password: "hashed_password",
      roleId: managerRole.id,
      tenantId: 1,
      department: "Sales",
      phone: "+1-555-0102",
      isActive: true,
      managerId: adminUser.id
    }).returning();

    // Supervisor users
    const [supervisor1] = await db.insert(users).values({
      username: "supervisor1",
      email: "supervisor1@company.com",
      firstName: "Mike",
      lastName: "Wilson",
      password: "hashed_password",
      roleId: supervisorRole.id,
      tenantId: 1,
      department: "Sales",
      phone: "+1-555-0103",
      isActive: true,
      managerId: managerUser.id
    }).returning();

    const [supervisor2] = await db.insert(users).values({
      username: "supervisor2",
      email: "supervisor2@company.com",
      firstName: "Lisa",
      lastName: "Anderson",
      password: "hashed_password",
      roleId: supervisorRole.id,
      tenantId: 1,
      department: "Sales",
      phone: "+1-555-0104",
      isActive: true,
      managerId: managerUser.id
    }).returning();

    // Agent users
    const agents = await db.insert(users).values([
      {
        username: "agent1",
        email: "agent1@company.com",
        firstName: "John",
        lastName: "Smith",
        password: "hashed_password",
        roleId: agentRole.id,
        tenantId: 1,
        department: "Sales",
        phone: "+1-555-0105",
        isActive: true,
        managerId: supervisor1.id
      },
      {
        username: "agent2",
        email: "agent2@company.com",
        firstName: "Emma",
        lastName: "Davis",
        password: "hashed_password",
        roleId: agentRole.id,
        tenantId: 1,
        department: "Sales",
        phone: "+1-555-0106",
        isActive: true,
        managerId: supervisor1.id
      },
      {
        username: "agent3",
        email: "agent3@company.com",
        firstName: "Robert",
        lastName: "Taylor",
        password: "hashed_password",
        roleId: agentRole.id,
        tenantId: 1,
        department: "Sales",
        phone: "+1-555-0107",
        isActive: true,
        managerId: supervisor2.id
      },
      {
        username: "agent4",
        email: "agent4@company.com",
        firstName: "Jessica",
        lastName: "Brown",
        password: "hashed_password",
        roleId: agentRole.id,
        tenantId: 1,
        department: "Sales",
        phone: "+1-555-0108",
        isActive: true,
        managerId: supervisor2.id
      }
    ]).returning();

    console.log(`✅ Created ${agents.length + 4} users total`);

    // Create companies
    const companyData = [
      {
        name: "TechCorp Solutions",
        industry: "Technology",
        website: "techcorp.com",
        phone: "+1-555-1001",
        address: "123 Tech Street, Silicon Valley, CA",
        tenantId: 1
      },
      {
        name: "Global Manufacturing Inc",
        industry: "Manufacturing",
        website: "globalmanuf.com",
        phone: "+1-555-1002",
        address: "456 Industrial Blvd, Detroit, MI",
        tenantId: 1
      },
      {
        name: "Healthcare Partners",
        industry: "Healthcare",
        website: "healthpartners.com",
        phone: "+1-555-1003",
        address: "789 Medical Center Dr, Boston, MA",
        tenantId: 1
      },
      {
        name: "Financial Services Group",
        industry: "Finance",
        website: "finservices.com",
        phone: "+1-555-1004",
        address: "321 Wall Street, New York, NY",
        tenantId: 1
      },
      {
        name: "Retail Plus",
        industry: "Retail",
        website: "retailplus.com",
        phone: "+1-555-1005",
        address: "654 Commerce Ave, Chicago, IL",
        tenantId: 1
      }
    ];

    const createdCompanies = await db.insert(companies).values(companyData).returning();
    console.log(`✅ Created ${createdCompanies.length} companies`);

    // Create leads with proper assignment
    const leadData = [
      // Leads for Agent 1
      {
        firstName: "Michael",
        lastName: "Johnson",
        email: "michael.johnson@techcorp.com",
        phone: "+1-555-2001",
        jobTitle: "CTO",
        source: "Website",
        status: "new",
        notes: "Interested in enterprise solutions",
        assignedToId: agents[0].id,
        assignedById: supervisor1.id,
        companyId: createdCompanies[0].id,
        tenantId: 1
      },
      {
        firstName: "Sarah",
        lastName: "Williams",
        email: "sarah.williams@techcorp.com",
        phone: "+1-555-2002",
        jobTitle: "VP Engineering",
        source: "Referral",
        status: "contacted",
        notes: "Looking for scalable infrastructure",
        assignedToId: agents[0].id,
        assignedById: supervisor1.id,
        companyId: createdCompanies[0].id,
        tenantId: 1
      },
      // Leads for Agent 2
      {
        firstName: "David",
        lastName: "Brown",
        email: "david.brown@globalmanuf.com",
        phone: "+1-555-2003",
        jobTitle: "Plant Manager",
        source: "Trade Show",
        status: "qualified",
        notes: "Needs manufacturing optimization software",
        assignedToId: agents[1].id,
        assignedById: supervisor1.id,
        companyId: createdCompanies[1].id,
        tenantId: 1
      },
      // Leads for Agent 3
      {
        firstName: "Jennifer",
        lastName: "Wilson",
        email: "jennifer.wilson@healthpartners.com",
        phone: "+1-555-2005",
        jobTitle: "IT Director",
        source: "Referral",
        status: "contacted",
        notes: "Looking for patient management system",
        assignedToId: agents[2].id,
        assignedById: supervisor2.id,
        companyId: createdCompanies[2].id,
        tenantId: 1
      },
      // Leads for Agent 4
      {
        firstName: "Thomas",
        lastName: "Garcia",
        email: "thomas.garcia@finservices.com",
        phone: "+1-555-2007",
        jobTitle: "CFO",
        source: "Cold Call",
        status: "new",
        notes: "Needs financial reporting tools",
        assignedToId: agents[3].id,
        assignedById: supervisor2.id,
        companyId: createdCompanies[3].id,
        tenantId: 1
      },
      // Unassigned leads
      {
        firstName: "Kevin",
        lastName: "Thompson",
        email: "kevin.thompson@retailplus.com",
        phone: "+1-555-2009",
        jobTitle: "Operations Director",
        source: "Trade Show",
        status: "new",
        notes: "Interested in inventory management system",
        assignedToId: null,
        assignedById: null,
        companyId: createdCompanies[4].id,
        tenantId: 1
      },
      {
        firstName: "Sarah",
        lastName: "Chen",
        email: "sarah.chen@techstartup.com",
        phone: "+1-555-2010",
        jobTitle: "CTO",
        source: "Website",
        status: "new",
        notes: "Looking for cloud infrastructure solutions",
        assignedToId: null,
        assignedById: null,
        companyId: createdCompanies[0].id,
        tenantId: 1
      }
    ];

    const createdLeads = await db.insert(leads).values(leadData).returning();
    console.log(`✅ Created ${createdLeads.length} leads`);

    // Create deal stages
    const stageData = [
      { name: "prospecting", order: 1, tenantId: 1 },
      { name: "qualification", order: 2, tenantId: 1 },
      { name: "proposal", order: 3, tenantId: 1 },
      { name: "negotiation", order: 4, tenantId: 1 },
      { name: "closed-won", order: 5, tenantId: 1 },
      { name: "closed-lost", order: 6, tenantId: 1 }
    ];

    const createdStages = await db.insert(dealStages).values(stageData).returning();
    console.log(`✅ Created ${createdStages.length} deal stages`);

    // Create some contacts
    const contactData = [
      {
        firstName: "Brian",
        lastName: "Miller",
        email: "brian.miller@techcorp.com",
        phone: "+1-555-3001",
        jobTitle: "VP of Sales",
        companyId: createdCompanies[0].id,
        tenantId: 1
      },
      {
        firstName: "Rachel",
        lastName: "Davis",
        email: "rachel.davis@globalmanuf.com",
        phone: "+1-555-3002",
        jobTitle: "Operations Manager",
        companyId: createdCompanies[1].id,
        tenantId: 1
      }
    ];

    const createdContacts = await db.insert(contacts).values(contactData).returning();
    console.log(`✅ Created ${createdContacts.length} contacts`);

    // Create deals
    const dealData = [
      {
        title: "Enterprise Software License",
        value: "250000",
        contactId: createdContacts[0].id,
        companyId: createdCompanies[0].id,
        stageId: createdStages.find(s => s.name === "proposal")!.id,
        expectedCloseDate: new Date("2024-03-15"),
        notes: "Large enterprise deal with multi-year contract",
        tenantId: 1
      },
      {
        title: "Manufacturing Optimization Suite",
        value: "150000",
        contactId: createdContacts[1].id,
        companyId: createdCompanies[1].id,
        stageId: createdStages.find(s => s.name === "qualification")!.id,
        expectedCloseDate: new Date("2024-02-28"),
        notes: "ERP implementation for manufacturing",
        tenantId: 1
      }
    ];

    const createdDeals = await db.insert(deals).values(dealData).returning();
    console.log(`✅ Created ${createdDeals.length} deals`);

    console.log("🎉 Quick seed completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("❌ Error in quick seed:", error);
    throw error;
  }
}