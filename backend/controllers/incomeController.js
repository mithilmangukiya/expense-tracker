const User = require('../models/User')
const Income = require('../models/Income')
const xlsx = require('xlsx')
const PDFDocument = require('pdfkit');
const path = require('path'); 
const fs = require('fs');

exports.addIncome = async (req, res) => {
    const userId = req.user.id
    try{
        const {icon, source, amount, date} = req.body
        if(!source ||!amount){
            return res.status(400).json({message: 'Please enter all fields'})
        }
        const dateValue = date ? new Date(date) : new Date(); 
        const newIncome = new Income({userId, icon, source, amount, date: dateValue})
        await newIncome.save()
        res.status(200).json(newIncome)
    }catch(err){
        res.status(500).json({message: 'Server Error', error: err.message})
    }
}

exports.getAllIncome = async (req, res) => {
    const userId = req.user.id
    try{
        const incomes = await Income.find({userId}).sort({date: -1})
        res.status(200).json(incomes)
    }catch(err){
        res.status(500).json({message: 'Server Error', error: err.message})
    }
}

exports.deleteIncome = async (req, res) => {
    const userId = req.user.id
    try {
        await Income.findByIdAndDelete({_id: req.params.id, userId})
        res.status(200).json({message: 'Income deleted successfully'})
    } catch (error) {
        res.status(500).json({message: 'Server Error', error: error.message})
    }
}

exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;
        try {
            const incomes = await Income.find({ userId }).sort({ date: -1 });
    
            if (incomes.length === 0) {
                return res.status(404).json({ message: "No incomes found" });
            }
    
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="income_details.pdf"');
    
            const doc = new PDFDocument();
            doc.pipe(res); 

            doc.fontSize(18).text("Income Report", { align: "center" });
            doc.moveDown(2);
    
            doc.fontSize(12).text("Source", 50, 100);
            doc.text("Amount", 250, 100);
            doc.text("Date", 400, 100);
            doc.moveDown(0.5);

            doc.moveTo(50, 120).lineTo(550, 120).stroke();

            let y = 140;
            incomes.forEach((income) => {
                doc.text(income.source, 50, y);
                doc.text(`$${income.amount.toFixed(2)}`, 250, y);
                doc.text(new Date(income.date).toLocaleDateString(), 400, y);
                y += 20;
            });
    
            doc.end(); 
    
        } catch (error) {
            console.error("Error generating PDF:", error);
            res.status(500).json({ message: "Server Error", error: error.message });
        }
}