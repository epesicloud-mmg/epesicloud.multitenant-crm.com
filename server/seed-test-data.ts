import { db } from "./db";
import { 
  tenants, users, roles, companies, contacts, deals, activities, products, 
  salesStages, salesPipelines, activityTypes, interestLevels,
  type InsertUser, type InsertRole, type InsertCompany, type InsertContact, 
  type InsertDeal, type InsertActivity, type InsertProduct
} from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedTestData() {
  console.log("🌱 Starting comprehensive test data seeding...");

  try {
    // 1. Create roles with proper hierarchy
    console.log("Creating roles...");
    const rolesData: InsertRole[] = [
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

    const createdRoles = await Promise.all(
      rolesData.map(async (role) => {
        const [existing] = await db.select().from(roles).where(eq(roles.name, role.name)).limit(1);
        if (existing) return existing;
        const [created] = await db.insert(roles).values(role).returning();
        return created;
      })
    );

    // 2. Create users with hierarchy: 1 Admin, 1 Sales Manager, 2 Supervisors, 6 Agents (3 per supervisor), 1 Director
    console.log("Creating users with hierarchy...");
    const usersData: InsertUser[] = [
      // Admin
      {
        tenantId: 1,
        username: "admin",
        email: "admin@epesicrm.com",
        firstName: "System",
        lastName: "Administrator",
        password: "admin123", // Default password for testing
        roleId: createdRoles.find(r => r.name === "Admin")!.id,
        department: "administration",
        phone: "+1-555-0001",
        isActive: true,
        currentWorkspaceId: 1,
        currentProjectId: 1
      },
      // Sales Manager
      {
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
      },
      // Director
      {
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
      },
      // Supervisor 1
      {
        tenantId: 1,
        username: "supervisor1",
        email: "mike.supervisor@epesicrm.com",
        firstName: "Mike",
        lastName: "Supervisor",
        password: "supervisor123",
        roleId: createdRoles.find(r => r.name === "Supervisor")!.id,
        managerId: 2, // Reports to Sales Manager
        department: "sales",
        phone: "+1-555-0004",
        isActive: true,
        currentWorkspaceId: 1,
        currentProjectId: 1
      },
      // Supervisor 2
      {
        tenantId: 1,
        username: "supervisor2",
        email: "lisa.supervisor@epesicrm.com",
        firstName: "Lisa",
        lastName: "Supervisor",
        password: "supervisor123",
        roleId: createdRoles.find(r => r.name === "Supervisor")!.id,
        managerId: 2, // Reports to Sales Manager
        department: "sales",
        phone: "+1-555-0005",
        isActive: true,
        currentWorkspaceId: 1,
        currentProjectId: 1
      },
      // Agents under Supervisor 1
      {
        tenantId: 1,
        username: "agent1",
        email: "john.agent1@epesicrm.com",
        firstName: "John",
        lastName: "Agent",
        password: "agent123",
        roleId: createdRoles.find(r => r.name === "Agent")!.id,
        managerId: 4, // Reports to Supervisor 1
        department: "sales",
        phone: "+1-555-0006",
        isActive: true,
        currentWorkspaceId: 1,
        currentProjectId: 1
      },
      {
        tenantId: 1,
        username: "agent2",
        email: "emma.agent2@epesicrm.com",
        firstName: "Emma",
        lastName: "Agent",
        password: "agent123",
        roleId: createdRoles.find(r => r.name === "Agent")!.id,
        managerId: 4, // Reports to Supervisor 1
        department: "sales",
        phone: "+1-555-0007",
        isActive: true,
        currentWorkspaceId: 1,
        currentProjectId: 1
      },
      {
        tenantId: 1,
        username: "agent3",
        email: "david.agent3@epesicrm.com",
        firstName: "David",
        lastName: "Agent",
        password: "agent123",
        roleId: createdRoles.find(r => r.name === "Agent")!.id,
        managerId: 4, // Reports to Supervisor 1
        department: "sales",
        phone: "+1-555-0008",
        isActive: true,
        currentWorkspaceId: 1,
        currentProjectId: 1
      },
      // Agents under Supervisor 2
      {
        tenantId: 1,
        username: "agent4",
        email: "sophia.agent4@epesicrm.com",
        firstName: "Sophia",
        lastName: "Agent",
        password: "agent123",
        roleId: createdRoles.find(r => r.name === "Agent")!.id,
        managerId: 5, // Reports to Supervisor 2
        department: "sales",
        phone: "+1-555-0009",
        isActive: true,
        currentWorkspaceId: 1,
        currentProjectId: 1
      },
      {
        tenantId: 1,
        username: "agent5",
        email: "alex.agent5@epesicrm.com",
        firstName: "Alex",
        lastName: "Agent",
        password: "agent123",
        roleId: createdRoles.find(r => r.name === "Agent")!.id,
        managerId: 5, // Reports to Supervisor 2
        department: "sales",
        phone: "+1-555-0010",
        isActive: true,
        currentWorkspaceId: 1,
        currentProjectId: 1
      },
      {
        tenantId: 1,
        username: "agent6",
        email: "mia.agent6@epesicrm.com",
        firstName: "Mia",
        lastName: "Agent",
        password: "agent123",
        roleId: createdRoles.find(r => r.name === "Agent")!.id,
        managerId: 5, // Reports to Supervisor 2
        department: "sales",
        phone: "+1-555-0011",
        isActive: true,
        currentWorkspaceId: 1,
        currentProjectId: 1
      }
    ];

    // Create users sequentially to handle foreign key constraints
    const createdUsers = [];
    
    // First create users without managerId
    const usersWithoutManager = usersData.filter(u => !u.managerId);
    for (const user of usersWithoutManager) {
      const [existing] = await db.select().from(users).where(eq(users.username, user.username)).limit(1);
      if (existing) {
        createdUsers.push(existing);
      } else {
        const [created] = await db.insert(users).values(user).returning();
        createdUsers.push(created);
      }
    }
    
    // Then create users with managerIds
    const usersWithManager = usersData.filter(u => u.managerId);
    for (const user of usersWithManager) {
      const [existing] = await db.select().from(users).where(eq(users.username, user.username)).limit(1);
      if (existing) {
        createdUsers.push(existing);
      } else {
        const [created] = await db.insert(users).values(user).returning();
        createdUsers.push(created);
      }
    }

    // 3. Create companies with assignments
    console.log("Creating companies...");
    const companiesData: InsertCompany[] = [
      {
        tenantId: 1,
        name: "TechCorp Solutions",
        industry: "Technology",
        website: "https://techcorp.com",
        phone: "+1-555-1001",
        email: "contact@techcorp.com",
        address: "123 Tech Street, Silicon Valley, CA",
        assignedToId: createdUsers[5].id, // Agent 1
        supervisorId: createdUsers[3].id, // Supervisor 1
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
        assignedToId: createdUsers[6].id, // Agent 2
        supervisorId: createdUsers[3].id, // Supervisor 1
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
        assignedToId: createdUsers[8].id, // Agent 4
        supervisorId: createdUsers[4].id, // Supervisor 2
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
        assignedToId: createdUsers[9].id, // Agent 5
        supervisorId: createdUsers[4].id, // Supervisor 2
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
        assignedToId: createdUsers[7].id, // Agent 3
        supervisorId: createdUsers[3].id, // Supervisor 1
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
        assignedToId: createdUsers[10].id, // Agent 6
        supervisorId: createdUsers[4].id, // Supervisor 2
        employees: 120
      }
    ];

    const createdCompanies = await Promise.all(
      companiesData.map(async (company) => {
        const [existing] = await db.select().from(companies).where(eq(companies.name, company.name)).limit(1);
        if (existing) return existing;
        const [created] = await db.insert(companies).values(company).returning();
        return created;
      })
    );

    // 4. Create contacts for each company
    console.log("Creating contacts...");
    const contactsData: InsertContact[] = [
      // TechCorp Solutions contacts
      {
        tenantId: 1,
        firstName: "Robert",
        lastName: "Johnson",
        email: "r.johnson@techcorp.com",
        phone: "+1-555-2001",
        position: "CTO",
        companyId: createdCompanies[0].id,
        assignedToId: createdUsers[5].id, // Agent 1
        supervisorId: createdUsers[3].id, // Supervisor 1
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
        assignedToId: createdUsers[5].id, // Agent 1
        supervisorId: createdUsers[3].id, // Supervisor 1
        contactSource: "Referral",
        status: "active"
      },
      // Global Manufacturing contacts
      {
        tenantId: 1,
        firstName: "Michael",
        lastName: "Brown",
        email: "m.brown@globalmanufacturing.com",
        phone: "+1-555-2003",
        position: "Operations Director",
        companyId: createdCompanies[1].id,
        assignedToId: createdUsers[6].id, // Agent 2
        supervisorId: createdUsers[3].id, // Supervisor 1
        contactSource: "Trade Show",
        status: "active"
      },
      // Healthcare Innovations contacts
      {
        tenantId: 1,
        firstName: "Dr. Sarah",
        lastName: "Wilson",
        email: "s.wilson@healthcareinnovations.com",
        phone: "+1-555-2004",
        position: "Chief Medical Officer",
        companyId: createdCompanies[2].id,
        assignedToId: createdUsers[8].id, // Agent 4
        supervisorId: createdUsers[4].id, // Supervisor 2
        contactSource: "Conference",
        status: "active"
      },
      // Financial Services contacts
      {
        tenantId: 1,
        firstName: "Thomas",
        lastName: "Anderson",
        email: "t.anderson@finservicesgroup.com",
        phone: "+1-555-2005",
        position: "Portfolio Manager",
        companyId: createdCompanies[3].id,
        assignedToId: createdUsers[9].id, // Agent 5
        supervisorId: createdUsers[4].id, // Supervisor 2
        contactSource: "LinkedIn",
        status: "active"
      },
      // Additional contacts for testing
      {
        tenantId: 1,
        firstName: "Amanda",
        lastName: "Garcia",
        email: "a.garcia@retaildynamics.com",
        phone: "+1-555-2006",
        position: "Store Manager",
        companyId: createdCompanies[4].id,
        assignedToId: createdUsers[7].id, // Agent 3
        supervisorId: createdUsers[3].id, // Supervisor 1
        contactSource: "Cold Call",
        status: "active"
      }
    ];

    const createdContacts = await Promise.all(
      contactsData.map(async (contact) => {
        const [existing] = await db.select().from(contacts).where(eq(contacts.email, contact.email)).limit(1);
        if (existing) return existing;
        const [created] = await db.insert(contacts).values(contact).returning();
        return created;
      })
    );

    // 5. Create products
    console.log("Creating products...");
    const productsData: InsertProduct[] = [
      {
        tenantId: 1,
        name: "Enterprise CRM Suite",
        category: "Software",
        price: 299.00,
        description: "Complete CRM solution for enterprise customers"
      },
      {
        tenantId: 1,
        name: "Professional CRM",
        category: "Software",
        price: 149.00,
        description: "Professional CRM for small to medium businesses"
      },
      {
        tenantId: 1,
        name: "CRM Analytics Add-on",
        category: "Software",
        price: 99.00,
        description: "Advanced analytics and reporting module"
      },
      {
        tenantId: 1,
        name: "Mobile CRM App",
        category: "Software",
        price: 49.00,
        description: "Mobile application for CRM access"
      },
      {
        tenantId: 1,
        name: "Integration Services",
        category: "Services",
        price: 500.00,
        description: "Professional integration and setup services"
      }
    ];

    const createdProducts = await Promise.all(
      productsData.map(async (product) => {
        const [existing] = await db.select().from(products).where(eq(products.name, product.name)).limit(1);
        if (existing) return existing;
        const [created] = await db.insert(products).values(product).returning();
        return created;
      })
    );

    // 6. Get sales stages and interest levels
    const [salesStagesList] = await Promise.all([
      db.select().from(salesStages).where(eq(salesStages.tenantId, 1)),
    ]);

    const [interestLevelsList] = await Promise.all([
      db.select().from(interestLevels).where(eq(interestLevels.tenantId, 1)),
    ]);

    // 7. Create deals with proper hierarchy
    console.log("Creating deals...");
    const dealsData: InsertDeal[] = [
      {
        tenantId: 1,
        title: "TechCorp Enterprise Implementation",
        value: 75000.00,
        stageId: salesStagesList[1]?.id || 1, // Qualification
        contactId: createdContacts[0].id,
        productId: createdProducts[0].id,
        interestLevelId: interestLevelsList[0]?.id || 1, // Hot
        assignedToId: createdUsers[5].id, // Agent 1
        supervisorId: createdUsers[3].id, // Supervisor 1
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        description: "Large enterprise CRM implementation for TechCorp"
      },
      {
        tenantId: 1,
        title: "Manufacturing CRM Upgrade",
        value: 45000.00,
        stageId: salesStagesList[2]?.id || 2, // Proposal
        contactId: createdContacts[2].id,
        productId: createdProducts[1].id,
        interestLevelId: interestLevelsList[1]?.id || 2, // Warm
        assignedToId: createdUsers[6].id, // Agent 2
        supervisorId: createdUsers[3].id, // Supervisor 1
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        description: "CRM system upgrade for manufacturing operations"
      },
      {
        tenantId: 1,
        title: "Healthcare Analytics Solution",
        value: 62000.00,
        stageId: salesStagesList[3]?.id || 3, // Negotiation
        contactId: createdContacts[3].id,
        productId: createdProducts[2].id,
        interestLevelId: interestLevelsList[0]?.id || 1, // Hot
        assignedToId: createdUsers[8].id, // Agent 4
        supervisorId: createdUsers[4].id, // Supervisor 2
        expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        description: "Advanced analytics solution for healthcare provider"
      },
      {
        tenantId: 1,
        title: "Financial Services Integration",
        value: 38000.00,
        stageId: salesStagesList[0]?.id || 1, // Prospecting
        contactId: createdContacts[4].id,
        productId: createdProducts[4].id,
        interestLevelId: interestLevelsList[2]?.id || 3, // Cold
        assignedToId: createdUsers[9].id, // Agent 5
        supervisorId: createdUsers[4].id, // Supervisor 2
        expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        description: "Integration services for financial CRM implementation"
      },
      {
        tenantId: 1,
        title: "Retail Mobile Solution",
        value: 28000.00,
        stageId: salesStagesList[1]?.id || 2, // Qualification
        contactId: createdContacts[5].id,
        productId: createdProducts[3].id,
        interestLevelId: interestLevelsList[1]?.id || 2, // Warm
        assignedToId: createdUsers[7].id, // Agent 3
        supervisorId: createdUsers[3].id, // Supervisor 1
        expectedCloseDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        description: "Mobile CRM solution for retail chain management"
      }
    ];

    const createdDeals = await Promise.all(
      dealsData.map(async (deal) => {
        const [existing] = await db.select().from(deals).where(eq(deals.title, deal.title)).limit(1);
        if (existing) return existing;
        const [created] = await db.insert(deals).values(deal).returning();
        return created;
      })
    );

    // 8. Create activities
    console.log("Creating activities...");
    const [activityTypesList] = await Promise.all([
      db.select().from(activityTypes).where(eq(activityTypes.tenantId, 1)),
    ]);

    const activitiesData: InsertActivity[] = [
      {
        tenantId: 1,
        title: "Initial Discovery Call",
        description: "Discovery call to understand TechCorp's CRM requirements",
        activityType: activityTypesList[0]?.name || "Call",
        contactId: createdContacts[0].id,
        dealId: createdDeals[0].id,
        userId: createdUsers[5].id, // Agent 1
        supervisorId: createdUsers[3].id, // Supervisor 1
        scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
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
        userId: createdUsers[6].id, // Agent 2
        supervisorId: createdUsers[3].id, // Supervisor 1
        scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
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
        userId: createdUsers[8].id, // Agent 4
        supervisorId: createdUsers[4].id, // Supervisor 2
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: "scheduled"
      },
      {
        tenantId: 1,
        title: "Follow-up Email",
        description: "Follow-up on financial services integration discussion",
        activityType: activityTypesList[2]?.name || "Email",
        contactId: createdContacts[4].id,
        dealId: createdDeals[3].id,
        userId: createdUsers[9].id, // Agent 5
        supervisorId: createdUsers[4].id, // Supervisor 2
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        status: "scheduled"
      }
    ];

    await Promise.all(
      activitiesData.map(async (activity) => {
        const [existing] = await db.select().from(activities).where(eq(activities.title, activity.title)).limit(1);
        if (existing) return existing;
        const [created] = await db.insert(activities).values(activity).returning();
        return created;
      })
    );

    console.log("✅ Test data seeding completed successfully!");
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
- Admin: Full system access
- Sales Manager: Manages 2 Supervisors
- Supervisor 1: Manages 3 Agents (John, Emma, David)
- Supervisor 2: Manages 3 Agents (Sophia, Alex, Mia)
- Director: Strategic oversight and reporting

All data includes proper supervisor_id assignments for hierarchical filtering.
    `);

  } catch (error) {
    console.error("❌ Error seeding test data:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestData().catch(console.error);
}