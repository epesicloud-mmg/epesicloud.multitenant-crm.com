import OpenAI from 'openai';
import type { Deal, Contact, Activity, Company, Lead } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ""
});

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedActions?: string[];
  metadata?: any;
}

export interface DashboardAIData {
  insights: AIInsight[];
  predictions: {
    revenue: {
      nextMonth: number;
      nextQuarter: number;
      confidence: number;
    };
    deals: {
      likelyToClose: Deal[];
      atRisk: Deal[];
    };
    opportunities: {
      highValue: string[];
      quickWins: string[];
    };
  };
  intelligentSummary: string;
}

export async function generateDashboardInsights(
  deals: Deal[],
  contacts: Contact[],
  activities: Activity[],
  companies: Company[],
  leads: Lead[]
): Promise<DashboardAIData> {
  try {
    // Prepare data summary for AI analysis
    const dataContext = {
      totalDeals: deals.length,
      totalRevenue: deals.reduce((sum, deal) => sum + parseFloat(deal.value), 0),
      avgDealSize: deals.length > 0 ? deals.reduce((sum, deal) => sum + parseFloat(deal.value), 0) / deals.length : 0,
      totalContacts: contacts.length,
      totalActivities: activities.length,
      totalCompanies: companies.length,
      totalLeads: leads.length,
      recentActivities: activities.slice(-10),
      highValueDeals: deals.filter(deal => parseFloat(deal.value) > 10000),
      staleDeals: deals.filter(deal => {
        const daysSinceCreated = Math.floor((Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceCreated > 30;
      })
    };

    const prompt = `As an AI sales analyst, analyze this CRM data and provide actionable insights:

Data Summary:
- Total Deals: ${dataContext.totalDeals}
- Total Revenue: $${dataContext.totalRevenue.toLocaleString()}
- Average Deal Size: $${dataContext.avgDealSize.toLocaleString()}
- Total Contacts: ${dataContext.totalContacts}
- Total Companies: ${dataContext.totalCompanies}
- Total Leads: ${dataContext.totalLeads}
- Recent Activities: ${dataContext.recentActivities.length}
- High Value Deals (>$10k): ${dataContext.highValueDeals.length}
- Stale Deals (>30 days): ${dataContext.staleDeals.length}

Provide insights in the following JSON format:
{
  "insights": [
    {
      "id": "unique_id",
      "type": "opportunity|risk|recommendation|prediction",
      "title": "Brief title",
      "description": "Detailed description with specific numbers",
      "confidence": 0.85,
      "priority": "high|medium|low",
      "actionable": true,
      "suggestedActions": ["Action 1", "Action 2"]
    }
  ],
  "predictions": {
    "revenue": {
      "nextMonth": 50000,
      "nextQuarter": 150000,
      "confidence": 0.78
    },
    "opportunities": {
      "highValue": ["Opportunity 1", "Opportunity 2"],
      "quickWins": ["Quick win 1", "Quick win 2"]
    }
  },
  "intelligentSummary": "Executive summary of current sales performance and key recommendations"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI sales analyst. Analyze the provided CRM data and return insights in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.3,
    });

    const aiData = JSON.parse(completion.choices[0]?.message?.content || "{}");
    
    // Add likely to close and at-risk deals based on data analysis
    const likelyToClose = deals.filter(deal => {
      const daysSinceCreated = Math.floor((Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreated > 7 && daysSinceCreated < 21 && parseFloat(deal.value) > dataContext.avgDealSize * 0.8;
    }).slice(0, 5);

    const atRisk = deals.filter(deal => {
      const daysSinceCreated = Math.floor((Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreated > 45;
    }).slice(0, 5);

    return {
      insights: aiData.insights || [],
      predictions: {
        ...aiData.predictions,
        deals: {
          likelyToClose,
          atRisk
        }
      },
      intelligentSummary: aiData.intelligentSummary || "AI analysis is processing your data..."
    };

  } catch (error) {
    console.error('AI analysis error:', error);
    // Return fallback insights based on data patterns
    return generateFallbackInsights(deals, contacts, activities, companies, leads);
  }
}

export async function generateContactInsights(contact: Contact, activities: Activity[], deals: Deal[]): Promise<AIInsight[]> {
  try {
    const contactActivities = activities.filter(a => a.contactId === contact.id);
    const contactDeals = deals.filter(d => d.contactId === contact.id);
    
    const prompt = `Analyze this contact's engagement and provide insights:
    
Contact: ${contact.firstName} ${contact.lastName} (Company ID: ${contact.companyId || 'No Company'})
Activities: ${contactActivities.length} total activities
Deals: ${contactDeals.length} deals worth $${contactDeals.reduce((sum, d) => sum + parseFloat(d.value), 0)}
Last Activity: ${contactActivities[0]?.createdAt || 'None'}

Provide 2-3 specific insights about this contact's engagement, deal potential, and recommended next actions.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI CRM analyst. Provide specific insights about contact engagement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const insightText = completion.choices[0]?.message?.content || "";
    
    // Parse AI response into structured insights
    return [
      {
        id: `contact_${contact.id}_engagement`,
        type: 'recommendation',
        title: 'Contact Engagement Analysis',
        description: insightText.slice(0, 200) + "...",
        confidence: 0.8,
        priority: contactActivities.length > 3 ? 'high' : 'medium',
        actionable: true,
        suggestedActions: [`Follow up with ${contact.firstName}`, "Schedule next meeting"]
      }
    ];

  } catch (error) {
    console.error('Contact AI analysis error:', error);
    return [];
  }
}

export async function generateDealScoring(deal: Deal, contact?: Contact, activities: Activity[] = []): Promise<{score: number, insights: string[], riskFactors: string[]}> {
  try {
    const dealActivities = activities.filter(a => a.dealId === deal.id);
    const daysSinceCreated = Math.floor((Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    
    const prompt = `Score this deal from 0-100 and provide insights:

Deal: ${deal.title}
Value: $${deal.value}
Age: ${daysSinceCreated} days
Activities: ${dealActivities.length}
Contact: ${contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown'}
Notes: ${deal.notes || 'None'}

Provide a JSON response with score (0-100), insights array, and riskFactors array.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a deal scoring AI. Analyze deals and return JSON with score (0-100), insights array, and riskFactors array."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.5,
    });

    return JSON.parse(completion.choices[0]?.message?.content || '{"score": 50, "insights": [], "riskFactors": []}');

  } catch (error) {
    console.error('Deal scoring error:', error);
    return {
      score: 50,
      insights: ["AI analysis temporarily unavailable"],
      riskFactors: ["Unable to assess risk factors"]
    };
  }
}

function generateFallbackInsights(
  deals: Deal[],
  contacts: Contact[],
  activities: Activity[],
  companies: Company[],
  leads: Lead[]
): DashboardAIData {
  const totalRevenue = deals.reduce((sum, deal) => sum + parseFloat(deal.value), 0);
  const avgDealSize = deals.length > 0 ? totalRevenue / deals.length : 0;
  
  const insights: AIInsight[] = [];
  
  if (deals.length > 0) {
    insights.push({
      id: 'revenue_analysis',
      type: 'opportunity',
      title: 'Revenue Performance',
      description: `You have ${deals.length} active deals worth $${totalRevenue.toLocaleString()} with an average deal size of $${avgDealSize.toLocaleString()}.`,
      confidence: 0.9,
      priority: 'high',
      actionable: true,
      suggestedActions: ['Focus on high-value opportunities', 'Review deal progression']
    });
  }
  
  if (leads.length > 5) {
    insights.push({
      id: 'lead_opportunity',
      type: 'opportunity',
      title: 'Lead Conversion Opportunity',
      description: `You have ${leads.length} leads ready for conversion. Focus on qualifying and converting these prospects.`,
      confidence: 0.8,
      priority: 'medium',
      actionable: true,
      suggestedActions: ['Qualify top leads', 'Schedule discovery calls']
    });
  }
  
  return {
    insights,
    predictions: {
      revenue: {
        nextMonth: totalRevenue * 1.1,
        nextQuarter: totalRevenue * 1.3,
        confidence: 0.7
      },
      deals: {
        likelyToClose: deals.slice(0, 3),
        atRisk: deals.slice(-2)
      },
      opportunities: {
        highValue: ['Focus on enterprise deals', 'Expand existing accounts'],
        quickWins: ['Follow up on warm leads', 'Close pending proposals']
      }
    },
    intelligentSummary: `Your CRM contains ${deals.length} deals, ${contacts.length} contacts, and ${leads.length} leads. Focus on converting leads and accelerating deal closure.`
  };
}

// New AI Chat function for conversational responses
export async function generateAIChatResponse(
  message: string,
  context: {
    page: string;
    pageName: string;
    recentEvents: any[];
    timestamp: string;
    conversationHistory?: any[];
  }
): Promise<string> {
  try {
    // Build context for the AI
    const systemContext = `You are EpesiCRM AI Assistant, an expert CRM consultant helping users with their business operations.
    
Current Context:
- User is on page: ${context.page} (${context.pageName})
- Current time: ${context.timestamp}
- Recent user activities: ${JSON.stringify(context.recentEvents.slice(0, 3), null, 2)}

Guidelines:
- Be helpful, professional, and concise
- Focus on CRM-specific advice and insights
- Reference the user's current page context when relevant
- Provide actionable recommendations
- Use markdown formatting for better readability
- Keep responses under 200 words unless detailed analysis is requested`;

    const conversationPrompt = `${systemContext}

User Message: "${message}"

Provide a helpful response as EpesiCRM AI Assistant. Format your response in markdown.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemContext
        },
        {
          role: "user", 
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response at the moment. Please try again.";
    
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 429 || error.code === 'insufficient_quota') {
      return `**⚠️ OpenAI API Quota Exceeded**

Your OpenAI API key has reached its usage limit. To restore full AI functionality:

1. **Check your OpenAI account** at platform.openai.com
2. **Review billing and usage** in your dashboard  
3. **Add credits or upgrade your plan** if needed
4. **Wait for quota reset** (usually monthly)

**In the meantime, I can still help with ${context.pageName}:**
• Navigate CRM features and explain functionality
• Provide best practices and workflow suggestions
• Guide you through data management tasks
• Offer tips for optimizing your sales process

What would you like assistance with?`;
    }
    
    if (error.status === 401) {
      return `**🔑 API Authentication Issue**
      
There's a problem with your OpenAI API key. Please verify:
• The key is valid and active
• It has the correct permissions
• It's properly configured in your environment

I can still provide guidance on ${context.pageName} features. How can I help?`;
    }
    
    // Provide contextual fallback response based on user's page
    const fallbackResponses: Record<string, string> = {
      '/deals': `I can help you with deal management! Here are some quick actions you can take:

• **Create a new deal** - Click the "New Deal" button
• **Update deal stages** - Drag and drop deals between pipeline stages  
• **Add activities** - Track calls, meetings, and follow-ups
• **Analyze performance** - Check your deal conversion rates

What specific aspect of deal management would you like help with?`,
      '/contacts': `I'm here to help with contact management! You can:

• **Add new contacts** - Import or manually create contact records
• **Organize relationships** - Link contacts to companies and deals
• **Track interactions** - Log calls, emails, and meetings
• **Segment contacts** - Create targeted lists for campaigns

What would you like to do with your contacts?`,
      '/': `Welcome to EpesiCRM! I'm your AI assistant ready to help with:

• **Sales Pipeline Management** - Track deals and opportunities
• **Contact & Lead Management** - Organize your relationships  
• **Activity Tracking** - Never miss a follow-up
• **Performance Analytics** - Get insights into your sales

How can I assist you today?`
    };

    return fallbackResponses[context.page] || fallbackResponses['/'];
  }
}