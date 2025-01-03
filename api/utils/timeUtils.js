import schedule from '../data/schedule.js';
import holidays from '../data/holidays.js';
import { config } from '../config/constants.js';

export const getBusinessStatus = (date = new Date()) => {
    const targetDate = new Date(date);
    const today = targetDate.toISOString().split('T')[0];

    console.log("Fecha actual:", today);

    const normalizedHolidays = holidays.map(h => ({
        ...h,
        date: new Date(h.date).toISOString().split('T')[0]
    }));


    const holiday = normalizedHolidays.find(h => h.date === today);
    console.log("Feriado encontrado:", holiday);

    if (holiday) {
        return {
            isOpen: false,
            status: `El ${targetDate.toLocaleDateString(config.locales, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} es feriado (${holiday.name}). No abrimos ese día. Reabriremos el ${new Date(holiday.reopenDate).toLocaleDateString(config.locales)}.`,
            isHoliday: true,
            reopenDate: holiday.reopenDate,
            reason: holiday.name
        };
    }


    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[targetDate.getDay()];
    const daySchedule = schedule.find(s => s.day === currentDay);

    console.log("Día actual:", currentDay);
    console.log("Horario del día:", daySchedule);

    if (!daySchedule) {
        return {
            isOpen: false,
            status: "Horario no disponible para este día.",
            isHoliday: false
        };
    }

    const currentTime = targetDate.toLocaleTimeString(config.locales, { hour12: false });
    const openTime = new Date(`${today} ${daySchedule.openTime}`).toLocaleTimeString(config.locales, { hour12: false });
    const closeTime = new Date(`${today} ${daySchedule.closeTime}`).toLocaleTimeString(config.locales, { hour12: false });

    console.log("Hora actual:", currentTime);
    console.log("Hora de apertura:", openTime);
    console.log("Hora de cierre:", closeTime);

    if (currentTime < openTime) {
        return {
            isOpen: false,
            status: `Cerrado. Abrimos el ${targetDate.toLocaleDateString(config.locales, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las ${daySchedule.openTime}.`,
            isHoliday: false
        };
    }

    if (currentTime > closeTime) {
        const tomorrow = days[(targetDate.getDay() + 1) % 7];
        const tomorrowSchedule = schedule.find(s => s.day === tomorrow);
        return {
            isOpen: false,
            status: `Cerrado. Abrimos mañana (${tomorrow}) a las ${tomorrowSchedule.openTime}.`,
            isHoliday: false
        };
    }

    return {
        isOpen: true,
        status: `¡Abierto! Cerramos el ${targetDate.toLocaleDateString(config.locales, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las ${daySchedule.closeTime}.`,
        isHoliday: false
    };
};

export const getTimeInfo = (queryDate, locales) => {
    const now = new Date();
    return {
        queryDate: queryDate ? queryDate.toLocaleDateString(locales, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : null,
        currentDate: now.toLocaleDateString(locales, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    };
};

export const getBusinessStatusWithTimeInfo = (queryDate, locales) => {
    const now = new Date();
    const businessStatus = queryDate ? getBusinessStatus(queryDate) : getBusinessStatus(now);
    const timeInfo = getTimeInfo(queryDate, locales);
    return { businessStatus, timeInfo };
};