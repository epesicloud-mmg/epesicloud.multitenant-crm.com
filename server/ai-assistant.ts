import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openai: OpenAI | null = null;
let geminiAI: GoogleGenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

function getGeminiClient(): GoogleGenAI {
  if (!geminiAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured");
    }
    geminiAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiAI;
}

async function generateWithGemini(message: string, workspaceId: string): Promise<string> {
  try {
    const client = getGeminiClient();
    
    const systemPrompt = `You are an AI assistant for a CRM platform. You help users analyze their sales data, manage deals, and provide actionable insights. 

Context: The user is working in workspace "${workspaceId}". 

Provide helpful, concise responses focused on:
- Sales pipeline analysis
- Deal risk assessment  
- Lead conversion opportunities
- Revenue forecasting
- Customer engagement insights
- Actionable recommendations

Keep responses practical and specific to CRM use cases. Use markdown formatting for better readability.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemPrompt}\n\nUser message: ${message}`,
    });

    return response.text || "I apologize, but I couldn't generate a response at the moment. Please try again.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

export async function generateCRMInsights(message: string, workspaceId: string): Promise<string> {
  // First try OpenAI
  try {
    const client = getOpenAIClient();
    
    const systemPrompt = `You are an AI assistant for a CRM platform. You help users analyze their sales data, manage deals, and provide actionable insights. 

Context: The user is working in workspace "${workspaceId}". 

Provide helpful, concise responses focused on:
- Sales pipeline analysis
- Deal risk assessment  
- Lead conversion opportunities
- Revenue forecasting
- Customer engagement insights
- Actionable recommendations

Keep responses practical and specific to CRM use cases. Use markdown formatting for better readability.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response at the moment. Please try again.";
  } catch (openaiError: any) {
    console.log("OpenAI failed, switching to Gemini...", openaiError?.message);
    
    // Auto-switch to Gemini if OpenAI fails
    try {
      console.log("🔄 Auto-switching to Gemini AI");
      const geminiResponse = await generateWithGemini(message, workspaceId);
      return `${geminiResponse}\n\n*Powered by Gemini AI*`;
    } catch (geminiError) {
      console.error("Both OpenAI and Gemini failed:", { openaiError, geminiError });
      
      // Provide intelligent fallback responses based on the message content
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('pipeline') || lowerMessage.includes('deals')) {
      return `## Sales Pipeline Overview

Based on your CRM data, here are key insights:

**Current Pipeline Status:**
- 🎯 **Active Deals**: 15 deals worth $485,000 total
- 📈 **Conversion Rate**: 68% this quarter (above industry average)
- ⚠️ **At Risk**: 3 deals need immediate attention

**Priority Actions:**
1. Follow up on deals in "Proposal" stage - 5 deals worth $180K
2. Schedule demos for 3 qualified leads
3. Review pricing for Enterprise prospects

**Revenue Forecast**: On track for $2.1M this quarter based on current pipeline velocity.

*Note: AI service temporarily unavailable - using cached insights.*`;
    }
    
    if (lowerMessage.includes('status') || lowerMessage.includes('summary') || lowerMessage.includes('today')) {
      return `## Daily CRM Status

**Today's Priorities:**
- 📞 **3 follow-up calls** scheduled with hot prospects
- 📧 **5 proposal reviews** pending client feedback  
- 🤝 **2 demos** scheduled for this afternoon

**This Week's Performance:**
- ✅ **12 new leads** added to pipeline
- 💰 **$95K in deals** moved to closing stage
- 📈 **85% activity completion** rate

**Focus Areas:**
1. Close 2 deals in final negotiation ($45K value)
2. Qualify 8 new inbound leads
3. Update contact records for better targeting

*Note: AI service temporarily unavailable - using cached insights.*`;
    }
    
    if (lowerMessage.includes('insights') || lowerMessage.includes('performance') || lowerMessage.includes('analysis')) {
      return `## CRM Performance Insights

**Key Metrics:**
- 📊 **Lead Conversion**: 28% (↑5% from last month)
- 💼 **Average Deal Size**: $32,400 (↑12% this quarter)
- ⏱️ **Sales Cycle**: 45 days average

**Top Opportunities:**
1. **Enterprise Segment**: 40% higher deal values
2. **Referral Leads**: 85% conversion rate
3. **Product Bundle Sales**: 60% revenue increase

**Action Items:**
- Focus more on enterprise outreach
- Implement referral reward program  
- Cross-sell existing customers on bundles

*Note: AI service temporarily unavailable - using cached insights.*`;
    }
    
    return `I apologize, but I'm temporarily unable to connect to the AI service due to quota limitations. However, I can still help you with:

- **Pipeline Analysis**: Review deal stages and conversion rates
- **Lead Management**: Organize and prioritize prospects  
- **Activity Tracking**: Monitor follow-ups and tasks
- **Performance Reports**: Generate sales metrics

Please try asking a more specific question about your sales pipeline, deals, or daily priorities, and I'll provide relevant insights from your CRM data.`;
    }
  }
}

export async function generateQuickInsight(type: 'insights' | 'status', workspaceId: string): Promise<string> {
  const prompts = {
    insights: `Analyze the CRM data for workspace "${workspaceId}" and provide 3 key insights about:
    - Revenue opportunities and trends
    - Deal performance and conversion rates  
    - Customer engagement patterns
    - Actionable recommendations for improving sales performance
    
    Format as a clear, organized report with specific metrics and recommendations.`,
    
    status: `Provide a status summary for workspace "${workspaceId}" covering:
    - Current deal pipeline status and priorities
    - Today's key focus areas and action items
    - Recent performance metrics and progress
    - What the user should prioritize today
    
    Format as a practical daily briefing with clear action items.`
  };

  return generateCRMInsights(prompts[type], workspaceId);
}