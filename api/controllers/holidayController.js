import Holiday from '../models/Holiday.js';

export const getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find();
        res.json(holidays);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los feriados' });
    }
};

export const addHoliday = async (req, res) => {
    try {
        const newHoliday = new Holiday(req.body);
        await newHoliday.save();
        res.status(201).json(newHoliday);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el feriado' });
    }
};