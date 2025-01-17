/* eslint-disable react/no-danger */
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Checkbox } from '@blueprintjs/core';
import { useDebounce } from 'use-debounce';

import { renderLatexString } from 'client/utils/editor';
import { getCurrentNodeLabels, EditorChangeObject, ReferenceableNodeType } from 'components/Editor';

import { NodeType } from 'prosemirror-model';
import { EditorChangeObjectWithNode } from '../types';
import { ControlsButton, ControlsButtonGroup } from './ControlsButton';
import { ControlsReferenceSettingsLink } from './ControlsReference';

require('./controls.scss');

type Props = {
	onClose: (...args: any[]) => any;
	pendingAttrs: any;
	editorChangeObject: EditorChangeObjectWithNode;
};

const getSchemaDefinitionForNodeType = (
	editorChangeObject: EditorChangeObject,
	nodeTypeName: string,
) => {
	return editorChangeObject.view.state.schema.nodes[nodeTypeName] as NodeType;
};

const docAcceptsBlockEquation = (editorChangeObject: EditorChangeObject) => {
	const docDefinition = getSchemaDefinitionForNodeType(editorChangeObject, 'doc');
	const blockEquationDefinition = getSchemaDefinitionForNodeType(
		editorChangeObject,
		'block_equation',
	);
	return docDefinition.contentMatch.matchType(blockEquationDefinition);
};

const ControlsEquation = (props: Props) => {
	const { editorChangeObject, pendingAttrs, onClose } = props;
	const { changeNode, updateNode, selectedNode } = editorChangeObject;
	const {
		commitChanges,
		hasPendingChanges,
		updateAttrs,
		attrs: { value, html },
	} = pendingAttrs;
	const [debouncedValue] = useDebounce(value, 250);
	const hasMountedRef = useRef(false);
	const toggleLabel = useCallback(
		(e: React.MouseEvent) => updateNode({ hideLabel: (e.target as HTMLInputElement).checked }),
		[updateNode],
	);
	const isBlock = selectedNode.type.name === 'block_equation';
	const nodeLabels = getCurrentNodeLabels(editorChangeObject.view.state);
	const canHideLabel = nodeLabels[selectedNode.type.name as ReferenceableNodeType]?.enabled;
	const [canConvertToBlock] = useState(() => docAcceptsBlockEquation(editorChangeObject));

	useEffect(() => {
		// Avoid an initial call to the server's LaTeX renderer on mount
		// We shouldn't need this anyway -- but moreover, it will sometimes produce HTML that is
		// insubstantially different from that given in our Prosemirror schema definitions, making
		// it appear as though there is a user-driven change to the node that needs to be committed
		// or reverted.
		if (!hasMountedRef.current) {
			hasMountedRef.current = true;
			return;
		}
		renderLatexString(debouncedValue, isBlock, (nextHtml) => {
			updateAttrs({ html: nextHtml });
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedValue, isBlock]);

	const handleUpdate = () => {
		commitChanges();
		onClose();
	};

	const handleChangeNodeType = () => {
		const targetNodeType = isBlock ? 'equation' : 'block_equation';
		const schemaDefinition = getSchemaDefinitionForNodeType(editorChangeObject, targetNodeType);
		renderLatexString(debouncedValue, !isBlock, (nextHtml) => {
			commitChanges();
			changeNode(schemaDefinition, { value, html: nextHtml }, null);
		});
	};

	return (
		<div className="controls-equation-component">
			<div className="section">
				<textarea
					className="latex"
					placeholder="Enter LaTeX"
					value={value}
					onChange={(evt) => updateAttrs({ value: evt.target.value })}
				/>
			</div>
			{html && (
				<div className="section">
					<div className="title">Preview</div>
					<div className="preview" dangerouslySetInnerHTML={{ __html: html }} />
					{isBlock && canHideLabel && (
						<Checkbox
							onClick={toggleLabel}
							label="Hide label"
							checked={selectedNode?.attrs?.hideLabel}
						>
							{!canHideLabel && (
								<>
									{' '}
									(
									<ControlsReferenceSettingsLink dark small />)
								</>
							)}
						</Checkbox>
					)}
					<ControlsButtonGroup>
						{canConvertToBlock && (
							<ControlsButton onClick={handleChangeNodeType}>
								Change to {isBlock ? 'inline' : 'block'}
							</ControlsButton>
						)}
						<ControlsButton disabled={!hasPendingChanges} onClick={handleUpdate}>
							Update equation
						</ControlsButton>
					</ControlsButtonGroup>
				</div>
			)}
		</div>
	);
};
export default ControlsEquation;
