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

function ReelThumbnail({reel,index}){
  const [failed,setFailed]=useState(false);
  const source=reel.thumbnailUrl||reel.mediaThumbnailUrl||reel.mediaUrl;
  return <div className="relative h-24 w-20 shrink-0 overflow-hidden border-2 border-zinc-900 bg-sky-100 sm:h-28 sm:w-24">
    {source&&!failed?<img src={source} onError={()=>setFailed(true)} alt={`${reel.caption||`Reel ${index+1}`} thumbnail`} loading="lazy" className="h-full w-full object-cover"/>:<div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-sky-100 text-zinc-600"><ImageIcon size={22}/><span className="text-[9px] font-black uppercase">Reel</span></div>}
  </div>;
}

export default function CreatorReelsPanel({reels,onRefresh,refreshing}){
  return <section aria-labelledby="reels-heading" className="mt-7">
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div><p className="brutal-overline">Stored Reel details</p><h2 id="reels-heading" className="mt-2 text-2xl font-black">Recent Reels Performance</h2></div>
      {!reels.length&&<button onClick={onRefresh} disabled={refreshing} className="brutal-button">{refreshing?"Refreshing…":"Refresh insights"}</button>}
    </div>
    {!reels.length?<div className="brutal-card p-6"><p>No stored Reel details are available yet.</p></div>:<div className="space-y-4">
      {reels.map((reel,index)=>{
        const engagement=reel.viewCount>0?reel.totalInteractions/reel.viewCount*100:null;
        return <details key={reel.mediaId} className="brutal-card group p-4 sm:p-5">
          <summary className="flex cursor-pointer list-none flex-col gap-4 sm:flex-row sm:items-center">
            <ReelThumbnail reel={reel} index={index}/>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 font-black">{reel.caption||`Reel #${index+1}`}</h3>
              <p className="mt-1 break-all font-mono text-xs text-zinc-500">{reel.mediaId} · {reel.timestamp?new Date(reel.timestamp).toLocaleString():"Date unavailable"}</p>
            </div>
            <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-start sm:gap-6">
              <span><small className="block uppercase text-zinc-500">Views</small><strong className="font-mono">{format(reel.viewCount)}</strong></span>
              <span><small className="block uppercase text-zinc-500">Reel engagement</small><strong className="font-mono">{pct(engagement)}</strong></span>
              <span aria-hidden className="text-xl font-black transition-transform group-open:rotate-45">＋</span>
            </div>
          </summary>
          <dl className="mt-5 grid grid-cols-2 gap-4 border-t-2 border-zinc-900 pt-5 sm:grid-cols-3 lg:grid-cols-5">
            {[["Views",reel.viewCount],["Likes",reel.likeCount],["Comments",reel.commentCount],["Saves",reel.savedCount],["Shares",reel.shareCount],["Reach",reel.reach],["Total interactions",reel.totalInteractions],["Follows",reel.follows],["Profile visits",reel.profileVisits],["Average watch time",durationFromMilliseconds(reel.averageWatchTime)],["Total watch time",durationFromMilliseconds(reel.totalWatchTime)]].map(([label,value])=><div key={label}><dt className="text-xs uppercase tracking-wider text-zinc-500">{label}</dt><dd className="mt-1 font-mono font-bold">{typeof value==="number"?full.format(value):value}</dd></div>)}
          </dl>
        </details>;
      })}
    </div>}
  </section>;
}
