require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function test() {
    try {

        const response = await ai.models.generateContent({
            model: "models/gemini-flash-latest",
            contents: "Say Hello only."
        });

        console.log(response.text);

    } catch (err) {

        console.log("ERROR:");
        console.log(err);

    }
}

test();