import { loadProducts } from './loadProducts.js';
import config from '../config/config.js';

export const getSystemPrompt = () => {
    if (!config.llmSystemPrompt) {
        console.error("SYSTEM_PROMPT is not defined in the config.");
        return "Error: SYSTEM PROMPT is missing.";
    }

    const products = loadProducts();
    const productList = products.map(product => 
        `Nombre: ${product.Nombre}, Precio: ${product.Precio}, Stock: ${product.Stock}, Categoría: ${product.Categoría}, Marca: ${product.Marca}, Descripción: ${product.Descripción}`
    ).join('\n');


    return `${config.llmSystemPrompt.replace('{product_list}', productList)}`;
};
