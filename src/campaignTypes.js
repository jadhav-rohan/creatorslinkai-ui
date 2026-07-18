/** @typedef {'DRAFT'|'ACTIVE'|'PAUSED'|'COMPLETED'|'CANCELLED'} CampaignStatus */
/** @typedef {'INVITED'|'NEGOTIATING'|'ACCEPTED'|'DECLINED'|'CONTRACTED'|'COMPLETED'} CampaignCreatorStatus */
/** @typedef {'ACTIVE'|'SCRIPTING'|'VIDEO_REVIEW'|'LIVE'|'PAYMENT'} CampaignCreatorWorkflowStatus */
/** @typedef {{creatorProfileId:string,instagramUsername:string,followersCount:number,profilePictureUrl?:string,claimed:boolean,sourceListId?:string,status:CampaignCreatorStatus,workflowStatus?:CampaignCreatorWorkflowStatus,agreedCost?:number,currency?:string,notes?:string,rejectionReason?:string,addedAt:string,updatedAt:string}} CampaignCreator */
/** @typedef {{id:string,workspaceId:string,name:string,description?:string,objective?:string,status:CampaignStatus,startDate?:string,endDate?:string,budget?:number,currency?:string,targetPlatforms:string[],creatorCount:number,creators:CampaignCreator[],createdAt:string,updatedAt:string}} Campaign */
export {};
