import React, { useState } from 'react'
import Input from '../Inputs/Input'
import EmojiPickerPopup from '../EmojiPickerPopup'
import SelectInputIncome from '../Inputs/SelectInputIncome';

const incomeCategoryIcons = {
    'Salary': '💰',
    'Freelancing': '🖥️',
    'Investments': '📈',
    'Gifts': '🎁',
    'Business': '🏢',
    'Rental Income': '🏠',
    'Dividends': '💵',
    'Bonus': '🎉',
    'Other': '❓'
};


const AddIncomeForm = ({ onAddIncome }) => {
    const sources = Object.keys(incomeCategoryIcons);
    const [income, setIncome] = useState({
        source: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        icon: '',
    })
    const today = new Date().toISOString().split('T')[0];

    const handleChange = (key, value) => {
        setIncome(prev => {
            let newIcon = prev.icon;
            if (key === 'source') {
                newIcon = incomeCategoryIcons[value] || '';
            }
            return { ...prev, [key]: value, icon: newIcon };
        });
    };
    return (
        <div>

<EmojiPickerPopup
                icon={income.icon}
                onSelect={(selectedIcon) => setIncome(prev => ({ ...prev, icon: selectedIcon }))}
            />

<SelectInputIncome
                value={income.source}
                onChange={(value) => handleChange('source', value)}
                label='Source'
                options={sources}
            />


            <Input value={income.amount}
                onChange={({ target }) => handleChange('amount', target.value)}
                label='Amount'
                placeholder=''
                type='number' />

            <Input value={income.date || today}
                onChange={({ target }) => handleChange('date', target.value)}
                label='Date'
                placeholder=''
                type='date' />

            <div className='flex justify-end mt-6'>
                <button type='button' className='add-btn add-btn-fill' onClick={() => onAddIncome(income)}>
                    Add Income
                </button>
            </div>
        </div>
    )
}

export default AddIncomeForm