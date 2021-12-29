import '../styles/globals.css'
import { useState } from 'react';

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
