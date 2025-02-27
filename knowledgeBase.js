// Knowledge base for Smile Center Dental Clinic
const knowledgeBase = `
Smile Center Dental Clinic has been serving Islamabad for over 10 years, offering comprehensive dental care.
Our services include preventive care, general and cosmetic dentistry, veneers, bonding, bridges, crowns, teeth whitening, extractions, dentures, dental implants, root canals, and oral health exams.

Our branches are:
- **F-8 Headquarter**: G Floor, Al-Babar Center, F-8, Markaz Islamabad (Contact: 0321-5212690 | WhatsApp: https://wa.me/03215212690)
- **Executive Branch**: 33 Bhitai Road, F-7/1, Islamabad (Contact: 0336-6775555 | WhatsApp: https://wa.me/03366775555)
- **I-8 Branch**: Ist Floor, City Arcade, I-8 Markaz, Islamabad (Contact: 0335-5511119 | WhatsApp: https://wa.me/03355511119)
- **G-8 Branch**: Basement Plaza 20D, G-8 Markaz, Islamabad (Contact: 0370-0344719 | WhatsApp: https://wa.me/03700344719)
- **RIMS Branch**: 68-E, Jinnah Avenue, Blue Area, Islamabad (Contact: 0333-7500036 | WhatsApp: https://wa.me/03337500036)

You can also book an appointment via Calendly: https://calendly.com/mujtaba-shahbaz/patient-appointment?back=1&month=2025-02

Our team includes Dr. Saeed Mustafa (MDS Orthodontics), Dr. Syeda Mahinu (General Dentistry), Dr. Usman Khattak (FCPS Periodontology), Dr. Alizay, Dr. Baryal Khan, Dr. Sarah Ali, Dr. Salwan Ghani, Dr. Anum Moiz, Dr. Hashim Asad, Dr. Maham Arshad, and Dr. Zainab Khawaja.
`;

// Branch contact details
const branchContacts = {
    "f8": { phone: "0321-5212690", whatsapp: "https://wa.me/03215212690" },
    "executive": { phone: "0336-6775555", whatsapp: "https://wa.me/03366775555" },
    "i8": { phone: "0335-5511119", whatsapp: "https://wa.me/03355511119" },
    "g8": { phone: "0370-0344719", whatsapp: "https://wa.me/03700344719" },
    "rims": { phone: "0333-7500036", whatsapp: "https://wa.me/03337500036" }
};

// Calendly link
const calendlyLink = "https://calendly.com/mujtaba-shahbaz/patient-appointment?back=1&month=2025-02";

module.exports = { knowledgeBase, branchContacts, calendlyLink };
