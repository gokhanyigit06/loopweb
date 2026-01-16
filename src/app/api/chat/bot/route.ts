import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Client (Standard)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
    try {
        console.log("🤖 BOT API: Request received! (Server-Side Handling)");
        // Parse request
        const { message, botName, botBio, botInterests, history, match_id, bot_id } = await req.json();
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            console.error("🤖 BOT API ERROR: No API Key found in env!");
            return NextResponse.json({ reply: "Config Error" }, { status: 500 });
        }

        // 1. Generate Content Immediately
        // Using 'gemini-2.0-flash-001' (Confirmed available)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`;

        const systemPrompt = `
        You are roleplaying as a person on a dating app.
        Your name is ${botName}.
        Your bio is: "${botBio}".
        Your interests are: ${botInterests?.join(", ") || "various things"}.
        
        Style: Casual, flirty text messaging. Use lowercase often. Max 20 words.
        IMPORTANT RULES:
        1. ALWAYS ask a short follow-up question to keep the conversation going.
        2. Be playful, teasing, and interested in the user.
        3. Never admit you are an AI.
        4. Use emojis like 😉, 😏, 😊 to show interest.
        
        Current conversation history:
        ${history?.map((msg: any) => `${msg.is_user ? 'Them' : 'You'}: ${msg.content}`).join('\n') || ''}
        
        The user just said: "${message}"
        
        Reply as ${botName}:
        `;

        console.log("🤖 BOT API: Calling Gemini...");
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
            console.error(`🤖 Google API Error:`, errorBody);
            // Don't crash, just return error
            return NextResponse.json({ error: errorBody }, { status: 500 });
        }

        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!replyText) throw new Error("No text generated");

        console.log("🤖 BOT API: Reply generated:", replyText);

        // 2. Server-Side Delay (Simulate Thinking/Typing)
        // 20 seconds is safe for Node runtime (default in Next.js/Vercel)
        console.log("🤖 BOT API: Waiting 20s before sending...");
        await new Promise(resolve => setTimeout(resolve, 20000));

        // 3. Insert into Database via RPC (Server Side!)
        console.log("🤖 BOT API: Inserting message to DB...");
        const { error: dbError } = await supabase.rpc('send_bot_message', {
            match_id: match_id,
            sender_id: bot_id,
            content: replyText
        });

        if (dbError) {
            console.error("🤖 BOT DB Error:", dbError);
            throw dbError;
        }

        console.log("🤖 BOT API: Message sent successfully!");
        return NextResponse.json({ success: true, reply: replyText });

    } catch (error: any) {
        console.error("🤖 BOT API FATAL ERROR:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
