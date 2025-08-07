import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import IncomeOverview from '../../components/Income/IncomeOverview'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import Modal from '../../components/Modal'
import AddIncomeForm from '../../components/Income/AddIncomeForm'
import toast from 'react-hot-toast'
import IncomeList from '../../components/Income/IncomeList'
import DeleteAlert from '../../components/DeleteAlert'
import { useUserAuth } from '../../hooks/useUserAuth'


const Income = () => {
  useUserAuth()
  const [incomeData, setIncomeData] = useState([])
  const [loading, setLoading] = useState(false)
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  })
  const [openAddIncomeModel, setOpenAddIncomeModel] = useState(false)

  const fetchIncomeDetails = async () => {
    if (loading)
      return;
    setLoading(true)

    try {
      const response = await axiosInstance.get(`${API_PATHS.INCOME.GET_ALL_INCOME}`)
      if (response.data) {
        setIncomeData(response.data)
      }
    } catch (error) {
      console.error('Something went wrong. Please try again', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddIncome = async (income) => {
    const { source, amount, date, icon } = income;

    if (!source.trim()) {
      toast.error("Source is required.");
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
      const response = await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {
        source,
        amount,
        date,
        icon,
      });

      if (response.data) {
        setIncomeData((prevIncomeData) => [...prevIncomeData, response.data]); 
      }

      setOpenAddIncomeModel(false);
      toast.success("Income added successfully");
    } catch (error) {
      console.log("Error adding income:", error.response?.data?.message || error.message);
    }
  };


  const deleteIncome = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id))
      setOpenDeleteAlert({ show: false, data: null })
      toast.success("Income deleted successfully");
      fetchIncomeDetails()
    } catch (error) {
      console.log('Error deleting income:', error.response?.data?.message || error.message)
    }
  }

  const handleDownloadIncomeDetails = async (id) => {
    try {
      const response = await axiosInstance.get(API_PATHS.INCOME.DOWNLOAD_INCOME, {
        responseType: 'blob', // Ensure we handle binary response
      });

      if (!response.data) {
        toast.error("No income details available to download.");
        return;
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "income_details.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Income details downloaded successfully!");
    } catch (error) {
      console.log("Error downloading income details:", error.response?.data?.message || error.message);
      toast.error("Failed to download income details. Please try again.");
    }
  }

  useEffect(() => {
    fetchIncomeDetails()
    return () => { }
  }, [])
  return (
    <DashboardLayout activeMenu="Income">
      <div className='my-5 mx-auto'>
        <div className='grid grid-cols-1 gap-6'>
          <div className=''>
            <IncomeOverview
              transactions={incomeData}
              onAddIncome={() => setOpenAddIncomeModel(true)} />
          </div>
          <IncomeList
            transactions={incomeData}
            onDelete={(id) => {
              setOpenDeleteAlert({ show: true, data: id });
            }}
            onDownLoad={handleDownloadIncomeDetails} />
        </div>
        <Modal
          isOpen={openAddIncomeModel}
          onClose={() => setOpenAddIncomeModel(false)}
          title='Add Income'>
          <AddIncomeForm onAddIncome={handleAddIncome} />
        </Modal>
        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title='Delete Income'>
          <DeleteAlert
            content='Are you sure you want to delete this income details?'
            onDelete={() => deleteIncome(openDeleteAlert.data)} />

        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default Income