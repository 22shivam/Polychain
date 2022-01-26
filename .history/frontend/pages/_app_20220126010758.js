import React from 'react';
import '../styles/globals.css'
import { useState, createContext, useEffect } from 'react';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

import 'react-toastify/dist/ReactToastify.css';
import { CookiesProvider, useCookies } from 'react-cookie';
import toastError from '../lib/toastError';

const WalletConnectorContext = createContext({
  connector: new WalletConnect({
    bridge: "https://bridge.walletconnect.org", // Required
    qrcodeModal: QRCodeModal,
  }),
})

const UserContext = createContext({
  userAccount: "",
  setUserAccount: () => { },
  walletConnect: false
});



function MyApp({ Component, pageProps }) {
  const [userAccount, setUserAccount] = useState({});
  const value = { userAccount, setUserAccount };
  const [loading, setLoading] = useState(true);
  const [cookies, setCookie] = useCookies(['token']);

  useEffect(() => {
    (async () => {
      try {
        // setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/isLoggedIn`, {
          credentials: 'include'
        })
        const processedResponse = await response.json()
        if (!processedResponse.isLoggedIn) {
          setUserAccount({})
          setLoading(false)
          // setHasUsername(false)
          // return toastError("Please login to access your account")
        } else {
          setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
          setLoading(false)
        }
      } catch (e) {
        setUserAccount({})
        setLoading(false)
        toastError("Something went wrong. Please try again.")
      }
    })()
  }, [])

  if (loading) {
    return <div type="button" className="flex justify-center items-center h-screen px-4 py-2 font-semibold leading-6 text-lg transition ease-in-out duration-150 cursor-not-allowed" disabled="">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading...
    </div>
  }

  return (
    <CookiesProvider>
      <WalletConnectorContext.Provider>
        <UserContext.Provider value={value}>
          <Component {...pageProps} />
        </UserContext.Provider>
      </WalletConnectorContext.Provider>
    </CookiesProvider>
  )
}

export default MyApp
export { UserContext, WalletConnectorContext };
