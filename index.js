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

// Knowledge base for Smile Center Dental Clinic
const knowledgeBase = `
Smile Center Dental Clinic has been serving Islamabad for over 10 years, offering comprehensive dental care.
Our services include preventive care, general and cosmetic dentistry, veneers, bonding, bridges, crowns, teeth whitening, extractions, dentures, dental implants, root canals, and oral health exams.
Our branches are:
- **F-8 Headquarter**: G Floor, Al-Babar Center, F-8, Markaz Islamabad
- **Executive Branch**: 33 Bhitai Road, F-7/1, Islamabad
- **I-8 Branch**: Ist Floor, City Arcade, I-8 Markaz, Islamabad
- **G-8 Branch**: Basement Plaza 20D, G-8 Markaz, Islamabad
- **RIMS Branch**: 68-E, Jinnah Avenue, Blue Area, Islamabad

Our team includes Dr. Saeed Mustafa (MDS Orthodontics), Dr. Syeda Mahinu (General Dentistry), Dr. Usman Khattak (FCPS Periodontology), Dr. Alizay, Dr. Baryal Khan, Dr. Sarah Ali, Dr. Salwan Ghani, Dr. Anum Moiz, Dr. Hashim Asad, Dr. Maham Arshad, and Dr. Zainab Khawaja.
`;

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
