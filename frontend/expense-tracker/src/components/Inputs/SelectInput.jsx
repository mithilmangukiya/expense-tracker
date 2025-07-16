import React from 'react';

const SelectInput = ({ value, onChange, label, options }) => {
    return (
        <div>
            <label className='text-[13px] text-slate-800'>{label}</label>
            <div className='input-box'>
                <select
                    className='w-full bg-transparent outline-none'
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value='' disabled>Select a category</option>
                    {options.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default SelectInput;
