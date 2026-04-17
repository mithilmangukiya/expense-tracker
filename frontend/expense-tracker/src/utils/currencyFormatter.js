// Currency utilities for the Expense Tracker app

export const CURRENCY_CONFIG = {
    INR: { symbol: '₹', name: 'Indian Rupee' },
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' },
    JPY: { symbol: '¥', name: 'Japanese Yen' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar' },
    AUD: { symbol: 'A$', name: 'Australian Dollar' }
};

export const getCurrencySymbol = (currencyCode) => {
    return CURRENCY_CONFIG[currencyCode]?.symbol || '₹';
};

export const getCurrencyName = (currencyCode) => {
    return CURRENCY_CONFIG[currencyCode]?.name || 'Indian Rupee';
};

export const formatAmount = (amount, currencyCode = 'INR') => {
    const symbol = getCurrencySymbol(currencyCode);
    const formattedAmount = addThousandsSeparator(amount);
    return `${symbol}${formattedAmount}`;
};

export const addThousandsSeparator = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const getAvailableCurrencies = () => {
    return Object.keys(CURRENCY_CONFIG).map(code => ({
        code,
        symbol: CURRENCY_CONFIG[code].symbol,
        name: CURRENCY_CONFIG[code].name
    }));
};