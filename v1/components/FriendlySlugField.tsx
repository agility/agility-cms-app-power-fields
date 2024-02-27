import { useAgilityAppSDK, contentItemMethods, setHeight, openAlertModal } from "@agility/app-sdk"
import { TextInput, Button, FormInputWithAddons } from "@agility/plenum-ui"
import "@agility/plenum-ui/dist/tailwind.css"
import { useEffect, useState } from "react"

const makeFriendlyStr = (s: string): string => {
	if (!s) return ""
	let friendly = s.toLowerCase()
	friendly = friendly
		.replace(new RegExp("\\s", "g"), "-")
		.replace(new RegExp("[àáâãäå]", "g"), "a")
		.replace(new RegExp("æ", "g"), "ae")
		.replace(new RegExp("ç", "g"), "c")
		.replace(new RegExp("[èéêë]", "g"), "e")
		.replace(new RegExp("[ìíîï]", "g"), "i")
		.replace(new RegExp("ñ", "g"), "n")
		.replace(new RegExp("[òóôõö]", "g"), "o")
		.replace(new RegExp("œ", "g"), "oe")
		.replace(new RegExp("[ùúûü]", "g"), "u")
		.replace(new RegExp("[ýÿ]", "g"), "y")
		.replace(new RegExp("[^\\w\\-@-]", "g"), "-")
		.replace(new RegExp("--+", "g"), "-")

	if (friendly.lastIndexOf("-") > 0 && friendly.lastIndexOf("-") == friendly.length - 1) {
		friendly = friendly.substring(0, friendly.length - 1)
	}
	return friendly
}

const FriendlyURLField = () => {
	const { contentItem, field, fieldValue } = useAgilityAppSDK()

	const [currentTitle, setCurrentTitle] = useState<string>("")

	const regenerateSlug = async (title: string) => {
		const newVal = makeFriendlyStr(title)
		contentItemMethods.setFieldValue({ name: field?.name, value: newVal })
	}

	useEffect(() => {
		//listen for changes to the title field
		contentItemMethods.addFieldListener({
			fieldName: "Title",
			onChange: (t) => {
				setCurrentTitle(t)

				contentItemMethods?.getContentItem()?.then((ci) => {
					//only regenerate the slug if the content item is new
					const isNewContentItem = Boolean((ci?.contentID ?? -1) < 0)
					if (isNewContentItem) {
						regenerateSlug(t)
					}
				})
			}
		})
	}, [])

	useEffect(() => {
		setHeight({ height: 50 })
	}, [])

	const hasBeenSaved = !!!(contentItem && contentItem?.contentID < 0)
	const [width, setWidth] = useState<number>(document.body.clientWidth)

	useEffect(() => {
		const handleResize = () => {
			setWidth(document.body.clientWidth)
		}
		window.addEventListener("resize", handleResize)
		return () => {
			window.removeEventListener("resize", handleResize)
		}
	}, [])

	return (
		<div className="flex flex-row items-center justify-between gap-1">
			<div className="w-full p-1 ">
				<FormInputWithAddons
					type="text"
					value={fieldValue}
					trailIcon={hasBeenSaved ? "IconRefresh" : undefined}
					trailLabel={hasBeenSaved ? (width > 400 ? "Re-Generate Slug" : undefined) : undefined}
					onChange={(str: string) => {
						regenerateSlug(str)
					}}
					onCtaClick={() => {
						openAlertModal({
							title: "Re-Generate Slug",
							message:
								"By changing the URL you could create broken links. We recommend you add in a URL redirection from the old URL to the new URL. Are you sure you wish to continue?",
							okButtonText: "Re-Generate",
							cancelButtonText: "Cancel",
							iconName: "QuestionMarkCircleIcon",
							callback: (ok: boolean) => {
								if (!ok) return
								regenerateSlug(currentTitle)
							}
						})
					}}
				/>
			</div>
		</div>
	)
}

export default FriendlyURLField
