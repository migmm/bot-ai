import Schedule from '../models/Schedule.js';

export const getSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.find();
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el horario' });
    }
};

export const createSchedule = async (req, res) => {
    try {
        const newSchedule = new Schedule(req.body);
        const savedSchedule = await newSchedule.save();
        res.status(201).json(savedSchedule);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el horario' });
    }
};

export const updateSchedule = async (req, res) => {
    try {
        const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedSchedule);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el horario' });
    }
};