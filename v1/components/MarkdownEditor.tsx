import { useAgilityAppSDK, contentItemMethods, useResizeHeight } from "@agility/app-sdk"
import React, { useState, useEffect, useRef, useMemo } from "react"
import useOnScreen from "../hooks/useOnScreen"
import SimpleMDE from "react-simplemde-editor"

const MarkdownEditor = () => {
	const { fieldValue } = useAgilityAppSDK()
	const containerRef = useRef<HTMLIFrameElement | null>(null)
	const isVisible = useOnScreen(containerRef)

	useResizeHeight({ ref: containerRef })

	const markdownValues = fieldValue

	const [markdownHeight, setMarkdownHeight] = useState(500)

	const onChange = (value: string) => {
		contentItemMethods.setFieldValue({ value })
	}

	// listen for simple-mde resizing events
	useEffect(() => {
		const mdeSizeElm = document.querySelector<HTMLElement>(".CodeMirror-sizer")
		if (!isVisible || !mdeSizeElm) return
		const observer = new ResizeObserver((entries) => {
			const entry = entries[0]
			if (!entry) return
			setMarkdownHeight(entry.contentRect.height)
		})
		observer.observe(mdeSizeElm)

		return () => observer.disconnect()
	}, [isVisible])

	return (
		<div ref={containerRef} className="min-h-[400px] ">
			<SimpleMDE id="simple-mde" value={markdownValues} onChange={onChange} />
		</div>
	)
}

export default MarkdownEditor
