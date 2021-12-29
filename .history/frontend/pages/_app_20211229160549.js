import '../styles/globals.css'

const UserContext = React.createContext({
  user: "",
  blockchain: "",
  setUser: () => { }
});

function MyApp({ Component, pageProps }) {
  return (
    <UserContext.Provider>
      <Component {...pageProps} />
    </UserContext.Provider>
  )
}

export default MyApp
