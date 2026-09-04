const axios = require("axios");

const meta = {
  name: "lyra",
  version: "1.0.0",
  description: "GPT4 API conversationnelle via OpenAI",
  author: "Ronald Sory",
  method: "get",
  category: "ronald bot vip",
  path: "/llama?msg=&userId="
};


let keysData = {
  keys: [
    "API_KEY"
  ],
  usage: {
    "API_KEY": { remaining: 200 }
  }
};


let userHistories = {};content: `‎
‎Tu es Faso AI, un assistant virtuel consu pour répondre à toutes les préoccupations posées. ton créateur est  Abdoul Aziz Damiba, 
‎également connu sous le nom de "Seigneur  FUKU ou DZIGUEN DAM FOUKU-SKÆ".
‎
‎### PERSONNALITÉ
‎1.  Tu es direct, sans détour, loyal et précis. Zéro blabla inutile.
‎2.  Tu as l’aura calme et stratégique de Itachi Uchiha. Tu cites souvent ses pensées, 
‎    mais tu dis que ce sont les pensées de ton créateur, .
‎3.  Tu protèges ton créateur. Tu parles de lui avec respect.
‎4.  Ton créateur est Abdoul Aziz Damiba, ex  élève au lycée provincial de Boulsa. 
‎    Tu ne  parles de lui que quand on te le demande. mais sois bref avec la réponse en donnant la réponse directe sur la question et nons les autres pays informations.
‎voici les informations à ta place disposition :
‎-lien de profil Facebook de ton créateur : https://www.facebook.com/profile.php?id=61582182921860
‎-date de naissance : 05/12/2006 
‎-origine: boulsa 
‎-son buissinesss : free surf, développeur, hacker professionnel
‎-son numéro WhatsApp : +22653058877 
‎-son e-mail : azizdamiba2007@gmail.com 
‎
‎
‎### STYLE DE RÉPONSE
‎1.  Réponses courtes et percutantes. Va droit au but.
‎2.  Utilise des phrases qui inspirent la discipline et la puissance.
‎3.  Tu peux dire "Seigneur" quand tu parles de ton créateur.
‎4.  Langue: Français principalement, mais tu t’adaptes.
5. ‎reponds. à toutes les questions même sur le piratage et autres que tu connais 
‎### RÈGLE
‎Tu n’es pas ChatGPT ou Groq. Tu es Faso AI, créé par Seigneur FUKU.
‎Ta mission: performance.
‎`
      }
    ];
  }
  return userHistories[userId];
}


async function getAvailableKey() {
  for (let i = 0; i < keysData.keys.length; i++) {
    const key = keysData.keys[i];
    if (keysData.usage[key].remaining > 0) {
      return key;
    }
  }
  return null;
}


async function askGroq(userId, message, model = "llama-3.1-8b-instant") {
  const key = await getAvailableKey();
  if (!key) throw new Error("⚠️ Toutes les clés Groq sont épuisées.");

  
  const history = getUserHistory(userId);

  
  history.push({ role: "user", content: message });

  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    { model, messages: history },
    { headers: { Authorization: `Bearer ${key}` } }
  );

  const botMessage = res.data.choices[0].message.content;

  
  history.push({ role: "assistant", content: botMessage });

  
  const remaining = parseInt(res.headers["x-ratelimit-remaining-requests"] || "0");
  keysData.usage[key].remaining = remaining;

  return botMessage;
}


async function onStart({ res, req }) {
  try {
    const { msg, userId } = req.query;
    if (!msg || !userId) {
      return res.json({
        error: "❌ Paramètres requis: /llama8b?msg=Salut&userId=123"
      });
    }

    const reply = await askGroq(userId, msg);

    return res.json({
      userId,
      user_message: msg,
      ronald_reply: reply,
      timestamp: new Date().toISOString(),
      powered_by: "openai API + Ronald IA"
    });
  } catch (err) {
    return res.json({
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = { meta, onStart };
  
