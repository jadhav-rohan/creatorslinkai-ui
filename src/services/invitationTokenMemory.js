let pendingToken=null;
export function rememberInvitationToken(token){pendingToken=typeof token==="string"&&token?token:null}
export function readInvitationToken(){return pendingToken}
export function clearInvitationToken(){pendingToken=null}
