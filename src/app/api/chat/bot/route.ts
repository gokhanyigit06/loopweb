import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { message, botName, botBio, botInterests, history } = await req.json();

        if (!process.env.GOOGLE_API_KEY) {
            console.error("GOOGLE_API_KEY is not set");
            return NextResponse.json(
                { reply: "I'm feeling a bit shy right now... (API Key missing)" },
                { status: 500 }
            );
        }

        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Construct a persona for the bot
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

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ reply: text });

    } catch (error) {
        console.error("Error generating bot response:", error);
        return NextResponse.json(
            { reply: "Haha, I don't know what to say to that! 😉" }, // Fallback reply
            { status: 500 }
        );
    }
}
