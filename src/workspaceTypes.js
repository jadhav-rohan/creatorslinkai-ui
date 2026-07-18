/** @typedef {{id:string,name:string,personal:boolean,type:'PERSONAL'|'BRAND'|'AGENCY'|'CREATOR_TEAM',role:'OWNER'|'ADMIN'|'CAMPAIGN_MANAGER'|'ANALYST'|'MEMBER',logoUrl?:string,website?:string,industry?:string,country?:string,timezone?:string,contactEmail?:string,description?:string,createdAt:string,updatedAt:string}} Workspace */
/** @typedef {{creatorProfileId:string,instagramUsername:string,followersCount:number,profilePictureUrl?:string,claimed:boolean,status:'CONSIDERING'|'SHORTLISTED'|'SELECTED'|'REJECTED',notes?:string,proposedCost?:number,currency?:string,addedAt:string,updatedAt:string}} CreatorListMember */
/** @typedef {{id:string,workspaceId:string,name:string,description?:string,creatorCount:number,creators:CreatorListMember[],createdAt:string,updatedAt:string}} CreatorList */
/** @typedef {{name:string,description?:string}} CreateCreatorListRequest */
/** @typedef {{name?:string,description?:string}} UpdateCreatorListRequest */
/** @typedef {{creatorProfileId:string,status:string,notes:null|string,proposedCost:null|number,currency:null|string}} AddCreatorToListRequest */
export {};
