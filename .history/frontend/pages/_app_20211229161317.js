import React from 'react';
import '../styles/globals.css'
import { useState }, React from 'react';

const UserContext = React.createContext({
  userAccount: "",
  setUserAccount: () => { }
});

function MyApp({ Component, pageProps }) {
  const [userAccount, setUserAccount] = useState("");
  const value = { userAccount, setUserAccount };


  return (
    <UserContext.Provider value={value}>
      <Component {...pageProps} />
    </UserContext.Provider>
  )
}

export default MyApp
export { UserContext };
