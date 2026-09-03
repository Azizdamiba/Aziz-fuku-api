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


let userHistories = {};content: `Tu es Lyra, une intelligence artificielle`
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
  
