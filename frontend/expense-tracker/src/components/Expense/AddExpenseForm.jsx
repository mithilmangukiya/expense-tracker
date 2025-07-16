// import React, { useState } from 'react'
// import Input from '../Inputs/Input'
// import EmojiPickerPopup from '../EmojiPickerPopup'
// import SelectInput from '../Inputs/SelectInput';


// const AddExpenseForm = ({ onAddExpense }) => {
//     const categories = ['Rent', 'Groceries', 'shopping', 'Entertainment', 'Utilities', 'medicine', 'transportation', 'food', 'Other'];
//     const [expense, setExpense] = useState({
//         category: '',
//         amount: '',
//         date: new Date().toISOString().split('T')[0],
//         icon: '',
//     })
    
//     const handleChange = (key, value) => setExpense({
//         ...expense, [key]: value
//     })
//     const today = new Date().toISOString().split('T')[0];
//     return (
//         <div>
//             <EmojiPickerPopup
//                 icon={expense.icon}
//                 onSelect={(selectedIcon) => handleChange('icon', selectedIcon)} />

            
// <SelectInput
//                 value={expense.category}
//                 onChange={(value) => handleChange('category', value)}
//                 label='Category'
//                 options={categories}
//             />

//             <Input
//                 value={expense.amount}
//                 onChange={({ target }) => handleChange('amount', target.value)}
//                 label='Amount'
//                 placeholder=''
//                 type='Number' />

//             <Input
//                 value={expense.date || today}
//                 onChange={({ target }) => handleChange('date', target.value)}
//                 label='Date'
//                 placeholder=''
//                 type='date' />

//             <div className=' flex justify-end mt-6'>
//                 <button type='button' className='add-btn add-btn-fill' onClick={() => onAddExpense(expense)}>
//                     Add Expense
//                 </button>
//             </div>
//         </div>
//     )
// }

// export default AddExpenseForm

import React, { useState } from 'react';
import Input from '../Inputs/Input';
import EmojiPickerPopup from '../EmojiPickerPopup';
import SelectInput from '../Inputs/SelectInput';

const categoryIcons = {
    'Rent': '🏠',
    'Groceries': '🛒',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Utilities': '💡',
    'Medicine': '💊',
    'Transportation': '🚗',
    'Food': '🍕',
    'Other': '❓'
};

const AddExpenseForm = ({ onAddExpense }) => {
    const categories = Object.keys(categoryIcons);
    const [expense, setExpense] = useState({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        icon: '',
    });

    const handleChange = (key, value) => {
        setExpense(prev => {
            let newIcon = prev.icon;
            if (key === 'category') {
                newIcon = categoryIcons[value] || '';
            }
            return { ...prev, [key]: value, icon: newIcon };
        });
    };

    return (
        <div>
            <EmojiPickerPopup
                icon={expense.icon}
                onSelect={(selectedIcon) => setExpense(prev => ({ ...prev, icon: selectedIcon }))}
            />

            <SelectInput
                value={expense.category}
                onChange={(value) => handleChange('category', value)}
                label='Category'
                options={categories}
            />

            <Input
                value={expense.amount}
                onChange={({ target }) => handleChange('amount', target.value)}
                label='Amount'
                placeholder=''
                type='number'
            />

            <Input
                value={expense.date}
                onChange={({ target }) => handleChange('date', target.value)}
                label='Date'
                placeholder=''
                type='date'
            />

            <div className='flex justify-end mt-6'>
                <button type='button' className='add-btn add-btn-fill' onClick={() => onAddExpense(expense)}>
                    Add Expense
                </button>
            </div>
        </div>
    );
};

export default AddExpenseForm;
