import { read as xlsxRead, utils } from 'xlsx';
import config from '../config/config.js';

export const loadProducts = () => {
    try {
        const workbook = xlsxRead(config.excelPath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        return utils.sheet_to_json(sheet);
    } catch (error) {
        console.error('Error loading products from Excel sheet:', error);
        return [];
    }
};