/** @typedef {'DRAFT'|'ISSUED'|'OVERDUE'|'PAID'|'VOID'} InvoiceStatus */
/** @typedef {{id:string,description:string,quantity:number,rate:number,amount:number}} InvoiceItem */
/** @typedef {{id:string,workspaceId:string,invoiceNumber:string,status:InvoiceStatus,brand:{name:string,email:string,billingAddress:string,gstNumber:string|null},creator:{name:string,panNumber:string,gstNumber:string|null,phone:string|null,email:string,address:string},currency:string,taxRate:number,items:InvoiceItem[],subtotal:number,taxAmount:number,total:number,typedSignature:string,notes:string|null,issueDate:string,dueDate:string|null,issuedAt:string|null,paidAt:string|null,voidedAt:string|null,createdAt:string,updatedAt:string}} InvoiceResponse */
export const invoiceListKey=workspaceId=>["creator-invoices",workspaceId];
export const invoiceKey=(workspaceId,invoiceId)=>["creator-invoice",workspaceId,invoiceId];
