import { Router } from "express";
import dealsRouter from "../../../api/deals.js";
import contactsRouter from "../../../api/contacts.js";
import companiesRouter from "../../../api/companies.js";
import activitiesRouter from "../../../api/activities.js";
import leadSourcesRouter from "../../../api/lead-sources.js";
import pipelinesRouter from "../../../api/pipelines.js";
import productsRouter from "../../../api/products.js";
import productCategoriesRouter from "../../../api/product-categories.js";
import productVariationsRouter from "../../../api/product-variations.js";
import productOffersRouter from "../../../api/product-offers.js";
import usersRouter from "../../../api/users.js";

const crmRouter = Router();

// Mount all CRM-related APIs
crmRouter.use("/deals", dealsRouter);
crmRouter.use("/contacts", contactsRouter);
crmRouter.use("/companies", companiesRouter);
crmRouter.use("/activities", activitiesRouter);
crmRouter.use("/lead-sources", leadSourcesRouter);
crmRouter.use("/pipelines", pipelinesRouter);
crmRouter.use("/products", productsRouter);
crmRouter.use("/product-categories", productCategoriesRouter);
crmRouter.use("/product-variations", productVariationsRouter);
crmRouter.use("/product-offers", productOffersRouter);
crmRouter.use("/users", usersRouter);

// CRM-specific endpoints
crmRouter.get("/health", (req, res) => {
  res.json({
    module: "CRM",
    status: "healthy",
    timestamp: new Date().toISOString(),
    features: ["contacts", "deals", "companies", "activities", "pipelines"]
  });
});

crmRouter.get("/stats", async (req, res) => {
  try {
    // This would typically fetch from the database
    const stats = {
      totalContacts: 156,
      activeDeals: 23,
      companies: 45,
      activitiesThisWeek: 78,
      conversionRate: "24%"
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch CRM stats" });
  }
});

export default crmRouter;