import { Community } from 'server/models';
import { getScope } from 'server/utils/queryHelpers';
import { licenses } from 'utils/licenses';

import { getValidCollectionIdsFromCreatePubToken } from './tokens';

const managerUpdatableFields = [
	'avatar',
	'citationInlineStyle',
	'citationStyle',
	'customPublishedAt',
	'description',
	'downloads',
	'draftPermissions',
	'headerBackgroundColor',
	'headerBackgroundImage',
	'headerStyle',
	'labels',
	'licenseSlug',
	'slug',
	'title',
	'htmlTitle',
	'nodeLabels',
	'pubEdgeListingDefaultsToCarousel',
	'pubEdgeDescriptionVisible',
];

const adminUpdatableFields = ['doi'];

const isValidLicenseSlugForCommunity = (community, licenseSlug) => {
	return (
		!licenseSlug ||
		community.premiumLicenseFlag ||
		!licenses.find((l) => l.slug === licenseSlug)?.requiresPremium
	);
};

export const canCreatePub = async ({ userId, communityId, collectionId, createPubToken }) => {
	if (userId) {
		if (createPubToken) {
			const collectionIds = getValidCollectionIdsFromCreatePubToken(createPubToken, {
				userId,
				communityId,
			});
			if (collectionIds) {
				return { create: true, collectionIds };
			}
			return { create: false };
		}

		const [scopeData, communityData] = await Promise.all([
			getScope({ communityId, collectionId, loginId: userId }),
			Community.findOne({ where: { id: communityId }, attributes: ['hideCreatePubButton'] }),
		]);

		const {
			activePermissions: { canManage },
		} = scopeData;
		const { hideCreatePubButton } = communityData;

		return {
			create: canManage || !hideCreatePubButton,
			collectionIds: [collectionId],
		};
	}
	return { create: false };
};

export const getUpdatablePubFields = async ({ userId, pubId, licenseSlug }) => {
	const {
		elements: { activeCommunity },
		activePermissions: { canManage, canAdmin },
	} = await getScope({ pubId, loginId: userId });

	if (!isValidLicenseSlugForCommunity(activeCommunity, licenseSlug)) {
		return null;
	}

	if (canManage) {
		if (canAdmin) {
			return [...managerUpdatableFields, ...adminUpdatableFields];
		}
		return managerUpdatableFields;
	}

	return null;
};

export const canDestroyPub = async ({ userId, pubId }) => {
	const {
		activePermissions: { canManage },
	} = await getScope({ pubId, loginId: userId });
	return canManage;
};
