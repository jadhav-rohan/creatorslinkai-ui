export const DELIVERABLE_TYPES = ["REEL", "STORY", "POST", "CAROUSEL", "OTHER"];
export const DELIVERABLE_TYPE_LABELS = { REEL: "Reel", STORY: "Story", POST: "Feed post", CAROUSEL: "Carousel", OTHER: "Other" };
export const DELIVERABLE_STATUSES = ["PLANNED", "SUBMITTED", "REVISION_REQUESTED", "APPROVED", "PUBLISHED"];
export const DELIVERABLE_STATUS_LABELS = { PLANNED: "Planned", SUBMITTED: "Submitted", REVISION_REQUESTED: "Revision requested", APPROVED: "Approved", PUBLISHED: "Published" };

/** @typedef {{id:string,campaignId:string,creatorProfileId:string,type:string,customType:?string,quantity:number,dueDate:?string,status:string,submissionUrl:?string,publishedUrl:?string,usageRightsStart:?string,usageRightsEnd:?string,internalFeedback:?string,revisionNotes:?string,createdAt:string,updatedAt:string}} CampaignDeliverable */
