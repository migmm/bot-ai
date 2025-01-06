import Promo from '../models/Promo.js';

export const getPromos = async (req, res) => {
    try {
        const promos = await Promo.find();
        res.json(promos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las promociones' });
    }
};

export const addPromo = async (req, res) => {
    try {
        const newPromo = new Promo(req.body);
        await newPromo.save();
        res.status(201).json(newPromo);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar la promoción' });
    }
};