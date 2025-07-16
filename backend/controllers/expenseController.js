const User = require('../models/User')
const Expense = require('../models/Expense')
const xlsx = require('xlsx')
const PDFDocument = require('pdfkit');
const path = require('path'); 
const fs = require('fs');

exports.addExpense = async (req, res) => {
    const userId = req.user.id
    try{
        const {icon, category, amount, date} = req.body
        if(!category ||!amount){
            return res.status(400).json({message: 'Please enter all fields'})
        }
        const dateValue = date ? new Date(date) : new Date(); 
        const newExpense = new Expense({userId, icon, category, amount, date: dateValue})
        await newExpense.save()
        res.status(200).json(newExpense)
    }catch(err){
        res.status(500).json({message: 'Server Error', error: err.message})
    }
}

exports.getAllExpense = async (req, res) => {
    const userId = req.user.id
    try{
        const expense = await Expense.find({userId}).sort({date: -1})
        res.status(200).json(expense)
    }catch(err){
        res.status(500).json({message: 'Server Error', error: err.message})
    }
}

exports.deleteExpense = async (req, res) => {
    const userId = req.user.id
    try {
        await Expense.findByIdAndDelete({_id: req.params.id, userId})
        res.status(200).json({message: 'Expense deleted successfully'})
    } catch (error) {
        res.status(500).json({message: 'Server Error', error: error.message})
    }
}

exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const expenses = await Expense.find({ userId }).sort({ date: -1 });

        if (expenses.length === 0) {
            return res.status(404).json({ message: "No expenses found" });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="expense_details.pdf"');

        const doc = new PDFDocument();
        doc.pipe(res); 

        doc.fontSize(18).text("Expense Report", { align: "center" });
        doc.moveDown(2);

        doc.fontSize(12).text("Category", 50, 100);
        doc.text("Amount", 250, 100);
        doc.text("Date", 400, 100);
        doc.moveDown(0.5);

        doc.moveTo(50, 120).lineTo(550, 120).stroke();

        let y = 140;
        expenses.forEach((expense) => {
            doc.text(expense.category, 50, y);
            doc.text(`$${expense.amount.toFixed(2)}`, 250, y);
            doc.text(new Date(expense.date).toLocaleDateString(), 400, y);
            y += 20;
        });

        doc.end(); 

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
    
}