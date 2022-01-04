import React from 'react';
import '../styles/globals.css'
import { useState, createContext, useEffect } from 'react';

import 'react-toastify/dist/ReactToastify.css';
import toastError from '../lib/toastError';

const UserContext = createContext({
  userAccount: "",
  setUserAccount: () => { }
});



function MyApp({ Component, pageProps }) {
  const [userAccount, setUserAccount] = useState({});
  const value = { userAccount, setUserAccount };
  console.log(userAccount)

  useEffect(() => {
    (async () => {
      const response = await fetch("http://localhost:3001/isLoggedIn", {
        credentials: 'include'
      })
      const processedResponse = await response.json()
      if (!processedResponse.isLoggedIn) {
        setUserAccount({})
        return toastError("Please login to access your account")
      } else {
        setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
      }
    })()
  }, [])


  return (
    <UserContext.Provider value={value}>
      <Component {...pageProps} />
    </UserContext.Provider>
  )
}

export default MyApp
export { UserContext };
