import { db } from "./db";
import { activityTypes, interestLevels, salesPipelines, salesStages, products } from "@shared/schema";

// Default sales stages configuration
export const DEFAULT_SALES_STAGES = [
  { title: "Research/Discovery", description: "Prospect Identification", order: 1 },
  { title: "Initial Contact: Book Appointment", description: "Initial Contact Made: Call, Email or Walk-ins", order: 2 },
  { title: "Qualification: Opportunity Assessed", description: "Opportunity Assessed After Appointment", order: 3 },
  { title: "Initial Presentation of Solution", description: "Product Demonstrations and Presentations", order: 4 },
  { title: "Negotiation", description: "Negotiate & Pending Decision", order: 5 },
  { title: "Contract/Offer Accepted", description: "Offer accepted, pending final closing procedures", order: 6 },
  { title: "Closed Won", description: "Closed Won", order: 7 },
  { title: "Closed Lost", description: "Closed Lost: Lost Deal", order: 8 },
];

/**
 * Creates a default sales pipeline with stages for a specific workspace
 * This function should be called whenever a new workspace is created
 */
export async function createDefaultPipelineForWorkspace(workspaceId: number, tenantId: number) {
  try {
    // Create the default pipeline
    const [pipeline] = await db.insert(salesPipelines).values({
      title: "Default Sales Pipeline",
      description: "Standard sales pipeline for all products",
      isDefault: true,
      workspaceId,
      tenantId,
    }).returning();

    // Create the stages for this pipeline
    const stagesData = DEFAULT_SALES_STAGES.map(stage => ({
      ...stage,
      salePipelineId: pipeline.id,
      workspaceId,
      tenantId,
    }));

    await db.insert(salesStages).values(stagesData);

    console.log(`✅ Created default pipeline and stages for workspace ${workspaceId}`);
    return pipeline;
  } catch (error) {
    console.error(`❌ Error creating default pipeline for workspace ${workspaceId}:`, error);
    throw error;
  }
}

export async function seedSampleData() {
  try {
    console.log("Seeding sample data...");

    // Activity Types for various business needs
    const activityTypesData = [
      { typeName: "Phone Call", description: "Inbound or outbound phone conversations with prospects/customers", tenantId: 1 },
      { typeName: "Email", description: "Email communications and follow-ups", tenantId: 1 },
      { typeName: "Meeting", description: "Face-to-face or virtual meetings, demos, presentations", tenantId: 1 },
      { typeName: "Site Visit", description: "On-site visits, factory tours, or facility inspections", tenantId: 1 },
      { typeName: "Follow-up", description: "Regular check-ins and relationship maintenance", tenantId: 1 },
      { typeName: "Product Demo", description: "Demonstrations of products or services", tenantId: 1 },
      { typeName: "Quotation", description: "Preparation and delivery of price quotes", tenantId: 1 },
      { typeName: "Contract Review", description: "Review and negotiation of contracts and agreements", tenantId: 1 },
      { typeName: "Training", description: "Customer training and onboarding sessions", tenantId: 1 },
      { typeName: "Support", description: "Technical support and troubleshooting", tenantId: 1 },
    ];

    // Interest Levels with manufacturing-relevant context
    const interestLevelsData = [
      { level: "Hot", description: "Ready to purchase, budget approved, immediate need", color: "#ef4444", tenantId: 1 },
      { level: "Warm", description: "Interested, evaluating options, has budget", color: "#f97316", tenantId: 1 },
      { level: "Cool", description: "Some interest, researching, timeline unclear", color: "#eab308", tenantId: 1 },
      { level: "Cold", description: "Initial inquiry, no immediate need or budget", color: "#3b82f6", tenantId: 1 },
      { level: "Qualifying", description: "Determining fit and requirements", color: "#8b5cf6", tenantId: 1 },
    ];

    // Sales Pipelines - Default pipeline
    const salesPipelinesData = [
      { title: "Default Sales Pipeline", description: "Standard sales pipeline for all products", isDefault: true, tenantId: 1 },
    ];

    // Sales Stages for Default Pipeline
    const salesStagesData = [
      { title: "Research/Discovery", description: "Prospect Identification", order: 1, salePipelineId: 1, tenantId: 1 },
      { title: "Initial Contact: Book Appointment", description: "Initial Contact Made: Call, Email or Walk-ins", order: 2, salePipelineId: 1, tenantId: 1 },
      { title: "Qualification: Opportunity Assessed", description: "Opportunity Assessed After Appointment", order: 3, salePipelineId: 1, tenantId: 1 },
      { title: "Initial Presentation of Solution", description: "Product Demonstrations and Presentations", order: 4, salePipelineId: 1, tenantId: 1 },
      { title: "Negotiation", description: "Negotiate & Pending Decision", order: 5, salePipelineId: 1, tenantId: 1 },
      { title: "Contract/Offer Accepted", description: "Offer accepted, pending final closing procedures", order: 6, salePipelineId: 1, tenantId: 1 },
      { title: "Closed Won", description: "Closed Won", order: 7, salePipelineId: 1, tenantId: 1 },
      { title: "Closed Lost", description: "Closed Lost: Lost Deal", order: 8, salePipelineId: 1, tenantId: 1 },
    ];

    // Products suitable for manufacturing company like Unga
    const productsData = [
      { 
        name: "Premium Wheat Flour",
        title: "Premium Wheat Flour", 
        description: "High-grade wheat flour for commercial bakeries and food manufacturers", 
        category: "Food Products", 
        salePrice: "65.00", 
        salesPipelineId: 1, 
        tenantId: 1 
      },
      { 
        name: "Industrial Packaging Solutions",
        title: "Industrial Packaging Solutions", 
        description: "Custom packaging and labeling solutions for food products", 
        category: "Packaging", 
        salePrice: "180.00", 
        salesPipelineId: 1, 
        tenantId: 1 
      },
      { 
        name: "Quality Control Software",
        title: "Quality Control Software", 
        description: "Manufacturing quality management and testing software", 
        category: "Software", 
        salePrice: "8500.00", 
        salesPipelineId: 2, 
        tenantId: 1 
      },
      { 
        name: "Production Line Equipment",
        title: "Production Line Equipment", 
        description: "Automated milling and processing equipment", 
        category: "Equipment", 
        salePrice: "220000.00", 
        salesPipelineId: 1, 
        tenantId: 1 
      },
      { 
        name: "Maintenance Service Contract",
        title: "Maintenance Service Contract", 
        description: "Annual maintenance and support for production equipment", 
        category: "Services", 
        salePrice: "15000.00", 
        salesPipelineId: 2, 
        tenantId: 1 
      },
      { 
        name: "Bulk Storage Silos",
        title: "Bulk Storage Silos", 
        description: "Large capacity storage solutions for grain and flour", 
        category: "Infrastructure", 
        salePrice: "125000.00", 
        salesPipelineId: 1, 
        tenantId: 1 
      },
    ];

    // Insert data
    await db.insert(activityTypes).values(activityTypesData);
    await db.insert(interestLevels).values(interestLevelsData);
    await db.insert(salesPipelines).values(salesPipelinesData);
    await db.insert(salesStages).values(salesStagesData);
    await db.insert(products).values(productsData);

    console.log("✅ Sample data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding sample data:", error);
  }
}