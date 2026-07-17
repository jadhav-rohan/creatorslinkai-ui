export const OUTREACH_CHANNELS=["EMAIL","INSTAGRAM_DM","WHATSAPP","PHONE","OTHER"];
export const CHANNEL_LABELS={EMAIL:"Email",INSTAGRAM_DM:"Instagram DM",WHATSAPP:"WhatsApp",PHONE:"Phone",OTHER:"Other"};
export const OUTREACH_STATUSES=["DRAFT","SENT","DELIVERED","REPLIED","FAILED"];
export const TASK_STATUSES=["OPEN","COMPLETED","CANCELLED"];
export const TEMPLATE_VARIABLES=["creatorName","creatorUsername","campaignName","brandName","deliverables","budget","deadline"];
export function renderTemplate(value,variables){return (value||"").replace(/{{\s*([^}]+?)\s*}}/g,(match,name)=>Object.prototype.hasOwnProperty.call(variables,name)&&variables[name]?variables[name]:match)}
