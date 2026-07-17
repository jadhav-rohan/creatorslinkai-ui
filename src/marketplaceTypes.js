/**
 * @typedef {Object} MetaBrandAccount
 * @property {string} igUserId
 * @property {string=} igUsername
 * @property {string=} pageName
 * @property {string=} tokenExpiresAt
 */

/**
 * @typedef {Object} CreatorMarketplaceSearchRequest
 * @property {string} brandIgUserId
 * @property {string=} query
 * @property {string=} username
 * @property {string[]=} creatorCountries
 * @property {string[]=} creatorStates
 * @property {number=} creatorMinFollowers
 * @property {number=} creatorMaxFollowers
 * @property {string=} creatorAgeBucket
 * @property {string[]=} creatorInterests
 * @property {string=} creatorGender
 * @property {string=} majorAudienceAgeBucket
 * @property {string=} majorAudienceGender
 * @property {string[]=} majorAudienceCountries
 * @property {string[]=} majorAudienceStates
 * @property {string=} recommendationType
 * @property {string=} latestPostActivity
 * @property {string=} followerGrowth
 * @property {string[]=} similarToCreators
 * @property {number} limit
 * @property {string=} after
 */

/**
 * @typedef {Object} MarketplaceCreator
 * @property {string=} id
 * @property {string} username
 * @property {boolean=} accountVerified
 * @property {string=} biography
 * @property {string=} country
 * @property {string=} gender
 * @property {string=} ageBucket
 * @property {Object=} insights
 * @property {string=} onboardedStatus
 * @property {string=} email
 * @property {string=} portfolioUrl
 * @property {string=} profilePictureUrl
 * @property {boolean=} brandPartnershipExperience
 */

export {};
