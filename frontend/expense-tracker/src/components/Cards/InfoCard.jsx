import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import { convertCurrency } from '../../utils/currencyFormatter'

const InfoCard = ({ icon, label, value, color, valueCurrency = 'INR' }) => {
    const { currency, currencySymbol } = useContext(UserContext);
    
    // Convert the value to selected currency
    const convertedValue = convertCurrency(value, valueCurrency, currency);
    
    return (
        <div className='flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200/50'>
            <div className={`w-12 h-12 flex items-center justify-center text-[26px] ${color} rounded-full drop-shadow-xl`}>
                {icon}
            </div>
            <div>
                <h6 className='text-sm text-gray-500 mb-1'>{label}</h6>
                <span className='text-[22px]'>{currencySymbol}{convertedValue.toFixed(2)}</span>
            </div>
        </div>
    )
}

export default InfoCard