// import FriendlyURLField from "@/components/FriendlySlugField"
import { useAgilityAppSDK } from "@agility/app-sdk"
import dynamic from "next/dynamic"
const FriendlyURLField = dynamic(() => import("../../components/FriendlySlugField"), { ssr: false })

export default function FriendlyURLPage() {
	const { initializing } = useAgilityAppSDK()
	if (initializing) return null
	return <FriendlyURLField />
}
