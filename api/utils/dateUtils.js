const MONTHS_ES = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
    'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
};

const DAYS_ES = {
    'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'domingo': 0,
    'lun': 1, 'mar': 2, 'mié': 3, 'jue': 4, 'vie': 5, 'sáb': 6, 'dom': 0
};

export const extractDateFromQuery = (message) => {
    const normalizedMessage = message.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const patterns = [
        {
            regex: /(\d{1,2})\s+(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
            handler: (matches) => {
                const day = parseInt(matches[1]);
                const month = MONTHS_ES[matches[2].toLowerCase()];
                return new Date(2025, month, day);
            }
        },
        {
            regex: /(?:el|este|esta|próximo|proximo)\s+(lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|domingo|lun|mar|mié|mie|jue|vie|sáb|sab|dom)\b/i,
            handler: (matches) => {
                const today = new Date();
                const targetDay = DAYS_ES[matches[1].toLowerCase()];
                const currentDay = today.getDay();
                let daysToAdd = targetDay - currentDay;
                if (daysToAdd <= 0) daysToAdd += 7;
                const targetDate = new Date(today);
                targetDate.setDate(today.getDate() + daysToAdd);
                return targetDate;
            }
        }
    ];

    for (const pattern of patterns) {
        const matches = normalizedMessage.match(pattern.regex);
        if (matches) {
            return pattern.handler(matches);
        }
    }

    return null;
};