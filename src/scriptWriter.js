export const SCRIPT_FORMATS=["REEL","STORY","POST","VIDEO"];
export const TONE_PRESETS=["Conversational","Educational","Energetic","Humorous","Luxury","Authentic","Storytelling","Direct response"];

export function scriptErrorMessage(error){
  if(error?.status===403)return "This Creator workspace is not available to your account.";
  if(error?.status===429)return "You have reached your monthly AI script generation limit.";
  if(error?.status===502)return "The AI provider could not generate a valid script. Please try again later.";
  if(error?.status===503)return "AI Script Writer is temporarily unavailable.";
  return error?.message||"AI Script Writer could not complete the request.";
}

export function fullScriptText(variation){
  const scenes=(variation.scenes||[]).slice().sort((a,b)=>a.order-b.order).map(scene=>[
    `Scene ${scene.order}${scene.durationSeconds!=null?` (${scene.durationSeconds}s)`:""}`,
    `Visual: ${scene.visual||""}`,
    `Dialogue: ${scene.dialogue||""}`,
  ].join("\n")).join("\n\n");
  return [
    variation.title,
    variation.hook&&`Hook: ${variation.hook}`,
    scenes,
    variation.cta&&`CTA: ${variation.cta}`,
    variation.caption&&`Caption: ${variation.caption}`,
    variation.hashtags?.length&&`Hashtags: ${variation.hashtags.join(" ")}`,
  ].filter(Boolean).join("\n\n");
}

export const initialScriptDraft=()=>({
  title:"",
  campaignBrief:"",
  brandName:"",
  productDescription:"",
  targetAudience:"",
  contentFormat:"REEL",
  durationSeconds:"30",
  tone:"Conversational",
  keyPoints:[],
  mandatoryPoints:[],
  avoidTerms:[],
  requestedCta:"",
  language:"English",
  variationCount:"3",
});

export function validateScriptDraft(draft){
  const error={};
  if(!draft.title.trim())error.title="Title is required.";
  else if(draft.title.trim().length>160)error.title="Title must be 160 characters or fewer.";
  if(!draft.campaignBrief.trim())error.campaignBrief="Campaign brief is required.";
  else if(draft.campaignBrief.length>12000)error.campaignBrief="Campaign brief must be 12,000 characters or fewer.";
  if(!SCRIPT_FORMATS.includes(draft.contentFormat))error.contentFormat="Choose a supported content format.";
  if(draft.brandName.length>160)error.brandName="Brand name must be 160 characters or fewer.";
  if(draft.productDescription.length>6000)error.productDescription="Product description must be 6,000 characters or fewer.";
  if(draft.targetAudience.length>4000)error.targetAudience="Target audience must be 4,000 characters or fewer.";
  const duration=Number(draft.durationSeconds);
  if(draft.durationSeconds!==""&&(!Number.isInteger(duration)||duration<5||duration>3600))error.durationSeconds="Duration must be between 5 and 3,600 seconds.";
  if(draft.tone.length>80)error.tone="Tone must be 80 characters or fewer.";
  if(draft.requestedCta.length>1000)error.requestedCta="CTA must be 1,000 characters or fewer.";
  if(!draft.language.trim())error.language="Language is required.";
  else if(draft.language.length>80)error.language="Language must be 80 characters or fewer.";
  const count=Number(draft.variationCount);
  if(!Number.isInteger(count)||count<1||count>3)error.variationCount="Choose between 1 and 3 variations.";
  return error;
}

export function serializeScriptDraft(draft){
  const optional=(value)=>value.trim()||undefined;
  return {
    title:draft.title.trim(),
    campaignBrief:draft.campaignBrief.trim(),
    contentFormat:draft.contentFormat,
    brandName:optional(draft.brandName),
    productDescription:optional(draft.productDescription),
    targetAudience:optional(draft.targetAudience),
    durationSeconds:draft.durationSeconds===""?undefined:Number(draft.durationSeconds),
    tone:optional(draft.tone),
    keyPoints:draft.keyPoints,
    mandatoryPoints:draft.mandatoryPoints,
    avoidTerms:draft.avoidTerms,
    requestedCta:optional(draft.requestedCta),
    language:draft.language.trim(),
    variationCount:Number(draft.variationCount),
  };
}
