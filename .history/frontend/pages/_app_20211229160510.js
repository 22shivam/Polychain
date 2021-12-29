import '../styles/globals.css'

const ThemeContext = React.createContext({
  user: "",
  blockchain: "",
  setUser: () => { }
});

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
