import dateFormat from 'dateformat';

import { formatDate, getLocalDateMatchingUtcCalendarDate, isValidDate } from 'utils/dates';
import { getPrimaryCollection } from 'utils/collections/primary';

import { DefinitelyHas, Maybe, CollectionPub, Pub } from 'types';

export const getPubLatestReleasedDate = (pub: Pub) => {
	if (pub.releases.length === 0) {
		return null;
	}
	return pub.releases
		.map((release) => new Date(release.createdAt))
		.reduce((latestDate, date) => {
			return date > latestDate ? date : latestDate;
		});
};

export const getPubCreatedDate = (pub: Pub) => {
	return pub.createdAt;
};

export const getPubPublishedDate = (pub: Pub, includeCustomPublishedAt = true) => {
	if (pub.customPublishedAt && includeCustomPublishedAt) {
		return getLocalDateMatchingUtcCalendarDate(pub.customPublishedAt);
	}
	const { releases } = pub;
	if (releases.length > 0) {
		const [firstRelease] = releases;
		return new Date(firstRelease.createdAt);
	}
	return null;
};

export const getPubPublishedDateString = (pub: Pub): string | null => {
	const publishedDate = getPubPublishedDate(pub, true);
	let publishedDateString = '';
	if (publishedDate) publishedDateString = formatDate(publishedDate);
	if (publishedDate && pub.releases.length === 0) publishedDateString += ' (Not yet released)';
	return publishedDateString || null;
};

export const getPubLatestReleaseDate = (pub: Pub, { excludeFirstRelease = false } = {}) => {
	const { releases } = pub;
	if (releases.length === 1 && excludeFirstRelease) {
		return null;
	}
	const latestRelease = releases[releases.length - 1];
	if (latestRelease) {
		return new Date(latestRelease.createdAt);
	}
	return null;
};

export const getPubUpdatedDate = ({
	pub,
	historyData = null,
}: {
	pub: Pub;
	historyData?: Maybe<{ timestamps?: number[]; latestKey?: number }>;
}) => {
	if (historyData) {
		const { timestamps, latestKey } = historyData;
		if (timestamps && typeof latestKey === 'number') {
			const latestTimestamp = timestamps[latestKey];
			return new Date(latestTimestamp);
		}
	}
	if ('draft' in pub && pub.draft?.latestKeyAt) {
		return pub.draft.latestKeyAt;
	}
	return null;
};

export const getPubCopyrightYear = (
	pub: Pub & {
		collectionPubs: DefinitelyHas<CollectionPub, 'collection'>[];
	},
): string => {
	const primaryCollection = getPrimaryCollection(pub.collectionPubs);
	if (primaryCollection) {
		const { metadata } = primaryCollection;
		if (metadata) {
			const { copyrightYear, date, publicationDate } = metadata;
			const dateSource = copyrightYear || date || publicationDate;
			if (dateSource && isValidDate(dateSource)) {
				return dateFormat(getLocalDateMatchingUtcCalendarDate(dateSource), 'yyyy');
			}
		}
	}
	const pubPublishedDate = getPubPublishedDate(pub);
	return pubPublishedDate ? dateFormat(pubPublishedDate, 'yyyy') : dateFormat('yyyy');
};
