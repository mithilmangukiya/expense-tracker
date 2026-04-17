import React, { createContext, useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { getCurrencySymbol } from '../utils/currencyFormatter';
import { API_PATHS } from '../utils/apiPaths';

export const UserContext = createContext();

const UserProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [currency, setCurrency] = useState('INR');
    const [currencySymbol, setCurrencySymbol] = useState('₹');

    // Update currency symbol when currency changes
    useEffect(() => {
        setCurrencySymbol(getCurrencySymbol(currency));
    }, [currency]);

    const updateUser = (userData) => {
        setUser(userData);
        if (userData?.currency) {
            setCurrency(userData.currency);
        }
    };

    const updateCurrency = async (newCurrency) => {
        try {
            const response = await axios.put(API_PATHS.AUTH.UPDATE_CURRENCY, { currency: newCurrency });
            if (response.data.user) {
                updateUser(response.data.user);
            }
            return { success: true };
        } catch (error) {
            console.error('Error updating currency:', error);
            return { success: false, error: error.response?.data?.message || 'Failed to update currency' };
        }
    };

    const clearUser = () => {
        setUser(null);
        setCurrency('INR');
        setCurrencySymbol('₹');
    };

    const logout = () => {
        localStorage.removeItem("token"); 
        clearUser();
    };

    return(
        <UserContext.Provider value={{
            user,
            currency,
            currencySymbol,
            updateUser,
            updateCurrency,
            clearUser,
            logout
        }}>
            {children}
        </UserContext.Provider>
    );
};
export default UserProvider;