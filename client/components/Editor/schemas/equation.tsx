import { DOMOutputSpec, Node } from 'prosemirror-model';
import React from 'react';

import { renderHtmlChildren } from '../utils/renderHtml';
import { counter } from './reactive/counter';

export default {
	equation: {
		atom: true,
		attrs: {
			id: { default: null },
			value: { default: '' },
			html: { default: '' },
			renderForPandoc: { default: false },
		},
		parseDOM: [
			{
				tag: 'span',
				getAttrs: (node) => {
					if (node.getAttribute('data-node-type') !== 'math-inline') {
						return false;
					}

					return {
						value: node.getAttribute('data-value') || '',
						html: node.firstChild.innerHTML || '',
					};
				},
			},
		],
		toDOM: (node, { isReact } = { isReact: false }) => {
			return [
				'span',
				{
					'data-node-type': 'math-inline',
					'data-value': node.attrs.value,
				},
				renderHtmlChildren(isReact, node.attrs.html),
			] as DOMOutputSpec;
		},
		inline: true,
		group: 'inline',
		draggable: false,

		/* These are not part of the standard Prosemirror Schema spec */
		onInsert: (view) => {
			const equationNode = view.state.schema.nodes.equation.create({
				value: '\\sum_ix^i',
				html: '<span class="katex"><span class="katex-mathml"><math><semantics><mrow><msub><mo>∑</mo><mi>i</mi></msub><msup><mi>x</mi><mi>i</mi></msup></mrow><annotation encoding="application/x-tex">sum_ix^i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="strut" style="height:0.824664em;"></span><span class="strut bottom" style="height:1.124374em;vertical-align:-0.29971000000000003em;"></span><span class="base"><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:-0.0000050000000000050004em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.16195399999999993em;"><span style="top:-2.40029em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathit mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.29971000000000003em;"></span></span></span></span></span><span class="mord"><span class="mord mathit">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.824664em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathit mtight">i</span></span></span></span></span></span></span></span></span></span></span>',
			});
			const transaction = view.state.tr.replaceSelectionWith(equationNode);
			view.dispatch(transaction);
		},
	},
	block_equation: {
		atom: true,
		reactive: true,
		attrs: {
			id: { default: null },
			value: { default: '' },
			html: { default: '' },
			renderForPandoc: { default: false },
			hideLabel: { default: false },
		},
		reactiveAttrs: {
			count: counter({ useNodeLabels: true }),
		},
		parseDOM: [
			{
				tag: 'div',
				getAttrs: (node) => {
					if (node.getAttribute('data-node-type') !== 'math-block') {
						return false;
					}
					const html =
						node.querySelector('span.katex')?.outerHTML || node.firstChild.innerHTML;

					return {
						id: node.getAttribute('id') || null,
						value: node.getAttribute('data-value') || '',
						html: html || '',
					};
				},
			},
		],
		// @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
		toDOM: (node: Node, { isReact } = {}) => {
			if (node.attrs.renderForPandoc) {
				return (
					<script
						type="math/tex-display"
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={{ __html: node.attrs.value }}
					/>
				) as any;
			}
			return [
				'div',
				{
					...(node.attrs.id && { id: node.attrs.id }),
					'data-node-type': 'math-block',
					'data-value': node.attrs.value,
				},
				['span'],
				renderHtmlChildren(isReact, node.attrs.html),
				[
					'span',
					{ class: 'equation-label', spellcheck: 'false' },
					node.attrs.count ? `(${node.attrs.count})` : '',
				],
			] as DOMOutputSpec;
		},

		inline: false,
		group: 'block',

		/* These are not part of the standard Prosemirror Schema spec */
		onInsert: (view) => {
			const equationNode = view.state.schema.nodes.block_equation.create({
				value: '\\sum_ix^i',
				html: '<span class="katex"><span class="katex-mathml"><math><semantics><mrow><msub><mo>∑</mo><mi>i</mi></msub><msup><mi>x</mi><mi>i</mi></msup></mrow><annotation encoding="application/x-tex">sum_ix^i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="strut" style="height:0.824664em;"></span><span class="strut bottom" style="height:1.124374em;vertical-align:-0.29971000000000003em;"></span><span class="base"><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:-0.0000050000000000050004em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.16195399999999993em;"><span style="top:-2.40029em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathit mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.29971000000000003em;"></span></span></span></span></span><span class="mord"><span class="mord mathit">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.824664em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathit mtight">i</span></span></span></span></span></span></span></span></span></span></span>',
			});
			const transaction = view.state.tr.replaceSelectionWith(equationNode);
			view.dispatch(transaction);
		},
	},
};
