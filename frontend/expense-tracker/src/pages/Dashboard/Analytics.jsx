import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { DatePicker } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useUserAuth } from "../../hooks/useUserAuth";

const { RangePicker } = DatePicker;

const Analytics = () => {
  useUserAuth();
  const [dateRange1, setDateRange1] = useState([]);
  const [dateRange2, setDateRange2] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const token = localStorage.getItem("token") || "";

  const [startYear, setStartYear] = useState(2022);
  const [endYear, setEndYear] = useState(2025);
  const [yearlyComparison, setYearlyComparison] = useState(null);

  useEffect(() => {
    if (!token) alert("You must be logged in to view this page.");
  }, [token]);

  const fetchData = async () => {
    if (!token) {
      alert("Authentication required!");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        API_PATHS.ANALYTICS.GET_ANALYTICS,
        {
          startDate1: dateRange1[0],
          endDate1: dateRange1[1],
          startDate2: dateRange2[0],
          endDate2: dateRange2[1],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data. Please check your API.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyComparison = async () => {
    if (!token) {
      alert("Authentication required!");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        API_PATHS.ANALYTICS.GET_MONTHLY_COMPARISON,
        { year },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formattedData = Object.entries(response.data.monthlyComparison).map(
        ([month, values]) => ({
          month,
          income: values?.income || 0,
          expense: values?.expense || 0,
        })
      );

      setMonthlyData(formattedData);
    } catch (error) {
      console.error("Error fetching monthly data:", error);
      alert("Failed to fetch data. Please check your API.");
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlyComparison = async () => {
    if (!token) {
      alert("Authentication required!");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        API_PATHS.ANALYTICS.GET_YEARLY_TRENDS,
        { startYear, endYear },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setYearlyComparison(response.data.yearlyComparison);
    } catch (error) {
      console.error("Error fetching yearly trends:", error);
      alert("Failed to fetch data. Please check your API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Analytics">
      <div className="my-10 mx-auto px-6 py-8 bg-white text-gray-800 min-h-screen rounded-xl shadow-lg">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-black">📊 Finance Comparison Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-100 border border-gray-300 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">📅 Select Range 1</h2>
            <RangePicker onChange={(dates, dateStrings) => setDateRange1(dateStrings)} />
          </div>

          <div className="bg-gray-100 border border-gray-300 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">📅 Select Range 2</h2>
            <RangePicker onChange={(dates, dateStrings) => setDateRange2(dateStrings)} />
          </div>
        </div>

        <button
          onClick={fetchData}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg transition duration-300"
        >
          🔍 Compare
        </button>

        <button
          onClick={fetchYearlyComparison}
          className="bg-green-600 hover:bg-green-500 text-white font-medium px-6 py-3 rounded-lg ml-4 transition duration-300"
        >
          📆 Yearly Trends
        </button>

        {loading && <p className="text-center text-blue-500 mt-4">Loading...</p>}
        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-100 p-6 rounded-lg shadow-sm border border-gray-300">
                <h2 className="text-lg font-semibold text-green-600 mb-2">📦 Range 1 Summary</h2>
                <p>💰 Total Income: ₹{data.range1.totalIncome}</p>
                <p>💸 Total Expense: ₹{data.range1.totalExpense}</p>
                <p>🧾 Balance: ₹{data.range1.balance}</p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg shadow-sm border border-gray-300">
                <h2 className="text-lg font-semibold text-red-600 mb-2">📦 Range 2 Summary</h2>
                <p>💰 Total Income: ₹{data.range2.totalIncome}</p>
                <p>💸 Total Expense: ₹{data.range2.totalExpense}</p>
                <p>🧾 Balance: ₹{data.range2.balance}</p>
              </div>
            </div>

            <div className="bg-gray-100 p-6 mt-8 rounded-lg shadow-sm border border-gray-300">
              <h2 className="text-xl font-semibold mb-4 text-teal-600">📈 Category Comparison</h2>

              {data?.comparison?.categoryComparison &&
              Object.keys(data.comparison.categoryComparison).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={Object.entries(data.comparison.categoryComparison).map(([category, values]) => {
                      const percentage = parseFloat(values.percentageChange.replace("%", "")) || 0;
                      return {
                        category,
                        increase: percentage > 0 ? percentage : 0,
                        decrease: percentage < 0 ? Math.abs(percentage) : 0,
                      };
                    })}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#aaa" />
                    <XAxis dataKey="category" stroke="#333" />
                    <YAxis tickFormatter={(value) => `${value}%`} stroke="#333" />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="increase"
                      stroke="#82ca9d"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="decrease"
                      stroke="#f44336"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>No category comparison data available.</p>
              )}
            </div>

            <div className="bg-gray-100 p-6 mt-8 rounded-lg shadow-sm border border-gray-300">
              <h2 className="text-xl font-semibold mb-4 text-teal-600">💡 Top Spending Categories</h2>
              {data.topSpendingCategories && data.topSpendingCategories.length > 0 ? (
                <ul>
                  {data.topSpendingCategories.map((category, index) => (
                    <li key={index}>
                      {category.category}: ₹{category.amount}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No top spending categories available.</p>
              )}
            </div>

            <div className="bg-gray-100 p-6 mt-8 rounded-lg shadow-sm border border-gray-300">
              <h2 className="text-xl font-semibold mb-4 text-teal-600">💰 Savings Rate Comparison</h2>
              <p>Range 1 Savings Rate: {data.savingsRate.range1}</p>
              <p>Range 2 Savings Rate: {data.savingsRate.range2}</p>
            </div>

            <div className="bg-gray-100 p-6 mt-8 rounded-lg shadow-sm border border-gray-300">
              <h2 className="text-xl font-semibold mb-4 text-teal-600">🚨 Anomalies</h2>
              {data.anomalies && data.anomalies.length > 0 ? (
                <ul>
                  {data.anomalies.map((anomaly, index) => (
                    <li key={index}>{anomaly}</li>
                  ))}
                </ul>
              ) : (
                <p>No anomalies detected.</p>
              )}
            </div>
          </>
        )}

        {yearlyComparison && (
          <div className="bg-gray-100 p-6 mt-8 rounded-lg shadow-sm border border-gray-300">
            <h2 className="text-xl font-semibold mb-4 text-teal-600">📆 Yearly Trends</h2>
            {Object.keys(yearlyComparison).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={Object.entries(yearlyComparison).map(([year, values]) => ({
                  year,
                  income: values?.income || 0,
                  expense: values?.expense || 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#aaa" />
                  <XAxis dataKey="year" stroke="#333" />
                  <YAxis tickFormatter={(value) => `₹${value}`} stroke="#333" />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#82ca9d"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#f44336"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No yearly trend data available.</p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;