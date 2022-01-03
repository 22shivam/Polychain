import React from 'react';
import '../styles/globals.css'
import { useState, createContext } from 'react';

import 'react-toastify/dist/ReactToastify.css';

const UserContext = createContext({
  userAccount: "",
  setUserAccount: () => { }
});

function MyApp({ Component, pageProps }) {
  const [userAccount, setUserAccount] = useState({});
  const value = { userAccount, setUserAccount };
  console.log(userAccount)


  return (
    <UserContext.Provider value={value}>
      <Component {...pageProps} />
    </UserContext.Provider>
  )
}

export default MyApp
export { UserContext };
