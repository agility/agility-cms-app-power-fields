import { useAgilityAppSDK, contentItemMethods, setHeight, openAlertModal, useResizeHeight } from "@agility/app-sdk"
import { FormInputWithAddons } from "@agility/plenum-ui"
import { useEffect, useRef, useState } from "react"

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
	console.log(contentItem, "contentItem")
	console.log(field, "field")
	console.log(fieldValue, "fieldValue")
	const [currentTitle, setCurrentTitle] = useState<string>("")
	const containerRef = useRef<HTMLIFrameElement | null>(null)
	useResizeHeight({ ref: containerRef })

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

	// useEffect(() => {}, [])

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
		<div ref={containerRef} className="flex flex-row items-center justify-between gap-1">
			<div className="w-full p-1 ">
				<FormInputWithAddons
					type="text"
					value={fieldValue}
					trailIcon={hasBeenSaved ? "RefreshIcon" : undefined}
					trailLabel={hasBeenSaved ? (width > 400 ? "Re-Generate Slug" : undefined) : undefined}
					handleChange={(str: string) => {
						regenerateSlug(str)
					}}
					addonOffset={8}
					addonBTN={{
						onClick: () => {
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
						},
						ctaLabel: hasBeenSaved ? (width > 400 ? "Re-Generate Slug" : undefined) : undefined,
						icon: {
							icon: hasBeenSaved ? "RefreshIcon" : undefined,
							className: "h-5 w-5 text-gray-400"
						}
					}}
				/>
			</div>
		</div>
	)
}

export default FriendlyURLField
