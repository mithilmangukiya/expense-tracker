import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import CustomeTooltip from './CustomeTooltip'
import CustomeLegend from './CustomeLegend'

const CustomePieChart = ({ data, label, totalAmount, colors, showTextAnchor }) => {
    return (
        <ResponsiveContainer width='100%' height={380}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey='amount'
                    nameKey='name'
                    cx='50%'
                    cy='50%'
                    outerRadius={130}
                    innerRadius={100}
                    labelLine={false}
                    label={({ cx, cy }) => 
                        showTextAnchor && (
                            <>
                                <text
                                    x={cx}
                                    y={cy - 15}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="#666"
                                    fontSize="14px"
                                    fontWeight="500">
                                    {label}
                                </text>
                                <text
                                    x={cx}
                                    y={cy + 10}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="#333"
                                    fontSize="24px"
                                    fontWeight="600">
                                    {totalAmount}
                                </text>
                            </>
                        )
                    }>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Pie>
                <Tooltip content={CustomeTooltip} />
                <Legend content={CustomeLegend} />
            </PieChart>
        </ResponsiveContainer>
    )
}

export default CustomePieChart
