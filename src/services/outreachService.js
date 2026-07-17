import { api } from "../api";
export const outreachKeys={contacts:w=>["creator-contacts",w],contact:(w,c)=>["creator-contact",w,c],templates:w=>["outreach-templates",w],template:(w,t)=>["outreach-template",w,t],messages:(w,c,p)=>["outreach-messages",w,c,p],tasks:w=>["outreach-tasks",w],task:(w,t)=>["outreach-task",w,t]};
const cache=new Map(),key=x=>JSON.stringify(x);const store=(k,v)=>(cache.set(key(k),v),v);
export const outreachService={
 cached:k=>cache.get(key(k)),set:store,clearWorkspace:w=>{for(const k of cache.keys())if(JSON.parse(k).includes(w))cache.delete(k)},
 getContact:async(w,c,t,s)=>store(outreachKeys.contact(w,c),await api.getCreatorContact(w,c,t,{signal:s})),putContact:(w,c,p,t)=>api.putCreatorContact(w,c,p,t),deleteContact:(w,c,t)=>api.deleteCreatorContact(w,c,t),
 listTemplates:async(w,t,s)=>store(outreachKeys.templates(w),await api.listOutreachTemplates(w,t,{signal:s})),createTemplate:(w,p,t)=>api.createOutreachTemplate(w,p,t),updateTemplate:(w,id,p,t)=>api.updateOutreachTemplate(w,id,p,t),deleteTemplate:(w,id,t)=>api.deleteOutreachTemplate(w,id,t),
 listMessages:async(w,c,p,t,s)=>store(outreachKeys.messages(w,c,p),await api.listOutreachMessages(w,c,p,t,{signal:s})),createMessage:(w,c,p,b,t)=>api.createOutreachMessage(w,c,p,b,t),updateMessage:(w,c,p,id,b,t)=>api.updateOutreachMessage(w,c,p,id,b,t),deleteMessage:(w,c,p,id,t)=>api.deleteOutreachMessage(w,c,p,id,t),
 listTasks:async(w,t,s)=>store(outreachKeys.tasks(w),await api.listOutreachTasks(w,t,{signal:s})),createTask:(w,p,t)=>api.createOutreachTask(w,p,t),updateTask:(w,id,p,t)=>api.updateOutreachTask(w,id,p,t),deleteTask:(w,id,t)=>api.deleteOutreachTask(w,id,t),
};
