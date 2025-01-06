import Menu from '../models/Menu.js';

export const getMenu = async (req, res) => {
    try {
        const menu = await Menu.find();
        res.json(menu);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el menú' });
    }
};

export const addMenuItem = async (req, res) => {
    try {
        const newItem = new Menu(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el ítem al menú' });
    }
};