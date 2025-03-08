import React, { useState, useCallback, useMemo } from 'react'
import { Node as SNode, Transforms, Text, createEditor, Descendant } from 'slate'
import { Button } from 'flowbite-react';

import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { css } from '@emotion/css'

import Prism from 'prismjs'
import 'prismjs/components/prism-markdown'

function withMyPlugins(editor) {
	const { insertText, insertData, normalizeNode, isVoid, isInline } = editor;
}

function getTokenLength(token) {
	if(typeof token === 'string')
		return token.length;
	else if(typeof token.content === 'string')
		return token.content.length;
	else
		return token.content.reduce((l, t) => l + getTokenLength(t), 0);
}

function decorateMarkdown([node, path]) {
	const ranges = [];

	if(!Text.isText(node)) {
		return ranges;
	}

	const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
	let start = 0;

	for(const token of tokens) {
		const length = getTokenLength(token);
		const end = start + length;
		console.debug("current token debug:", token);

		if(typeof token !== 'string') {
			ranges.push({
				[token.type]: true,
				anchor: {path, offset: start},
				focus: {path, offset: end},
			});
		}

		start = end;
	}
	return ranges;
}

function getTokenAtCursor(editor, textNode) {
	const cursorPos = editor.selection.anchor.offset

	textNode = textNode.map(n => SNode.string(n)).join('\n');

	const tokens = Prism.tokenize(textNode, Prism.languages.markdown);
	let start = 0;

	for(const token of tokens) {
		const length = getTokenLength(token);
		const end = start + length;
		console.debug("Current Token DEBUG:", editor.selection, start, end, token);
		if (start < cursorPos && end > cursorPos) {
			if(typeof token !== 'string') {
				return token.type;
			}
		}

		start = end;
	}
	return null;
}

const Editor = ({ onSubmit }) => {
	const [value, setValue] = useState(initialValue);

	const renderLeaf = useCallback(props => <Leaf {...props} />, [])

	const editor = useMemo(() => withHistory(withReact(createEditor())), []);
	//
	Prism.languages.markdown.title[1].pattern = /\S.*(?:\n|\r\n?)(?:==+|--+)(?=[ \t]*$)/m
	Prism.languages.markdown.title[1].pattern = /(?<![^\n]\n?)#.+/m
	//Prism.languages.markdown.code[1].pattern = /^```[\s\S]*?(^```$|\Z)/m
	//Prism.languages.markdown.code[1].pattern = /^(```)([a-z0-9_+\-.#]+$)?/
	//Prism.languages.markdown.title[1].pattern = /(^\s*)#.+/m
	console.debug("PRISM", Prism.languages.markdown);

	const decorate = useCallback(decorateMarkdown, []);

	function submitMessage(event) {
		event.preventDefault();
		onSubmit(value.map(n => SNode.string(n)).join('\n'));
		const newValue = [{type: 'paragraph', children: [{text: ""}]}];
		//const point = { path: [0, 0], offset: 0 }
		//editor.selection = { anchor: point, focus: point };
		//editor.history = { redos: [], undos: [] };
		//editor.children = newValue;
		Transforms.select(editor, { offset: 0, path: [0, 0] });
		editor.children.map(item => Transforms.delete(editor, { at: [0] }));
		editor.children = newValue;
		editor.onChange();
		//setValue(newValue);
	}

	return (
		<>
		<div className="grow">
			<Slate
				editor={editor}
				initialValue={value}
				onChange={(value) => {
					setValue(value);
				}}
			>
				<Editable
					decorate={decorate}
					renderLeaf={renderLeaf}
					placeholder="Message for friends"
					className="py-2 px-4 bg-stone-200 dark:bg-stone-600"
					onKeyDown={event => {
						console.log(editor.children);
						//if (event.key !== 'Enter') return next()
						//if (options.shift && event.shiftKey === false) return next()
						if (event.key === 'Enter' && event.shiftKey) {
							event.preventDefault();
							return editor.insertText('\n')
						}
						if(event.key === 'Enter' && !event.shiftKey) {
							const token = getTokenAtCursor(editor, value);
							console.debug("Current Token:", token);
							if (token === 'code') {
								event.preventDefault();
								return editor.insertText('\n')
							}
							submitMessage(event);
						}
						if(!event.ctrlKey) {
							return;
						}
					}}
				/>
			</Slate>
		</div>
		<Button type="submit" onClick={submitMessage} gradientDuoTone="purpleToBlue">Send</Button>
		</>
	);
};

const Leaf = ({ attributes, children, leaf }) => {
	console.log("LEAF:", leaf);
	let styles = css`
		font-weight: ${leaf.bold && 'bold'};
		font-style: ${leaf.italic && 'italic'};
		text-decoration: ${leaf.underlined && 'underline'};
		${leaf.title &&
		css`
			display: inline-block;
			font-weight: bold;
			font-size: 20px;
			margin: 20px 0 10px 0;
		`}
		${leaf.list &&
		css`
			padding-left: 10px;
			font-size: 20px;
			line-height: 10px;
		`}
		${leaf.hr &&
		css`
			display: block;
			text-align: center;
			border-bottom: 2px solid #ddd;
		`}
		${leaf.blockquote &&
		css`
			display: inline-block;
			border-left: 2px solid #ddd;
			padding-left: 10px;
			color: #aaa;
			font-style: italic;
		`}
		${leaf.code &&
		css`
			font-family: monospace;
			/* background-color: #eee; */
			padding: 3px;
			display: block;
		`}
		${leaf["code-snippet"] &&
		css`
			font-family: monospace;
		`}
	`;
	if (leaf.code || leaf["code-snippet"])
		styles += " dark:bg-stone-800";
	return (
		<span
			{...attributes}
			className={styles}
		>
			{children}
		</span>
	);
};

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  }
]

export default Editor;
