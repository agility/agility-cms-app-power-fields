import { AppProps } from "next/app"
import "../styles/globals.css"
import "../styles/index.scss"
import "@agility/plenum-ui/dist/tailwind.css"
import "easymde/dist/easymde.min.css"

function MyApp({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />
}

export default MyApp
