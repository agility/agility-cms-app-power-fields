import { FOCUS_EVENTS, handleFieldFocusEvent } from "@/methods/handleFieldFocusEvent"
import { useAgilityAppSDK, contentItemMethods, useResizeHeight } from "@agility/app-sdk"
import React from "react"

import SimpleMDE from "react-simplemde-editor"

const MarkdownEditor = () => {
	const { fieldValue } = useAgilityAppSDK()
	const containerRef = useResizeHeight(2)

	const markdownValues = fieldValue

	const onChange = (value: string) => {
		contentItemMethods.setFieldValue({ value })
	}

	return (
		<div ref={containerRef} className="min-h-[400px] bg-white">
			<SimpleMDE
				id="simple-mde"
				value={markdownValues}
				onChange={onChange}
				onFocus={() => {
					handleFieldFocusEvent({ eventName: FOCUS_EVENTS.FOCUS })
				}}
				onBlur={() => {
					handleFieldFocusEvent({ eventName: FOCUS_EVENTS.BLUR })
				}}
			/>
		</div>
	)
}

export default MarkdownEditor
