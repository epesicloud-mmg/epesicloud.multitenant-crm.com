import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { generateAIChatResponse } from "../ai";

export const aiChatRouter = Router();

// AI Chat completions endpoint
aiChatRouter.post("/completions", async (req, res) => {
  try {
    const { message, context, conversationId } = req.body;
    const userId = parseInt(req.headers['x-user-id'] as string) || 1;
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;

    // Get conversation context if provided
    let conversationHistory: any[] = [];
    if (conversationId) {
      const messages = await storage.getConversationMessages(conversationId, userId, tenantId);
      conversationHistory = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    }

    // Generate real AI response using Gemini
    const aiResponse = await generateAIChatResponse(message, {
      page: context?.page || '/',
      pageName: context?.pageName || 'Dashboard',
      recentEvents: context?.recentEvents || [],
      timestamp: new Date().toISOString(),
      conversationHistory
    });

    res.json({
      response: aiResponse,
      conversationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

async function generateContextualResponse(
  userMessage: string, 
  context: any,
  conversationHistory: any[] = []
): Promise<string> {
  const lowerMessage = userMessage.toLowerCase();
  const { pageName, description, recentActions, suggestions } = context;
  
  // Handle greetings with context
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! I'm Epesi Agent, your AI-powered CRM assistant with memory of our conversations.

I can see you're currently on the **${pageName}** page. ${description}

Based on your current context, I can help you with:
${suggestions.slice(0, 4).map((s: string) => `• ${s}`).join('\n')}

Recent activity I noticed:
${recentActions.map((action: string) => `• ${action}`).join('\n')}

What would you like me to help you with today?`;
  }

  // Handle insights and analytics requests  
  if (lowerMessage.includes('insight') || lowerMessage.includes('analytics') || lowerMessage.includes('report') || lowerMessage.includes('forecast')) {
    try {
      const insights = await generateCRMInsights({
        type: 'comprehensive',
        context: `User is on ${pageName} page and requested insights`,
        userMessage: userMessage
      });
      
      return `Here are AI-powered insights based on your CRM data:

**${pageName} Intelligence:**
${insights}

**Quick Actions Available:**
${suggestions.slice(0, 3).map((s: string) => `• ${s}`).join('\n')}

Would you like me to dive deeper into any specific metric or help you take action on these insights?`;
    } catch (error) {
      return `I can generate powerful insights from your CRM data, but I'm having trouble accessing the latest data right now.

**Available Analysis Types:**
• Revenue forecasting and deal predictions
• Pipeline health analysis with conversion rates
• Contact engagement scoring and prioritization
• Performance benchmarking and trend analysis

Please try your request again, or let me know which specific area interests you most.`;
    }
  }

  // Handle deals and pipeline requests
  if (lowerMessage.includes('deal') || lowerMessage.includes('pipeline') || lowerMessage.includes('sales') || lowerMessage.includes('revenue')) {
    return `I can help you with deal management and sales pipeline optimization:

**Deal Actions:**
• Track deal progress through your 6-stage pipeline
• Update deal values, probabilities, and close dates
• Identify high-value opportunities requiring attention
• Generate deal conversion forecasts

**Pipeline Intelligence:**
• Current pipeline health: Active deals across all stages
• Bottleneck analysis: Deals stuck in specific stages
• Win rate optimization based on historical patterns
• Revenue projections for upcoming quarters

Since you're on the **${pageName}** page, would you like me to:
${suggestions.filter((s: string) => s.toLowerCase().includes('deal') || s.toLowerCase().includes('pipeline')).slice(0, 2).map((s: string) => `• ${s}`).join('\n')}

What specific aspect of your deals would you like to focus on?`;
  }

  // Handle contact and relationship requests
  if (lowerMessage.includes('contact') || lowerMessage.includes('customer') || lowerMessage.includes('relationship')) {
    return `I can assist with contact management and customer relationships:

**Contact Intelligence:**
• Contact engagement scoring and activity tracking
• Relationship strength analysis and recommendations
• Communication history and interaction patterns
• Lead qualification and conversion optimization

**Available Actions:**
• Add new contacts with intelligent data suggestions
• Update contact information and relationship status
• Schedule follow-ups and set interaction reminders
• Export contact lists with customizable filters

**Recent Context:**
${recentActions.filter((action: string) => action.toLowerCase().includes('contact')).join(', ') || 'Contact management activities'}

How can I help you manage your customer relationships more effectively?`;
  }

  // Handle activity and task requests
  if (lowerMessage.includes('activity') || lowerMessage.includes('task') || lowerMessage.includes('follow') || lowerMessage.includes('reminder')) {
    return `I can help you manage activities and stay on top of important tasks:

**Activity Management:**
• Log calls, emails, meetings, and notes efficiently
• Set up automated follow-up reminders
• Track completion rates and activity trends
• Generate activity reports and productivity insights

**Smart Scheduling:**
• Suggest optimal times for customer outreach
• Identify overdue follow-ups requiring immediate attention
• Balance activity workload across your team
• Integrate with calendar systems for seamless planning

Current page context suggests:
${suggestions.filter((s: string) => s.toLowerCase().includes('activity') || s.toLowerCase().includes('follow')).join('\n')}

What activities would you like me to help you manage or optimize?`;
  }

  // Handle data analysis and reporting
  if (lowerMessage.includes('analyze') || lowerMessage.includes('data') || lowerMessage.includes('metric') || lowerMessage.includes('performance')) {
    return `I can provide comprehensive data analysis and performance metrics:

**Analytics Capabilities:**
• Real-time dashboard metrics and KPI tracking
• Conversion rate analysis across your sales funnel
• Team performance benchmarking and improvement areas
• Custom report generation with actionable insights

**Key Metrics Available:**
• Total contacts, active deals, and pipeline value
• Win/loss ratios and deal velocity trends
• Activity completion rates and engagement scores
• Revenue forecasts and growth projections

**Page-Specific Analysis:**
Based on your current **${pageName}** context:
${suggestions.filter((s: string) => s.toLowerCase().includes('report') || s.toLowerCase().includes('analy')).join('\n')}

Which metrics or analysis would be most valuable for your decision-making right now?`;
  }

  // Handle navigation and general help
  if (lowerMessage.includes('navigate') || lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('where')) {
    return `I'm here to help you navigate and use your CRM effectively:

**Navigation Assistance:**
• Guide you to specific sections and features
• Explain how to use different CRM functions
• Provide shortcuts and productivity tips
• Help you find the information you need quickly

**Current Context - ${pageName}:**
${description}

**Quick Actions You Can Take:**
${suggestions.map((s: string) => `• ${s}`).join('\n')}

**Recent Activity:**
${recentActions.join(', ')}

What specific help or guidance would you like? I can walk you through any CRM process or feature.`;
  }

  // Default contextual response
  return `I understand you're asking about: "${userMessage}"

Based on your current context on the **${pageName}** page, here's how I can help:

**Page-Specific Assistance:**
${description}

**Suggested Actions:**
${suggestions.slice(0, 4).map((s: string) => `• ${s}`).join('\n')}

**What I Can Help With:**
• Answer questions about your CRM data and processes
• Generate insights and analytics from your business data
• Guide you through specific tasks and workflows
• Provide recommendations based on your current context

Could you be more specific about what you'd like me to help you with? I have access to your CRM data and conversation history to provide personalized assistance.`;
}

