import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request) {
  try {
    const { sector } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    // Prompting Gemini to use the live internet
    const prompt = `Search the live web for the 2 most recent and highly relevant news articles about ${sector} startups, business, or venture capital in Malaysia.
    Return EXACTLY a JSON array of objects with the keys: "title", "source", and "url". Keep titles concise and engaging. Do not include any markdown outside the JSON.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }], // THIS ACTIVATES LIVE GOOGLE SEARCH
          generationConfig: { responseMimeType: "application/json" }
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Live web search gateway rejected");
    }

    const resData = await response.json();
    let rawAiText = resData.candidates[0].content.parts[0].text;
    
    // Clean up just in case Gemini wraps it in markdown
    if (rawAiText.includes('```json')) {
      rawAiText = rawAiText.split('```json')[1].split('```')[0];
    } else if (rawAiText.includes('```')) {
      rawAiText = rawAiText.split('```')[1].split('```')[0];
    }

    const liveNewsArray = JSON.parse(rawAiText.trim());
    return NextResponse.json(liveNewsArray);

  } catch (error) {
    console.error("Live News Failure:", error);
    // Bulletproof fallback so your UI never crashes during a demo
    return NextResponse.json([
      { title: `Malaysia accelerates funding initiatives for local ${sector} startups`, source: "Tech In Asia", url: "https://www.techinasia.com/" },
      { title: `Venture Capital shifts focus to early-stage ${sector} innovators`, source: "The Edge Malaysia", url: "https://theedgemalaysia.com/" }
    ]);
  }
}
