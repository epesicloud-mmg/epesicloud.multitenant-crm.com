import { 
  tenants, users, roles, companies, products, leads, contacts, salesStages, deals, activities,
  activityTypes, salesPipelines, interestLevels, eventLogs, chatConversations, chatMessages, agentConversations, agentMessages,
  type Tenant, type User, type Role, type Company, type Product, type Lead, type Contact, type SalesStage, type Deal, type Activity,
  type ActivityType, type SalesPipeline, type InterestLevel, type EventLog, type ChatConversation, type ChatMessage, type AgentConversation, type AgentMessage,
  type UserWithRole, type UserWithManager,
  type InsertTenant, type InsertUser, type InsertRole, type InsertCompany, type InsertProduct, type InsertLead, type InsertContact, 
  type InsertSalesStage, type InsertDeal, type InsertActivity, type InsertActivityType, type InsertSalesPipeline, type InsertInterestLevel,
  type InsertEventLog, type InsertChatConversation, type InsertChatMessage, type InsertAgentConversation, type InsertAgentMessage,
  PERMISSIONS, ROLE_LEVELS
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, or, ilike, sql, isNull, inArray } from "drizzle-orm";

export interface IStorage {
  // Tenants
  getTenant(id: number): Promise<Tenant | undefined>;
  getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;

  // Roles
  getRoles(tenantId: number, workspaceId?: number): Promise<Role[]>;
  getRole(id: number, tenantId: number): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>, tenantId: number): Promise<Role | undefined>;
  deleteRole(id: number, tenantId: number): Promise<boolean>;

  // Users with hierarchy and RBAC
  getUser(id: number): Promise<UserWithRole | undefined>;
  getUserWithPermissions(id: number, tenantId: number): Promise<UserWithRole | undefined>;
  getUserByUsername(username: string, tenantId: number): Promise<UserWithRole | undefined>;
  getUsers(tenantId: number, workspaceId?: number, managerId?: number): Promise<UserWithRole[]>;
  getUserHierarchy(userId: number, tenantId: number): Promise<UserWithManager | undefined>;
  getUserSubordinates(managerId: number, tenantId: number): Promise<UserWithRole[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>, tenantId: number): Promise<User | undefined>;
  updateUserContext(id: number, workspaceId?: number, projectId?: number, tenantId?: number): Promise<User | undefined>;
  deleteUser(id: number, tenantId: number): Promise<boolean>;
  
  // Permission checks
  userHasPermission(userId: number, permission: string, tenantId: number): Promise<boolean>;
  getUserDataScope(userId: number, tenantId: number): Promise<'own' | 'team' | 'all'>;

  // Companies
  getCompanies(tenantId: number): Promise<Company[]>;
  getCompany(id: number, tenantId: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>, tenantId: number): Promise<Company | undefined>;
  deleteCompany(id: number, tenantId: number): Promise<boolean>;

  // Products
  getProducts(tenantId: number): Promise<Product[]>;
  getProduct(id: number, tenantId: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>, tenantId: number): Promise<Product | undefined>;
  deleteProduct(id: number, tenantId: number): Promise<boolean>;

  // Leads
  getLeads(tenantId: number): Promise<Lead[]>;
  getLead(id: number, tenantId: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>, tenantId: number): Promise<Lead | undefined>;
  deleteLead(id: number, tenantId: number): Promise<boolean>;
  convertLead(id: number, tenantId: number): Promise<Contact>;

  // Contacts
  getContacts(tenantId: number, limit?: number): Promise<(Contact & { company?: Company })[]>;
  getContact(id: number, tenantId: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>, tenantId: number): Promise<Contact | undefined>;
  deleteContact(id: number, tenantId: number): Promise<boolean>;
  searchContacts(query: string, tenantId: number): Promise<Contact[]>;

  // Sales Pipelines
  getSalesPipelines(tenantId: number): Promise<SalesPipeline[]>;
  getSalesPipeline(id: number, tenantId: number): Promise<SalesPipeline | undefined>;
  createSalesPipeline(pipeline: InsertSalesPipeline): Promise<SalesPipeline>;
  updateSalesPipeline(id: number, pipeline: Partial<InsertSalesPipeline>, tenantId: number): Promise<SalesPipeline | undefined>;
  deleteSalesPipeline(id: number, tenantId: number): Promise<boolean>;

  // Sales Stages
  getSalesStages(tenantId: number, pipelineId?: number): Promise<SalesStage[]>;
  getSalesStage(id: number, tenantId: number): Promise<SalesStage | undefined>;
  createSalesStage(stage: InsertSalesStage): Promise<SalesStage>;
  updateSalesStage(id: number, stage: Partial<InsertSalesStage>, tenantId: number): Promise<SalesStage | undefined>;
  deleteSalesStage(id: number, tenantId: number): Promise<boolean>;
  getDealStages(tenantId: number): Promise<SalesStage[]>;

  // Activity Types
  getActivityTypes(tenantId: number): Promise<ActivityType[]>;
  getActivityType(id: number, tenantId: number): Promise<ActivityType | undefined>;
  createActivityType(activityType: InsertActivityType): Promise<ActivityType>;
  updateActivityType(id: number, activityType: Partial<InsertActivityType>, tenantId: number): Promise<ActivityType | undefined>;
  deleteActivityType(id: number, tenantId: number): Promise<boolean>;

  // Deals
  getDeals(tenantId: number): Promise<Deal[]>;
  getDeal(id: number, tenantId: number): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: number, deal: Partial<InsertDeal>, tenantId: number): Promise<Deal | undefined>;
  deleteDeal(id: number, tenantId: number): Promise<boolean>;
  getDealStages(tenantId: number): Promise<SalesStage[]>;

  // Lead assignment methods
  assignLead(id: number, assignedToId: number, assignedById: number, tenantId: number): Promise<Lead | undefined>;
  unassignLead(id: number, tenantId: number): Promise<Lead | undefined>;
  getMyLeads(userId: number, tenantId: number): Promise<Lead[]>;
  getTeamLeads(managerId: number, tenantId: number): Promise<Lead[]>;

  // Activities
  getActivities(tenantId: number, limit?: number): Promise<Activity[]>;
  getActivitiesForContact(contactId: number, tenantId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>, tenantId: number): Promise<Activity | undefined>;
  deleteActivity(id: number, tenantId: number): Promise<boolean>;

  // Dashboard metrics
  getDashboardMetrics(tenantId: number): Promise<{
    totalContacts: number;
    activeDeals: number;
    pipelineRevenue: number;
    conversionRate: number;
  }>;

  // AI Conversations
  getUserConversations(userId: number, tenantId: number): Promise<AgentConversation[]>;
  getConversation(id: number, userId: number, tenantId: number): Promise<AgentConversation | undefined>;
  createConversation(conversation: InsertAgentConversation): Promise<AgentConversation>;
  updateConversation(id: number, conversation: Partial<InsertAgentConversation>, userId: number, tenantId: number): Promise<AgentConversation | undefined>;
  deleteConversation(id: number, userId: number, tenantId: number): Promise<boolean>;

  // AI Messages
  getConversationMessages(conversationId: number, userId: number, tenantId: number): Promise<AgentMessage[]>;
  addMessage(message: InsertAgentMessage): Promise<AgentMessage>;
  deleteMessage(id: number, userId: number, tenantId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getTenant(id: number): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain));
    return tenant || undefined;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db.insert(tenants).values(tenant).returning();
    return newTenant;
  }

  async getUser(id: number): Promise<UserWithRole | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, id));
    
    if (!user) return undefined;
    
    return {
      ...user.users,
      role: user.roles!
    };
  }

  async getUserByUsername(username: string, tenantId: number): Promise<UserWithRole | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(and(eq(users.username, username), eq(users.tenantId, tenantId)));
    
    if (!user) return undefined;
    
    return {
      ...user.users,
      role: user.roles!
    };
  }

  async getUserWithPermissions(id: number, tenantId: number): Promise<UserWithRole | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId)));
    
    if (!user) return undefined;
    
    return {
      ...user.users,
      role: user.roles!
    };
  }

  async getRoles(tenantId: number, workspaceId?: number): Promise<Role[]> {
    let query = db
      .select()
      .from(roles)
      .where(eq(roles.tenantId, tenantId));

    if (workspaceId) {
      query = query.where(or(eq(roles.workspaceId, workspaceId), isNull(roles.workspaceId))) as any;
    }

    return await query;
  }

  async getUsers(tenantId: number, workspaceId?: number, managerId?: number): Promise<UserWithRole[]> {
    let conditions = [eq(users.tenantId, tenantId)];

    if (workspaceId) {
      conditions.push(eq(users.currentWorkspaceId, workspaceId));
    }

    if (managerId) {
      conditions.push(eq(users.managerId, managerId));
    }

    const result = await db
      .select()
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(and(...conditions));

    return result.map(row => ({
      ...row.users,
      role: row.roles!
    }));
  }

  async getUserHierarchy(userId: number, tenantId: number): Promise<UserWithManager | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId));

    if (!user) return undefined;

    let manager = undefined;
    if (user.users.managerId) {
      const [managerData] = await db
        .select()
        .from(users)
        .leftJoin(roles, eq(users.roleId, roles.id))
        .where(eq(users.id, user.users.managerId));

      if (managerData) {
        manager = {
          ...managerData.users,
          role: managerData.roles!
        };
      }
    }

    const subordinates = await db
      .select()
      .from(users)
      .where(eq(users.managerId, userId));

    return {
      ...user.users,
      role: user.roles!,
      manager,
      subordinates
    };
  }

  async getUserSubordinates(managerId: number, tenantId: number): Promise<UserWithRole[]> {
    const result = await db
      .select()
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.managerId, managerId));

    return result.map(row => ({
      ...row.users,
      role: row.roles!
    }));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async createRole(role: InsertRole): Promise<Role> {
    const [newRole] = await db.insert(roles).values(role).returning();
    return newRole;
  }

  async updateUserContext(id: number, workspaceId?: number, projectId?: number, tenantId?: number): Promise<User | undefined> {
    const updateData: any = {};
    if (workspaceId !== undefined) updateData.currentWorkspaceId = workspaceId;
    if (projectId !== undefined) updateData.currentProjectId = projectId;
    
    let conditions = [eq(users.id, id)];
    if (tenantId) {
      conditions.push(eq(users.tenantId, tenantId));
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(and(...conditions))
      .returning();
    
    return updatedUser || undefined;
  }

  async updateUser(id: number, user: Partial<InsertUser>, tenantId: number): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId)))
      .returning();
    
    return updatedUser || undefined;
  }

  async getUserDataScope(userId: number, tenantId: number): Promise<'own' | 'team' | 'all'> {
    const user = await this.getUserWithPermissions(userId, tenantId);
    if (!user) return 'own';
    
    // Admin and Sales Manager see all data (level 4-5)
    if (user.role.level >= 4) return 'all';
    
    // Supervisors see team data (level 3)
    if (user.role.level >= 3) return 'team';
    
    // Agents see only their own data (level 1-2)
    return 'own';
  }

  async userHasPermission(userId: number, permission: string, tenantId: number): Promise<boolean> {
    const user = await this.getUserWithPermissions(userId, tenantId);
    if (!user) return false;
    
    return user.role.permissions.includes(permission);
  }

  async getRole(id: number, tenantId: number): Promise<Role | undefined> {
    const [role] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.id, id), eq(roles.tenantId, tenantId)));
    
    return role || undefined;
  }

  async updateRole(id: number, role: Partial<InsertRole>, tenantId: number): Promise<Role | undefined> {
    const [updatedRole] = await db
      .update(roles)
      .set(role)
      .where(and(eq(roles.id, id), eq(roles.tenantId, tenantId)))
      .returning();
    
    return updatedRole || undefined;
  }

  async deleteRole(id: number, tenantId: number): Promise<boolean> {
    const result = await db
      .delete(roles)
      .where(and(eq(roles.id, id), eq(roles.tenantId, tenantId)));
    
    return result.rowCount > 0;
  }

  async deleteUser(id: number, tenantId: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId)));
    
    return result.rowCount > 0;
  }

  async getCompanies(tenantId: number): Promise<Company[]> {
    return await db.select().from(companies)
      .where(eq(companies.tenantId, tenantId))
      .orderBy(desc(companies.createdAt));
  }

  async getCompany(id: number, tenantId: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies)
      .where(and(eq(companies.id, id), eq(companies.tenantId, tenantId)));
    return company || undefined;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: number, company: Partial<InsertCompany>, tenantId: number): Promise<Company | undefined> {
    const [updatedCompany] = await db.update(companies)
      .set(company)
      .where(and(eq(companies.id, id), eq(companies.tenantId, tenantId)))
      .returning();
    return updatedCompany || undefined;
  }

  async deleteCompany(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(companies)
      .where(and(eq(companies.id, id), eq(companies.tenantId, tenantId)));
    return (result.rowCount || 0) > 0;
  }

  // Products methods
  async getProducts(tenantId: number): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.tenantId, tenantId))
      .orderBy(desc(products.createdAt));
  }

  async getProduct(id: number, tenantId: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>, tenantId: number): Promise<Product | undefined> {
    const [updatedProduct] = await db.update(products)
      .set(product)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .returning();
    return updatedProduct || undefined;
  }

  async deleteProduct(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
    return (result.rowCount || 0) > 0;
  }

  // Leads methods
  async getLeads(tenantId: number, userId?: number, userRole?: string): Promise<Lead[]> {
    // Role-based filtering
    if (userId && userRole) {
      if (userRole === 'agent') {
        // Agents only see their assigned leads
        return await db.select().from(leads)
          .where(and(eq(leads.assignedToId, userId), eq(leads.tenantId, tenantId)))
          .orderBy(desc(leads.createdAt));
      } else if (userRole === 'supervisor') {
        // Supervisors see leads assigned to their agents (team members)
        const teamMembers = await this.getUserSubordinates(userId, tenantId);
        const teamIds = teamMembers.map(member => member.id);
        teamIds.push(userId); // Include supervisor's own leads
        
        return await db.select().from(leads)
          .leftJoin(users, eq(leads.assignedToId, users.id))
          .where(
            and(
              eq(leads.tenantId, tenantId),
              or(
                inArray(leads.assignedToId, teamIds),
                isNull(leads.assignedToId) // Also show unassigned leads
              )
            )
          )
          .orderBy(desc(leads.createdAt))
          .then(result => result.map(row => ({
            ...row.leads,
            assignedTo: row.users
          })) as any[]);
      } else if (userRole === 'sales manager') {
        // Sales managers see unassigned leads and leads assigned to their entire team hierarchy
        const teamMembers = await this.getUserSubordinates(userId, tenantId);
        const teamIds = teamMembers.map(member => member.id);
        teamIds.push(userId);
        
        return await db.select().from(leads)
          .leftJoin(users, eq(leads.assignedToId, users.id))
          .where(
            and(
              eq(leads.tenantId, tenantId),
              or(
                isNull(leads.assignedToId),
                inArray(leads.assignedToId, teamIds)
              )
            )
          )
          .orderBy(desc(leads.createdAt))
          .then(result => result.map(row => ({
            ...row.leads,
            assignedTo: row.users
          })) as any[]);
      }
    }

    // Default: show all leads for super admin/director
    const result = await db.select().from(leads)
      .leftJoin(users, eq(leads.assignedToId, users.id))
      .where(eq(leads.tenantId, tenantId))
      .orderBy(desc(leads.createdAt));
    
    return result.map(row => ({
      ...row.leads,
      assignedTo: row.users
    })) as any[];
  }

  async assignLead(id: number, assignedToId: number, assignedById: number, tenantId: number): Promise<Lead | undefined> {
    const [updatedLead] = await db.update(leads)
      .set({ 
        assignedToId, 
        assignedById,
        assignedAt: new Date()
      })
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)))
      .returning();
    return updatedLead || undefined;
  }

  async unassignLead(id: number, tenantId: number): Promise<Lead | undefined> {
    const [updatedLead] = await db.update(leads)
      .set({ 
        assignedToId: null, 
        assignedById: null,
        assignedAt: null
      })
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)))
      .returning();
    return updatedLead || undefined;
  }

  async getMyLeads(userId: number, tenantId: number): Promise<Lead[]> {
    return await db.select().from(leads)
      .where(and(eq(leads.assignedToId, userId), eq(leads.tenantId, tenantId)))
      .orderBy(desc(leads.createdAt));
  }

  async getTeamLeads(managerId: number, tenantId: number): Promise<Lead[]> {
    const teamMembers = await this.getUserSubordinates(managerId, tenantId);
    const teamIds = teamMembers.map(member => member.id);
    teamIds.push(managerId);
    
    return await db.select().from(leads)
      .where(and(
        inArray(leads.assignedToId, teamIds),
        eq(leads.tenantId, tenantId)
      ))
      .orderBy(desc(leads.createdAt));
  }

  async getLead(id: number, tenantId: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads)
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)));
    return lead || undefined;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async updateLead(id: number, lead: Partial<InsertLead>, tenantId: number): Promise<Lead | undefined> {
    const [updatedLead] = await db.update(leads)
      .set(lead)
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)))
      .returning();
    return updatedLead || undefined;
  }

  async deleteLead(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(leads)
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)));
    return (result.rowCount || 0) > 0;
  }

  async convertLead(id: number, tenantId: number): Promise<Contact> {
    const lead = await this.getLead(id, tenantId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Create contact from lead
    const newContact = await this.createContact({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      jobTitle: lead.jobTitle,
      status: "prospect",
      tenantId: lead.tenantId,
      notes: lead.notes,
    });

    // Mark lead as converted
    await this.updateLead(id, { status: "converted" }, tenantId);

    return newContact;
  }

  async getContacts(tenantId: number, limit: number = 50): Promise<(Contact & { company?: Company })[]> {
    const result = await db.select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      email: contacts.email,
      phone: contacts.phone,
      jobTitle: contacts.jobTitle,
      status: contacts.status,
      companyId: contacts.companyId,
      tenantId: contacts.tenantId,
      notes: contacts.notes,
      createdAt: contacts.createdAt,
      lastContactDate: contacts.lastContactDate,
      companyName: companies.name,
      companyIndustry: companies.industry
    })
    .from(contacts)
    .leftJoin(companies, eq(contacts.companyId, companies.id))
    .where(eq(contacts.tenantId, tenantId))
    .orderBy(desc(contacts.createdAt))
    .limit(limit);

    return result.map(row => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone,
      jobTitle: row.jobTitle,
      status: row.status,
      companyId: row.companyId,
      tenantId: row.tenantId,
      notes: row.notes,
      createdAt: row.createdAt,
      lastContactDate: row.lastContactDate,
      company: row.companyName ? {
        id: row.companyId!,
        name: row.companyName,
        industry: row.companyIndustry,
        website: null,
        phone: null,
        address: null,
        tenantId: row.tenantId,
        createdAt: row.createdAt
      } : undefined
    }));
  }

  async getContact(id: number, tenantId: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)));
    return contact || undefined;
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }

  async updateContact(id: number, contact: Partial<InsertContact>, tenantId: number): Promise<Contact | undefined> {
    const [updatedContact] = await db.update(contacts)
      .set(contact)
      .where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)))
      .returning();
    return updatedContact || undefined;
  }

  async deleteContact(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)));
    return (result.rowCount || 0) > 0;
  }

  async searchContacts(query: string, tenantId: number): Promise<Contact[]> {
    return await db.select().from(contacts)
      .where(and(
        eq(contacts.tenantId, tenantId),
        // Note: This is a simple search implementation. In production, you might want to use full-text search
      ))
      .orderBy(desc(contacts.createdAt));
  }

  // Activity Types Implementation
  async getActivityTypes(tenantId: number): Promise<ActivityType[]> {
    return await db.select().from(activityTypes)
      .where(eq(activityTypes.tenantId, tenantId))
      .orderBy(activityTypes.typeName);
  }

  async getActivityType(id: number, tenantId: number): Promise<ActivityType | undefined> {
    const [activityType] = await db.select().from(activityTypes)
      .where(and(eq(activityTypes.id, id), eq(activityTypes.tenantId, tenantId)));
    return activityType || undefined;
  }

  async createActivityType(activityType: InsertActivityType): Promise<ActivityType> {
    const [newActivityType] = await db.insert(activityTypes).values(activityType).returning();
    return newActivityType;
  }

  async updateActivityType(id: number, activityType: Partial<InsertActivityType>, tenantId: number): Promise<ActivityType | undefined> {
    const [updatedActivityType] = await db.update(activityTypes)
      .set(activityType)
      .where(and(eq(activityTypes.id, id), eq(activityTypes.tenantId, tenantId)))
      .returning();
    return updatedActivityType || undefined;
  }

  async deleteActivityType(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(activityTypes)
      .where(and(eq(activityTypes.id, id), eq(activityTypes.tenantId, tenantId)));
    return (result.rowCount || 0) > 0;
  }

  // Sales Pipelines Implementation
  async getSalesPipelines(tenantId: number): Promise<SalesPipeline[]> {
    const pipelines = await db.select().from(salesPipelines)
      .where(eq(salesPipelines.tenantId, tenantId))
      .orderBy(salesPipelines.title);

    // Get stages for each pipeline
    const pipelinesWithStages = await Promise.all(
      pipelines.map(async (pipeline) => {
        const stages = await this.getSalesStages(tenantId, pipeline.id);
        return { ...pipeline, stages };
      })
    );

    return pipelinesWithStages as any[];
  }

  async getSalesPipeline(id: number, tenantId: number): Promise<SalesPipeline | undefined> {
    const [pipeline] = await db.select().from(salesPipelines)
      .where(and(eq(salesPipelines.id, id), eq(salesPipelines.tenantId, tenantId)));
    
    if (!pipeline) return undefined;

    const stages = await this.getSalesStages(tenantId, pipeline.id);
    return { ...pipeline, stages } as any;
  }

  async createSalesPipeline(pipeline: InsertSalesPipeline): Promise<SalesPipeline> {
    const [newPipeline] = await db.insert(salesPipelines).values(pipeline).returning();
    return newPipeline;
  }

  async updateSalesPipeline(id: number, pipeline: Partial<InsertSalesPipeline>, tenantId: number): Promise<SalesPipeline | undefined> {
    const [updatedPipeline] = await db.update(salesPipelines)
      .set(pipeline)
      .where(and(eq(salesPipelines.id, id), eq(salesPipelines.tenantId, tenantId)))
      .returning();
    return updatedPipeline || undefined;
  }

  async deleteSalesPipeline(id: number, tenantId: number): Promise<boolean> {
    // First delete all stages for this pipeline
    await db.delete(salesStages)
      .where(and(eq(salesStages.salePipelineId, id), eq(salesStages.tenantId, tenantId)));
    
    // Then delete the pipeline
    const result = await db.delete(salesPipelines)
      .where(and(eq(salesPipelines.id, id), eq(salesPipelines.tenantId, tenantId)));
    return (result.rowCount || 0) > 0;
  }

  // Sales Stages Implementation
  async getSalesStages(tenantId: number, pipelineId?: number): Promise<SalesStage[]> {
    const conditions = [eq(salesStages.tenantId, tenantId)];
    if (pipelineId) {
      conditions.push(eq(salesStages.salePipelineId, pipelineId));
    }

    return await db.select().from(salesStages)
      .where(and(...conditions))
      .orderBy(salesStages.order);
  }

  async getSalesStage(id: number, tenantId: number): Promise<SalesStage | undefined> {
    const [stage] = await db.select().from(salesStages)
      .where(and(eq(salesStages.id, id), eq(salesStages.tenantId, tenantId)));
    return stage || undefined;
  }

  async createSalesStage(stage: InsertSalesStage): Promise<SalesStage> {
    const [newStage] = await db.insert(salesStages).values(stage).returning();
    return newStage;
  }

  async updateSalesStage(id: number, stage: Partial<InsertSalesStage>, tenantId: number): Promise<SalesStage | undefined> {
    const [updatedStage] = await db.update(salesStages)
      .set(stage)
      .where(and(eq(salesStages.id, id), eq(salesStages.tenantId, tenantId)))
      .returning();
    return updatedStage || undefined;
  }

  async deleteSalesStage(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(salesStages)
      .where(and(eq(salesStages.id, id), eq(salesStages.tenantId, tenantId)));
    return (result.rowCount || 0) > 0;
  }

  async getDeals(tenantId: number): Promise<Deal[]> {
    return await db.select().from(deals)
      .where(eq(deals.tenantId, tenantId))
      .orderBy(desc(deals.createdAt));
  }

  async getDeal(id: number, tenantId: number): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals)
      .where(and(eq(deals.id, id), eq(deals.tenantId, tenantId)));
    return deal || undefined;
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const [newDeal] = await db.insert(deals).values(deal).returning();
    return newDeal;
  }

  async updateDeal(id: number, deal: Partial<InsertDeal>, tenantId: number): Promise<Deal | undefined> {
    const [updatedDeal] = await db.update(deals)
      .set(deal)
      .where(and(eq(deals.id, id), eq(deals.tenantId, tenantId)))
      .returning();
    return updatedDeal || undefined;
  }

  async deleteDeal(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(deals)
      .where(and(eq(deals.id, id), eq(deals.tenantId, tenantId)));
    return (result.rowCount || 0) > 0;
  }

  // Deal stages method - alias for sales stages for API compatibility
  async getDealStages(tenantId: number): Promise<SalesStage[]> {
    return await this.getSalesStages(tenantId);
  }

  async getActivities(tenantId: number, limit: number = 20): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(eq(activities.tenantId, tenantId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getActivitiesForContact(contactId: number, tenantId: number): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(and(eq(activities.contactId, contactId), eq(activities.tenantId, tenantId)))
      .orderBy(desc(activities.createdAt));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async updateActivity(id: number, activity: Partial<InsertActivity>, tenantId: number): Promise<Activity | undefined> {
    const [updatedActivity] = await db.update(activities)
      .set(activity)
      .where(and(eq(activities.id, id), eq(activities.tenantId, tenantId)))
      .returning();
    return updatedActivity || undefined;
  }

  async deleteActivity(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(activities)
      .where(and(eq(activities.id, id), eq(activities.tenantId, tenantId)));
    return (result.rowCount || 0) > 0;
  }

  async getDashboardMetrics(tenantId: number): Promise<{
    totalContacts: number;
    activeDeals: number;
    pipelineRevenue: number;
    conversionRate: number;
  }> {
    // Get total contacts
    const [contactsCount] = await db.select({ count: count() }).from(contacts)
      .where(eq(contacts.tenantId, tenantId));

    // Get active deals
    const [dealsCount] = await db.select({ count: count() }).from(deals)
      .where(eq(deals.tenantId, tenantId));

    // Calculate pipeline revenue (sum of all active deals)
    const dealsData = await db.select().from(deals)
      .where(eq(deals.tenantId, tenantId));
    
    const pipelineRevenue = dealsData.reduce((sum, deal) => sum + parseFloat(deal.value), 0);

    // Simple conversion rate calculation (this is a placeholder - in real apps you'd have more sophisticated metrics)
    const conversionRate = contactsCount.count > 0 ? (dealsCount.count / contactsCount.count) * 100 : 0;

    return {
      totalContacts: contactsCount.count,
      activeDeals: dealsCount.count,
      pipelineRevenue,
      conversionRate: Math.round(conversionRate * 10) / 10,
    };
  }

  // Interest Levels methods
  async getInterestLevels(tenantId: number): Promise<InterestLevel[]> {
    return await db.select().from(interestLevels).where(eq(interestLevels.tenantId, tenantId));
  }

  async createInterestLevel(level: InsertInterestLevel): Promise<InterestLevel> {
    const [newLevel] = await db.insert(interestLevels).values(level).returning();
    return newLevel;
  }

  async updateInterestLevel(id: number, updates: Partial<InsertInterestLevel>, tenantId: number): Promise<InterestLevel | null> {
    const [updated] = await db
      .update(interestLevels)
      .set(updates)
      .where(and(eq(interestLevels.id, id), eq(interestLevels.tenantId, tenantId)))
      .returning();
    return updated || null;
  }

  async deleteInterestLevel(id: number, tenantId: number): Promise<boolean> {
    const result = await db
      .delete(interestLevels)
      .where(and(eq(interestLevels.id, id), eq(interestLevels.tenantId, tenantId)));
    return (result.rowCount || 0) > 0;
  }

  // Event Logs methods (for auditing and AI context)
  async getUserRecentEvents(userId: number, tenantId: number, limit: number = 10): Promise<EventLog[]> {
    return await db
      .select()
      .from(eventLogs)
      .where(and(eq(eventLogs.userId, userId), eq(eventLogs.tenantId, tenantId)))
      .orderBy(desc(eventLogs.createdAt))
      .limit(limit);
  }

  async createEventLog(eventLog: InsertEventLog): Promise<EventLog> {
    const [newEvent] = await db.insert(eventLogs).values(eventLog).returning();
    return newEvent;
  }

  async getEntityEventLogs(
    sourceEntity: string,
    sourceEntityReference: number,
    tenantId: number,
    limit: number = 50
  ): Promise<EventLog[]> {
    return await db
      .select()
      .from(eventLogs)
      .where(
        and(
          eq(eventLogs.sourceEntity, sourceEntity),
          eq(eventLogs.sourceEntityReference, sourceEntityReference),
          eq(eventLogs.tenantId, tenantId)
        )
      )
      .orderBy(desc(eventLogs.createdAt))
      .limit(limit);
  }

  // AI Conversations methods
  async getUserConversations(userId: number, tenantId: number): Promise<AgentConversation[]> {
    return await db
      .select()
      .from(agentConversations)
      .where(and(eq(agentConversations.userId, userId), eq(agentConversations.tenantId, tenantId)))
      .orderBy(desc(agentConversations.updatedAt));
  }

  async getConversation(id: number, userId: number, tenantId: number): Promise<AgentConversation | undefined> {
    const [conversation] = await db
      .select()
      .from(agentConversations)
      .where(and(
        eq(agentConversations.id, id),
        eq(agentConversations.userId, userId),
        eq(agentConversations.tenantId, tenantId)
      ));
    return conversation || undefined;
  }

  async createConversation(conversation: InsertAgentConversation): Promise<AgentConversation> {
    const [newConversation] = await db
      .insert(agentConversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async updateConversation(
    id: number,
    conversation: Partial<InsertAgentConversation>,
    userId: number,
    tenantId: number
  ): Promise<AgentConversation | undefined> {
    const [updated] = await db
      .update(agentConversations)
      .set({
        ...conversation,
        updatedAt: new Date(),
      })
      .where(and(
        eq(agentConversations.id, id),
        eq(agentConversations.userId, userId),
        eq(agentConversations.tenantId, tenantId)
      ))
      .returning();
    return updated || undefined;
  }

  async deleteConversation(id: number, userId: number, tenantId: number): Promise<boolean> {
    const result = await db
      .delete(agentConversations)
      .where(and(
        eq(agentConversations.id, id),
        eq(agentConversations.userId, userId),
        eq(agentConversations.tenantId, tenantId)
      ));
    return (result.rowCount || 0) > 0;
  }

  // Chat Conversations methods
  async getUserChatConversations(userId: number, tenantId: number): Promise<ChatConversation[]> {
    return await db
      .select()
      .from(chatConversations)
      .where(and(eq(chatConversations.userId, userId), eq(chatConversations.tenantId, tenantId)))
      .orderBy(desc(chatConversations.lastMessageAt));
  }

  async getChatConversation(id: number, userId: number, tenantId: number): Promise<ChatConversation | undefined> {
    const [conversation] = await db
      .select()
      .from(chatConversations)
      .where(and(
        eq(chatConversations.id, id),
        eq(chatConversations.userId, userId),
        eq(chatConversations.tenantId, tenantId)
      ));
    return conversation || undefined;
  }

  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [newConversation] = await db
      .insert(chatConversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async updateChatConversation(
    id: number,
    conversation: Partial<InsertChatConversation>,
    userId: number,
    tenantId: number
  ): Promise<ChatConversation | undefined> {
    const [updated] = await db
      .update(chatConversations)
      .set({
        ...conversation,
        updatedAt: new Date(),
      })
      .where(and(
        eq(chatConversations.id, id),
        eq(chatConversations.userId, userId),
        eq(chatConversations.tenantId, tenantId)
      ))
      .returning();
    return updated || undefined;
  }

  async deleteChatConversation(id: number, userId: number, tenantId: number): Promise<boolean> {
    const result = await db
      .delete(chatConversations)
      .where(and(
        eq(chatConversations.id, id),
        eq(chatConversations.userId, userId),
        eq(chatConversations.tenantId, tenantId)
      ));
    return (result.rowCount || 0) > 0;
  }

  // Chat Messages methods
  async getChatMessages(conversationId: number, userId: number, tenantId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(and(
        eq(chatMessages.conversationId, conversationId),
        eq(chatMessages.userId, userId),
        eq(chatMessages.tenantId, tenantId)
      ))
      .orderBy(chatMessages.createdAt);
  }

  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    
    // Update conversation's lastMessageAt and messageCount
    await db
      .update(chatConversations)
      .set({
        lastMessageAt: new Date(),
        messageCount: sql`${chatConversations.messageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(chatConversations.id, message.conversationId));
    
    return newMessage;
  }

  async deleteChatMessage(id: number, userId: number, tenantId: number): Promise<boolean> {
    const result = await db
      .delete(chatMessages)
      .where(and(
        eq(chatMessages.id, id),
        eq(chatMessages.userId, userId),
        eq(chatMessages.tenantId, tenantId)
      ));
    return (result.rowCount || 0) > 0;
  }

  // AI Messages methods
  async getConversationMessages(conversationId: number, userId: number, tenantId: number): Promise<AgentMessage[]> {
    return await db
      .select()
      .from(agentMessages)
      .where(and(
        eq(agentMessages.conversationId, conversationId),
        eq(agentMessages.userId, userId),
        eq(agentMessages.tenantId, tenantId)
      ))
      .orderBy(agentMessages.createdAt);
  }

  async addMessage(message: InsertAgentMessage): Promise<AgentMessage> {
    const [newMessage] = await db
      .insert(agentMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async deleteMessage(id: number, userId: number, tenantId: number): Promise<boolean> {
    const result = await db
      .delete(agentMessages)
      .where(and(
        eq(agentMessages.id, id),
        eq(agentMessages.userId, userId),
        eq(agentMessages.tenantId, tenantId)
      ));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
