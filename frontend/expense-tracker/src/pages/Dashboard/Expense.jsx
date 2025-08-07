import React, { useEffect, useState } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import ExpenseOverview from "../../components/Expense/ExpenseOverview";
import Modal from "../../components/Modal";
import AddExpenseForm from "../../components/Expense/AddExpenseForm";
import ExpenseList from "../../components/Expense/ExpenseList";
import DeleteAlert from "../../components/DeleteAlert";
import Calander from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Expense = () => {
  useUserAuth();
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [openAddExpenseModel, setOpenAddExpenseModel] = useState(false);
  const [dailyExpenses, setDailyExpenses] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  const fetchExpenseDetails = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`
      );
      if (response.data) {
        setExpenseData(response.data);
        calculateDailyExpenses(response.data);
      }
    } catch (error) {
      console.error("Something went wrong. Please try again", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expense) => {
    const { category, amount, date, icon } = expense;

    if (!category.trim()) {
      toast.error("Category is required.");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Amount is required and should be a positive number.");
      return;
    }

    if (!date) {
      toast.error("Date is required.");
      return;
    }

    try {
      const response = await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        category,
        amount,
        date,
        icon,
      });

      if (response.data) {
        setExpenseData((prevExpenseData) => [...prevExpenseData, response.data]);
        calculateDailyExpenses([...expenseData, response.data]); 
        filterExpensesByDate(selectedDate, [...expenseData, response.data]); 
      }

      setOpenAddExpenseModel(false);
      toast.success("Expense added successfully");
    } catch (error) {
      console.log(
        "Error adding expense:",
        error.response?.data?.message || error.message
      );
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Expense deleted successfully");
      fetchExpenseDetails();
    } catch (error) {
      console.log(
        "Error deleting expense:",
        error.response?.data?.message || error.message
      );
    }
  };


  const calculateDailyExpenses = (expenses) => {
    const dailyExpenseMap = {};
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];

      dailyExpenseMap[localDate] =
        (dailyExpenseMap[localDate] || 0) + expense.amount;
    });
    setDailyExpenses(dailyExpenseMap);
  };

  const filterExpensesByDate = (date, expenses = expenseData) => {
    const formattedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];

    const filtered = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
        .toISOString()
        .split("T")[0];
      return expenseDate === formattedDate;
    });

    setFilteredExpenses(filtered);
  };

  useEffect(() => {
    fetchExpenseDetails();
  }, []);

  useEffect(() => {
    filterExpensesByDate(selectedDate);
  }, [selectedDate, expenseData]);

  return (
    <DashboardLayout activeMenu="Expense">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <ExpenseOverview
              transactions={expenseData}
              onAddExpense={() => setOpenAddExpenseModel(true)}
            />
          </div>

          <ExpenseList
            transactions={expenseData}
            onDelete={(id) => {
              setOpenDeleteAlert({ show: true, data: id });
            }}
          />
        </div>

        <Modal
          isOpen={openAddExpenseModel}
          onClose={() => setOpenAddExpenseModel(false)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense} />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Expense"
        >
          <DeleteAlert
            content="Are you sure you want to delete this expense details?"
            onDelete={() => deleteExpense(openDeleteAlert.data)}
          />
        </Modal>

        <div className="mt-8 p-8 bg-white shadow-md rounded-2xl border border-gray-200">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
            📅 Expense Calendar
          </h2>
          <div className="flex justify-center">
            <div className="p-6 bg-white rounded-xl shadow-md border border-gray-300 hover:shadow-lg transition-all duration-300">
              <Calander
                onChange={setSelectedDate}
                value={selectedDate}
                className="w-full max-w-md bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
                tileContent={({ date }) => {
                  const dateString = date.toLocaleDateString("en-CA");
                  const expenseAmount = dailyExpenses[dateString] || 0;
                  return (
                    <p
                      className={`text-sm font-medium mt-1 transition-all duration-300 ${expenseAmount > 0 ? "text-red-500" : "text-green-500"
                        }`}
                    >
                      ₹{expenseAmount}
                    </p>
                  );
                }}
              />
            </div>
          </div>
          <div className="mt-8 bg-gray-50 p-5 rounded-lg shadow-md border border-gray-300 text-center hover:shadow-lg transition-all duration-300">
            <p className="text-gray-600 text-sm uppercase tracking-wide">
              Total Expenses on:
            </p>
            <p className="font-semibold text-lg text-gray-900 mt-2">
              {selectedDate.toLocaleDateString("en-CA")}
            </p>
            <p
              className={`font-bold text-xl mt-3 transition-all duration-300 ${dailyExpenses[selectedDate.toLocaleDateString("en-CA")] > 0
                  ? "text-red-600"
                  : "text-green-600"
                }`}
            >
              ₹{dailyExpenses[selectedDate.toLocaleDateString("en-CA")] || 0}
            </p>
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Expenses on Selected Date:</h3>
            <ExpenseList transactions={filteredExpenses} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Expense;
