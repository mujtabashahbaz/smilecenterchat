require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const app = express();
const port = process.env.PORT || 3000;

// Validate essential environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

// Initialize OpenAI API
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configure middleware
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Branch contact details
const branchContacts = {
  "f8": { name: "F-8 Headquarter", contact: "0321-5212690" },
  "executive": { name: "Executive Branch", contact: "0336-6775555" },
  "i8": { name: "I-8 Branch", contact: "0335-5511119" },
  "g8": { name: "G-8 Branch", contact: "0370-0344719" },
  "rims": { name: "RIMS Branch", contact: "0333-7500036" }
};

// Helper functions
const formatWhatsAppLink = (phoneNumber) => {
  // Remove any non-digit characters and ensure proper format
  const digits = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${digits}`;
};

const getBranchFromMessage = (message) => {
  const lowerCaseMessage = message.toLowerCase();
  
  for (const [key, value] of Object.entries(branchContacts)) {
    if (lowerCaseMessage.includes(key)) {
      return value;
    }
  }
  
  return null;
};

const isAppointmentRequest = (message) => {
  const lowerCaseMessage = message.toLowerCase();
  const appointmentKeywords = ['book', 'appointment', 'schedule', 'visit', 'consult'];
  
  return appointmentKeywords.some(keyword => lowerCaseMessage.includes(keyword));
};

// Generate branch selection message
const generateBranchSelectionMessage = () => {
  let message = "Please specify which branch you'd like to book an appointment at:\n\n";
  
  for (const [key, value] of Object.entries(branchContacts)) {
    message += `- ${value.name}: Reply with "${key}"\n`;
  }
  
  return message;
};

// API endpoints
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Smile Center Dental Clinic Chatbot API is running. Send POST requests to /api/chat.'
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    // Input validation
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request. Please provide a valid message.' 
      });
    }

    // Handle appointment requests
    if (isAppointmentRequest(message)) {
      const branchDetails = getBranchFromMessage(message);
      
      if (branchDetails) {
        const whatsappLink = formatWhatsAppLink(branchDetails.contact);
        return res.json({
          reply: `To book an appointment at ${branchDetails.name}, please use this WhatsApp link: ${whatsappLink} or call directly at ${branchDetails.contact}.`
        });
      } else {
        return res.json({
          reply: generateBranchSelectionMessage()
        });
      }
    }
    
    // Check if message contains just a branch name
    const branchDetails = getBranchFromMessage(message);
    if (branchDetails) {
      const whatsappLink = formatWhatsAppLink(branchDetails.contact);
      return res.json({
        reply: `To book an appointment at ${branchDetails.name}, please use this WhatsApp link: ${whatsappLink} or call directly at ${branchDetails.contact}.`
      });
    }

    // Handle general inquiries with OpenAI
    const systemPrompt = `
You are a helpful chatbot for Smile Center Dental Clinic. Provide concise, friendly responses.
Available branches:
${Object.entries(branchContacts).map(([key, value]) => `- ${value.name}: ${value.contact}`).join('\n')}

If asked about booking appointments, direct users to contact the specific branch via their phone number.
For dental advice, clarify you're not a medical professional and suggest consulting a dentist.
Keep responses under 150 words and focus on being helpful and informative.
    `;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    return res.json({ 
      reply: response.choices[0].message.content.trim() 
    });
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Return appropriate error based on type
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: "We're experiencing high demand. Please try again in a few moments." 
      });
    }
    
    return res.status(500).json({ 
      error: "Sorry, I'm having trouble responding right now. Please try again later." 
    });
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
