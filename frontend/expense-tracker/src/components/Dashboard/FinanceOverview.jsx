import React, { useContext } from 'react'
import CustomePieChart from '../Charts/CustomePieChart'
import { UserContext } from '../../context/userContext'
import { convertCurrency } from '../../utils/currencyFormatter'

const COLORS = ['#875CF5', '#FA2C37', '#FF6900']

const FinanceOverview = ({totalBalance, totalIncome, totalExpense}) => {
    const { currency, currencySymbol } = useContext(UserContext);

    // Convert all values from INR to selected currency
    const convertedBalance = convertCurrency(totalBalance, 'INR', currency);
    const convertedIncome = convertCurrency(totalIncome, 'INR', currency);
    const convertedExpense = convertCurrency(totalExpense, 'INR', currency);

    const balancaData = [
        {name: 'Total Balance', amount: convertedBalance}, 
        {name: 'Total Expenses', amount: convertedExpense}, 
        {name: 'Total Income', amount: convertedIncome},
    ]
  return (
    <div className='card'>
        <div className='flex items-center justify-between'>
            <h5 className='text-lg'>Financial Overview</h5>
        </div>

        <CustomePieChart 
        data={balancaData}
        label='Total Balance'
        totalAmount={`${currencySymbol}${convertedBalance.toFixed(2)}`}
        colors={COLORS}
        showTextAnchor />
    </div>
  )
}

export default FinanceOverview