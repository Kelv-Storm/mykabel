import { NextResponse } from 'next/server';

// Override Vercel's 10-second timeout limit
export const maxDuration = 60; 

export async function POST(request) {
  try {
    const body = await request.json();
    const { startupName, sector, stage, teamSize, fundingNeededMin, fundingNeededMax, description } = body;

    const prompt = `
      You are the core intelligence matching routing module for "MyKabel", an enterprise SME matching engine in Malaysia.
      Analyze the following startup profile telemetry:
      - Startup Name: ${startupName}
      - Business Description: ${description} 
      - Sector Focus: ${sector}
      - Growth Phase Stage: ${stage}
      - Active Team Size: ${teamSize} members
      - Funding Target Window: RM ${fundingNeededMin}K to RM ${fundingNeededMax}K

      Based on this data, generate ALL highly relevant, unique, and realistic entity matches in the Malaysian venture/SME ecosystem. Do not limit the output to a specific number—if there are 12 perfect matches, generate all 12. Prioritize quality and relevance. 
      Mix them across appropriate categories (choose from Gobi Partners, Cradle Fund, Artem Ventures, NEXEA, Sunway iLabs, MTDC, MRANTI, pitchIN, 1337 Ventures, ScaleUp Malaysia, or MDEC grants, or other accurate Malaysian funds).

      CRITICAL METRICS INSTRUCTIONS:
      - "opportunitiesCount": Generate a realistic integer representing the estimated total active programs/grants available in Malaysia for this specific sector.
      - "connectionsCount": Generate a realistic integer representing immediate warm lead potential.

      CRITICAL LINK INSTRUCTIONS: For each matched entity, you must provide accurate URL strings corresponding to their live registration portals and informational FAQ pages. Use these exact domain routes where applicable:
      - Cradle Fund: portalUrl "https://cradle.com.my/cip-spark/" | faqUrl "https://cradle.com.my/cip-spark/"
      - 1337 Ventures: portalUrl "https://1337.ventures/" | faqUrl "https://1337.ventures/10-questions-vcs-will-ask-and-how-to-answer-them-1337-ventures/"
      - pitchIN: portalUrl "https://www.pitchin.my/" | faqUrl "https://www.pitchin.my/equity-crowdfunding"
      - MDEC: portalUrl "https://www.mdec.my/malaysiadigital/apply" | faqUrl "https://www.mdec.my/grants"
      - NEXEA: portalUrl "https://www.nexea.co/incubator-venture-builder/" | faqUrl "https://mystartupaccelerator.org/faqs/"
      - Sunway iLabs: portalUrl "https://innovationlabs.sunway.edu.my/accelerator/" | faqUrl "https://innovationlabs.sunway.edu.my/why-join-sunway-ilabs-super-accelerator/"
      - For others, provide their authentic corporate domain application links.

      Keep the "explanation" for each match extremely concise (under 25 words max).

      Required JSON Response Schema Format:
      {
        "opportunitiesCount": 15,
        "connectionsCount": 2,
        "recommendations": [
          {
            "name": "Name of Entity",
            "type": "Investor",
            "matchScore": "95%",
            "focus": "Keywords of what they focus on",
            "stage": "Stages they support",
            "ticketSize": "Funding ranges or capital metrics they deploy",
            "explanation": "Snappy 1-sentence explanation matching their specific criteria.",
            "portalUrl": "https://example.com/apply",
            "faqUrl": "https://example.com/faq"
          }
        ]
      }
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing backend system deployment key." }, { status: 500 });
    }

    // Swapping back to stable 2.5-flash since you have a fresh API key quota pool
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: "Gemini API gateway thread reject.", details: errText }, { status: response.status });
    }

    const resData = await response.json();
    let rawAiText = resData.candidates[0].content.parts[0].text;
    
    if (rawAiText.includes('```json')) {
      rawAiText = rawAiText.split('```json')[1].split('```')[0];
    } else if (rawAiText.includes('```')) {
      rawAiText = rawAiText.split('```')[1].split('```')[0];
    }

    const structuredOutput = JSON.parse(rawAiText.trim());
    return NextResponse.json(structuredOutput);

  } catch (error) {
    console.error("Analytical pipeline failure:", error);
    return NextResponse.json({ error: "Internal telemetry pipeline generation error.", details: error.message }, { status: 500 });
  }
}
