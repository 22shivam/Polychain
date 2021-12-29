import '../styles/globals.css'
import { useState } from 'react';

const UserContext = React.createContext({
  user: "",
  setUser: () => { }
});

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState("");
  const value = { user, setUser };


  return (
    <UserContext.Provider value={value}>
      <Component {...pageProps} />
    </UserContext.Provider>
  )
}

export default MyApp
