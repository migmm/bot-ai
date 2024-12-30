import xlsx from 'xlsx';
import config from '../config/config.js';




export const loadProducts = () => {
    return {
        products: [
            { Nombre: "Laptop HP Pavilion", Categoría: "laptops", Marca: "hp", Precio: 1200, Descripción: "Laptop con pantalla Full HD y 8GB de RAM." },
            { Nombre: "Laptop Dell Inspiron", Categoría: "laptops", Marca: "dell", Precio: 1100, Descripción: "Laptop con procesador i5 y SSD de 256GB." },
        ],
    };
};
