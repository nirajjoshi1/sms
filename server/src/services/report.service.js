/**
 * Returns { startDate, endDate } for the requested period.
 * @param {'today'|'week'|'month'|'quarter'|'year'} period
 * @returns {{ startDate: Date, endDate: Date }}
 */
const getDateRange = (period) => {
    const now = new Date();
    let startDate;
    const endDate = new Date(now);

    switch (period) {
        case 'today':
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            break;

        case 'week': {
            const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
            startDate = new Date(now);
            startDate.setDate(now.getDate() - dayOfWeek);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        }

        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate.setHours(23, 59, 59, 999);
            break;

        case 'quarter': {
            const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
            startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
            endDate.setHours(23, 59, 59, 999);
            break;
        }

        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate.setHours(23, 59, 59, 999);
            break;

        default:
            throw new Error(`Unknown period: "${period}". Use today|week|month|quarter|year`);
    }

    return { startDate, endDate };
};

/**
 * Format a number as an Indian Rupee string.
 * @param {number} amount
 * @returns {string} e.g. "₹1,23,456.00"
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

/**
 * Build a CSV string from an array of header strings and an array of row arrays.
 * @param {string[]} headers
 * @param {Array<Array<string|number>>} rows
 * @returns {string}
 */
const buildCSV = (headers, rows) => {
    const escape = (val) => {
        const str = String(val ?? '');
        // Wrap in quotes if the value contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const headerLine = headers.map(escape).join(',');
    const dataLines = rows.map(row => row.map(escape).join(','));

    return [headerLine, ...dataLines].join('\n');
};

/**
 * Calculate the growth rate between two values.
 * @param {number} current
 * @param {number} previous
 * @returns {string} e.g. "+12.5%" or "-3.2%" or "0.0%"
 */
const calcGrowthRate = (current, previous) => {
    if (previous === 0) {
        return current > 0 ? '+100.0%' : '0.0%';
    }

    const rate = ((current - previous) / Math.abs(previous)) * 100;
    const rounded = rate.toFixed(1);

    return rate >= 0 ? `+${rounded}%` : `${rounded}%`;
};

module.exports = {
    getDateRange,
    formatCurrency,
    buildCSV,
    calcGrowthRate
};
