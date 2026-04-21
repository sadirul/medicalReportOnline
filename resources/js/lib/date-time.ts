const kolkataDateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
});

export const formatDateTimeInKolkata = (value: string): string => {
    const parts = kolkataDateTimeFormatter.formatToParts(new Date(value));

    const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';

    const day = get('day');
    const month = get('month');
    const year = get('year');
    const hour = get('hour');
    const minute = get('minute');
    const dayPeriod = get('dayPeriod').toUpperCase();

    return `${day}-${month}-${year} ${hour}:${minute} ${dayPeriod}`;
};
