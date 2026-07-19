import {api} from "../api";import {mediaKitKey} from "../mediaKitTypes";
const cache=new Map(),key=(w,i)=>JSON.stringify(mediaKitKey(w,i));
export const mediaKitService={get:async(w,i,t,s)=>{const x=await api.getMediaKit(w,i,t,{signal:s});cache.set(key(w,i),x);return x},save:async(w,i,p,t)=>{const x=await api.saveMediaKit(w,i,p,t);cache.set(key(w,i),x);return x},invalidate:w=>{for(const k of cache.keys())if(JSON.parse(k)[1]===w)cache.delete(k)},clear:()=>cache.clear()};
