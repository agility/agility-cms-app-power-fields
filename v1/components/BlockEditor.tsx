import React, { useState, useEffect, useRef, useMemo } from "react"
import {
	contentItemMethods,
	useAgilityAppSDK,
	setHeight,
	getManagementAPIToken,
	useResizeHeight
} from "@agility/app-sdk"
import useOnScreen from "../hooks/useOnScreen"

import EditorJS, { OutputData } from "@editorjs/editorjs"
import Embed from "@editorjs/embed"
import Table from "@editorjs/table"
import Paragraph from "@editorjs/paragraph"
import Warning from "@editorjs/warning"
import Code from "@editorjs/code"
import Image from "@editorjs/image"
import Raw from "@editorjs/raw"
import Header from "@editorjs/header"
import Quote from "@editorjs/quote"
import Marker from "@editorjs/marker"
import Delimiter from "@editorjs/delimiter"
import InlineCode from "@editorjs/inline-code"
import NestedList from "@editorjs/nested-list"
import DragDrop from "editorjs-drag-drop"
import { useCallback } from "react"

const BlockEditor = ({ configuration }: { configuration: any }) => {
	const { initializing, instance, fieldValue } = useAgilityAppSDK()
	const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
	const containerRef = useRef<HTMLIFrameElement>(null)
	const blockRef = useRef<HTMLIFrameElement>(null)
	const savedValue = useRef<string | null>(null)

	useResizeHeight({ ref: containerRef })

	const isVisible = useOnScreen(containerRef)

	const [token, setToken] = useState()

	const editor = useRef<EditorJS | null>(null)

	// Get the ManagementAPIToken
	useEffect(() => {
		const getToken = async () => {
			const token = await getManagementAPIToken()
			setToken(token)
		}
		getToken()
	}, [])

	useEffect(() => {
		//handle changes to the field value from outside the editor

		if (!editor.current) return
		if (savedValue.current === null) return

		try {
			const blocks = JSON.parse(fieldValue) as OutputData
			if (fieldValue !== savedValue.current) {
				if (!fieldValue || blocks.blocks.length == 0) {
					editor.current.clear()
				} else {
					if (blocks) {
						editor.current.render(blocks)
					}
				}
			}
		} catch (e) {
			console.warn("Error parsing JSON for Block Editor", e)
		}
	}, [fieldValue, editor])

	const initEditor = useCallback(() => {
		if (fieldValue && editor.current) {
			try {
				const blocks = JSON.parse(fieldValue) as OutputData

				if (blocks.blocks.length == 0) {
					editor.current.clear()
				} else {
					editor.current.render(blocks)
				}
			} catch (e) {
				console.warn("Error parsing JSON for Block Editor", e)
			}
		}
	}, [editor.current, fieldValue])

	useEffect(() => {
		//initialize the editor
		if (!blockRef.current || !token || initializing) return

		if (editor.current) return

		const uploadImagePayload = {
			guid: instance?.guid,
			token,
			assetFolder: configuration.assetFolder ?? "/images/block-editor"
		}

		const editorJS = new EditorJS({
			autofocus: false, //setting this to true will not do anything because this is in an iframe
			holder: blockRef.current,
			placeholder: "📝 Enter text, paste images/embed urls, or select a block to add here...",
			inlineToolbar: true,

			tools: {
				table: Table,
				paragraph: {
					class: Paragraph,
					inlineToolbar: true
				},
				list: {
					class: NestedList,
					inlineToolbar: true
				},
				warning: Warning,
				code: Code,
				image: {
					class: Image,
					config: {
						endpoints: {
							byFile: "/api/image/uploadByFile",
							byUrl: "/api/image/fetchByUrl"
						},
						additionalRequestData: { ...uploadImagePayload }
					}
				},
				raw: Raw,
				header: Header,
				quote: Quote,
				marker: Marker,
				delimiter: Delimiter,
				inlineCode: InlineCode,
				embed: Embed
			},
			onChange: (e: any) => {
				editorJS.save().then((v) => {
					//remove the time and version properties - we ONLY care about the blocks
					delete v.time
					delete v.version
					const valueJSON = JSON.stringify(v)
					if (valueJSON !== fieldValue) {
						savedValue.current = valueJSON
						contentItemMethods.setFieldValue({ value: valueJSON })
					}
				})
			},
			onReady: () => {
				// const blockSizeElm = document.querySelector<HTMLElement>("#container-element")
				// if (blockSizeElm) {
				// 	const observer = new ResizeObserver((entries) => {
				// 		const entry = entries[0]
				// 		if (!entry) return
				// 		let height = entry.contentRect.height + 50
				// 		if (height < 400) height = 400

				// 		setHeight({ height })
				// 	})
				// 	observer.observe(blockSizeElm)
				// }

				new DragDrop(editorJS)

				initEditor()
			}
		})

		editor.current = editorJS
	}, [blockRef, initializing, token])

	// Resize the editor when the container resizes
	useEffect(() => {
		if (!blockRef.current || !containerRef.current) return

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0]
			if (!entry || !blockRef.current) return
			const { width, height } = entry.contentRect
			setContainerDimensions({ width, height })
			const editorElem = document.getElementById("editor-elem")
			const nextElem = document.getElementById("__next")
			if (nextElem) {
				nextElem.style.backgroundColor = "white"
				nextElem.style.borderRadius = "3px"
			}
			// if (editorElem) {
			// 	editorElem.style.width = `${width}px`
			// }
		})

		observer.observe(containerRef.current)

		return () => {
			observer.disconnect()
		}
	}, [containerDimensions, blockRef, containerRef])
	return (
		<div className="w-full rounded-[3px] bg-white" ref={containerRef} id="container-element">
			<div
				className="prose mx-auto max-h-[400px] min-h-[400px] !max-w-[100rem] overflow-y-auto rounded-[3px] px-4 pb-14   pt-2"
				style={{ backgroundColor: "white" }}
				id="editor-elem"
				ref={blockRef}
			></div>
		</div>
	)
}

export default BlockEditor
