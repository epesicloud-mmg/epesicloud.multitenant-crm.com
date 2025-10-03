import { db } from "./db";
import { activityTypes, interestLevels, salesPipelines, salesStages, products } from "@shared/schema";

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

    // Sales Pipelines for different business types
    const salesPipelinesData = [
      { title: "Manufacturing Sales", description: "Pipeline for industrial products, equipment, and bulk materials", isDefault: true, tenantId: 1 },
      { title: "Service Sales", description: "Pipeline for consulting, maintenance, and service offerings", isDefault: false, tenantId: 1 },
      { title: "Retail Sales", description: "Pipeline for direct consumer sales and small orders", isDefault: false, tenantId: 1 },
      { title: "Distribution Sales", description: "Pipeline for distributor and wholesale partnerships", isDefault: false, tenantId: 1 },
    ];

    // Sales Stages for Manufacturing Pipeline
    const salesStagesData = [
      { title: "Lead Generation", description: "Identifying potential customers", order: 1, probability: 10, salePipelineId: 1, tenantId: 1 },
      { title: "Initial Contact", description: "First interaction and needs assessment", order: 2, probability: 20, salePipelineId: 1, tenantId: 1 },
      { title: "Qualification", description: "Qualifying budget, authority, need, timeline", order: 3, probability: 30, salePipelineId: 1, tenantId: 1 },
      { title: "Technical Review", description: "Product specification and technical requirements", order: 4, probability: 45, salePipelineId: 1, tenantId: 1 },
      { title: "Proposal", description: "Formal proposal and quotation submitted", order: 5, probability: 60, salePipelineId: 1, tenantId: 1 },
      { title: "Negotiation", description: "Price and terms negotiation", order: 6, probability: 75, salePipelineId: 1, tenantId: 1 },
      { title: "Contract Review", description: "Legal review and contract finalization", order: 7, probability: 90, salePipelineId: 1, tenantId: 1 },
      { title: "Closed Won", description: "Deal successfully closed", order: 8, probability: 100, salePipelineId: 1, tenantId: 1 },
      { title: "Closed Lost", description: "Deal lost to competitor or cancelled", order: 9, probability: 0, salePipelineId: 1, tenantId: 1 },
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