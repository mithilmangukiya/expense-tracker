// Currency utilities for the Expense Tracker app

export const CURRENCY_CONFIG = {
    INR: { symbol: '₹', name: 'Indian Rupee', rate: 1 },
    USD: { symbol: '$', name: 'US Dollar', rate: 0.012 },
    EUR: { symbol: '€', name: 'Euro', rate: 0.011 },
    GBP: { symbol: '£', name: 'British Pound', rate: 0.0095 },
    JPY: { symbol: '¥', name: 'Japanese Yen', rate: 1.8 },
    CAD: { symbol: 'C$', name: 'Canadian Dollar', rate: 0.017 },
    AUD: { symbol: 'A$', name: 'Australian Dollar', rate: 0.018 }
};

export const getCurrencySymbol = (currencyCode) => {
    return CURRENCY_CONFIG[currencyCode]?.symbol || '₹';
};

export const getCurrencyName = (currencyCode) => {
    return CURRENCY_CONFIG[currencyCode]?.name || 'Indian Rupee';
};

// Convert amount from INR to any currency
export const convertCurrency = (amountInINR, fromCurrency = 'INR', toCurrency = 'INR') => {
    const amount = Number(amountInINR || 0);
    if (Number.isNaN(amount)) return 0;

    if (fromCurrency === toCurrency) return amount;
    
    // First convert to INR base if needed
    const amountInBase = amount / (CURRENCY_CONFIG[fromCurrency]?.rate || 1);
    
    // Then convert to target currency
    const converted = amountInBase * (CURRENCY_CONFIG[toCurrency]?.rate || 1);
    
    return Math.round(converted * 100) / 100; // Round to 2 decimals
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