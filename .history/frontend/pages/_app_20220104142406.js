import React from 'react';
import '../styles/globals.css'
import { useState, createContext, useEffect } from 'react';

import 'react-toastify/dist/ReactToastify.css';
import { CookiesProvider, useCookies } from 'react-cookie';


const UserContext = createContext({
  userAccount: "",
  setUserAccount: () => { }
});



function MyApp({ Component, pageProps }) {
  const [userAccount, setUserAccount] = useState({});
  const value = { userAccount, setUserAccount };
  const [loading, setLoading] = useState(true);
  console.log(userAccount)

  useEffect(() => {
    (async () => {
      // setLoading(true)
      const response = await fetch("http://localhost:3001/isLoggedIn", {
        credentials: 'include'
      })
      const processedResponse = await response.json()
      if (!processedResponse.isLoggedIn) {
        setUserAccount({})
        setLoading(false)
        // setHasUsername(false)
        // console.log("not logged in")
        // return toastError("Please login to access your account")
      } else {
        setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return <div type="button" class="flex justify-center items-center h-screen px-4 py-2 font-semibold leading-6 text-lg transition ease-in-out duration-150 cursor-not-allowed" disabled="">
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading...
    </div>
  }

  return (
    <CookiesProvider>
      <UserContext.Provider value={value}>
        <Component {...pageProps} />
      </UserContext.Provider>
    </CookiesProvider>
  )
}

export default MyApp
export { UserContext };
