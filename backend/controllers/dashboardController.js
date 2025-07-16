const Income = require('../models/Income');
const Expense = require('../models/Expense');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require("mongoose");

const { isValidObjectId, Types } = require('mongoose');

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));

        const totalIncome = await Income.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, totalIncome: { $sum: '$amount' } } }
        ])

        const totalExpense = await Expense.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, totalExpense: { $sum: '$amount' } } }
        ])

        const last60DaysIncomeTransaction = await Income.find({
            userId,
            date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 })

        const incomeLast60Days = last60DaysIncomeTransaction.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
        );

        const last30DaysExpenseTransaction = await Expense.find({
            userId,
            date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        })

        const expenseLast30Days = last30DaysExpenseTransaction.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
        );

        const lastTransaction = [
            ...(await Income.find({ userId }).sort({ date: -1 }).limit(5)).map(
                (txn) => ({
                    ...txn.toObject(),
                    type: "income",
                })
            ),
            ...(await Expense.find({ userId }).sort({ date: -1 }).limit(5)).map(
                (txn) => ({
                    ...txn.toObject(),
                    type: "expense",
                })
            )
        ].sort((a, b) => b.date - a.date);

        res.json({
            totalBalance:
                (totalIncome[0]?.totalIncome || 0) - (totalExpense[0]?.totalExpense || 0),
            totalIncome: totalIncome[0]?.totalIncome || 0,
            totalExpense: totalExpense[0]?.totalExpense || 0,
            last30DaysExpense: {
                total: expenseLast30Days,
                transactions: last30DaysExpenseTransaction,
            },
            last60DaysIncome: {
                total: incomeLast60Days,
                transactions: last60DaysIncomeTransaction,
            },
            recentTransactions: lastTransaction,
        })
    } catch (error) {
        res.status(500).json({ message: "server error", error: error.message })
    }
}

exports.handleChatbotQuery = async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));

        const allIncomeTransactions = await Income.find({ userId }).sort({ date: -1 });
        const allExpenseTransactions = await Expense.find({ userId }).sort({ date: -1 });

        const safeStringify = (obj) => {
            const cache = new Set();
            try {
                const result = JSON.stringify(obj, (key, value) => {

                    if (value && typeof value === 'object') {
                        if (cache.has(value)) {
                            return;
                        }
                        cache.add(value);
                    }
                    return value;
                });
                return result;
                console.log(result);
            } catch (error) {
                console.error('Error in safeStringify:', error);
                return '{}';
            }
        };
        console.log("safeStringify", safeStringify);

        const aiChatbot = async (userQuery, incomeData, expenseData) => {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

                // const prompt = `
                // You are a financial assistant chatbot. Answer the user's financial questions in one line based on their data.

                // User's Financial Data:
                // Income Data: ${safeStringify(incomeData)}
                // Expense Data: ${safeStringify(expenseData)}

                // User's Question: ${userQuery}
                // `;

                const prompt = `Here's an enhanced prompt to calculate the total expenses for March from an array of expense objects:  

**Prompt:**  
*"Given an array of expense objects, calculate the total expenses for the month of March (YYYY-MM). The array contains objects with fields like _id, userI, category, amount, date, and timestamps. Filter out expenses where the date falls in March of any given year and sum up the amount values. Return the result in the following format:*  


{
  "totalMarchExpense": 0
}
 

*Ensure the date filtering accounts for different time zones and formats while correctly identifying March expenses."
Input : 
Income Data : ${incomeData}
Expense Data : ${expenseData}*  

`
                const result = await model.generateContent(prompt);
                console.log(result.response.candidates.content);
                const response = await result.response;



                if (!response || !response.text) {
                    throw new Error('Invalid response from AI model');
                }

                return response.text().trim();
            } catch (error) {
                console.error('Error generating chatbot response:', error);
                throw new Error('Failed to generate chatbot response');
            }
        };

        const { userQuery } = req.body;

        if (!userQuery) {
            return res.status(400).json({ message: "Please provide a query." });
        }

        const aiChatbotResponse = await aiChatbot(
            userQuery,
            allIncomeTransactions,
            allExpenseTransactions
        );

        return res.json({ response: aiChatbotResponse });
    } catch (error) {
        console.error('Error processing AI chatbot query:', error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.generateInsights = async (req, res) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const userId = req.user.id;

        const expenses = await Expense.find({ userId }).sort({ date: -1 });
        const income = await Income.find({ userId }).sort({ date: -1 });

        if (!expenses.length || !income.length) {
            return res.status(400).json({ message: "Not enough data for insights." });
        }

        const expenseData = expenses.map(exp => ({
            category: exp.category,
            amount: exp.amount,
            date: exp.date.toISOString().slice(0, 10),
        }));

        const incomeData = income.map(inc => ({
            source: inc.source,
            amount: inc.amount,
            date: inc.date.toISOString().slice(0, 10),
        }));

        const prompt = `Analyze the following income and expense data to provide concise, single-line financial insights suitable for display on a frontend interface.

**Income Data:** ${JSON.stringify(incomeData)}
**Expense Data:** ${JSON.stringify(expenseData)}

Generate a JSON object with the following keys, each containing a single-line string value representing the corresponding financial analysis in rupee sign:

monthlySavings: A summary of the monthly savings trend.
highestExpenseCategory: The spending category with the largest total expense.
expenseReductionSuggestion: A brief suggestion for reducing unnecessary expenses.
unusualSpending: Any significant or unusual spending patterns observed.
nextMonthPredictedExpense: A predicted expense total for the next month, based on the provided data.

Ensure the output is a valid JSON object that can be directly parsed and displayed on a frontend.`
        const result = await model.generateContent(prompt);
        const aiResponse = await result.response;
        const cleanedResult = aiResponse.text();
        const insights = cleanedResult
            .replace(/```json|```/g, "")
            .trim()
            .replace(/^{|}$/g, "")
            .replace(/"\s*([^"]+?)\s*"\s*:/g, '$1:')
            .replace(/"\s*([^"]+?)\s*"/g, '$1');
        res.status(200).json({ insights });
    } catch (error) {
        console.error("AI Insights Error:", error);
        res.status(500).json({ message: "Failed to generate AI insights" });
    }
}

exports.compare = async (req, res) => {
    try {
        const { userId, startDate1, endDate1, startDate2, endDate2 } = req.body;

        if (!userId || !startDate1 || !endDate1 || !startDate2 || !endDate2) {
            return res.status(400).json({ message: "All date ranges and userId are required" });
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

        const getMonthlyData = async (userId) => {
            const objectIdUser = new mongoose.Types.ObjectId(userId);

            const monthlyIncome = await Income.aggregate([
                { $match: { userId: objectIdUser } },
                {
                    $group: {
                        _id: {
                            year: { $year: "$date" },
                            month: { $month: "$date" }
                        },
                        totalIncome: { $sum: "$amount" }
                    }
                }
            ]);
            const monthlyExpense = await Expense.aggregate([
                { $match: { userId: objectIdUser } },
                {
                    $group: {
                        _id: {
                            year: { $year: "$date" },
                            month: { $month: "$date" }
                        },
                        totalExpense: { $sum: "$amount" }
                    }
                }
            ]);
            const monthlyData = {};
            monthlyIncome.forEach(item => {
                const key = `${item._id.year}-${item._id.month}`;
                monthlyData[key] = { income: item.totalIncome, expense: 0 };
            });
            monthlyExpense.forEach(item => {
                const key = `${item._id.year}-${item._id.month}`;
                if (monthlyData[key]) {
                    monthlyData[key].expense = item.totalExpense;
                } else {
                    monthlyData[key] = { income: 0, expense: item.totalExpense };
                }
            });
            return monthlyData;
        };
        const monthlyComparison = await getMonthlyData(userId);
        const result = {
            range1: {
                startDate: startDate1,
                endDate: endDate1,
                totalIncome: totalIncome1,
                totalExpense: totalExpense1,
                balance: totalIncome1 - totalExpense1,
                details: { income: income1, expense: expense1 }
            },
            range2: {
                startDate: startDate2,
                endDate: endDate2,
                totalIncome: totalIncome2,
                totalExpense: totalExpense2,
                balance: totalIncome2 - totalExpense2,
                details: { income: income2, expense: expense2 }
            },
            comparison: {
                incomeDifference: totalIncome2 - totalIncome1,
                expenseDifference: totalExpense2 - totalExpense1,
                balanceDifference: (totalIncome2 - totalExpense2) - (totalIncome1 - totalExpense1),
                categoryComparison
            },
            monthlyComparison
        };

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
