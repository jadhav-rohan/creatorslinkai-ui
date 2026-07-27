import {useState} from "react";
import {Image as ImageIcon} from "lucide-react";

const compact=new Intl.NumberFormat(undefined,{notation:"compact",maximumFractionDigits:1});
const full=new Intl.NumberFormat();
const format=value=>value==null?"—":compact.format(value);
const pct=value=>value==null?"—":`${Number(value).toLocaleString(undefined,{maximumFractionDigits:2})}%`;
function durationFromMilliseconds(value){
  if(value==null||!Number.isFinite(Number(value)))return "—";
  const seconds=Math.max(0,Number(value))/1000;
  if(seconds<60)return `${seconds.toLocaleString(undefined,{maximumFractionDigits:1})} sec`;
  const whole=Math.round(seconds),days=Math.floor(whole/86400),hours=Math.floor(whole%86400/3600),minutes=Math.floor(whole%3600/60),remaining=whole%60;
  return [[days,"d"],[hours,"h"],[minutes,"m"],[remaining,"s"]].filter(([amount])=>amount>0).map(([amount,unit])=>`${amount}${unit}`).join(" ");
}

function ReelThumbnail({reel,index,expanded=false}){
  const [failed,setFailed]=useState(false);
  const source=reel.thumbnailUrl||reel.mediaThumbnailUrl||reel.mediaUrl;
  return <div className={`relative shrink-0 overflow-hidden border-2 border-zinc-900 bg-sky-100 ${expanded?"aspect-[4/5] w-full sm:h-64 sm:w-52":"h-28 w-24"}`}>
    {source&&!failed?<img src={source} onError={()=>setFailed(true)} alt={`${reel.caption||`Reel ${index+1}`} thumbnail`} loading="lazy" className="h-full w-full object-cover"/>:<div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-sky-100 text-zinc-600"><ImageIcon size={22}/><span className="text-[9px] font-black uppercase">Reel</span></div>}
  </div>;
}

export default function CreatorReelsPanel({reels,onRefresh,refreshing}){
  const [expandedId,setExpandedId]=useState(null);
  const expandedReel=reels.find(reel=>reel.mediaId===expandedId);
  const visibleReels=expandedReel?[expandedReel]:reels;
  return <section aria-labelledby="reels-heading" className="nb-section-gap">
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div><p className="brutal-overline">Stored Reel details</p><h2 id="reels-heading" className="nb-section-title mt-1.5 font-black">Recent Reels Performance</h2></div>
      {!reels.length&&<button onClick={onRefresh} disabled={refreshing} className="brutal-button">{refreshing?"Refreshing…":"Refresh insights"}</button>}
    </div>
    {!reels.length?<div className="brutal-card nb-card-pad"><p>No stored Reel details are available yet.</p></div>:<div className={expandedReel?"":"flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3"}>
      {visibleReels.map((reel)=>{
        const index=reels.findIndex(item=>item.mediaId===reel.mediaId);
        const expanded=reel.mediaId===expandedId;
        const engagement=reel.viewCount>0?reel.totalInteractions/reel.viewCount*100:null;
        return <article key={reel.mediaId} className={`brutal-card nb-secondary-card ${expanded?"w-full p-3 sm:p-5":"w-[min(84vw,370px)] shrink-0 snap-start p-3 sm:p-4"}`}>
          <div className={expanded?"grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]":""}>
            <ReelThumbnail reel={reel} index={index} expanded={expanded}/>
            <div className={expanded?"min-w-0":"mt-3"}>
              <button type="button" onClick={()=>setExpandedId(expanded?null:reel.mediaId)} aria-expanded={expanded} className="block w-full text-left">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="nb-card-title line-clamp-2 font-black">{reel.caption||`Reel #${index+1}`}</h3>
                    <p className="mt-1 break-all font-mono text-xs text-zinc-500">{reel.mediaId}</p>
                    <p className="mt-1 text-xs text-zinc-500">{reel.timestamp?new Date(reel.timestamp).toLocaleString():"Date unavailable"}</p>
                  </div>
                  <span aria-hidden className={`text-xl font-black transition-transform ${expanded?"rotate-45":""}`}>＋</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 border-t-2 border-zinc-900 pt-3">
                  <span><small className="block uppercase text-zinc-500">Views</small><strong className="font-mono">{format(reel.viewCount)}</strong></span>
                  <span><small className="block uppercase text-zinc-500">Reel engagement</small><strong className="font-mono">{pct(engagement)}</strong></span>
                </div>
              </button>
              {expanded&&<dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t-2 border-zinc-900 pt-4 sm:grid-cols-3 lg:grid-cols-4">
                {[["Views",reel.viewCount],["Likes",reel.likeCount],["Comments",reel.commentCount],["Saves",reel.savedCount],["Shares",reel.shareCount],["Reach",reel.reach],["Total interactions",reel.totalInteractions],["Follows",reel.follows],["Profile visits",reel.profileVisits],["Average watch time",durationFromMilliseconds(reel.averageWatchTime)],["Total watch time",durationFromMilliseconds(reel.totalWatchTime)]].map(([label,value])=><div key={label}><dt className="text-xs uppercase tracking-wider text-zinc-500">{label}</dt><dd className="mt-1 font-mono font-bold">{typeof value==="number"?full.format(value):value}</dd></div>)}
              </dl>}
            </div>
          </div>
        </article>;
      })}
    </div>}
  </section>;
}
