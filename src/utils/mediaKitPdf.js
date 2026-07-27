const YELLOW=[253,224,71];
const SKY=[186,230,253];
const INK=[24,24,27];
const MUTED=[82,82,91];
const PAPER=[250,250,250];
const WHITE=[255,255,255];
const PAGE={width:210,height:297,margin:14};
const MAX_PROFILE_IMAGE_BYTES=5*1024*1024;
const MAX_PROFILE_IMAGE_DIMENSION=4096;
const MAX_PROFILE_IMAGE_PIXELS=16_000_000;
const PROFILE_IMAGE_TYPES=new Set(["image/jpeg","image/png"]);

const valueOrDash=value=>value==null||value===""?"-":String(value);
const compact=value=>value==null?"-":new Intl.NumberFormat(undefined,{notation:"compact",maximumFractionDigits:1}).format(value);
const price=(value,currency)=>value==null?"-":`${currency||""} ${Number(value).toLocaleString(undefined,{maximumFractionDigits:2})}`.trim();
const safeName=value=>(value||"creator").replace(/^@/,"").replace(/[^a-z0-9-_]+/gi,"-").replace(/^-+|-+$/g,"").toLowerCase()||"creator";

function hasSupportedImageSignature(bytes,type){
  if(type==="image/jpeg"){
    return bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
  }
  return bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47
    &&bytes[4]===0x0d&&bytes[5]===0x0a&&bytes[6]===0x1a&&bytes[7]===0x0a;
}

async function hasSafeImageDimensions(blob){
  if(typeof createImageBitmap!=="function")return true;
  const bitmap=await createImageBitmap(blob);
  const {width,height}=bitmap;
  bitmap.close();
  return width>0&&height>0
    &&width<=MAX_PROFILE_IMAGE_DIMENSION
    &&height<=MAX_PROFILE_IMAGE_DIMENSION
    &&width*height<=MAX_PROFILE_IMAGE_PIXELS;
}

async function imageData(url){
  if(!url)return null;
  try{
    const parsedUrl=new URL(url,window.location.origin);
    if(parsedUrl.protocol!=="https:"&&parsedUrl.origin!==window.location.origin)return null;
    const response=await fetch(url,{mode:"cors"});
    if(!response.ok)return null;
    const declaredSize=Number(response.headers.get("content-length"));
    if(Number.isFinite(declaredSize)&&declaredSize>MAX_PROFILE_IMAGE_BYTES)return null;
    const blob=await response.blob();
    const type=blob.type.toLowerCase().split(";")[0];
    if(!PROFILE_IMAGE_TYPES.has(type)||blob.size===0||blob.size>MAX_PROFILE_IMAGE_BYTES)return null;
    const signature=new Uint8Array(await blob.slice(0,8).arrayBuffer());
    if(!hasSupportedImageSignature(signature,type)||!await hasSafeImageDimensions(blob))return null;
    return await new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=reject;
      reader.readAsDataURL(blob);
    });
  }catch{return null}
}

export async function createMediaKitPdf(mediaKit){
  const {jsPDF}=await import("jspdf");
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4",compress:true});
  const preview=mediaKit.preview||{};
  const usable=PAGE.width-PAGE.margin*2;
  const profileImage=await imageData(preview.profilePictureUrl);
  let page=1;
  let y=0;

  const setText=(size,weight="normal",color=INK)=>{
    doc.setFont("helvetica",weight);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };
  const watermark=()=>{
    setText(31,"bold",[226,226,230]);
    doc.setCharSpace(1.8);
    doc.text("CREATORLINKSAI",PAGE.width/2,PAGE.height/2+18,{align:"center",angle:35});
    doc.setCharSpace(0);
  };
  const footer=()=>{
    doc.setDrawColor(...INK);
    doc.setLineWidth(.5);
    doc.line(PAGE.margin,PAGE.height-13,PAGE.width-PAGE.margin,PAGE.height-13);
    setText(7,"bold",MUTED);
    doc.text("CREATORLINKSAI / MEDIA KIT",PAGE.margin,PAGE.height-8);
    doc.text(String(page),PAGE.width-PAGE.margin,PAGE.height-8,{align:"right"});
  };
  const newPage=()=>{
    footer();
    doc.addPage();
    page+=1;
    doc.setFillColor(...PAPER);
    doc.rect(0,0,PAGE.width,PAGE.height,"F");
    watermark();
    y=18;
  };
  const ensure=height=>{if(y+height>PAGE.height-18)newPage()};
  const overline=(text,x,yPos,color=MUTED)=>{
    setText(7,"bold",color);
    doc.setCharSpace(1.1);
    doc.text(text.toUpperCase(),x,yPos);
    doc.setCharSpace(0);
  };
  const sectionTitle=title=>{
    ensure(22);
    doc.setDrawColor(...INK);
    doc.setLineWidth(.7);
    doc.line(PAGE.margin,y,PAGE.width-PAGE.margin,y);
    y+=6;
    overline(title,PAGE.margin,y);
    y+=5;
  };

  doc.setFillColor(...PAPER);
  doc.rect(0,0,PAGE.width,PAGE.height,"F");
  watermark();
  doc.setFillColor(...YELLOW);
  doc.rect(0,0,PAGE.width,66,"F");
  doc.setFillColor(...INK);
  doc.rect(0,0,7,66,"F");
  overline("Creator Media Kit",PAGE.margin,17,INK);
  setText(25,"bold",INK);
  const displayName=preview.displayName||"Creator";
  doc.text(displayName,PAGE.margin,36,{maxWidth:125});
  setText(11,"normal",INK);
  doc.text(preview.handle||"@creator",PAGE.margin,46);
  setText(8,"bold",INK);
  doc.text("CREATORLINKSAI",PAGE.margin,61);
  doc.setDrawColor(...INK);
  doc.setLineWidth(1);
  doc.setFillColor(...SKY);
  doc.rect(158,16,36,36,"FD");
  if(profileImage){
    try{doc.addImage(profileImage,undefined,159,17,34,34)}catch{/* unsupported remote image */}
  }else{
    setText(18,"bold",INK);
    const initials=displayName.split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase();
    doc.text(initials||"CR",176,39,{align:"center"});
  }

  y=75;
  overline("Audience snapshot",PAGE.margin,y);
  y+=5;
  const metrics=[
    ["Followers",compact(preview.followers)],
    ["Engagement",preview.engagementRate==null?"-":`${Number(preview.engagementRate).toLocaleString(undefined,{maximumFractionDigits:2})}%`],
    ["Avg. views",compact(preview.averageViews)],
    ["Avg. likes",compact(preview.averageLikes)],
  ];
  const metricGap=3;
  const metricWidth=(usable-metricGap*3)/4;
  metrics.forEach(([label,value],index)=>{
    const x=PAGE.margin+index*(metricWidth+metricGap);
    doc.setFillColor(...WHITE);
    doc.setDrawColor(...INK);
    doc.setLineWidth(.6);
    doc.rect(x,y,metricWidth,24,"FD");
    overline(label,x+3,y+7);
    setText(16,"bold",INK);
    doc.text(valueOrDash(value),x+3,y+18,{maxWidth:metricWidth-6});
  });
  y+=29;
  if(preview.metricsCapturedAt){
    setText(7,"normal",MUTED);
    doc.text(`Metrics captured ${new Date(preview.metricsCapturedAt).toLocaleDateString()}`,PAGE.margin,y);
    y+=7;
  }

  sectionTitle("About");
  setText(10,"normal",INK);
  const aboutLines=doc.splitTextToSize(mediaKit.about||"Creator profile and partnership information.",usable);
  const aboutHeight=Math.max(14,aboutLines.length*5);
  ensure(aboutHeight+6);
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...INK);
  doc.setLineWidth(.6);
  doc.rect(PAGE.margin,y-3,usable,aboutHeight+4,"FD");
  doc.text(aboutLines,PAGE.margin+5,y+4);
  y+=aboutHeight+9;

  sectionTitle("Partnership rates");
  const prices=[
    ["Reel",mediaKit.pricing?.reel],
    ["Story",mediaKit.pricing?.story],
    ["Post",mediaKit.pricing?.post],
    ["Video",mediaKit.pricing?.video],
    ["Collaboration",mediaKit.pricing?.collaboration],
  ];
  const priceWidth=(usable-6)/2;
  prices.forEach(([label,amount],index)=>{
    const row=Math.floor(index/2);
    const column=index%2;
    const x=PAGE.margin+column*(priceWidth+6);
    const itemY=y+row*17;
    doc.setFillColor(...(index===4?YELLOW:WHITE));
    doc.setDrawColor(...INK);
    doc.setLineWidth(.5);
    doc.rect(x,itemY,priceWidth,13,"FD");
    setText(8,"bold",MUTED);
    doc.text(label,x+3,itemY+5);
    setText(10,"bold",INK);
    doc.text(price(amount,mediaKit.currency),x+priceWidth-3,itemY+9,{align:"right"});
  });
  y+=Math.ceil(prices.length/2)*17+3;

  sectionTitle("Selected collaborations");
  const brands=Array.isArray(mediaKit.brandsWorkedWith)?mediaKit.brandsWorkedWith:[];
  if(!brands.length){
    setText(9,"normal",MUTED);
    doc.text("Available for new brand partnerships.",PAGE.margin,y);
    y+=10;
  }else{
    let x=PAGE.margin;
    let lineY=y;
    brands.forEach(brand=>{
      setText(8,"bold",INK);
      const label=String(brand);
      const width=Math.min(usable,doc.getTextWidth(label)+8);
      if(x+width>PAGE.width-PAGE.margin){x=PAGE.margin;lineY+=11}
      ensure(lineY-y+13);
      doc.setFillColor(...YELLOW);
      doc.setDrawColor(...INK);
      doc.rect(x,lineY-5,width,9,"FD");
      doc.text(label,x+4,lineY+1,{maxWidth:width-8});
      x+=width+3;
    });
    y=lineY+10;
  }

  sectionTitle("Contact");
  ensure(27);
  doc.setFillColor(...INK);
  doc.rect(PAGE.margin,y-3,usable,24,"F");
  overline("Email",PAGE.margin+5,y+4,YELLOW);
  overline("Phone",PAGE.margin+100,y+4,YELLOW);
  setText(10,"bold",WHITE);
  doc.text(mediaKit.contact?.email||"Not provided",PAGE.margin+5,y+13,{maxWidth:85});
  doc.text(mediaKit.contact?.phone||"Not provided",PAGE.margin+100,y+13,{maxWidth:77});
  y+=30;

  setText(7,"normal",MUTED);
  doc.text("Audience metrics are based on the latest stored Instagram snapshot.",PAGE.margin,y);
  footer();
  return doc;
}

export async function downloadStyledMediaKitPdf(mediaKit){
  const doc=await createMediaKitPdf(mediaKit);
  doc.save(`${safeName(mediaKit.preview?.handle||mediaKit.preview?.displayName)}-media-kit.pdf`);
}
