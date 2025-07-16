const Income = require('../models/Income');
const Expense = require('../models/Expense');
const mongoose = require("mongoose");

exports.analytics = async (req, res) => {
    try {
        const { startDate1, endDate1, startDate2, endDate2 } = req.body;
        const userId = req.user.id; 

        if (!startDate1 || !endDate1 || !startDate2 || !endDate2) {
            return res.status(400).json({ message: "All date ranges are required" });
        }

        const start1 = new Date(startDate1);
        const end1 = new Date(endDate1);
        const start2 = new Date(startDate2);
        const end2 = new Date(endDate2);

        const income1 = await Income.find({ userId, date: { $gte: start1, $lte: end1 } });
        const expense1 = await Expense.find({ userId, date: { $gte: start1, $lte: end1 } });

        const income2 = await Income.find({ userId, date: { $gte: start2, $lte: end2 } });
        const expense2 = await Expense.find({ userId, date: { $gte: start2, $lte: end2 } });

        const totalIncome1 = income1.reduce((sum, item) => sum + item.amount, 0);
        const totalExpense1 = expense1.reduce((sum, item) => sum + item.amount, 0);
        const totalIncome2 = income2.reduce((sum, item) => sum + item.amount, 0);
        const totalExpense2 = expense2.reduce((sum, item) => sum + item.amount, 0);

        const categorizeExpenses = (expenses) => {
            return expenses.reduce((acc, item) => {
                acc[item.category] = (acc[item.category] || 0) + item.amount;
                return acc;
            }, {});
        };

        const categoryExpenses1 = categorizeExpenses(expense1);
        const categoryExpenses2 = categorizeExpenses(expense2);

        const categoryComparison = {};
        const allCategories = new Set([...Object.keys(categoryExpenses1), ...Object.keys(categoryExpenses2)]);

        allCategories.forEach(category => {
            const amount1 = categoryExpenses1[category] || 0;
            const amount2 = categoryExpenses2[category] || 0;
            const percentageChange = amount1 === 0 ? (amount2 > 0 ? 100 : 0) : ((amount2 - amount1) / amount1) * 100;

            categoryComparison[category] = {
                amount1,
                amount2,
                percentageChange: percentageChange.toFixed(2) + "%"
            };
        });

        const topCategories = Object.entries(categoryExpenses2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category, amount]) => ({ category, amount }));

        const savingsRate1 = totalIncome1 === 0 ? 0 : ((totalIncome1 - totalExpense1) / totalIncome1) * 100;
        const savingsRate2 = totalIncome2 === 0 ? 0 : ((totalIncome2 - totalExpense2) / totalIncome2) * 100;

        const anomalyDetected = [];
        const threshold = 1.5; 

        if (Math.abs((totalExpense2 - totalExpense1) / totalExpense1) > threshold) {
            anomalyDetected.push('Expense spike detected between range 1 and range 2.');
        }

        res.json({
            range1: { startDate: startDate1, endDate: endDate1, totalIncome: totalIncome1, totalExpense: totalExpense1, balance: totalIncome1 - totalExpense1 },
            range2: { startDate: startDate2, endDate: endDate2, totalIncome: totalIncome2, totalExpense: totalExpense2, balance: totalIncome2 - totalExpense2 },
            comparison: {
                incomeDifference: totalIncome2 - totalIncome1,
                expenseDifference: totalExpense2 - totalExpense1,
                balanceDifference: (totalIncome2 - totalExpense2) - (totalIncome1 - totalExpense1),
                categoryComparison,
            },
            topSpendingCategories: topCategories,
            savingsRate: {
                range1: savingsRate1.toFixed(2) + "%",
                range2: savingsRate2.toFixed(2) + "%"
            },
            anomalies: anomalyDetected.length > 0 ? anomalyDetected : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.monthly_comparison = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const { year } = req.body; 

        if (!year) {
            return res.status(400).json({ message: "Year is required." });
        }

        const incomeData = await Income.aggregate([
            { $match: { userId, date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
            { 
                $group: {
                    _id: { $month: "$date" }, 
                    totalIncome: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } } 
        ]);

        const expenseData = await Expense.aggregate([
            { $match: { userId, date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
            { 
                $group: {
                    _id: { $month: "$date" }, 
                    totalExpense: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } } 
        ]);

        const monthlyComparison = {};
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        monthNames.forEach(month => {
            monthlyComparison[month] = { income: 0, expense: 0 };
        });

        incomeData.forEach(entry => {
            const monthName = monthNames[entry._id - 1];
            monthlyComparison[monthName].income = entry.totalIncome;
        });

        expenseData.forEach(entry => {
            const monthName = monthNames[entry._id - 1];
            monthlyComparison[monthName].expense = entry.totalExpense;
        });

        Object.keys(monthlyComparison).forEach(month => {
            const data = monthlyComparison[month];
            data.savings = data.income - data.expense;
        });

        res.json({ monthlyComparison });
    } catch (error) {
        console.error("Error fetching monthly comparison:", error);
        res.status(500).json({ message: "Server error. Try again later." });
    }
}

exports.yearly_trends = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const { startYear, endYear } = req.body; 

        if (!startYear || !endYear) {
            return res.status(400).json({ message: "Both startYear and endYear are required." });
        }

        const incomeData = await Income.aggregate([
            { $match: { userId, date: { $gte: new Date(`${startYear}-01-01`), $lte: new Date(`${endYear}-12-31`) } } },
            { 
                $group: {
                    _id: { $year: "$date" }, 
                    totalIncome: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } } 
        ]);

        const expenseData = await Expense.aggregate([
            { $match: { userId, date: { $gte: new Date(`${startYear}-01-01`), $lte: new Date(`${endYear}-12-31`) } } },
            { 
                $group: {
                    _id: { $year: "$date" }, 
                    totalExpense: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } } 
        ]);

        const yearlyComparison = {};

        incomeData.forEach(entry => {
            yearlyComparison[entry._id] = { income: entry.totalIncome, expense: 0 };
        });

        expenseData.forEach(entry => {
            if (yearlyComparison[entry._id]) {
                yearlyComparison[entry._id].expense = entry.totalExpense;
            }
        });

        res.json({ yearlyComparison });
    } catch (error) {
        console.error("Error fetching yearly trends:", error);
        res.status(500).json({ message: "Error fetching yearly trends." });
    }
}


const getLast7Days = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    return { today, sevenDaysAgo };
};

exports.weekly_trends = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const { today, sevenDaysAgo } = getLast7Days();

        const incomeData = await Income.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: sevenDaysAgo, $lte: today }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalIncome: { $sum: "$amount" }
                }
            }
        ]);

        const expenseData = await Expense.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: sevenDaysAgo, $lte: today }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalExpense: { $sum: "$amount" }
                }
            }
        ]);

        const weeklyInsight = [];
        let totalWeekIncome = 0;
        let totalWeekExpense = 0;

        for (let i = 0; i < 7; i++) {
            const date = new Date(sevenDaysAgo);
            date.setDate(date.getDate() + i);
            const formattedDate = date.toISOString().split('T')[0];

            const incomeEntry = incomeData.find(entry => entry._id === formattedDate);
            const expenseEntry = expenseData.find(entry => entry._id === formattedDate);

            const income = incomeEntry ? incomeEntry.totalIncome : 0;
            const expense = expenseEntry ? expenseEntry.totalExpense : 0;

            totalWeekIncome += income;
            totalWeekExpense += expense;

            weeklyInsight.push({
                date: formattedDate,
                income,
                expense
            });
        }

        res.json({
            weeklyInsight,
            totalWeekIncome,
            totalWeekExpense
        });

    } catch (error) {
        console.error("Error fetching weekly trends:", error);
        res.status(500).json({ message: "Error fetching weekly trends." });
    }
};
