import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        console.log("🤖 BOT API: Request received! (Direct REST Mode)");
        const { message, botName, botBio, botInterests, history } = await req.json();
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            console.error("🤖 BOT API ERROR: No API Key found in env!");
            return NextResponse.json({ reply: "I'm feeling a bit shy... (No API Key)" }, { status: 500 });
        }

        // Prepare context
        const systemPrompt = `
        You are roleplaying as a person on a dating app.
        Your name is ${botName}.
        Your bio is: "${botBio}".
        Your interests are: ${botInterests?.join(", ") || "various things"}.
        
        Style: Casual, flirty, engaging, sometimes use emojis. Keep responses relatively short (1-3 sentences).
        IMPORTANT: Never admit you are an AI. Act completely like the human described above.
        
        Current conversation history:
        ${history?.map((msg: any) => `${msg.is_user ? 'Them' : 'You'}: ${msg.content}`).join('\n') || ''}
        
        The user just said: "${message}"
        
        Reply as ${botName}:
        `;

        // Direct Fetch Call to Google API
        // Using 'gemini-2.0-flash-001' (Confirmed available in user's model list)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`;

        console.log("🤖 BOT API: Sending fetch request to Google...");

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemPrompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`🤖 Google API Fetch Error (${response.status}):`, errorBody);
            return NextResponse.json(
                { reply: "Oops, connection error!", debug: errorBody },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log("🤖 BOT API: Success!");

        // Extract text
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!replyText) {
            console.error("🤖 BOT API: Unexpected response format:", JSON.stringify(data));
            return NextResponse.json({ reply: "..." }, { status: 500 });
        }

        return NextResponse.json({ reply: replyText });

    } catch (error: any) {
        console.error("🤖 BOT API FATAL ERROR:", error);
        return NextResponse.json(
            { reply: "System Error: " + error.message },
            { status: 500 }
        );
    }
}
