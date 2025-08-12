import React, { createContext, useState} from 'react';

export const UserContext = createContext();

const UserProvider = ({children}) => {
    const [user, setUser] = useState(null);

    const updateUser = (userData) => {
        setUser(userData)
    }

    const clearUser = () => {
        setUser(null)
    }

    const logout = () => {
        localStorage.clear();
        clearUser();
    };

    return(
        <UserContext.Provider value={{user, updateUser, clearUser, logout}}>
            {children}
        </UserContext.Provider>
    )
}
export default UserProvider