import dotenv from 'dotenv';

dotenv.config();

const config = {
    mongoURI: process.env.MONGODB_URI,
    port: process.env.PORT || 3000,
    excelPath: process.env.EXCEL_PATH,
    llmApiUrl: process.env.LLM_API_URL,
    llmApiKey: process.env.LLM_API_KEY,
    llmModel: process.env.LLM_MODEL,

    store: {
        name: "Electrónica XYZ",
        hours: {
            monday_to_friday: "9:00 a 18:00",
            saturdays: "9:00 a 13:00",
            sundays: "Cerrado"
        },
        adress: "Av. Example 123",
        phone: "+54 11 1234-5678",
        whatsapp: "+54 911 1234-5678"
    }
};

export default config;