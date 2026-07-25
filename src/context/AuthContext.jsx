import {createContext,useCallback,useContext,useEffect,useRef,useState} from "react";
import {ApiError,api,setAuthenticationFailureHandler,setBrandPortalDisabledHandler} from "../api";
import {clearAuthenticatedSession} from "../services/authenticatedSessionService";
import {clearPendingVerification} from "../services/pendingVerificationService";
import {featureFlags} from "../config/featureFlags";

const AuthContext=createContext(null);
const RECOGNIZED_PERSONAS=new Set(["CREATOR","BRAND"]);
const SESSION_NOTICE_KEY="creatorlinksai_auth_notice";
const SESSION_EXPIRED_MESSAGE="Your session has expired. Please sign in again.";

function removeLegacyTokens(){
 window.localStorage.removeItem("ig_auth");
 window.localStorage.removeItem("ig_jwt");
 window.sessionStorage.removeItem("ig_auth");
 window.sessionStorage.removeItem("ig_jwt");
}

function validateSession(value,expectedPersona){
 if(!value?.token||!RECOGNIZED_PERSONAS.has(value.activePersona)||expectedPersona&&value.activePersona!==expectedPersona)throw new ApiError("The authenticated account does not match this portal.",403,null);
 return value;
}

export function AuthProvider({children}){
 const [auth,setAuthState]=useState(null),[profile,setProfileState]=useState(null),[restoringSession,setRestoringSession]=useState(true),[loggingOut,setLoggingOut]=useState(false),[blockedBrandSession,setBlockedBrandSessionState]=useState(null),[brandPortalMessage,setBrandPortalMessage]=useState("");
 const authRef=useRef(null),blockedBrandRef=useRef(null),refreshPromise=useRef(null),refreshBlockedUntil=useRef(0),logoutPromise=useRef(null),mounted=useRef(true);
 const setAuth=useCallback(value=>{authRef.current=value;if(mounted.current)setAuthState(value)},[]);
 const setBlockedBrandSession=useCallback(value=>{blockedBrandRef.current=value;if(mounted.current)setBlockedBrandSessionState(value)},[]);

 const clearSession=useCallback((reason=null)=>{
  clearAuthenticatedSession();
  if(reason==="expired")window.sessionStorage.setItem(SESSION_NOTICE_KEY,SESSION_EXPIRED_MESSAGE);
  setProfileState(null);
  setAuth(null);
 },[setAuth]);

 const blockBrandSession=useCallback((session,message="The Brand and Agency portal is coming soon.")=>{
  clearAuthenticatedSession();
  setProfileState(null);
  setAuth(null);
  setBlockedBrandSession(session||{token:null});
  if(mounted.current)setBrandPortalMessage(message);
 },[setAuth,setBlockedBrandSession]);

 const refreshSession=useCallback((silent=false)=>{
  if(refreshPromise.current)return refreshPromise.current;
  if(Date.now()<refreshBlockedUntil.current)return Promise.reject(new ApiError("Too many attempts. Please try again later.",429,null,String(Math.ceil((refreshBlockedUntil.current-Date.now())/1000))));
  const operation=(async()=>{
   try{const result=validateSession(await api.refresh());refreshBlockedUntil.current=0;if(!featureFlags.brandPortalEnabled&&result.activePersona==="BRAND"){blockBrandSession(result);return null}setAuth(result);return result.token}
   catch(error){if(error.status===429){const seconds=Number(error.retryAfter);refreshBlockedUntil.current=Date.now()+(Number.isFinite(seconds)&&seconds>0?Math.ceil(seconds):60)*1000}else if(error.status===401){clearSession(silent?null:"expired");if(!silent&&window.location.hash!=="#/login")window.location.hash="/login"}throw error}
   finally{if(refreshPromise.current===operation)refreshPromise.current=null}
  })();
  refreshPromise.current=operation;
  return operation;
 },[blockBrandSession,clearSession,setAuth]);

 useEffect(()=>{
  mounted.current=true;removeLegacyTokens();
  refreshSession(true).catch(()=>{}).finally(()=>mounted.current&&setRestoringSession(false));
  return()=>{mounted.current=false};
 },[refreshSession]);

 useEffect(()=>{setAuthenticationFailureHandler((failedToken,{canRefresh=true}={})=>{if(!canRefresh){clearSession("expired");if(window.location.hash!=="#/login")window.location.hash="/login";return Promise.resolve(null)}return failedToken&&authRef.current?.token&&failedToken!==authRef.current.token?Promise.resolve(authRef.current.token):refreshSession()});return()=>setAuthenticationFailureHandler(null)},[refreshSession,clearSession]);

 useEffect(()=>{
  setBrandPortalDisabledHandler(error=>{
   if(authRef.current?.activePersona==="BRAND")blockBrandSession(authRef.current,error.message);
   else{
    if(!authRef.current)setBlockedBrandSession(blockedBrandRef.current||{token:null});
    if(mounted.current)setBrandPortalMessage(error.message||"The Brand and Agency portal is coming soon.");
   }
   if(window.location.hash!=="#/brand/coming-soon")window.location.hash="/brand/coming-soon";
  });
  return()=>setBrandPortalDisabledHandler(null);
 },[blockBrandSession,setBlockedBrandSession]);

 useEffect(()=>{
  if(!auth?.token||!auth.expiresInSeconds)return;
  const delay=Math.max(1000,Number(auth.expiresInSeconds)*1000-60000);
  const timer=window.setTimeout(()=>{refreshSession().catch(()=>{})},delay);
  return()=>window.clearTimeout(timer);
 },[auth?.token,auth?.expiresInSeconds,refreshSession]);

 const registerPortal=useCallback((persona,payload)=>{
  if(persona==="CREATOR")return api.registerCreator(payload.email,payload.password);
  if(!featureFlags.brandPortalEnabled)return Promise.reject(new ApiError("The Brand and Agency portal is coming soon.",503,null,null,"BRAND_PORTAL_DISABLED"));
  return api.registerBrand(payload.email,payload.password,payload.workspaceName,payload.workspaceType);
 },[]);

 const loginPortal=useCallback(async(persona,payload)=>{
  if(persona==="BRAND"&&!featureFlags.brandPortalEnabled)throw new ApiError("The Brand and Agency portal is coming soon.",503,null,null,"BRAND_PORTAL_DISABLED");
  const result=persona==="CREATOR"
   ?await api.loginCreator(payload.email,payload.password)
   :await api.loginBrand(payload.email,payload.password);
  validateSession(result,persona);clearPendingVerification();setBlockedBrandSession(null);setBrandPortalMessage("");setProfileState(null);setAuth(result);return result;
 },[setAuth,setBlockedBrandSession]);

 const updateProfileSummary=useCallback(value=>{
  setProfileState(value?{
   displayName:value.displayName||"",
   firstName:value.firstName||"",
   lastName:value.lastName||"",
   profilePictureUrl:value.profilePictureUrl||"",
  }:null);
 },[]);

 const logout=useCallback(()=>{
  if(logoutPromise.current)return logoutPromise.current;
  const token=authRef.current?.token||blockedBrandRef.current?.token;
  const hasSession=Boolean(authRef.current||blockedBrandRef.current);
  if(!hasSession){if(window.location.hash!=="#/login")window.location.hash="/login";return Promise.resolve()}
  const operation=(async()=>{
   setLoggingOut(true);
   try{await api.logout(token)}catch{/* Local cleanup always wins, including a disabled or expired Brand session. */}
   finally{setBlockedBrandSession(null);setBrandPortalMessage("");clearSession();setLoggingOut(false);if(window.location.hash!=="#/login")window.location.hash="/login"}
  })();
  logoutPromise.current=operation;
  operation.finally(()=>{if(logoutPromise.current===operation)logoutPromise.current=null});
  return operation;
 },[clearSession,setBlockedBrandSession]);

 const value={token:auth?.token??null,email:auth?.email??null,userId:auth?.userId??null,expiresInSeconds:auth?.expiresInSeconds??null,activePersona:auth?.activePersona??null,personas:Array.isArray(auth?.personas)?auth.personas:[],workspaceId:auth?.workspaceId??auth?.defaultWorkspaceId??null,defaultWorkspaceId:auth?.defaultWorkspaceId??auth?.workspaceId??null,workspaceType:auth?.workspaceType??null,isAuthenticated:Boolean(auth?.token),isCreatorPortal:auth?.activePersona==="CREATOR",isBrandPortal:auth?.activePersona==="BRAND",activeWorkspaceId:auth?.workspaceId??auth?.defaultWorkspaceId??null,canAccessPersona:persona=>Array.isArray(auth?.personas)&&auth.personas.includes(persona),profile,updateProfileSummary,hasDisabledBrandSession:Boolean(blockedBrandSession),brandPortalMessage,registerPortal,loginPortal,refreshSession,logout,loggingOut,restoringSession};
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error("useAuth must be used within AuthProvider");return value}
