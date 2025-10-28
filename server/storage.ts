import { 
  tenants, users, roles, permissions, rolePermissions, tenantUsers, refreshTokens,
  companies, products, leads, contacts, salesStages, deals, activities, leadSources,
  activityTypes, salesPipelines, interestLevels, productTypes, productCategories, productVariations, productOffers, customers,
  customerTypes, meetingTypes, meetingCancellationReasons, paymentMethods, paymentItems,
  paymentPlans, payments, commissionStatuses, commissions, commissionItems,
  type Tenant, type User, type Role, type Permission, type TenantUser, type RefreshToken,
  type Company, type Product, type Lead, type Contact, type SalesStage, type Deal, type Activity, type LeadSource,
  type ActivityType, type SalesPipeline, type InterestLevel, type ProductType, type ProductCategory, type ProductVariation, type ProductOffer, type Customer,
  type CustomerType, type MeetingType, type MeetingCancellationReason, type PaymentMethod, type PaymentItem,
  type PaymentPlan, type Payment, type CommissionStatus, type Commission, type CommissionItem,
  type InsertTenant, type InsertUser, type InsertRole, type InsertPermission, type InsertTenantUser, type InsertRefreshToken,
  type InsertCompany, type InsertProduct, type InsertLead, type InsertContact, 
  type InsertSalesStage, type InsertDeal, type InsertActivity, type InsertLeadSource, type InsertActivityType, type InsertSalesPipeline, type InsertInterestLevel,
  type InsertProductType, type InsertProductCategory, type InsertProductVariation, type InsertProductOffer, type InsertCustomer,
  type InsertCustomerType, type InsertMeetingType, type InsertMeetingCancellationReason, type InsertPaymentMethod, type InsertPaymentItem,
  type InsertPaymentPlan, type InsertPayment, type InsertCommissionStatus, type InsertCommission, type InsertCommissionItem
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // ==================== AUTH & USERS ====================
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  getUsers(tenantId: number): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserLastTenant(userId: number, tenantId: number): Promise<User | undefined>;
  updateUserLastLogin(userId: number): Promise<User | undefined>;
  
  // Refresh Tokens
  createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken>;
  getRefreshToken(tokenHash: string): Promise<RefreshToken | undefined>;
  revokeRefreshToken(tokenHash: string): Promise<boolean>;
  deleteExpiredTokens(): Promise<number>;
  
  // ==================== TENANTS ====================
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  getTenant(id: number): Promise<Tenant | undefined>;
  getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined>;
  getUserTenants(userId: number): Promise<Array<Tenant & { role: string }>>;
  
  // ==================== TENANT MEMBERSHIP ====================
  addUserToTenant(tenantUser: InsertTenantUser): Promise<TenantUser>;
  getUserTenantMembership(userId: number, tenantId: number): Promise<TenantUser | undefined>;
  removeUserFromTenant(userId: number, tenantId: number): Promise<boolean>;
  getTenantUsers(tenantId: number): Promise<Array<TenantUser & { user: User }>>;
  
  // ==================== ROLES & PERMISSIONS ====================
  createRole(role: InsertRole): Promise<Role>;
  getRole(id: number): Promise<Role | undefined>;
  getRoles(tenantId?: number): Promise<Role[]>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;
  
  createPermission(permission: InsertPermission): Promise<Permission>;
  getPermissions(): Promise<Permission[]>;
  getPermissionsByModule(module: string): Promise<Permission[]>;
  
  addPermissionToRole(roleId: number, permissionId: number): Promise<void>;
  removePermissionFromRole(roleId: number, permissionId: number): Promise<void>;
  getRolePermissions(roleId: number): Promise<Permission[]>;
  getUserPermissions(userId: number, tenantId: number): Promise<Permission[]>;
  
  // ==================== CRM - COMPANIES ====================
  getCompanies(tenantId: number): Promise<Company[]>;
  getCompany(id: number, tenantId: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>, tenantId: number): Promise<Company | undefined>;
  deleteCompany(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== CRM - CONTACTS ====================
  getContacts(tenantId: number, limit?: number): Promise<(Contact & { company?: Company })[]>;
  getContact(id: number, tenantId: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>, tenantId: number): Promise<Contact | undefined>;
  deleteContact(id: number, tenantId: number): Promise<boolean>;
  searchContacts(query: string, tenantId: number): Promise<Contact[]>;
  
  // ==================== CRM - LEADS ====================
  getLeads(tenantId: number): Promise<Lead[]>;
  getLead(id: number, tenantId: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>, tenantId: number): Promise<Lead | undefined>;
  deleteLead(id: number, tenantId: number): Promise<boolean>;
  assignLead(id: number, assignedToId: number, assignedById: number, tenantId: number): Promise<Lead | undefined>;
  getMyLeads(userId: number, tenantId: number): Promise<Lead[]>;
  
  // ==================== CRM - DEALS ====================
  getDeals(tenantId: number): Promise<Deal[]>;
  getDeal(id: number, tenantId: number): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: number, deal: Partial<InsertDeal>, tenantId: number): Promise<Deal | undefined>;
  deleteDeal(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== CRM - ACTIVITIES ====================
  getActivities(tenantId: number, limit?: number): Promise<Activity[]>;
  getActivitiesForContact(contactId: number, tenantId: number): Promise<Activity[]>;
  getActivitiesForDeal(dealId: number, tenantId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>, tenantId: number): Promise<Activity | undefined>;
  deleteActivity(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== LEAD SOURCES ====================
  getLeadSources(tenantId: number): Promise<LeadSource[]>;
  getLeadSource(id: number, tenantId: number): Promise<LeadSource | undefined>;
  createLeadSource(leadSource: InsertLeadSource): Promise<LeadSource>;
  updateLeadSource(id: number, leadSource: Partial<InsertLeadSource>, tenantId: number): Promise<LeadSource | undefined>;
  deleteLeadSource(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== CRM - SALES PIPELINES ====================
  getSalesPipelines(tenantId: number): Promise<SalesPipeline[]>;
  getSalesPipeline(id: number, tenantId: number): Promise<SalesPipeline | undefined>;
  createSalesPipeline(pipeline: InsertSalesPipeline): Promise<SalesPipeline>;
  updateSalesPipeline(id: number, pipeline: Partial<InsertSalesPipeline>, tenantId: number): Promise<SalesPipeline | undefined>;
  deleteSalesPipeline(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== CRM - SALES STAGES ====================
  getSalesStages(tenantId: number, pipelineId?: number): Promise<SalesStage[]>;
  getSalesStage(id: number, tenantId: number): Promise<SalesStage | undefined>;
  createSalesStage(stage: InsertSalesStage): Promise<SalesStage>;
  updateSalesStage(id: number, stage: Partial<InsertSalesStage>, tenantId: number): Promise<SalesStage | undefined>;
  deleteSalesStage(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== CRM - PRODUCTS ====================
  getProducts(tenantId: number): Promise<Product[]>;
  getProduct(id: number, tenantId: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>, tenantId: number): Promise<Product | undefined>;
  deleteProduct(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== CRM - PRODUCT TYPES & CATEGORIES ====================
  getProductTypes(tenantId: number): Promise<ProductType[]>;
  createProductType(productType: InsertProductType): Promise<ProductType>;
  
  getProductCategories(tenantId: number): Promise<ProductCategory[]>;
  getProductCategory(id: number, tenantId: number): Promise<ProductCategory | undefined>;
  createProductCategory(category: InsertProductCategory): Promise<ProductCategory>;
  updateProductCategory(id: number, category: Partial<InsertProductCategory>, tenantId: number): Promise<ProductCategory | undefined>;
  deleteProductCategory(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== CRM - PRODUCT VARIATIONS ====================
  getProductVariations(tenantId: number): Promise<ProductVariation[]>;
  getProductVariation(id: number, tenantId: number): Promise<ProductVariation | undefined>;
  getProductVariationsByProduct(productId: number, tenantId: number): Promise<ProductVariation[]>;
  createProductVariation(variation: InsertProductVariation): Promise<ProductVariation>;
  updateProductVariation(id: number, variation: Partial<InsertProductVariation>, tenantId: number): Promise<ProductVariation | undefined>;
  deleteProductVariation(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== CRM - PRODUCT OFFERS ====================
  getProductOffers(tenantId: number): Promise<ProductOffer[]>;
  getProductOffer(id: number, tenantId: number): Promise<ProductOffer | undefined>;
  getProductOffersByProduct(productId: number, tenantId: number): Promise<ProductOffer[]>;
  createProductOffer(offer: InsertProductOffer): Promise<ProductOffer>;
  updateProductOffer(id: number, offer: Partial<InsertProductOffer>, tenantId: number): Promise<ProductOffer | undefined>;
  deleteProductOffer(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== CRM - ACTIVITY TYPES ====================
  getActivityTypes(tenantId: number): Promise<ActivityType[]>;
  createActivityType(activityType: InsertActivityType): Promise<ActivityType>;
  updateActivityType(id: number, activityType: Partial<InsertActivityType>, tenantId: number): Promise<ActivityType | undefined>;
  deleteActivityType(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== CRM - INTEREST LEVELS ====================
  getInterestLevels(tenantId: number): Promise<InterestLevel[]>;
  createInterestLevel(interestLevel: InsertInterestLevel): Promise<InterestLevel>;
  updateInterestLevel(id: number, interestLevel: Partial<InsertInterestLevel>, tenantId: number): Promise<InterestLevel | undefined>;
  deleteInterestLevel(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== CRM - CUSTOMER TYPES ====================
  getCustomerTypes(tenantId: number): Promise<CustomerType[]>;
  createCustomerType(customerType: InsertCustomerType): Promise<CustomerType>;
  updateCustomerType(id: number, customerType: Partial<InsertCustomerType>, tenantId: number): Promise<CustomerType | undefined>;
  deleteCustomerType(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== CRM - MEETING TYPES ====================
  getMeetingTypes(tenantId: number): Promise<MeetingType[]>;
  createMeetingType(meetingType: InsertMeetingType): Promise<MeetingType>;
  updateMeetingType(id: number, meetingType: Partial<InsertMeetingType>, tenantId: number): Promise<MeetingType | undefined>;
  deleteMeetingType(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== CRM - MEETING CANCELLATION REASONS ====================
  getMeetingCancellationReasons(tenantId: number): Promise<MeetingCancellationReason[]>;
  createMeetingCancellationReason(reason: InsertMeetingCancellationReason): Promise<MeetingCancellationReason>;
  updateMeetingCancellationReason(id: number, reason: Partial<InsertMeetingCancellationReason>, tenantId: number): Promise<MeetingCancellationReason | undefined>;
  deleteMeetingCancellationReason(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== CRM - PAYMENT METHODS ====================
  getPaymentMethods(tenantId: number): Promise<PaymentMethod[]>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, method: Partial<InsertPaymentMethod>, tenantId: number): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== CRM - PAYMENT ITEMS ====================
  getPaymentItems(tenantId: number): Promise<PaymentItem[]>;
  createPaymentItem(item: InsertPaymentItem): Promise<PaymentItem>;
  updatePaymentItem(id: number, item: Partial<InsertPaymentItem>, tenantId: number): Promise<PaymentItem | undefined>;
  deletePaymentItem(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== PAYMENT COLLECTION MODULE ====================
  
  // Payment Plans
  getPaymentPlans(tenantId: number): Promise<PaymentPlan[]>;
  getPaymentPlan(id: number, tenantId: number): Promise<PaymentPlan | undefined>;
  getPaymentPlansByDeal(dealId: number, tenantId: number): Promise<PaymentPlan[]>;
  createPaymentPlan(plan: InsertPaymentPlan): Promise<PaymentPlan>;
  updatePaymentPlan(id: number, plan: Partial<InsertPaymentPlan>, tenantId: number): Promise<PaymentPlan | undefined>;
  deletePaymentPlan(id: number, tenantId: number): Promise<boolean>;
  
  // Payments
  getPayments(tenantId: number): Promise<Payment[]>;
  getPayment(id: number, tenantId: number): Promise<Payment | undefined>;
  getPaymentsByDeal(dealId: number, tenantId: number): Promise<Payment[]>;
  getPaymentsByPlan(planId: number, tenantId: number): Promise<Payment[]>;
  getPaymentsByContact(contactId: number, tenantId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>, tenantId: number): Promise<Payment | undefined>;
  deletePayment(id: number, tenantId: number): Promise<boolean>;
  generateReceiptNumber(tenantId: number): Promise<string>;
  
  // ==================== COMMISSION TRACKING MODULE ====================
  
  // Commission Statuses
  getCommissionStatuses(tenantId: number): Promise<CommissionStatus[]>;
  getCommissionStatus(id: number, tenantId: number): Promise<CommissionStatus | undefined>;
  createCommissionStatus(status: InsertCommissionStatus): Promise<CommissionStatus>;
  updateCommissionStatus(id: number, status: Partial<InsertCommissionStatus>, tenantId: number): Promise<CommissionStatus | undefined>;
  deleteCommissionStatus(id: number, tenantId: number): Promise<boolean>;
  
  // Commissions
  getCommissions(tenantId: number, filters?: { status?: string; userId?: number }): Promise<Commission[]>;
  getCommission(id: number, tenantId: number): Promise<Commission | undefined>;
  getCommissionsByUser(userId: number, tenantId: number): Promise<Commission[]>;
  getCommissionsByDeal(dealId: number, tenantId: number): Promise<Commission[]>;
  createCommission(commission: InsertCommission): Promise<Commission>;
  updateCommission(id: number, commission: Partial<InsertCommission>, tenantId: number): Promise<Commission | undefined>;
  deleteCommission(id: number, tenantId: number): Promise<boolean>;
  verifyCommission(id: number, verifiedById: number, tenantId: number): Promise<Commission | undefined>;
  approveCommission(id: number, approvedById: number, tenantId: number): Promise<Commission | undefined>;
  markCommissionPaid(id: number, paidById: number, paymentReference: string, tenantId: number): Promise<Commission | undefined>;
  generateCommissionNumber(tenantId: number): Promise<string>;
  
  // Commission Items
  getCommissionItems(commissionId: number, tenantId: number): Promise<CommissionItem[]>;
  createCommissionItem(item: InsertCommissionItem): Promise<CommissionItem>;
  updateCommissionItem(id: number, item: Partial<InsertCommissionItem>, tenantId: number): Promise<CommissionItem | undefined>;
  deleteCommissionItem(id: number, tenantId: number): Promise<boolean>;
  
  // ==================== DASHBOARD ====================
  getDashboardMetrics(tenantId: number): Promise<{
    totalContacts: number;
    activeDeals: number;
    pipelineRevenue: number;
    conversionRate: number;
  }>;
}

export class DbStorage implements IStorage {
  // ==================== AUTH & USERS ====================
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUsers(tenantId: number): Promise<User[]> {
    const allUsers = await db.select().from(users).where(eq(users.tenantId, tenantId));
    return allUsers;
  }

  async getUserWithPermissions(userId: number, tenantId: number): Promise<any> {
    // Get user basic info
    const user = await this.getUser(userId);
    if (!user) return undefined;

    // Get tenant membership with role
    const membership = await this.getUserTenantMembership(userId, tenantId);
    if (!membership) return undefined;

    // Get role details
    const role = await this.getRole(membership.roleId);
    if (!role) return undefined;

    // Get permissions
    const permissions = await this.getUserPermissions(userId, tenantId);

    return {
      ...user,
      tenantId,
      role: {
        id: role.id,
        name: role.name,
        permissions: role.permissions || [],
      },
      permissions: permissions.map(p => p.name),
    };
  }
  
  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }
  
  async updateUserLastTenant(userId: number, tenantId: number): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ lastTenantId: tenantId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }
  
  async updateUserLastLogin(userId: number): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }
  
  // ==================== REFRESH TOKENS ====================
  
  async createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken> {
    const [newToken] = await db.insert(refreshTokens).values(token).returning();
    return newToken;
  }
  
  async getRefreshToken(tokenHash: string): Promise<RefreshToken | undefined> {
    const [token] = await db.select().from(refreshTokens)
      .where(and(
        eq(refreshTokens.tokenHash, tokenHash),
        eq(refreshTokens.revoked, false)
      ))
      .limit(1);
    return token;
  }
  
  async revokeRefreshToken(tokenHash: string): Promise<boolean> {
    const result = await db.update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.tokenHash, tokenHash));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async deleteExpiredTokens(): Promise<number> {
    const result = await db.delete(refreshTokens)
      .where(sql`${refreshTokens.expiresAt} < NOW()`);
    return result.rowCount || 0;
  }
  
  // ==================== TENANTS ====================
  
  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db.insert(tenants).values(tenant).returning();
    return newTenant;
  }
  
  async getTenant(id: number): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
    return tenant;
  }
  
  async getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain)).limit(1);
    return tenant;
  }
  
  async getUserTenants(userId: number): Promise<Array<Tenant & { role: string }>> {
    const results = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        subdomain: tenants.subdomain,
        createdAt: tenants.createdAt,
        updatedAt: tenants.updatedAt,
        role: roles.name,
      })
      .from(tenantUsers)
      .innerJoin(tenants, eq(tenantUsers.tenantId, tenants.id))
      .innerJoin(roles, eq(tenantUsers.roleId, roles.id))
      .where(eq(tenantUsers.userId, userId));
    
    return results.map(r => ({ ...r, role: r.role || 'member' }));
  }
  
  // ==================== TENANT MEMBERSHIP ====================
  
  async addUserToTenant(tenantUser: InsertTenantUser): Promise<TenantUser> {
    const [membership] = await db.insert(tenantUsers).values(tenantUser).returning();
    return membership;
  }
  
  async getUserTenantMembership(userId: number, tenantId: number): Promise<TenantUser | undefined> {
    const [membership] = await db.select().from(tenantUsers)
      .where(and(
        eq(tenantUsers.userId, userId),
        eq(tenantUsers.tenantId, tenantId)
      ))
      .limit(1);
    return membership;
  }
  
  async removeUserFromTenant(userId: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(tenantUsers)
      .where(and(
        eq(tenantUsers.userId, userId),
        eq(tenantUsers.tenantId, tenantId)
      ));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async getTenantUsers(tenantId: number): Promise<Array<TenantUser & { user: User }>> {
    const results = await db
      .select()
      .from(tenantUsers)
      .innerJoin(users, eq(tenantUsers.userId, users.id))
      .where(eq(tenantUsers.tenantId, tenantId));
    
    return results.map(r => ({
      ...r.tenant_users,
      user: r.users,
    }));
  }
  
  // ==================== ROLES & PERMISSIONS ====================
  
  async createRole(role: InsertRole): Promise<Role> {
    const [newRole] = await db.insert(roles).values(role).returning();
    return newRole;
  }
  
  async getRole(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    return role;
  }
  
  async getRoles(tenantId?: number): Promise<Role[]> {
    if (tenantId) {
      return await db.select().from(roles)
        .where(or(eq(roles.tenantId, tenantId), sql`${roles.tenantId} IS NULL`));
    }
    return await db.select().from(roles).where(sql`${roles.tenantId} IS NULL`);
  }
  
  async updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined> {
    const [updated] = await db.update(roles)
      .set({ ...role, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();
    return updated;
  }
  
  async deleteRole(id: number): Promise<boolean> {
    const result = await db.delete(roles).where(eq(roles.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async createPermission(permission: InsertPermission): Promise<Permission> {
    const [newPermission] = await db.insert(permissions).values(permission).returning();
    return newPermission;
  }
  
  async getPermissions(): Promise<Permission[]> {
    return await db.select().from(permissions);
  }
  
  async getPermissionsByModule(module: string): Promise<Permission[]> {
    return await db.select().from(permissions).where(eq(permissions.module, module));
  }
  
  async addPermissionToRole(roleId: number, permissionId: number): Promise<void> {
    await db.insert(rolePermissions).values({ roleId, permissionId });
  }
  
  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    await db.delete(rolePermissions)
      .where(and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId)
      ));
  }
  
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const results = await db
      .select({
        id: permissions.id,
        name: permissions.name,
        description: permissions.description,
        module: permissions.module,
        createdAt: permissions.createdAt,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));
    
    return results;
  }
  
  async getUserPermissions(userId: number, tenantId: number): Promise<Permission[]> {
    const results = await db
      .select({
        id: permissions.id,
        name: permissions.name,
        description: permissions.description,
        module: permissions.module,
        createdAt: permissions.createdAt,
      })
      .from(tenantUsers)
      .innerJoin(rolePermissions, eq(tenantUsers.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(and(
        eq(tenantUsers.userId, userId),
        eq(tenantUsers.tenantId, tenantId)
      ));
    
    return results;
  }
  
  // ==================== CRM - COMPANIES ====================
  
  async getCompanies(tenantId: number): Promise<Company[]> {
    return await db.select().from(companies).where(eq(companies.tenantId, tenantId));
  }
  
  async getCompany(id: number, tenantId: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies)
      .where(and(eq(companies.id, id), eq(companies.tenantId, tenantId)))
      .limit(1);
    return company;
  }
  
  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }
  
  async updateCompany(id: number, company: Partial<InsertCompany>, tenantId: number): Promise<Company | undefined> {
    const [updated] = await db.update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(and(eq(companies.id, id), eq(companies.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteCompany(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(companies)
      .where(and(eq(companies.id, id), eq(companies.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== CRM - CONTACTS ====================
  
  async getContacts(tenantId: number, limit?: number): Promise<(Contact & { company?: Company })[]> {
    const query = db.select({
      contact: contacts,
      company: companies,
    })
    .from(contacts)
    .leftJoin(companies, eq(contacts.companyId, companies.id))
    .where(eq(contacts.tenantId, tenantId))
    .orderBy(desc(contacts.createdAt));
    
    const results = limit ? await query.limit(limit) : await query;
    
    return results.map(r => ({
      ...r.contact,
      company: r.company || undefined,
    }));
  }
  
  async getContact(id: number, tenantId: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)))
      .limit(1);
    return contact;
  }
  
  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }
  
  async updateContact(id: number, contact: Partial<InsertContact>, tenantId: number): Promise<Contact | undefined> {
    const [updated] = await db.update(contacts)
      .set({ ...contact, updatedAt: new Date() })
      .where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteContact(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async searchContacts(query: string, tenantId: number): Promise<Contact[]> {
    return await db.select().from(contacts)
      .where(and(
        eq(contacts.tenantId, tenantId),
        or(
          ilike(contacts.firstName, `%${query}%`),
          ilike(contacts.lastName, `%${query}%`),
          ilike(contacts.email, `%${query}%`)
        )
      ))
      .limit(20);
  }
  
  // ==================== CRM - LEADS ====================
  
  async getLeads(tenantId: number): Promise<Lead[]> {
    return await db.select().from(leads)
      .where(eq(leads.tenantId, tenantId))
      .orderBy(desc(leads.createdAt));
  }
  
  async getLead(id: number, tenantId: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads)
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)))
      .limit(1);
    return lead;
  }
  
  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }
  
  async updateLead(id: number, lead: Partial<InsertLead>, tenantId: number): Promise<Lead | undefined> {
    const [updated] = await db.update(leads)
      .set({ ...lead, updatedAt: new Date() })
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteLead(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(leads)
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async assignLead(id: number, assignedToId: number, assignedById: number, tenantId: number): Promise<Lead | undefined> {
    const [updated] = await db.update(leads)
      .set({ 
        assignedToId, 
        assignedById, 
        assignedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async getMyLeads(userId: number, tenantId: number): Promise<Lead[]> {
    return await db.select().from(leads)
      .where(and(
        eq(leads.assignedToId, userId),
        eq(leads.tenantId, tenantId)
      ))
      .orderBy(desc(leads.createdAt));
  }
  
  // ==================== CRM - DEALS ====================
  
  async getDeals(tenantId: number): Promise<Deal[]> {
    return await db.select().from(deals)
      .where(eq(deals.tenantId, tenantId))
      .orderBy(desc(deals.createdAt));
  }
  
  async getDeal(id: number, tenantId: number): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals)
      .where(and(eq(deals.id, id), eq(deals.tenantId, tenantId)))
      .limit(1);
    return deal;
  }
  
  async createDeal(deal: InsertDeal): Promise<Deal> {
    const [newDeal] = await db.insert(deals).values(deal).returning();
    return newDeal;
  }
  
  async updateDeal(id: number, deal: Partial<InsertDeal>, tenantId: number): Promise<Deal | undefined> {
    const [updated] = await db.update(deals)
      .set({ ...deal, updatedAt: new Date() })
      .where(and(eq(deals.id, id), eq(deals.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteDeal(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(deals)
      .where(and(eq(deals.id, id), eq(deals.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== CRM - ACTIVITIES ====================
  
  async getActivities(tenantId: number, limit?: number): Promise<Activity[]> {
    const query = db.select().from(activities)
      .where(eq(activities.tenantId, tenantId))
      .orderBy(desc(activities.createdAt));
    
    return limit ? await query.limit(limit) : await query;
  }
  
  async getActivitiesForContact(contactId: number, tenantId: number): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(and(
        eq(activities.contactId, contactId),
        eq(activities.tenantId, tenantId)
      ))
      .orderBy(desc(activities.createdAt));
  }
  
  async getActivitiesForDeal(dealId: number, tenantId: number): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(and(
        eq(activities.dealId, dealId),
        eq(activities.tenantId, tenantId)
      ))
      .orderBy(desc(activities.createdAt));
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }
  
  async updateActivity(id: number, activity: Partial<InsertActivity>, tenantId: number): Promise<Activity | undefined> {
    const [updated] = await db.update(activities)
      .set({ ...activity, updatedAt: new Date() })
      .where(and(eq(activities.id, id), eq(activities.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteActivity(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(activities)
      .where(and(eq(activities.id, id), eq(activities.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== LEAD SOURCES ====================
  
  async getLeadSources(tenantId: number): Promise<LeadSource[]> {
    return await db.select().from(leadSources)
      .where(eq(leadSources.tenantId, tenantId))
      .orderBy(leadSources.category, leadSources.sourceName);
  }
  
  async getLeadSource(id: number, tenantId: number): Promise<LeadSource | undefined> {
    const [source] = await db.select().from(leadSources)
      .where(and(eq(leadSources.id, id), eq(leadSources.tenantId, tenantId)))
      .limit(1);
    return source;
  }
  
  async createLeadSource(leadSource: InsertLeadSource): Promise<LeadSource> {
    const [newSource] = await db.insert(leadSources).values(leadSource).returning();
    return newSource;
  }
  
  async updateLeadSource(id: number, leadSource: Partial<InsertLeadSource>, tenantId: number): Promise<LeadSource | undefined> {
    const [updated] = await db.update(leadSources)
      .set({ ...leadSource, updatedAt: new Date() })
      .where(and(eq(leadSources.id, id), eq(leadSources.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteLeadSource(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(leadSources)
      .where(and(eq(leadSources.id, id), eq(leadSources.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== CRM - SALES PIPELINES ====================
  
  async getSalesPipelines(tenantId: number): Promise<SalesPipeline[]> {
    return await db.select().from(salesPipelines).where(eq(salesPipelines.tenantId, tenantId));
  }
  
  async getSalesPipeline(id: number, tenantId: number): Promise<any> {
    const [pipeline] = await db.select().from(salesPipelines)
      .where(and(eq(salesPipelines.id, id), eq(salesPipelines.tenantId, tenantId)))
      .limit(1);
    
    if (!pipeline) {
      return undefined;
    }
    
    // Fetch associated stages
    const stages = await this.getSalesStages(tenantId, id);
    
    return {
      ...pipeline,
      stages
    };
  }
  
  async createSalesPipeline(pipeline: InsertSalesPipeline): Promise<SalesPipeline> {
    const [newPipeline] = await db.insert(salesPipelines).values(pipeline).returning();
    return newPipeline;
  }
  
  async updateSalesPipeline(id: number, pipeline: Partial<InsertSalesPipeline>, tenantId: number): Promise<SalesPipeline | undefined> {
    const [updated] = await db.update(salesPipelines)
      .set({ ...pipeline, updatedAt: new Date() })
      .where(and(eq(salesPipelines.id, id), eq(salesPipelines.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteSalesPipeline(id: number, tenantId: number): Promise<boolean> {
    // First, delete all associated stages to avoid foreign key constraint errors
    await db.delete(salesStages)
      .where(and(
        eq(salesStages.salePipelineId, id),
        eq(salesStages.tenantId, tenantId)
      ));
    
    // Then delete the pipeline
    const result = await db.delete(salesPipelines)
      .where(and(eq(salesPipelines.id, id), eq(salesPipelines.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== CRM - SALES STAGES ====================
  
  async getSalesStages(tenantId: number, pipelineId?: number): Promise<SalesStage[]> {
    if (pipelineId) {
      return await db.select().from(salesStages)
        .where(and(
          eq(salesStages.tenantId, tenantId),
          eq(salesStages.salePipelineId, pipelineId)
        ))
        .orderBy(salesStages.order);
    }
    return await db.select().from(salesStages)
      .where(eq(salesStages.tenantId, tenantId))
      .orderBy(salesStages.order);
  }
  
  async getSalesStage(id: number, tenantId: number): Promise<SalesStage | undefined> {
    const [stage] = await db.select().from(salesStages)
      .where(and(eq(salesStages.id, id), eq(salesStages.tenantId, tenantId)))
      .limit(1);
    return stage;
  }
  
  async createSalesStage(stage: InsertSalesStage): Promise<SalesStage> {
    const [newStage] = await db.insert(salesStages).values(stage).returning();
    return newStage;
  }
  
  async updateSalesStage(id: number, stage: Partial<InsertSalesStage>, tenantId: number): Promise<SalesStage | undefined> {
    const [updated] = await db.update(salesStages)
      .set({ ...stage, updatedAt: new Date() })
      .where(and(eq(salesStages.id, id), eq(salesStages.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteSalesStage(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(salesStages)
      .where(and(eq(salesStages.id, id), eq(salesStages.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== CRM - PRODUCTS ====================
  
  async getProducts(tenantId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.tenantId, tenantId));
  }
  
  async getProduct(id: number, tenantId: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .limit(1);
    return product;
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>, tenantId: number): Promise<Product | undefined> {
    const [updated] = await db.update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteProduct(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== CRM - PRODUCT TYPES & CATEGORIES ====================
  
  async getProductTypes(tenantId: number): Promise<ProductType[]> {
    return await db.select().from(productTypes).where(eq(productTypes.tenantId, tenantId));
  }
  
  async createProductType(productType: InsertProductType): Promise<ProductType> {
    const [newType] = await db.insert(productTypes).values(productType).returning();
    return newType;
  }
  
  async getProductCategories(tenantId: number): Promise<ProductCategory[]> {
    return await db.select().from(productCategories).where(eq(productCategories.tenantId, tenantId));
  }
  
  async createProductCategory(category: InsertProductCategory): Promise<ProductCategory> {
    const [newCategory] = await db.insert(productCategories).values(category).returning();
    return newCategory;
  }
  
  async getProductCategory(id: number, tenantId: number): Promise<ProductCategory | undefined> {
    const [category] = await db.select().from(productCategories)
      .where(and(eq(productCategories.id, id), eq(productCategories.tenantId, tenantId)))
      .limit(1);
    return category;
  }
  
  async updateProductCategory(id: number, category: Partial<InsertProductCategory>, tenantId: number): Promise<ProductCategory | undefined> {
    const [updated] = await db.update(productCategories)
      .set(category)
      .where(and(eq(productCategories.id, id), eq(productCategories.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteProductCategory(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(productCategories)
      .where(and(eq(productCategories.id, id), eq(productCategories.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== CRM - PRODUCT VARIATIONS ====================
  
  async getProductVariations(tenantId: number): Promise<ProductVariation[]> {
    return await db.select().from(productVariations).where(eq(productVariations.tenantId, tenantId));
  }
  
  async getProductVariation(id: number, tenantId: number): Promise<ProductVariation | undefined> {
    const [variation] = await db.select().from(productVariations)
      .where(and(eq(productVariations.id, id), eq(productVariations.tenantId, tenantId)))
      .limit(1);
    return variation;
  }
  
  async getProductVariationsByProduct(productId: number, tenantId: number): Promise<ProductVariation[]> {
    return await db.select().from(productVariations)
      .where(and(eq(productVariations.productId, productId), eq(productVariations.tenantId, tenantId)));
  }
  
  async createProductVariation(variation: InsertProductVariation): Promise<ProductVariation> {
    const [newVariation] = await db.insert(productVariations).values(variation).returning();
    return newVariation;
  }
  
  async updateProductVariation(id: number, variation: Partial<InsertProductVariation>, tenantId: number): Promise<ProductVariation | undefined> {
    const [updated] = await db.update(productVariations)
      .set({ ...variation, updatedAt: new Date() })
      .where(and(eq(productVariations.id, id), eq(productVariations.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteProductVariation(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(productVariations)
      .where(and(eq(productVariations.id, id), eq(productVariations.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== CRM - PRODUCT OFFERS ====================
  
  async getProductOffers(tenantId: number): Promise<ProductOffer[]> {
    return await db.select().from(productOffers).where(eq(productOffers.tenantId, tenantId));
  }
  
  async getProductOffer(id: number, tenantId: number): Promise<ProductOffer | undefined> {
    const [offer] = await db.select().from(productOffers)
      .where(and(eq(productOffers.id, id), eq(productOffers.tenantId, tenantId)))
      .limit(1);
    return offer;
  }
  
  async getProductOffersByProduct(productId: number, tenantId: number): Promise<ProductOffer[]> {
    return await db.select().from(productOffers)
      .where(and(eq(productOffers.productId, productId), eq(productOffers.tenantId, tenantId)));
  }
  
  async createProductOffer(offer: InsertProductOffer): Promise<ProductOffer> {
    const [newOffer] = await db.insert(productOffers).values(offer).returning();
    return newOffer;
  }
  
  async updateProductOffer(id: number, offer: Partial<InsertProductOffer>, tenantId: number): Promise<ProductOffer | undefined> {
    const [updated] = await db.update(productOffers)
      .set({ ...offer, updatedAt: new Date() })
      .where(and(eq(productOffers.id, id), eq(productOffers.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteProductOffer(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(productOffers)
      .where(and(eq(productOffers.id, id), eq(productOffers.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== CRM - ACTIVITY TYPES ====================
  
  async getActivityTypes(tenantId: number): Promise<ActivityType[]> {
    return await db.select().from(activityTypes).where(eq(activityTypes.tenantId, tenantId));
  }
  
  async createActivityType(activityType: InsertActivityType): Promise<ActivityType> {
    const [newType] = await db.insert(activityTypes).values(activityType).returning();
    return newType;
  }
  
  async updateActivityType(id: number, activityType: Partial<InsertActivityType>, tenantId: number): Promise<ActivityType | undefined> {
    const [updated] = await db.update(activityTypes)
      .set(activityType)
      .where(and(eq(activityTypes.id, id), eq(activityTypes.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteActivityType(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(activityTypes)
      .where(and(eq(activityTypes.id, id), eq(activityTypes.tenantId, tenantId)));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // ==================== CRM - INTEREST LEVELS ====================
  
  async getInterestLevels(tenantId: number): Promise<InterestLevel[]> {
    return await db.select().from(interestLevels).where(eq(interestLevels.tenantId, tenantId));
  }
  
  async createInterestLevel(interestLevel: InsertInterestLevel): Promise<InterestLevel> {
    const [newLevel] = await db.insert(interestLevels).values(interestLevel).returning();
    return newLevel;
  }
  
  async updateInterestLevel(id: number, interestLevel: Partial<InsertInterestLevel>, tenantId: number): Promise<InterestLevel | undefined> {
    const [updated] = await db.update(interestLevels)
      .set(interestLevel)
      .where(and(eq(interestLevels.id, id), eq(interestLevels.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteInterestLevel(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(interestLevels)
      .where(and(eq(interestLevels.id, id), eq(interestLevels.tenantId, tenantId)));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // ==================== CRM - CUSTOMER TYPES ====================
  
  async getCustomerTypes(tenantId: number): Promise<CustomerType[]> {
    return await db.select().from(customerTypes).where(eq(customerTypes.tenantId, tenantId));
  }
  
  async createCustomerType(customerType: InsertCustomerType): Promise<CustomerType> {
    const [newType] = await db.insert(customerTypes).values(customerType).returning();
    return newType;
  }
  
  async updateCustomerType(id: number, customerType: Partial<InsertCustomerType>, tenantId: number): Promise<CustomerType | undefined> {
    const [updated] = await db.update(customerTypes)
      .set({ ...customerType, updatedAt: new Date() })
      .where(and(eq(customerTypes.id, id), eq(customerTypes.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteCustomerType(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(customerTypes)
      .where(and(eq(customerTypes.id, id), eq(customerTypes.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== CRM - MEETING TYPES ====================
  
  async getMeetingTypes(tenantId: number): Promise<MeetingType[]> {
    return await db.select().from(meetingTypes).where(eq(meetingTypes.tenantId, tenantId));
  }
  
  async createMeetingType(meetingType: InsertMeetingType): Promise<MeetingType> {
    const [newType] = await db.insert(meetingTypes).values(meetingType).returning();
    return newType;
  }
  
  async updateMeetingType(id: number, meetingType: Partial<InsertMeetingType>, tenantId: number): Promise<MeetingType | undefined> {
    const [updated] = await db.update(meetingTypes)
      .set({ ...meetingType, updatedAt: new Date() })
      .where(and(eq(meetingTypes.id, id), eq(meetingTypes.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteMeetingType(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(meetingTypes)
      .where(and(eq(meetingTypes.id, id), eq(meetingTypes.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== CRM - MEETING CANCELLATION REASONS ====================
  
  async getMeetingCancellationReasons(tenantId: number): Promise<MeetingCancellationReason[]> {
    return await db.select().from(meetingCancellationReasons).where(eq(meetingCancellationReasons.tenantId, tenantId));
  }
  
  async createMeetingCancellationReason(reason: InsertMeetingCancellationReason): Promise<MeetingCancellationReason> {
    const [newReason] = await db.insert(meetingCancellationReasons).values(reason).returning();
    return newReason;
  }
  
  async updateMeetingCancellationReason(id: number, reason: Partial<InsertMeetingCancellationReason>, tenantId: number): Promise<MeetingCancellationReason | undefined> {
    const [updated] = await db.update(meetingCancellationReasons)
      .set({ ...reason, updatedAt: new Date() })
      .where(and(eq(meetingCancellationReasons.id, id), eq(meetingCancellationReasons.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteMeetingCancellationReason(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(meetingCancellationReasons)
      .where(and(eq(meetingCancellationReasons.id, id), eq(meetingCancellationReasons.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== CRM - PAYMENT METHODS ====================
  
  async getPaymentMethods(tenantId: number): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods).where(eq(paymentMethods.tenantId, tenantId));
  }
  
  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    const [newMethod] = await db.insert(paymentMethods).values(method).returning();
    return newMethod;
  }
  
  async updatePaymentMethod(id: number, method: Partial<InsertPaymentMethod>, tenantId: number): Promise<PaymentMethod | undefined> {
    const [updated] = await db.update(paymentMethods)
      .set({ ...method, updatedAt: new Date() })
      .where(and(eq(paymentMethods.id, id), eq(paymentMethods.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deletePaymentMethod(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(paymentMethods)
      .where(and(eq(paymentMethods.id, id), eq(paymentMethods.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== CRM - PAYMENT ITEMS ====================
  
  async getPaymentItems(tenantId: number): Promise<PaymentItem[]> {
    return await db.select().from(paymentItems).where(eq(paymentItems.tenantId, tenantId));
  }
  
  async createPaymentItem(item: InsertPaymentItem): Promise<PaymentItem> {
    const [newItem] = await db.insert(paymentItems).values(item).returning();
    return newItem;
  }
  
  async updatePaymentItem(id: number, item: Partial<InsertPaymentItem>, tenantId: number): Promise<PaymentItem | undefined> {
    const [updated] = await db.update(paymentItems)
      .set({ ...item, updatedAt: new Date() })
      .where(and(eq(paymentItems.id, id), eq(paymentItems.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deletePaymentItem(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(paymentItems)
      .where(and(eq(paymentItems.id, id), eq(paymentItems.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== PAYMENT COLLECTION MODULE ====================
  
  // Payment Plans
  async getPaymentPlans(tenantId: number): Promise<PaymentPlan[]> {
    return await db.select().from(paymentPlans).where(eq(paymentPlans.tenantId, tenantId)).orderBy(desc(paymentPlans.createdAt));
  }
  
  async getPaymentPlan(id: number, tenantId: number): Promise<PaymentPlan | undefined> {
    const [plan] = await db.select().from(paymentPlans)
      .where(and(eq(paymentPlans.id, id), eq(paymentPlans.tenantId, tenantId)));
    return plan;
  }
  
  async getPaymentPlansByDeal(dealId: number, tenantId: number): Promise<PaymentPlan[]> {
    return await db.select().from(paymentPlans)
      .where(and(eq(paymentPlans.dealId, dealId), eq(paymentPlans.tenantId, tenantId)))
      .orderBy(desc(paymentPlans.createdAt));
  }
  
  async createPaymentPlan(plan: InsertPaymentPlan): Promise<PaymentPlan> {
    const [newPlan] = await db.insert(paymentPlans).values(plan).returning();
    return newPlan;
  }
  
  async updatePaymentPlan(id: number, plan: Partial<InsertPaymentPlan>, tenantId: number): Promise<PaymentPlan | undefined> {
    const [updated] = await db.update(paymentPlans)
      .set({ ...plan, updatedAt: new Date() })
      .where(and(eq(paymentPlans.id, id), eq(paymentPlans.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deletePaymentPlan(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(paymentPlans)
      .where(and(eq(paymentPlans.id, id), eq(paymentPlans.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Payments
  async getPayments(tenantId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.tenantId, tenantId)).orderBy(desc(payments.paymentDate));
  }
  
  async getPayment(id: number, tenantId: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments)
      .where(and(eq(payments.id, id), eq(payments.tenantId, tenantId)));
    return payment;
  }
  
  async getPaymentsByDeal(dealId: number, tenantId: number): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(and(eq(payments.dealId, dealId), eq(payments.tenantId, tenantId)))
      .orderBy(desc(payments.paymentDate));
  }
  
  async getPaymentsByPlan(planId: number, tenantId: number): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(and(eq(payments.paymentPlanId, planId), eq(payments.tenantId, tenantId)))
      .orderBy(desc(payments.paymentDate));
  }
  
  async getPaymentsByContact(contactId: number, tenantId: number): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(and(eq(payments.contactId, contactId), eq(payments.tenantId, tenantId)))
      .orderBy(desc(payments.paymentDate));
  }
  
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }
  
  async updatePayment(id: number, payment: Partial<InsertPayment>, tenantId: number): Promise<Payment | undefined> {
    const [updated] = await db.update(payments)
      .set({ ...payment, updatedAt: new Date() })
      .where(and(eq(payments.id, id), eq(payments.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deletePayment(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(payments)
      .where(and(eq(payments.id, id), eq(payments.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async generateReceiptNumber(tenantId: number): Promise<string> {
    const year = new Date().getFullYear();
    const [result] = await db.select({ count: count() })
      .from(payments)
      .where(eq(payments.tenantId, tenantId));
    const nextNumber = (result.count + 1).toString().padStart(6, '0');
    return `RCP-${year}-${nextNumber}`;
  }
  
  // ==================== COMMISSION TRACKING MODULE ====================
  
  // Commission Statuses
  async getCommissionStatuses(tenantId: number): Promise<CommissionStatus[]> {
    return await db.select().from(commissionStatuses)
      .where(eq(commissionStatuses.tenantId, tenantId))
      .orderBy(commissionStatuses.sortOrder);
  }
  
  async getCommissionStatus(id: number, tenantId: number): Promise<CommissionStatus | undefined> {
    const [status] = await db.select().from(commissionStatuses)
      .where(and(eq(commissionStatuses.id, id), eq(commissionStatuses.tenantId, tenantId)));
    return status;
  }
  
  async createCommissionStatus(status: InsertCommissionStatus): Promise<CommissionStatus> {
    const [newStatus] = await db.insert(commissionStatuses).values(status).returning();
    return newStatus;
  }
  
  async updateCommissionStatus(id: number, status: Partial<InsertCommissionStatus>, tenantId: number): Promise<CommissionStatus | undefined> {
    const [updated] = await db.update(commissionStatuses)
      .set({ ...status, updatedAt: new Date() })
      .where(and(eq(commissionStatuses.id, id), eq(commissionStatuses.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteCommissionStatus(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(commissionStatuses)
      .where(and(eq(commissionStatuses.id, id), eq(commissionStatuses.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Commissions
  async getCommissions(tenantId: number, filters?: { status?: string; userId?: number }): Promise<Commission[]> {
    const conditions = [eq(commissions.tenantId, tenantId)];
    
    if (filters?.status) {
      conditions.push(eq(commissions.status, filters.status));
    }
    
    if (filters?.userId) {
      conditions.push(eq(commissions.userId, filters.userId));
    }
    
    return await db.select().from(commissions)
      .where(and(...conditions))
      .orderBy(desc(commissions.createdAt));
  }
  
  async getCommission(id: number, tenantId: number): Promise<Commission | undefined> {
    const [commission] = await db.select().from(commissions)
      .where(and(eq(commissions.id, id), eq(commissions.tenantId, tenantId)));
    return commission;
  }
  
  async getCommissionsByUser(userId: number, tenantId: number): Promise<Commission[]> {
    return await db.select().from(commissions)
      .where(and(eq(commissions.userId, userId), eq(commissions.tenantId, tenantId)))
      .orderBy(desc(commissions.createdAt));
  }
  
  async getCommissionsByDeal(dealId: number, tenantId: number): Promise<Commission[]> {
    return await db.select().from(commissions)
      .where(and(eq(commissions.dealId, dealId), eq(commissions.tenantId, tenantId)))
      .orderBy(desc(commissions.createdAt));
  }
  
  async createCommission(commission: InsertCommission): Promise<Commission> {
    const [newCommission] = await db.insert(commissions).values(commission).returning();
    return newCommission;
  }
  
  async updateCommission(id: number, commission: Partial<InsertCommission>, tenantId: number): Promise<Commission | undefined> {
    const [updated] = await db.update(commissions)
      .set({ ...commission, updatedAt: new Date() })
      .where(and(eq(commissions.id, id), eq(commissions.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteCommission(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(commissions)
      .where(and(eq(commissions.id, id), eq(commissions.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async verifyCommission(id: number, verifiedById: number, tenantId: number): Promise<Commission | undefined> {
    const [updated] = await db.update(commissions)
      .set({ 
        status: 'verified',
        verifiedById,
        verifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(eq(commissions.id, id), eq(commissions.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async approveCommission(id: number, approvedById: number, tenantId: number): Promise<Commission | undefined> {
    const [updated] = await db.update(commissions)
      .set({ 
        status: 'approved',
        approvedById,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(eq(commissions.id, id), eq(commissions.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async markCommissionPaid(id: number, paidById: number, paymentReference: string, tenantId: number): Promise<Commission | undefined> {
    const [updated] = await db.update(commissions)
      .set({ 
        status: 'paid',
        paidById,
        paidAt: new Date(),
        paymentReference,
        updatedAt: new Date()
      })
      .where(and(eq(commissions.id, id), eq(commissions.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async generateCommissionNumber(tenantId: number): Promise<string> {
    const year = new Date().getFullYear();
    const [result] = await db.select({ count: count() })
      .from(commissions)
      .where(eq(commissions.tenantId, tenantId));
    const nextNumber = (result.count + 1).toString().padStart(6, '0');
    return `COM-${year}-${nextNumber}`;
  }
  
  // Commission Items
  async getCommissionItems(commissionId: number, tenantId: number): Promise<CommissionItem[]> {
    return await db.select().from(commissionItems)
      .where(and(eq(commissionItems.commissionId, commissionId), eq(commissionItems.tenantId, tenantId)))
      .orderBy(desc(commissionItems.createdAt));
  }
  
  async createCommissionItem(item: InsertCommissionItem): Promise<CommissionItem> {
    const [newItem] = await db.insert(commissionItems).values(item).returning();
    return newItem;
  }
  
  async updateCommissionItem(id: number, item: Partial<InsertCommissionItem>, tenantId: number): Promise<CommissionItem | undefined> {
    const [updated] = await db.update(commissionItems)
      .set({ ...item, updatedAt: new Date() })
      .where(and(eq(commissionItems.id, id), eq(commissionItems.tenantId, tenantId)))
      .returning();
    return updated;
  }
  
  async deleteCommissionItem(id: number, tenantId: number): Promise<boolean> {
    const result = await db.delete(commissionItems)
      .where(and(eq(commissionItems.id, id), eq(commissionItems.tenantId, tenantId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // ==================== DASHBOARD ====================
  
  async getDashboardMetrics(tenantId: number): Promise<{
    totalContacts: number;
    activeDeals: number;
    pipelineRevenue: number;
    conversionRate: number;
  }> {
    const [contactCount] = await db.select({ count: count() })
      .from(contacts)
      .where(eq(contacts.tenantId, tenantId));
    
    const [dealCount] = await db.select({ count: count() })
      .from(deals)
      .where(eq(deals.tenantId, tenantId));
    
    const dealsData = await db.select({ value: deals.value })
      .from(deals)
      .where(eq(deals.tenantId, tenantId));
    
    const pipelineRevenue = dealsData.reduce((sum, d) => sum + Number(d.value || 0), 0);
    
    return {
      totalContacts: contactCount.count,
      activeDeals: dealCount.count,
      pipelineRevenue,
      conversionRate: 0,
    };
  }
}

export const storage = new DbStorage();
