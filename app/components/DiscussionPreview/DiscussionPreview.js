import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from 'components/Avatar/Avatar';

require('./discussionPreview.scss');

const propTypes = {
	discussions: PropTypes.array.isRequired,
	slug: PropTypes.string.isRequired,
	isPresentation: PropTypes.bool,
};

const defaultProps = {
	isPresentation: false,
};

const DiscussionPreview = function(props) {
	const hasAttachments = props.discussions.reduce((prev, curr)=> {
		return prev || curr.attachments;
	}, false);
	const hasSuggestions = props.discussions.reduce((prev, curr)=> {
		return prev || curr.suggestions;
	}, false);
	const hasHighlight = props.discussions.reduce((prev, curr)=> {
		return prev || curr.highlight;
	}, false);

	const sortedDiscussions = props.discussions.sort((foo, bar)=> {
		if (foo.date > bar.date) { return 1; }
		if (foo.date < bar.date) { return -1; }
		return 0;
	});

	const toUrl = props.isPresentation
		? `/pub/${props.slug}?thread=${props.discussions[0].threadNumber}`
		: `/pub/${props.slug}/collaborate?thread=${props.discussions[0].threadNumber}`;

	return (
		<Link className={'discussion-preview'} to={toUrl}>
			<div className={'icons'}>
				{hasAttachments &&
					<span className={'pt-icon-standard pt-icon-paperclip'} />
				}
				{hasSuggestions &&
					<span className={'pt-icon-standard pt-icon-doc'} />
				}
				{hasHighlight &&
					<span className={'pt-icon-standard pt-icon-highlight'} />
				}
			</div>

			<div className={'title'}>{sortedDiscussions[0].title}</div>

			<div>
				{sortedDiscussions.slice(0, 3).map((discussion)=> {
					return (
						<div className={'discussion'} key={`discussion-preview-${discussion.id}`}>
							<Avatar
								width={20}
								userInitials={discussion.author.intials}
								userAvatar={discussion.author.avatar}
							/>
							<div className={'text'}>{discussion.text}</div>
						</div>
					);
				})}
			</div>
			{sortedDiscussions.length > 3 &&
				<div className={'more'}>
					{sortedDiscussions.length - 3} more...
				</div>
			}
			<div className={'bottom-border'} />
		</Link>
	);
};

DiscussionPreview.propTypes = propTypes;
DiscussionPreview.defaultProps = defaultProps;
export default DiscussionPreview;
