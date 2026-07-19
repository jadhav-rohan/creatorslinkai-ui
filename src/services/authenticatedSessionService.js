import {creatorDashboardService} from "./creatorDashboardService";
import {deliverableService} from "./deliverableService";
import {invoiceService} from "./invoiceService";
import {mediaKitService} from "./mediaKitService";
import {outreachService} from "./outreachService";

const LOCAL_KEYS=["ig_auth","ig_jwt","creatorlinksai_workspace_id"];
const SESSION_KEYS=["creatorlinksai_connection_in_progress"];
const SESSION_PREFIXES=["creatorDashboardAccount:","creatorAutoDmAccount:"];

export function clearAuthenticatedSession(){
  LOCAL_KEYS.forEach(key=>window.localStorage.removeItem(key));
  SESSION_KEYS.forEach(key=>window.sessionStorage.removeItem(key));
  for(let index=window.sessionStorage.length-1;index>=0;index-=1){const key=window.sessionStorage.key(index);if(key&&SESSION_PREFIXES.some(prefix=>key.startsWith(prefix)))window.sessionStorage.removeItem(key)}
  creatorDashboardService.clear();
  mediaKitService.clear();
  invoiceService.clear();
  deliverableService.clear();
  outreachService.clear();
}
