export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
    AUTH: {
        LOGIN: "/api/v1/auth/login",
        REGISTER: "/api/v1/auth/register",
        GET_USER_INFO: "/api/v1/auth/user",    
    },
    DASHBOARD: {
        GET_DATA: "/api/v1/dashboard",
        INSIGHTS: "/api/v1/dashboard/insights",
        
    },
    INCOME: {
        ADD_INCOME: "api/v1/income/add",
        GET_ALL_INCOME: "api/v1/income/get",
        DELETE_INCOME: (incomeId) => `api/v1/income/${incomeId}`,
        DOWNLOAD_INCOME: 'api/v1/income/downloadexcel',
    },
    EXPENSE: {
        ADD_EXPENSE: "api/v1/expense/add",
        GET_ALL_EXPENSE: "api/v1/expense/get",
        DELETE_EXPENSE: (expenseId) => `api/v1/expense/${expenseId}`,
        DOWNLOAD_EXPENSE: 'api/v1/expense/downloadexcel',
    },
    IMAGE: {
        UPLOAD_IMAGE: 'api/v1/images/upload-image',
    },
    ANALYTICS: {
        GET_ANALYTICS: 'api/v1/analytics',
        GET_MONTHLY_COMPARISON: 'api/v1/analytics/monthly',
        GET_YEARLY_TRENDS: 'api/v1/analytics/yearly',
        
    },
}