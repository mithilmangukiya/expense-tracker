import React from 'react'
import CustomePieChart from '../Charts/CustomePieChart'

const COLORS = ['#875CF5', '#FA2C37', '#FF6900']

const FinanceOverview = ({totalBalance, totalIncome, totalExpense}) => {

    const balancaData = [{name: 'Total Balance', amount: totalBalance}, {name: 'Total Expenses', amount: totalExpense}, {name: 'Total Income', amount: totalIncome},]
  return (
    <div className='card'>
        <div className='flex items-center justify-between'>
            <h5 className='text-lg'>Financial Overview</h5>
        </div>

        <CustomePieChart 
        data={balancaData}
        label='Total Balance'
        totalAmount={`₹${totalBalance}`}
        colors={COLORS}
        showTextAnchor />
    </div>
  )
}

export default FinanceOverview