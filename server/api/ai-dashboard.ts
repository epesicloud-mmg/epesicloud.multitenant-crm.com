import { Router } from "express";
import { db } from "../db";
import { eq, count, sum, avg, desc } from "drizzle-orm";
import { deals, contacts, activities, workspaces, projects, companies } from "@shared/schema";

const router = Router();

// Get AI dashboard metrics
router.get("/metrics", async (req, res) => {
  try {
    const tenantId = 1; // Mock tenant for now

    // Get basic counts and metrics
    const [contactsCount] = await db
      .select({ count: count() })
      .from(contacts)
      .where(eq(contacts.tenantId, tenantId));

    const [activeDealsResult] = await db
      .select({ 
        count: count(),
        totalValue: sum(deals.value)
      })
      .from(deals)
      .where(eq(deals.tenantId, tenantId));

    const [activitiesThisWeek] = await db
      .select({ count: count() })
      .from(activities)
      .where(eq(activities.tenantId, tenantId));

    // Get workspaces with project counts
    const workspaceData = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        color: workspaces.color,
        projectsCount: count(projects.id)
      })
      .from(workspaces)
      .leftJoin(projects, eq(projects.workspaceId, workspaces.id))
      .where(eq(workspaces.tenantId, tenantId))
      .groupBy(workspaces.id, workspaces.name, workspaces.color);

    // Get active projects with mock progress data
    const projectData = await db
      .select({
        id: projects.id,
        name: projects.name,
        workspaceName: workspaces.name,
        color: projects.color,
        status: projects.status
      })
      .from(projects)
      .leftJoin(workspaces, eq(workspaces.id, projects.workspaceId))
      .where(eq(projects.tenantId, tenantId))
      .limit(6);

    // Get recent activities
    const recentActivities = await db
      .select({
        id: activities.id,
        type: activities.type,
        subject: activities.subject,
        createdAt: activities.createdAt,
        contactId: activities.contactId
      })
      .from(activities)
      .where(eq(activities.tenantId, tenantId))
      .orderBy(desc(activities.createdAt))
      .limit(10);

    // Calculate conversion rate (mock calculation)
    const conversionRate = 24.5;

    // Mock AI insights
    const aiInsights = [
      {
        type: 'revenue',
        title: 'Revenue Surge Opportunity',
        description: 'Based on current pipeline velocity, closing TechCorp and DataFlow deals could boost Q1 revenue by 32%',
        confidence: 89,
        action: 'Focus on enterprise deals'
      },
      {
        type: 'opportunity',
        title: 'Warm Lead Conversion',
        description: '12 leads with 80%+ engagement scores are ready for sales outreach this week',
        confidence: 76,
        action: 'Schedule follow-up calls'
      },
      {
        type: 'risk',
        title: 'Deal at Risk',
        description: 'Manufacturing Solutions deal ($45K) shows declining engagement. Last contact: 8 days ago',
        confidence: 82,
        action: 'Immediate re-engagement'
      }
    ];

    // Format workspace data with deal counts
    const workspacesWithDeals = workspaceData.map(ws => ({
      id: ws.id,
      name: ws.name,
      color: ws.color,
      projects: ws.projectsCount || 0,
      activeDeals: Math.floor(Math.random() * 20) + 5 // Mock for now
    }));

    // Format project data with mock progress
    const projectsWithProgress = projectData.map((proj, index) => ({
      id: proj.id,
      name: proj.name,
      workspace: proj.workspaceName || 'Unknown',
      progress: [75, 60, 40, 85, 30, 90][index] || 50,
      priority: ['High', 'Critical', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
      dueDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    // Format recent activities
    const formattedActivities = recentActivities.slice(0, 5).map(activity => ({
      id: activity.id,
      type: activity.type,
      subject: activity.subject,
      contact: `Contact ${activity.contactId || 'Unknown'}`,
      time: getTimeAgo(activity.createdAt)
    }));

    const response = {
      totalContacts: contactsCount.count,
      activeDeals: activeDealsResult.count,
      totalRevenue: Number(activeDealsResult.totalValue) || 0,
      conversionRate,
      activitiesThisWeek: activitiesThisWeek.count,
      workspaces: workspacesWithDeals,
      projects: projectsWithProgress,
      aiInsights,
      recentActivities: formattedActivities
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching AI dashboard metrics:", error);
    res.status(500).json({ error: "Failed to fetch AI dashboard metrics" });
  }
});

function getTimeAgo(date: Date | null): string {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return 'Just now';
}

export default router;