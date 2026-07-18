/** @typedef {{reel:number|null,story:number|null,post:number|null,video:number|null,collaboration:number|null}} MediaKitPricing */
/** @typedef {{displayName:string|null,handle:string|null,profilePictureUrl:string|null,followers:number|null,engagementRate:number|null,averageViews:number|null,averageLikes:number|null,metricsCapturedAt:string|null}} MediaKitPreview */
/** @typedef {{exists:boolean,complete:boolean,id:string|null,workspaceId:string,about:string|null,currency:string,pricing:MediaKitPricing,brandsWorkedWith:string[],contact:{email:string|null,phone:string|null},preview:MediaKitPreview,createdAt:string|null,updatedAt:string|null}} MediaKitResponse */
export const mediaKitKey=(workspaceId,igUserId)=>["media-kit",workspaceId,igUserId||null];
