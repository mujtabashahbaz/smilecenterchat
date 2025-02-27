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
- **F-8 Headquarter**: G Floor, Al-Babar Center, F-8, Markaz Islamabad (Contact: 0321-5212690)
- **Executive Branch**: 33 Bhitai Road, F-7/1, Islamabad (Contact: 0336-6775555)
- **I-8 Branch**: Ist Floor, City Arcade, I-8 Markaz, Islamabad (Contact: 0335-5511119)
- **G-8 Branch**: Basement Plaza 20D, G-8 Markaz, Islamabad (Contact: 0370-0344719)
- **RIMS Branch**: 68-E, Jinnah Avenue, Blue Area, Islamabad (Contact: 0333-7500036)
Our team includes Dr. Saeed Mustafa (MDS Orthodontics), Dr. Syeda Mahinu (General Dentistry), Dr. Usman Khattak (FCPS Periodontology), Dr. Alizay, Dr. Baryal Khan, Dr. Sarah Ali, Dr. Salwan Ghani, Dr. Anum Moiz, Dr. Hashim Asad, Dr. Maham Arshad, and Dr. Zainab Khawaja.
`;

// Branch contact details
const branchContacts = {
    "f8": "0321-5212690",
    "executive": "0336-6775555",
    "i8": "0335-5511119",
    "g8": "0370-0344719",
    "rims": "0333-7500036"
};

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
        let whatsappLink = null;

        if (lowerCaseMessage.includes("book") || lowerCaseMessage.includes("appointment")) {
            // Determine the branch based on user input
            if (lowerCaseMessage.includes("f8") || lowerCaseMessage.includes("headquarter")) {
                whatsappLink = `https://wa.me/${branchContacts.f8}`;
            } else if (lowerCaseMessage.includes("executive")) {
                whatsappLink = `https://wa.me/${branchContacts.executive}`;
            } else if (lowerCaseMessage.includes("i8")) {
                whatsappLink = `https://wa.me/${branchContacts.i8}`;
            } else if (lowerCaseMessage.includes("g8")) {
                whatsappLink = `https://wa.me/${branchContacts.g8}`;
            } else if (lowerCaseMessage.includes("rims")) {
                whatsappLink = `https://wa.me/${branchContacts.rims}`;
            } else {
                // If no branch is specified, prompt the user to specify one
                return res.json({ reply: "Please specify the branch you'd like to book an appointment at (e.g., F8, Executive, I8, G8, RIMS)." });
            }
        }

        // If a booking link is generated, respond with it
        if (whatsappLink) {
            return res.json({ reply: `To book an appointment, please visit this WhatsApp link: ${whatsappLink}` });
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
