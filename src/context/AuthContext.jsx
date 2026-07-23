import {createContext,useCallback,useContext,useEffect,useRef,useState} from "react";
import {ApiError,api,setAuthenticationFailureHandler} from "../api";
import {clearAuthenticatedSession} from "../services/authenticatedSessionService";
import {clearPendingVerification} from "../services/pendingVerificationService";

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
 const [auth,setAuthState]=useState(null),[restoringSession,setRestoringSession]=useState(true),[loggingOut,setLoggingOut]=useState(false);
 const authRef=useRef(null),refreshPromise=useRef(null),refreshBlockedUntil=useRef(0),logoutPromise=useRef(null),mounted=useRef(true);
 const setAuth=useCallback(value=>{authRef.current=value;if(mounted.current)setAuthState(value)},[]);

 const clearSession=useCallback((reason=null)=>{
  clearAuthenticatedSession();
  if(reason==="expired")window.sessionStorage.setItem(SESSION_NOTICE_KEY,SESSION_EXPIRED_MESSAGE);
  setAuth(null);
 },[setAuth]);

 const refreshSession=useCallback((silent=false)=>{
  if(refreshPromise.current)return refreshPromise.current;
  if(Date.now()<refreshBlockedUntil.current)return Promise.reject(new ApiError("Too many attempts. Please try again later.",429,null,String(Math.ceil((refreshBlockedUntil.current-Date.now())/1000))));
  const operation=(async()=>{
   try{const result=validateSession(await api.refresh());refreshBlockedUntil.current=0;setAuth(result);return result.token}
   catch(error){if(error.status===429){const seconds=Number(error.retryAfter);refreshBlockedUntil.current=Date.now()+(Number.isFinite(seconds)&&seconds>0?Math.ceil(seconds):60)*1000}else if(error.status===401){clearSession(silent?null:"expired");if(!silent&&window.location.hash!=="#/login")window.location.hash="/login"}throw error}
   finally{if(refreshPromise.current===operation)refreshPromise.current=null}
  })();
  refreshPromise.current=operation;
  return operation;
 },[clearSession,setAuth]);

 useEffect(()=>{
  mounted.current=true;removeLegacyTokens();
  refreshSession(true).catch(()=>{}).finally(()=>mounted.current&&setRestoringSession(false));
  return()=>{mounted.current=false};
 },[refreshSession]);

 useEffect(()=>{setAuthenticationFailureHandler((failedToken,{canRefresh=true}={})=>{if(!canRefresh){clearSession("expired");if(window.location.hash!=="#/login")window.location.hash="/login";return Promise.resolve(null)}return failedToken&&authRef.current?.token&&failedToken!==authRef.current.token?Promise.resolve(authRef.current.token):refreshSession()});return()=>setAuthenticationFailureHandler(null)},[refreshSession,clearSession]);

 useEffect(()=>{
  if(!auth?.token||!auth.expiresInSeconds)return;
  const delay=Math.max(1000,Number(auth.expiresInSeconds)*1000-60000);
  const timer=window.setTimeout(()=>{refreshSession().catch(()=>{})},delay);
  return()=>window.clearTimeout(timer);
 },[auth?.token,auth?.expiresInSeconds,refreshSession]);

 const authenticatePortal=useCallback(async(persona,mode,payload)=>{
  const result=persona==="CREATOR"
   ?await(mode==="register"?api.registerCreator(payload.email,payload.password):api.loginCreator(payload.email,payload.password))
   :await(mode==="register"?api.registerBrand(payload.email,payload.password,payload.workspaceName,payload.workspaceType):api.loginBrand(payload.email,payload.password));
  if(mode==="register")return result;
  validateSession(result,persona);clearPendingVerification();setAuth(result);return result;
 },[setAuth]);

 const logout=useCallback(()=>{
  if(logoutPromise.current)return logoutPromise.current;
  const token=authRef.current?.token;
  if(!token){if(window.location.hash!=="#/login")window.location.hash="/login";return Promise.resolve()}
  const operation=(async()=>{
   setLoggingOut(true);
   try{if(token)await api.logout(token)}catch{/* Local cleanup always wins, including a 401. */}
   finally{clearSession();setLoggingOut(false);if(window.location.hash!=="#/login")window.location.hash="/login"}
  })();
  logoutPromise.current=operation;
  operation.finally(()=>{if(logoutPromise.current===operation)logoutPromise.current=null});
  return operation;
 },[clearSession]);

 const value={token:auth?.token??null,email:auth?.email??null,userId:auth?.userId??null,expiresInSeconds:auth?.expiresInSeconds??null,activePersona:auth?.activePersona??null,personas:Array.isArray(auth?.personas)?auth.personas:[],workspaceId:auth?.workspaceId??auth?.defaultWorkspaceId??null,defaultWorkspaceId:auth?.defaultWorkspaceId??auth?.workspaceId??null,workspaceType:auth?.workspaceType??null,isAuthenticated:Boolean(auth?.token),isCreatorPortal:auth?.activePersona==="CREATOR",isBrandPortal:auth?.activePersona==="BRAND",activeWorkspaceId:auth?.workspaceId??auth?.defaultWorkspaceId??null,canAccessPersona:persona=>Array.isArray(auth?.personas)&&auth.personas.includes(persona),authenticatePortal,refreshSession,logout,loggingOut,restoringSession};
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error("useAuth must be used within AuthProvider");return value}
