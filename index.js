require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const { knowledgeBase, branchContacts, calendlyLink } = require('./knowledgeBase'); // Import knowledge base
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow common HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers
}));

// Middleware to parse JSON
app.use(express.json());

// Initialize OpenAI API with secret key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Root route for basic testing
app.get('/', (req, res) => {
    res.send('Chatbot is running. Send a POST request to /chat.');
});

// Chat endpoint using OpenAI API
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    try {
        // Check if the user is asking about booking an appointment
        const lowerCaseMessage = userMessage.toLowerCase();
        let reply = null;

        if (lowerCaseMessage.includes("book") || lowerCaseMessage.includes("appointment")) {
            // Determine the branch based on user input
            if (lowerCaseMessage.includes("f8") || lowerCaseMessage.includes("headquarter")) {
                reply = `To book an appointment at F-8 Headquarter, please visit this WhatsApp link: ${branchContacts.f8.whatsapp}. Alternatively, you can book via Calendly: ${calendlyLink}`;
            } else if (lowerCaseMessage.includes("executive")) {
                reply = `To book an appointment at the Executive Branch, please visit this WhatsApp link: ${branchContacts.executive.whatsapp}. Alternatively, you can book via Calendly: ${calendlyLink}`;
            } else if (lowerCaseMessage.includes("i8")) {
                reply = `To book an appointment at the I-8 Branch, please visit this WhatsApp link: ${branchContacts.i8.whatsapp}. Alternatively, you can book via Calendly: ${calendlyLink}`;
            } else if (lowerCaseMessage.includes("g8")) {
                reply = `To book an appointment at the G-8 Branch, please visit this WhatsApp link: ${branchContacts.g8.whatsapp}. Alternatively, you can book via Calendly: ${calendlyLink}`;
            } else if (lowerCaseMessage.includes("rims")) {
                reply = `To book an appointment at the RIMS Branch, please visit this WhatsApp link: ${branchContacts.rims.whatsapp}. Alternatively, you can book via Calendly: ${calendlyLink}`;
            } else {
                // If no branch is specified, prompt the user to specify one
                reply = "Please specify the branch you'd like to book an appointment at (e.g., F8, Executive, I8, G8, RIMS). Alternatively, you can book via Calendly: " + calendlyLink;
            }
        }

        // If a booking reply is generated, respond with it
        if (reply) {
            return res.json({ reply });
        }

        // Otherwise, use OpenAI to handle the query
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: `You are a helpful chatbot for Smile Center Dental Clinic. Use the following knowledge base: ${knowledgeBase}. If the user's query cannot be answered using this, use your default knowledge.` },
                { role: "user", content: userMessage }
            ]
        });

        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error("Error communicating with OpenAI API:", error);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
