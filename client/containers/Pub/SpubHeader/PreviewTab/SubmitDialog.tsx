import React, { useState } from 'react';

import { Callout, Button, Classes, Dialog } from '@blueprintjs/core';
import { apiFetch } from 'client/utils/apiFetch';
import { Submission, SubmissionStatus, DefinitelyHas } from 'types';
import { Editor } from 'components';

type Props = {
	submission: DefinitelyHas<Submission, 'submissionWorkflow'>;
	isOpen: boolean;
	onClose: () => any;
};

const SubmitDialog = (props: Props) => {
	const [isHandlingSubmission, setIsHandlingSubmission] = useState(false);
	const [updatedSubmission, setUpdatedSubmission] = useState(null);
	const [submissionErr, setSubmissionErr] = useState(null);
	const onSubmit = () => {
		setIsHandlingSubmission(true);
		apiFetch
			.put('/api/submissions', {
				id: props.submission.id,
				status: 'pending' as SubmissionStatus,
			})
			.then((submissionRes) => setUpdatedSubmission(submissionRes))
			.catch((err) => setSubmissionErr(err))
			.finally(() => setIsHandlingSubmission(false));
	};
	return (
		<Dialog isOpen={props.isOpen} onClose={props.onClose}>
			{submissionErr ? (
				<Callout intent="warning" title="There was an error submitting this Pub." />
			) : updatedSubmission ? (
				<>
					<div className={Classes.DIALOG_BODY}>
						<Callout intent="success" title="Submitted!">
							Your Pub has been submitted for review.
						</Callout>
					</div>
					<div className={Classes.DIALOG_FOOTER}>
						<div className={Classes.DIALOG_FOOTER_ACTIONS}>
							<Button onClick={props.onClose} disabled={isHandlingSubmission}>
								Close
							</Button>
							<Button
								onClick={() => window.location.reload()}
								loading={isHandlingSubmission}
								intent="primary"
							>
								View Submission
							</Button>
						</div>
					</div>
				</>
			) : (
				<>
					<div className={Classes.DIALOG_BODY}>
						<Callout title="Submit Pub?">Are you ready to submit this Pub?</Callout>
					</div>
					<div className={Classes.DIALOG_FOOTER}>
						<div className={Classes.DIALOG_FOOTER_ACTIONS}>
							<Button onClick={props.onClose} disabled={isHandlingSubmission}>
								Cancel
							</Button>
							<Button
								onClick={onSubmit}
								loading={isHandlingSubmission}
								intent="primary"
							>
								Submit
							</Button>
						</div>
					</div>
				</>
			)}
		</Dialog>
	);
};

export default SubmitDialog;
