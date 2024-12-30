
import { callLLM } from './llmService.js';
import Chat from '../models/Chat.js';
import { loadProducts } from '../utils/loadProducts.js';

export const handleChat = async (message, customerId) => {
    let chat = await Chat.findOne({ customerId });

    if (!chat) {
        chat = new Chat({ 
            customerId, 
            messages: [], 
            context: {} 
        });
    }

    const systemPrompt = getSystemPrompt();
    const llmResponse = await callLLM([
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
    ]);

    // Procesar la intención del cliente
    const response = processIntent(llmResponse, chat.context);

    chat.context = { ...chat.context, ...llmResponse.contextUpdates };
    chat.messages.push({ message, response });
    chat.lastActivity = new Date();
    await chat.save();

    return response;
};

export const getSystemPrompt = () => {
    return `
`;
};

const parseLLMResponse = (llmResponse) => {
    try {
        const intent = JSON.parse(llmResponse);
        return {
            intentType: intent.intentType, // Por ejemplo: "searchProduct", "askFeatures"
            category: intent.category,
            brand: intent.brand,
            contextUpdates: intent.contextUpdates || {}
        };
    } catch (error) {
        console.error('Error parsing LLM response:', error);
        return { intentType: "unknown", contextUpdates: {} };
    }
};

const processIntent = (parsedIntent, context) => {
    const { products } = loadProducts();

    switch (parsedIntent.intentType) {
        case "searchProduct":
            const matchedProducts = products.filter(product => 
                (!parsedIntent.category || product.Categoría.toLowerCase() === parsedIntent.category.toLowerCase()) &&
                (!parsedIntent.brand || product.Marca.toLowerCase() === parsedIntent.brand.toLowerCase())
            );

            if (matchedProducts.length > 0) {
                return matchedProducts.map(product => 
                    `Sí, tenemos ${product.Nombre}. Precio: $${product.Precio}. ${product.Descripción}`
                ).join('\n');
            } else {
                return `No tenemos productos que coincidan con tu búsqueda.`;
            }

        default:
            return "No entiendo tu solicitud. Por favor, consulta nuestra lista de productos disponibles.";
    }
};
