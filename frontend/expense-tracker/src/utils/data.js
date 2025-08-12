import { LuLayoutDashboard, LuHandCoins, LuWalletMinimal, LuLogOut } from "react-icons/lu";
import { DiGoogleAnalytics } from "react-icons/di";

export const SIDE_MENU_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/dashboard",
    },
    {
        id: "02",
        label: "Income",
        icon: LuWalletMinimal,
        path: "/income",
    },
    {
        id: "03",
        label: "Expense",
        icon: LuHandCoins,
        path: "/expense",
    },
    {
        id: "04",
        label: "Analytics",
        icon: DiGoogleAnalytics,
        path: "/analytics",
    },
    {
        id: "05",
        label: "Logout",
        icon: LuLogOut,
        path: "/",
    },
]