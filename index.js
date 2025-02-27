require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
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

// Branch contact details
const branchContacts = {
    "f8": { name: "F-8 Headquarter", contact: "0321-5212690" },
    "executive": { name: "Executive Branch", contact: "0336-6775555" },
    "i8": { name: "I-8 Branch", contact: "0335-5511119" },
    "g8": { name: "G-8 Branch", contact: "0370-0344719" },
    "rims": { name: "RIMS Branch", contact: "0333-7500036" }
};

// Root route for basic testing
app.get('/', (req, res) => {
    res.send('Chatbot is running. Send a POST request to /chat.');
});

// Chat endpoint using OpenAI API with Few-Shot Prompting
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    try {
        const lowerCaseMessage = userMessage.toLowerCase();

        // Check if the user is asking about booking an appointment
        if (lowerCaseMessage.includes("book") || lowerCaseMessage.includes("appointment")) {
            // Determine the branch based on user input
            let branchDetails = null;

            for (const [key, value] of Object.entries(branchContacts)) {
                if (lowerCaseMessage.includes(key)) {
                    branchDetails = value;
                    break;
                }
            }

            if (branchDetails) {
                const whatsappLink = `https://wa.me/${branchDetails.contact}`;
                return res.json({
                    reply: `To book an appointment at ${branchDetails.name}, please visit this WhatsApp link: ${whatsappLink}. You can also contact them directly at ${branchDetails.contact}.`
                });
            } else {
                // Use Few-Shot Prompting to guide the response
                const fewShotPrompt = `
Examples:
User Input: "Can I book an appointment at F8?"
Bot Response: "To book an appointment at F-8 Headquarter, please visit this WhatsApp link: https://wa.me/0321-5212690. You can also contact them directly at 0321-5212690."

User Input: "Can I book an appointment?"
Bot Response: "Please specify the branch you'd like to book an appointment at (e.g., F8, Executive, I8, G8, RIMS)."

User Input: "F8"
Bot Response: "To book an appointment at F-8 Headquarter, please visit this WhatsApp link: https://wa.me/0321-5212690. You can also contact them directly at 0321-5212690."

Now, respond to the following user input:
User Input: "${userMessage}"
Bot Response:
`;

                const response = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are a helpful chatbot for Smile Center Dental Clinic." },
                        { role: "user", content: fewShotPrompt }
                    ]
                });

                return res.json({ reply: response.choices[0].message.content.trim() });
            }
        }

        // Otherwise, use OpenAI to handle general inquiries
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful chatbot for Smile Center Dental Clinic." },
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
