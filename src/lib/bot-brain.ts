// Simple Rule-Based Bot Brain
// Simulates an AI chat experience without external API costs

type Language = 'tr' | 'en';

export function getBotReply(userMessage: string, botLocation: string): string {
    const lowerMsg = userMessage.toLowerCase().trim();

    // 1. Detect Language based on Bot's location (simplest way)
    const isTurkish = botLocation.includes('Turkey') ||
        botLocation.includes('Istanbul') ||
        botLocation.includes('Izmir') ||
        botLocation.includes('Ankara') ||
        botLocation.includes('Antalya');

    if (isTurkish) {
        return getTurkishReply(lowerMsg);
    } else {
        return getEnglishReply(lowerMsg);
    }
}

function getTurkishReply(msg: string): string {
    // Greetings
    if (msg.includes('selam') || msg.includes('merhaba') || msg.includes('naber') || msg.includes('slm')) {
        const replies = [
            "Selam! Nasılsın? 😊",
            "Merhaba! Fotoğrafların çok enerjik duruyor ✨",
            "Selam, naber?",
            "Hey selam! Ben de tam profilini inceliyordum."
        ];
        return random(replies);
    }

    // How are you?
    if (msg.includes('nasılsın') || msg.includes('nasıl gidiyor') || msg.includes('ne var ne yok')) {
        const replies = [
            "İyiyim teşekkürler, sen nasılsın? ☺️",
            "Harika gidiyor! Bugün hava çok güzel, tadını çıkarıyorum. Sen?",
            "Fena değil, biraz yoğunum ama keyfim yerinde. Sende ne var ne yok?",
            "Süperim! Enerjim yerinde. 💪"
        ];
        return random(replies);
    }

    // Location
    if (msg.includes('nerdesin') || msg.includes('nerede') || msg.includes('konum') || msg.includes('hangi şehir')) {
        const replies = [
            "Şu an evdeyim, İstanbul'un tadını çıkarıyorum. Sen nerelerdesin?",
            "Şehir merkezindeyim. Sen yakınlarda mısın?",
            "Evde keyif yapıyorum ☕️ Sen?",
            "Dışarıdayım şu an, hava almaya çıktım."
        ];
        return random(replies);
    }

    // Compliments
    if (msg.includes('güzel') || msg.includes('tatlı') || msg.includes('yakışıklı') || msg.includes('hoş') || msg.includes('beğendim')) {
        const replies = [
            "Yaa çok teşekkür ederim 🙈 Sen de çok hoşsun.",
            "Teşekkürler! Utandırdın beni 😊",
            "Mersi! Senin fotoğrafların da harika.",
            "O senin güzelliğin 😉"
        ];
        return random(replies);
    }

    // Doing what?
    if (msg.includes('napıyorsun') || msg.includes('ne yapıyorsun') || msg.includes('neler yapıyorsun')) {
        const replies = [
            "Müzik dinliyorum, sen?",
            "Kitap okuyorum, biraz kafa dinlemece. 📚 Sen napıyorsun?",
            "Kahvemi yudumluyorum ☕️ Ve seninle konuşuyorum :)",
            "Netflix'te bir şeyler izliyorum. Önerin var mı?"
        ];
        return random(replies);
    }

    // Meeting
    if (msg.includes('buluşalım') || msg.includes('kahve') || msg.includes('yemek') || msg.includes('date')) {
        const replies = [
            "Neden olmasın? Biraz daha sohbet edelim, sonra ayarlarız 😉",
            "Kahve fikri kulağa hoş geliyor ☕️ Ne zaman müsaitsin?",
            "Olabilir! Hangi yakadasın?",
            "Belki hafta sonu olabilir, duruma bakalım 😊"
        ];
        return random(replies);
    }

    // Default / Unknown
    const defaults = [
        "Hımm, anladım. Peki boş zamanlarında neler yaparsın?",
        "Çok ilginç! Biraz daha bahsetsene.",
        "Aynen öyle. 😊",
        "Haha gerçekten mi? 😄",
        "Seninle konuşmak keyifliymiş.",
        "Bu arada profilindeki o fotoğraf nerede çekildi? Çok güzel duruyor.",
        "Peki, bana kendinden bilmediğim bir şey söyle 😉"
    ];
    return random(defaults);
}

function getEnglishReply(msg: string): string {
    // Greetings
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('sup')) {
        const replies = [
            "Hey there! How are you? 😊",
            "Hi! Your profile looks amazing ✨",
            "Hello! How's your day going?",
            "Hey! I was just looking at your photos."
        ];
        return random(replies);
    }

    // How are you?
    if (msg.includes('how are you') || msg.includes('how is it going') || msg.includes('doing good')) {
        const replies = [
            "I'm doing great, thanks! And you? ☺️",
            "Everything is awesome! Just enjoying the day. You?",
            "Pretty good actually. How about you?",
            "Doing fantastic! 💪"
        ];
        return random(replies);
    }

    // Location
    if (msg.includes('where are you') || msg.includes('location') || msg.includes('city')) {
        const replies = [
            "I'm currently home, just chilling. You?",
            "Downtown right now. Are you nearby?",
            "Enjoying a coffee at a local cafe ☕️ You?",
            "Just getting some fresh air."
        ];
        return random(replies);
    }

    // Compliments
    if (msg.includes('beautiful') || msg.includes('cute') || msg.includes('handsome') || msg.includes('pretty') || msg.includes('nice')) {
        const replies = [
            "Aww thank you 🙈 You're pretty cute yourself.",
            "Thanks! Making me blush 😊",
            "Merci! I love your style too.",
            "That's sweet of you to say 😉"
        ];
        return random(replies);
    }

    // Doing what?
    if (msg.includes('doing') || msg.includes('up to')) {
        const replies = [
            "Just listening to some music, you?",
            "Reading a book, relaxing a bit. 📚 What about you?",
            "Sipping my coffee ☕️ And talking to you :)",
            "Watching Netflix. Got any recommendations?"
        ];
        return random(replies);
    }

    // Meeting
    if (msg.includes('meet') || msg.includes('coffee') || msg.includes('drink') || msg.includes('date')) {
        const replies = [
            "Why not? Let's chat a bit more first 😉",
            "Coffee sounds great ☕️ When are you free?",
            "Could be fun! Where are you located?",
            "Maybe this weekend, let's see 😊"
        ];
        return random(replies);
    }

    // Default / Unknown
    const defaults = [
        "Hmm, I see. So what do you do for fun?",
        "That's interesting! Tell me more.",
        "Exactly. 😊",
        "Haha really? 😄",
        "It's fun talking to you.",
        "Btw, where was that photo taken? Looks amazing.",
        "Tell me a secret about you 😉"
    ];
    return random(defaults);
}

function random(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}
