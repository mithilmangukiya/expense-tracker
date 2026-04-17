import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'

const InfoCard = ({ icon, label, value, color }) => {
    const { currencySymbol } = useContext(UserContext);
    
    return (
        <div className='flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200/50'>
            <div className={`w-12 h-12 flex items-center justify-center text-[26px] ${color} rounded-full drop-shadow-xl`}>
                {icon}
            </div>
            <div>
                <h6 className='text-sm text-gray-500 mb-1'>{label}</h6>
                <span className='text-[22px]'>{currencySymbol}{value}</span>
            </div>
        </div>
    )
}

export default InfoCard