import React, { useEffect, useState } from 'react'
import { LuPlus } from 'react-icons/lu'
import CustomeBarChart from '../Charts/CustomeBarChart'
import { prepareIncomeBarChartData } from '../../utils/helper'
import CustomeBarChartIncome from '../Charts/CustomeBarChartIncome'

const IncomeOverview = ({transactions, onAddIncome}) => {
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        const result = prepareIncomeBarChartData(transactions)
        setChartData(result)

        return () => {}
    }, [transactions])
  return (
    <div className='card'>
        <div className='flex items-center justify-between'>
            <div className=''>
                <h5 className='tetx-lg'>Income Overview</h5>
                <p className='text-xs text-gray-400 mt-0.5'>
                    Track your earnings over time and analyzeyour income trends.
                </p>
            </div>
            <button className='add-btn' onClick={onAddIncome}>
                <LuPlus className='tetx-lg'/> Add Income
            </button>
        </div>
        <div className='mt-10'>
            <CustomeBarChartIncome data={chartData}  />
        </div>
    </div>
  )
}

export default IncomeOverview