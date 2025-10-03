import { db } from "./db";
import { execute_sql_tool } from "../tools";

export async function seedSimpleTestData() {
  try {
    console.log("🌱 Seeding database with test data...");

    // Direct SQL inserts to avoid schema conflicts
    await db.execute(`
      -- Clear existing data
      DELETE FROM activities;
      DELETE FROM deals;
      DELETE FROM leads;
      DELETE FROM contacts;
      DELETE FROM companies;
      DELETE FROM users;
      DELETE FROM roles;
      DELETE FROM deal_stages;
      DELETE FROM tenants;

      -- Insert tenant
      INSERT INTO tenants (id, name, subdomain) VALUES (1, 'Demo Company', 'demo');

      -- Insert roles
      INSERT INTO roles (id, name, level, permissions, tenant_id) VALUES 
      (1, 'super admin', 1, '["all"]', 1),
      (2, 'sales manager', 2, '["manage_team", "view_all_data"]', 1),
      (3, 'supervisor', 3, '["manage_agents", "view_team_data"]', 1),
      (4, 'agent', 4, '["manage_own_data"]', 1);

      -- Insert users with hierarchy
      INSERT INTO users (id, username, email, first_name, last_name, password, role_id, tenant_id, department, phone, is_active, manager_id) VALUES 
      (1, 'admin', 'admin@company.com', 'Admin', 'User', 'hashed_password', 1, 1, 'IT', '+1-555-0100', true, NULL),
      (2, 'sales_manager', 'manager@company.com', 'Sarah', 'Johnson', 'hashed_password', 2, 1, 'Sales', '+1-555-0101', true, NULL),
      (3, 'supervisor1', 'supervisor1@company.com', 'Mike', 'Wilson', 'hashed_password', 3, 1, 'Sales', '+1-555-0102', true, 2),
      (4, 'supervisor2', 'supervisor2@company.com', 'Lisa', 'Chen', 'hashed_password', 3, 1, 'Sales', '+1-555-0103', true, 2),
      (5, 'agent1', 'agent1@company.com', 'John', 'Smith', 'hashed_password', 4, 1, 'Sales', '+1-555-0104', true, 3),
      (6, 'agent2', 'agent2@company.com', 'Emma', 'Davis', 'hashed_password', 4, 1, 'Sales', '+1-555-0105', true, 3),
      (7, 'agent3', 'agent3@company.com', 'Robert', 'Taylor', 'hashed_password', 4, 1, 'Sales', '+1-555-0106', true, 4),
      (8, 'agent4', 'agent4@company.com', 'Jessica', 'Brown', 'hashed_password', 4, 1, 'Sales', '+1-555-0107', true, 4);

      -- Insert companies
      INSERT INTO companies (id, name, industry, website, phone, address, tenant_id) VALUES 
      (1, 'TechCorp Solutions', 'Technology', 'techcorp.com', '+1-555-1001', '123 Tech Street, Silicon Valley, CA', 1),
      (2, 'Global Manufacturing Inc', 'Manufacturing', 'globalmanuf.com', '+1-555-1002', '456 Industrial Blvd, Detroit, MI', 1),
      (3, 'Healthcare Partners', 'Healthcare', 'healthpartners.com', '+1-555-1003', '789 Medical Center Dr, Boston, MA', 1),
      (4, 'Financial Services Group', 'Finance', 'finservices.com', '+1-555-1004', '321 Wall Street, New York, NY', 1);

      -- Insert leads assigned to different agents
      INSERT INTO leads (id, first_name, last_name, email, phone, job_title, source, status, notes, assigned_to_id, assigned_by_id, company_id, tenant_id) VALUES 
      (1, 'Michael', 'Johnson', 'michael.johnson@techcorp.com', '+1-555-2001', 'CTO', 'Website', 'new', 'Interested in enterprise software solutions', 5, 3, 1, 1),
      (2, 'Sarah', 'Williams', 'sarah.williams@techcorp.com', '+1-555-2002', 'VP of Operations', 'LinkedIn', 'contacted', 'Follow up on automation tools', 5, 3, 1, 1),
      (3, 'David', 'Brown', 'david.brown@globalmanuf.com', '+1-555-2003', 'Plant Manager', 'Trade Show', 'qualified', 'Needs manufacturing optimization software', 6, 3, 2, 1),
      (4, 'Lisa', 'Martinez', 'lisa.martinez@globalmanuf.com', '+1-555-2004', 'Director of Technology', 'Email Campaign', 'new', 'Evaluating ERP solutions', 6, 3, 2, 1),
      (5, 'Jennifer', 'Wilson', 'jennifer.wilson@healthpartners.com', '+1-555-2005', 'IT Director', 'Referral', 'contacted', 'Looking for patient management system', 7, 4, 3, 1),
      (6, 'Mark', 'Anderson', 'mark.anderson@healthpartners.com', '+1-555-2006', 'Chief Medical Officer', 'Website', 'qualified', 'Interested in telemedicine solutions', 7, 4, 3, 1),
      (7, 'Thomas', 'Garcia', 'thomas.garcia@finservices.com', '+1-555-2007', 'CFO', 'Cold Call', 'new', 'Needs financial reporting tools', 8, 4, 4, 1),
      (8, 'Amanda', 'Rodriguez', 'amanda.rodriguez@finservices.com', '+1-555-2008', 'Head of Risk Management', 'LinkedIn', 'contacted', 'Evaluating compliance software', 8, 4, 4, 1);

      -- Insert contacts (converted leads)
      INSERT INTO contacts (id, first_name, last_name, email, phone, job_title, company_id, tenant_id) VALUES 
      (1, 'Brian', 'Miller', 'brian.miller@techcorp.com', '+1-555-3001', 'VP of Sales', 1, 1),
      (2, 'Rachel', 'Davis', 'rachel.davis@globalmanuf.com', '+1-555-3002', 'Operations Manager', 2, 1);

      -- Insert deal stages
      INSERT INTO deal_stages (id, name, "order", tenant_id) VALUES 
      (1, 'prospecting', 1, 1),
      (2, 'qualification', 2, 1),
      (3, 'proposal', 3, 1),
      (4, 'negotiation', 4, 1),
      (5, 'closed-won', 5, 1),
      (6, 'closed-lost', 6, 1);

      -- Insert deals
      INSERT INTO deals (id, title, value, contact_id, company_id, stage_id, expected_close_date, notes, tenant_id) VALUES 
      (1, 'Enterprise Software License - TechCorp', '250000', 1, 1, 3, '2024-03-15', 'Large enterprise deal with multi-year contract', 1),
      (2, 'Manufacturing Optimization Suite', '150000', 2, 2, 2, '2024-02-28', 'ERP implementation for manufacturing', 1);

      -- Insert activities
      INSERT INTO activities (id, type, subject, description, contact_id, user_id, tenant_id, scheduled_at) VALUES 
      (1, 'call', 'Discovery call with TechCorp', 'Initial discovery call to understand requirements', 1, 5, 1, '2024-01-15 10:00:00'),
      (2, 'email', 'Follow-up proposal sent', 'Sent detailed proposal for enterprise software', 1, 5, 1, '2024-01-16 14:30:00'),
      (3, 'meeting', 'Demo scheduled with GlobalManuf', 'Product demonstration for manufacturing team', 2, 6, 1, '2024-01-20 11:00:00');
    `);

    console.log("🎉 Database seeded successfully with comprehensive test data!");
    console.log("\n📊 Test Data Summary:");
    console.log("• Users: 8 (1 Admin, 1 Manager, 2 Supervisors, 4 Agents)");
    console.log("• Companies: 4");
    console.log("• Leads: 8 (distributed among agents)");
    console.log("• Contacts: 2");
    console.log("• Deals: 2");
    console.log("• Activities: 3");
    console.log("\n🔑 User Hierarchy:");
    console.log("• Admin (see all data)");
    console.log("• Sales Manager (see all data)");
    console.log("  ├── Supervisor 1 (see team data: Agent 1, Agent 2)");
    console.log("  │   ├── Agent 1 (2 leads)");
    console.log("  │   └── Agent 2 (2 leads)");
    console.log("  └── Supervisor 2 (see team data: Agent 3, Agent 4)");
    console.log("      ├── Agent 3 (2 leads)");
    console.log("      └── Agent 4 (2 leads)");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}