import unidecode from 'unidecode';
import { metaValueToString, metaValueToJsonSerializable } from '@pubpub/prosemirror-pandoc';

import { getSearchUsers } from 'server/search/queries';
import { isValidDate } from 'utils/dates';

const getAuthorsArray = (author) => {
	if (author.type === 'MetaList') {
		return author.content;
	}
	if (author.type === 'MetaInlines' || author.type === 'MetaMap') {
		return [author];
	}
	return null;
};

const getDateStringFromMetaValue = (metaDateString) => {
	const date = new Date(metaValueToString(metaDateString));
	if (isValidDate(date)) {
		return date.toUTCString();
	}
	return null;
};

const getAttributions = async (author) => {
	if (author) {
		const authorsArray = getAuthorsArray(author);
		const authorEntries = authorsArray.map(metaValueToJsonSerializable);
		const attributions = await Promise.all(
			authorEntries.map(async (authorEntry) => {
				if (typeof authorEntry === 'string') {
					const users = await getSearchUsers(authorEntry);
					return { name: authorEntry, users: users.map((user) => user.toJSON()) };
				}
				return authorEntry;
			}),
		);
		return attributions;
	}
	return null;
};

const stripFalseyValues = (object) =>
	// @ts-expect-error ts-migrate(2339) FIXME: Property 'fromEntries' does not exist on type 'Obj... Remove this comment to see the full error message
	Object.fromEntries(Object.entries(object).filter((kv) => kv[1]));

export const getProposedMetadata = async (meta) => {
	const { title, subtitle, author, authors, date, pubMetadata, slug } = meta;
	return stripFalseyValues({
		slug: slug && unidecode(metaValueToString(slug)),
		title: title && metaValueToString(title),
		description: subtitle && metaValueToString(subtitle),
		attributions: await getAttributions(authors || author),
		customPublishedAt: date && getDateStringFromMetaValue(date),
		metadata: pubMetadata !== undefined && metaValueToJsonSerializable(pubMetadata),
	});
};

export const getRawMetadata = (meta) => {
	// @ts-expect-error ts-migrate(2339) FIXME: Property 'fromEntries' does not exist on type 'Obj... Remove this comment to see the full error message
	return Object.fromEntries(
		Object.entries(meta).map(([key, value]) => [key, metaValueToJsonSerializable(value)]),
	);
};
