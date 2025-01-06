import BusinessInfo from '../models/BusinessInfo.js';

export const getBusinessInfo = async (req, res) => {
    try {
        const businessInfo = await BusinessInfo.findOne();
        res.json(businessInfo);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la información del negocio' });
    }
};

export const updateBusinessInfo = async (req, res) => {
    try {
        const updatedInfo = await BusinessInfo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedInfo);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la información del negocio' });
    }
};