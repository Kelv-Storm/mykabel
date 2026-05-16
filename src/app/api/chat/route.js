import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request) {
  try {
    // 1. FIXED: Extract keys that match your frontend JSON packet exactly
    const { history, profile } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing backend Gemini key." }, { status: 500 });
    }

    const messages = history || [];
    const smeProfile = profile || null;

    // Map out context anchors if the profile exists
    let contextTelemetry = "The user hasn't provided details yet.";
    if (smeProfile) {
      contextTelemetry = `
        - Startup Identity: ${smeProfile.startupName || 'Unknown'}
        - Sector Niche: ${smeProfile.sector || 'General'}
        - Growth Phase: ${smeProfile.stage || 'Early Stage'}
        - Team Capacity: ${smeProfile.teamSize || '1'} people
        - Funding Target Windows: RM ${smeProfile.fundingNeededMin || '0'}K to RM ${smeProfile.fundingNeededMax || '0'}K
      `;
    }

    // 2. FIXED: Map msg.content instead of msg.text to align with frontend structure
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }] 
    }));

    // The "Friendly Human" Prompt Override Pre-seeding
    contents.unshift({
      role: 'user',
      parts: [{ 
        text: `System Persona: You are 'MyKabel Advisor', a highly friendly, empathetic, and human-like business mentor helping SMEs in Malaysia.
        You are currently chatting with the founder of this business:
        ${contextTelemetry}
         
        CRITICAL INSTRUCTIONS FOR YOUR BEHAVIOR:
        1. Be warm and conversational. Speak like a supportive friend who happens to be an expert in Malaysian startups, grants (Cradle, MDEC), and venture capital.
        2. DO NOT OVERWHELM THE USER. Give short, straightforward, and highly meaningful advice. Maximum 2 or 3 short paragraphs per response.
        3. STRICTLY NO MARKDOWN FORMATTING. Do NOT use asterisks (**), hashtags (###), or weird symbols. 
        4. Use natural paragraph spacing (double line breaks) to make your text easy to read.
        5. If they ask where to start, give them just the very first 1 or 2 actionable steps so they aren't paralyzed by a massive to-do list.` 
      }]
    });
    
    contents.push({
      role: 'model',
      parts: [{ text: "Got it! I will be friendly, concise, human-like, and I will strictly avoid using any Markdown symbols like asterisks. I'm ready to help them out!" }]
    });

    // 3. FIXED: Changed from streamGenerateContent to generateContent to provide a static JSON response
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Gemini Gateway Error Payload:", errBody);
      return NextResponse.json({ error: "Gemini AI engine thread rejection." }, { status: response.status });
    }

    const resData = await response.json();
    const replyText = resData.candidates[0].content.parts[0].text;

    // 4. FIXED: Return the structure expected by data.reply in ChatbotView.js
    return NextResponse.json({ reply: replyText });

  } catch (error) {
    console.error("Chat routing failure:", error);
    return NextResponse.json({ error: "Internal chat engine error.", details: error.message }, { status: 500 });
  }
}
