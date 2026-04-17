import React, { useContext } from 'react';
import { UserContext } from '../context/userContext';
import { getAvailableCurrencies } from '../utils/currencyFormatter';

const CurrencySelector = () => {
    const { currency, currencySymbol, updateCurrency } = useContext(UserContext);
    const currencies = getAvailableCurrencies();

    const handleCurrencyChange = async (newCurrency) => {
        const result = await updateCurrency(newCurrency);
        if (!result.success) {
            alert(result.error);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <label htmlFor="currency-select" className="text-sm font-medium text-gray-700">
                Currency:
            </label>
            <select
                id="currency-select"
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                {currencies.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.name}
                    </option>
                ))}
            </select>
            <span className="text-sm text-gray-500">({currencySymbol})</span>
        </div>
    );
};

export default CurrencySelector;