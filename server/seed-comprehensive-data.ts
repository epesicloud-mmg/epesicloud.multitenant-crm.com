import { db } from "./db";
import { 
  tenants, users, roles, companies, contacts, deals, activities, products, 
  salesStages, salesPipelines, activityTypes, interestLevels,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedComprehensiveData() {
  console.log("🌱 Starting comprehensive test data seeding...");

  try {
    // 1. Create roles
    console.log("Creating roles...");
    const rolesData = [
      {
        tenantId: 1,
        name: "Admin",
        level: 5,
        permissions: ["manage_users", "view_all_data", "manage_deals", "view_reports", "manage_pipeline", "export_data", "manage_settings", "view_team_data"],
        description: "Full system administrator access"
      },
      {
        tenantId: 1,
        name: "Sales Manager",
        level: 4,
        permissions: ["manage_deals", "view_all_data", "view_reports", "manage_pipeline", "view_team_data"],
        description: "Manages sales operations and team performance"
      },
      {
        tenantId: 1,
        name: "Supervisor",
        level: 3,
        permissions: ["manage_deals", "view_team_data", "view_reports"],
        description: "Supervises agent teams and manages assigned deals"
      },
      {
        tenantId: 1,
        name: "Agent",
        level: 2,
        permissions: ["manage_deals"],
        description: "Handles individual deals and customer relationships"
      },
      {
        tenantId: 1,
        name: "Director",
        level: 4,
        permissions: ["view_all_data", "view_reports", "export_data"],
        description: "Strategic oversight with reporting focus"
      }
    ];

    const createdRoles = [];
    for (const role of rolesData) {
      const [existing] = await db.select().from(roles).where(eq(roles.name, role.name)).limit(1);
      if (existing) {
        createdRoles.push(existing);
      } else {
        const [created] = await db.insert(roles).values(role).returning();
        createdRoles.push(created);
      }
    }

    // 2. Create users step by step to handle hierarchy
    console.log("Creating users with hierarchy...");
    
    // Step 1: Create admin user
    let adminUser;
    const [existingAdmin] = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
    if (existingAdmin) {
      adminUser = existingAdmin;
    } else {
      const [admin] = await db.insert(users).values({
        tenantId: 1,
        username: "admin",
        email: "admin@epesicrm.com",
        firstName: "System",
        lastName: "Administrator",
        password: "admin123",
        roleId: createdRoles.find(r => r.name === "Admin")!.id,
        department: "administration",
        phone: "+1-555-0001",
        isActive: true,
        currentWorkspaceId: 1,
        currentProjectId: 1
      }).returning();
      adminUser = admin;
    }

    // Step 2: Create sales manager and director
    let salesManager, director;
    const [existingSM] = await db.select().from(users).where(eq(users.username, "smanager")).limit(1);
    if (existingSM) {
      salesManager = existingSM;
    } else {
      const [sm] = await db.insert(users).values({
        tenantId: 1,
        username: "smanager",
        email: "sarah.manager@epesicrm.com",
        firstName: "Sarah",
        lastName: "Manager",
        password: "manager123",
        roleId: createdRoles.find(r => r.name === "Sales Manager")!.id,
        department: "sales",
        phone: "+1-555-0002",
        isActive: true,
        currentWorkspaceId: 1,
        currentProjectId: 1
      }).returning();
      salesManager = sm;
    }

    const [existingDir] = await db.select().from(users).where(eq(users.username, "director")).limit(1);
    if (existingDir) {
      director = existingDir;
    } else {
      const [dir] = await db.insert(users).values({
        tenantId: 1,
        username: "director",
        email: "james.director@epesicrm.com",
        firstName: "James",
        lastName: "Director",
        password: "director123",
        roleId: createdRoles.find(r => r.name === "Director")!.id,
        department: "executive",
        phone: "+1-555-0003",
        isActive: true,
        currentWorkspaceId: 1,
        currentProjectId: 1
      }).returning();
      director = dir;
    }

    // Step 3: Create supervisors
    let supervisor1, supervisor2;
    const [existingSup1] = await db.select().from(users).where(eq(users.username, "supervisor1")).limit(1);
    if (existingSup1) {
      supervisor1 = existingSup1;
    } else {
      const [sup1] = await db.insert(users).values({
        tenantId: 1,
        username: "supervisor1",
        email: "mike.supervisor@epesicrm.com",
        firstName: "Mike",
        lastName: "Supervisor",
        password: "supervisor123",
        roleId: createdRoles.find(r => r.name === "Supervisor")!.id,
        managerId: salesManager.id,
        department: "sales",
        phone: "+1-555-0004",
        isActive: true,
        currentWorkspaceId: 1,
        currentProjectId: 1
      }).returning();
      supervisor1 = sup1;
    }

    const [existingSup2] = await db.select().from(users).where(eq(users.username, "supervisor2")).limit(1);
    if (existingSup2) {
      supervisor2 = existingSup2;
    } else {
      const [sup2] = await db.insert(users).values({
        tenantId: 1,
        username: "supervisor2",
        email: "lisa.supervisor@epesicrm.com",
        firstName: "Lisa",
        lastName: "Supervisor",
        password: "supervisor123",
        roleId: createdRoles.find(r => r.name === "Supervisor")!.id,
        managerId: salesManager.id,
        department: "sales",
        phone: "+1-555-0005",
        isActive: true,
        currentWorkspaceId: 1,
        currentProjectId: 1
      }).returning();
      supervisor2 = sup2;
    }

    // Step 4: Create agents
    const agentData = [
      { username: "agent1", firstName: "John", email: "john.agent1@epesicrm.com", managerId: supervisor1.id, phone: "+1-555-0006" },
      { username: "agent2", firstName: "Emma", email: "emma.agent2@epesicrm.com", managerId: supervisor1.id, phone: "+1-555-0007" },
      { username: "agent3", firstName: "David", email: "david.agent3@epesicrm.com", managerId: supervisor1.id, phone: "+1-555-0008" },
      { username: "agent4", firstName: "Sophia", email: "sophia.agent4@epesicrm.com", managerId: supervisor2.id, phone: "+1-555-0009" },
      { username: "agent5", firstName: "Alex", email: "alex.agent5@epesicrm.com", managerId: supervisor2.id, phone: "+1-555-0010" },
      { username: "agent6", firstName: "Mia", email: "mia.agent6@epesicrm.com", managerId: supervisor2.id, phone: "+1-555-0011" },
    ];

    const agents = [];
    for (const agent of agentData) {
      const [existing] = await db.select().from(users).where(eq(users.username, agent.username)).limit(1);
      if (existing) {
        agents.push(existing);
      } else {
        const [created] = await db.insert(users).values({
          tenantId: 1,
          username: agent.username,
          email: agent.email,
          firstName: agent.firstName,
          lastName: "Agent",
          password: "agent123",
          roleId: createdRoles.find(r => r.name === "Agent")!.id,
          managerId: agent.managerId,
          department: "sales",
          phone: agent.phone,
          isActive: true,
          currentWorkspaceId: 1,
          currentProjectId: 1
        }).returning();
        agents.push(created);
      }
    }

    // 3. Create companies
    console.log("Creating companies...");
    const companiesData = [
      {
        tenantId: 1,
        name: "TechCorp Solutions",
        industry: "Technology",
        website: "https://techcorp.com",
        phone: "+1-555-1001",
        email: "contact@techcorp.com",
        address: "123 Tech Street, Silicon Valley, CA",
        assignedToId: agents[0].id,
        supervisorId: supervisor1.id,
        employees: 250
      },
      {
        tenantId: 1,
        name: "Global Manufacturing Inc",
        industry: "Manufacturing",
        website: "https://globalmanufacturing.com",
        phone: "+1-555-1002",
        email: "info@globalmanufacturing.com",
        address: "456 Industrial Blvd, Detroit, MI",
        assignedToId: agents[1].id,
        supervisorId: supervisor1.id,
        employees: 500
      },
      {
        tenantId: 1,
        name: "Healthcare Innovations",
        industry: "Healthcare",
        website: "https://healthcareinnovations.com",
        phone: "+1-555-1003",
        email: "contact@healthcareinnovations.com",
        address: "789 Medical Center Dr, Boston, MA",
        assignedToId: agents[3].id,
        supervisorId: supervisor2.id,
        employees: 150
      },
      {
        tenantId: 1,
        name: "Financial Services Group",
        industry: "Finance",
        website: "https://finservicesgroup.com",
        phone: "+1-555-1004",
        email: "info@finservicesgroup.com",
        address: "321 Wall Street, New York, NY",
        assignedToId: agents[4].id,
        supervisorId: supervisor2.id,
        employees: 300
      },
      {
        tenantId: 1,
        name: "Retail Dynamics",
        industry: "Retail",
        website: "https://retaildynamics.com",
        phone: "+1-555-1005",
        email: "sales@retaildynamics.com",
        address: "654 Commerce Ave, Chicago, IL",
        assignedToId: agents[2].id,
        supervisorId: supervisor1.id,
        employees: 80
      },
      {
        tenantId: 1,
        name: "Education Platform Co",
        industry: "Education",
        website: "https://edplatform.com",
        phone: "+1-555-1006",
        email: "contact@edplatform.com",
        address: "987 Learning Lane, Austin, TX",
        assignedToId: agents[5].id,
        supervisorId: supervisor2.id,
        employees: 120
      }
    ];

    const createdCompanies = [];
    for (const company of companiesData) {
      const [existing] = await db.select().from(companies).where(eq(companies.name, company.name)).limit(1);
      if (existing) {
        createdCompanies.push(existing);
      } else {
        const [created] = await db.insert(companies).values(company).returning();
        createdCompanies.push(created);
      }
    }

    // 4. Create contacts
    console.log("Creating contacts...");
    const contactsData = [
      {
        tenantId: 1,
        firstName: "Robert",
        lastName: "Johnson",
        email: "r.johnson@techcorp.com",
        phone: "+1-555-2001",
        position: "CTO",
        companyId: createdCompanies[0].id,
        assignedToId: agents[0].id,
        supervisorId: supervisor1.id,
        contactSource: "Website",
        status: "active"
      },
      {
        tenantId: 1,
        firstName: "Jennifer",
        lastName: "Davis",
        email: "j.davis@techcorp.com",
        phone: "+1-555-2002",
        position: "VP of Sales",
        companyId: createdCompanies[0].id,
        assignedToId: agents[0].id,
        supervisorId: supervisor1.id,
        contactSource: "Referral",
        status: "active"
      },
      {
        tenantId: 1,
        firstName: "Michael",
        lastName: "Brown",
        email: "m.brown@globalmanufacturing.com",
        phone: "+1-555-2003",
        position: "Operations Director",
        companyId: createdCompanies[1].id,
        assignedToId: agents[1].id,
        supervisorId: supervisor1.id,
        contactSource: "Trade Show",
        status: "active"
      },
      {
        tenantId: 1,
        firstName: "Dr. Sarah",
        lastName: "Wilson",
        email: "s.wilson@healthcareinnovations.com",
        phone: "+1-555-2004",
        position: "Chief Medical Officer",
        companyId: createdCompanies[2].id,
        assignedToId: agents[3].id,
        supervisorId: supervisor2.id,
        contactSource: "Conference",
        status: "active"
      },
      {
        tenantId: 1,
        firstName: "Thomas",
        lastName: "Anderson",
        email: "t.anderson@finservicesgroup.com",
        phone: "+1-555-2005",
        position: "Portfolio Manager",
        companyId: createdCompanies[3].id,
        assignedToId: agents[4].id,
        supervisorId: supervisor2.id,
        contactSource: "LinkedIn",
        status: "active"
      },
      {
        tenantId: 1,
        firstName: "Amanda",
        lastName: "Garcia",
        email: "a.garcia@retaildynamics.com",
        phone: "+1-555-2006",
        position: "Store Manager",
        companyId: createdCompanies[4].id,
        assignedToId: agents[2].id,
        supervisorId: supervisor1.id,
        contactSource: "Cold Call",
        status: "active"
      }
    ];

    const createdContacts = [];
    for (const contact of contactsData) {
      const [existing] = await db.select().from(contacts).where(eq(contacts.email, contact.email)).limit(1);
      if (existing) {
        createdContacts.push(existing);
      } else {
        const [created] = await db.insert(contacts).values(contact).returning();
        createdContacts.push(created);
      }
    }

    // 5. Create products
    console.log("Creating products...");
    const productsData = [
      {
        tenantId: 1,
        name: "Enterprise CRM Suite",
        category: "Software",
        salePrice: 299.00,
        description: "Complete CRM solution for enterprise customers"
      },
      {
        tenantId: 1,
        name: "Professional CRM",
        category: "Software",
        salePrice: 149.00,
        description: "Professional CRM for small to medium businesses"
      },
      {
        tenantId: 1,
        name: "CRM Analytics Add-on",
        category: "Software",
        salePrice: 99.00,
        description: "Advanced analytics and reporting module"
      },
      {
        tenantId: 1,
        name: "Mobile CRM App",
        category: "Software",
        salePrice: 49.00,
        description: "Mobile application for CRM access"
      },
      {
        tenantId: 1,
        name: "Integration Services",
        category: "Services",
        salePrice: 500.00,
        description: "Professional integration and setup services"
      }
    ];

    const createdProducts = [];
    for (const product of productsData) {
      const [existing] = await db.select().from(products).where(eq(products.name, product.name)).limit(1);
      if (existing) {
        createdProducts.push(existing);
      } else {
        const [created] = await db.insert(products).values(product).returning();
        createdProducts.push(created);
      }
    }

    // 6. Get existing stages and interest levels
    const [salesStagesList] = await Promise.all([
      db.select().from(salesStages).where(eq(salesStages.tenantId, 1)),
    ]);

    const [interestLevelsList] = await Promise.all([
      db.select().from(interestLevels).where(eq(interestLevels.tenantId, 1)),
    ]);

    // 7. Create deals
    console.log("Creating deals...");
    const dealsData = [
      {
        tenantId: 1,
        title: "TechCorp Enterprise Implementation",
        value: 75000.00,
        stageId: salesStagesList[1]?.id || 1,
        contactId: createdContacts[0].id,
        productId: createdProducts[0].id,
        interestLevelId: interestLevelsList[0]?.id || 1,
        assignedToId: agents[0].id,
        supervisorId: supervisor1.id,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: "Large enterprise CRM implementation for TechCorp"
      },
      {
        tenantId: 1,
        title: "Manufacturing CRM Upgrade",
        value: 45000.00,
        stageId: salesStagesList[2]?.id || 2,
        contactId: createdContacts[2].id,
        productId: createdProducts[1].id,
        interestLevelId: interestLevelsList[1]?.id || 2,
        assignedToId: agents[1].id,
        supervisorId: supervisor1.id,
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        description: "CRM system upgrade for manufacturing operations"
      },
      {
        tenantId: 1,
        title: "Healthcare Analytics Solution",
        value: 62000.00,
        stageId: salesStagesList[3]?.id || 3,
        contactId: createdContacts[3].id,
        productId: createdProducts[2].id,
        interestLevelId: interestLevelsList[0]?.id || 1,
        assignedToId: agents[3].id,
        supervisorId: supervisor2.id,
        expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        description: "Advanced analytics solution for healthcare provider"
      },
      {
        tenantId: 1,
        title: "Financial Services Integration",
        value: 38000.00,
        stageId: salesStagesList[0]?.id || 1,
        contactId: createdContacts[4].id,
        productId: createdProducts[4].id,
        interestLevelId: interestLevelsList[2]?.id || 3,
        assignedToId: agents[4].id,
        supervisorId: supervisor2.id,
        expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        description: "Integration services for financial CRM implementation"
      },
      {
        tenantId: 1,
        title: "Retail Mobile Solution",
        value: 28000.00,
        stageId: salesStagesList[1]?.id || 2,
        contactId: createdContacts[5].id,
        productId: createdProducts[3].id,
        interestLevelId: interestLevelsList[1]?.id || 2,
        assignedToId: agents[2].id,
        supervisorId: supervisor1.id,
        expectedCloseDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        description: "Mobile CRM solution for retail chain management"
      }
    ];

    const createdDeals = [];
    for (const deal of dealsData) {
      const [existing] = await db.select().from(deals).where(eq(deals.title, deal.title)).limit(1);
      if (existing) {
        createdDeals.push(existing);
      } else {
        const [created] = await db.insert(deals).values(deal).returning();
        createdDeals.push(created);
      }
    }

    // 8. Create activities
    console.log("Creating activities...");
    const [activityTypesList] = await Promise.all([
      db.select().from(activityTypes).where(eq(activityTypes.tenantId, 1)),
    ]);

    const activitiesData = [
      {
        tenantId: 1,
        title: "Initial Discovery Call",
        description: "Discovery call to understand TechCorp's CRM requirements",
        activityType: activityTypesList[0]?.name || "Call",
        contactId: createdContacts[0].id,
        dealId: createdDeals[0].id,
        userId: agents[0].id,
        supervisorId: supervisor1.id,
        scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: "completed"
      },
      {
        tenantId: 1,
        title: "Requirements Analysis Meeting",
        description: "Detailed requirements gathering session with manufacturing team",
        activityType: activityTypesList[1]?.name || "Meeting",
        contactId: createdContacts[2].id,
        dealId: createdDeals[1].id,
        userId: agents[1].id,
        supervisorId: supervisor1.id,
        scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "completed"
      },
      {
        tenantId: 1,
        title: "Demo Presentation",
        description: "Product demonstration for healthcare analytics features",
        activityType: activityTypesList[1]?.name || "Meeting",
        contactId: createdContacts[3].id,
        dealId: createdDeals[2].id,
        userId: agents[3].id,
        supervisorId: supervisor2.id,
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: "scheduled"
      },
      {
        tenantId: 1,
        title: "Follow-up Email",
        description: "Follow-up on financial services integration discussion",
        activityType: activityTypesList[2]?.name || "Email",
        contactId: createdContacts[4].id,
        dealId: createdDeals[3].id,
        userId: agents[4].id,
        supervisorId: supervisor2.id,
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: "scheduled"
      }
    ];

    for (const activity of activitiesData) {
      const [existing] = await db.select().from(activities).where(eq(activities.title, activity.title)).limit(1);
      if (!existing) {
        await db.insert(activities).values(activity);
      }
    }

    console.log("✅ Comprehensive test data seeding completed successfully!");
    console.log(`
📊 Created test data summary:
- 5 Roles (Admin, Sales Manager, Supervisor, Agent, Director)
- 11 Users (1 Admin, 1 Sales Manager, 2 Supervisors, 6 Agents, 1 Director)
- 6 Companies across different industries
- 6 Contacts with proper assignments
- 5 Products/Services
- 5 Deals in various stages
- 4 Activities (completed and scheduled)

🏗️ Hierarchy Structure:
- Admin (${adminUser.firstName} ${adminUser.lastName}): Full system access
- Sales Manager (${salesManager.firstName} ${salesManager.lastName}): Manages 2 Supervisors
- Supervisor 1 (${supervisor1.firstName} ${supervisor1.lastName}): Manages 3 Agents (John, Emma, David)
- Supervisor 2 (${supervisor2.firstName} ${supervisor2.lastName}): Manages 3 Agents (Sophia, Alex, Mia)
- Director (${director.firstName} ${director.lastName}): Strategic oversight and reporting

All data includes proper supervisor_id assignments for hierarchical filtering.
    `);

  } catch (error) {
    console.error("❌ Error seeding comprehensive test data:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedComprehensiveData().catch(console.error);
}