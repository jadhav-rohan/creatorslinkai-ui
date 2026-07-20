import {useState} from "react";import {Link,useNavigate,useParams} from "react-router-dom";import {api} from "../api";import {useCreatorInvoiceAccess} from "../hooks/useCreatorInvoiceAccess";import {useInvoice} from "../hooks/useInvoices";import {invoiceService} from "../services/invoiceService";import {InvoiceBack,InvoiceGate,LoadError,Status,cash,dateOnly} from "../components/InvoiceShared";import {useThemedDialog} from "../context/ThemedDialogContext";
function Block({title,children}){return <section>
<p className="brutal-overline text-zinc-500">{title}</p>
<div className="mt-3 whitespace-pre-wrap text-sm leading-6">{children}</div>
</section>}
export default function CreatorInvoiceDetail(){const {confirm}=useThemedDialog();const {invoiceId}=useParams(),navigate=useNavigate(),access=useCreatorInvoiceAccess(),query=useInvoice({workspaceId:access.workspaceId,invoiceId,token:access.token,enabled:access.workspaceAllowed&&access.canView,onUnauthorized:access.logout}),[busy,setBusy]=useState(""),[message,setMessage]=useState(""),[error,setError]=useState("");const invoice=query.data;async function transition(action,prompt){if(busy||!await confirm(prompt,{title:"Confirm invoice action"}))return;setBusy(action);setError("");try{const x=await invoiceService.transition(access.workspaceId,invoiceId,action,access.token);query.setData(x);setMessage(action==="markInvoicePaid"?"Invoice marked paid. This records status only; no payment was processed.":action==="voidInvoice"?"Invoice voided.":"Invoice issued successfully.")}catch(e){if(e.status===401)access.logout();else setError(e.message)}finally{setBusy("")}}async function remove(){if(busy||!await confirm("Delete this draft permanently? This cannot be undone.",{title:"Delete draft invoice",confirmLabel:"Delete"}))return;setBusy("delete");try{await invoiceService.remove(access.workspaceId,invoiceId,access.token);navigate("/creator/invoices",{replace:true,state:{notice:"Draft invoice deleted."}})}catch(e){if(e.status===401)access.logout();else setError(e.message)}finally{setBusy("")}}async function pdf(){if(busy)return;setBusy("pdf");setError("");try{const {blob,disposition}=await api.downloadInvoicePdf(access.workspaceId,invoiceId,access.token),match=disposition?.match(/filename\*?=(?:UTF-8''|\")?([^";]+)/i),name=match?decodeURIComponent(match[1].replace(/"$/,"")):`${invoice.invoiceNumber}.pdf`,url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0)}catch(e){if(e.status===401)access.logout();else setError(e.message)}finally{setBusy("")}}return <InvoiceGate access={access}>
<main className="brutal-page min-h-[calc(100vh-82px)] p-4 sm:p-6 md:p-8">
<div className="mx-auto max-w-6xl">{query.loading&&!invoice?<div className="h-[600px] animate-pulse border-2 border-zinc-900 bg-zinc-200"/>:query.error?<LoadError error={query.error} retry={query.refetch}/>:invoice?<>
<InvoiceBack/>
<header className="mt-5 flex flex-col gap-5 border-b-2 border-zinc-900 pb-6 md:flex-row md:items-end md:justify-between">
<div>
<p className="brutal-overline">Invoice</p>
<h1 className="mt-2 font-mono text-3xl font-black">{invoice.invoiceNumber}</h1>
<div className="mt-3">
<Status value={invoice.status}/>
</div>
</div>
<div className="flex flex-wrap gap-3">
<button onClick={pdf} disabled={Boolean(busy)} className="border-2 border-zinc-900 bg-white px-5 py-3 font-black shadow-[4px_4px_0_#18181b]">{busy==="pdf"?"Downloading…":"Download PDF"}</button>{access.canEdit&&invoice.status==="DRAFT"&&<Link to={`/creator/invoices/${invoice.id}/edit`} className="border-2 border-zinc-900 bg-white px-5 py-3 font-black">Edit</Link>}{access.canIssue&&invoice.status==="DRAFT"&&<button onClick={()=>transition("issueInvoice","Issue this invoice? It becomes immutable, and billing, tax, items, and totals can no longer be edited. You can later mark it paid or void it.")} disabled={Boolean(busy)} className="brutal-button">Issue Invoice</button>}{access.canIssue&&["ISSUED","OVERDUE"].includes(invoice.status)&&<button onClick={()=>transition("markInvoicePaid","Mark this invoice paid? This only records its status and does not process a payment.")} disabled={Boolean(busy)} className="brutal-button">Mark Paid</button>}{access.canIssue&&["DRAFT","ISSUED","OVERDUE"].includes(invoice.status)&&<button onClick={()=>transition("voidInvoice","Void this invoice? It will remain in history but cannot be edited, issued, or marked paid.")} disabled={Boolean(busy)} className="border-2 border-red-700 bg-rose-100 px-5 py-3 font-black text-red-800">Void</button>}{access.canEdit&&invoice.status==="DRAFT"&&<button onClick={remove} disabled={Boolean(busy)} className="border-2 border-red-700 bg-white px-5 py-3 font-black text-red-800">Delete</button>}</div>
</header>
<div aria-live="polite">{message&&<p role="status" className="mt-5 border-2 border-zinc-900 bg-emerald-200 p-3 font-bold">{message}</p>}{error&&<p role="alert" className="mt-5 border-2 border-red-700 bg-red-50 p-3 text-red-800">{error}</p>}</div>
<article className="brutal-card mt-7 p-5 sm:p-8">
<div className="grid gap-8 border-b-2 border-zinc-900 pb-8 md:grid-cols-2">
<Block title="Bill to">
<strong>{invoice.brand.name}</strong>
<br/>{invoice.brand.email}<br/>{invoice.brand.billingAddress}{invoice.brand.gstNumber&&<>
<br/>GST: {invoice.brand.gstNumber}</>}</Block>
<Block title="From">
<strong>{invoice.creator.name}</strong>
<br/>{invoice.creator.email}{invoice.creator.phone&&<>
<br/>{invoice.creator.phone}</>}<br/>{invoice.creator.address}<br/>PAN: {invoice.creator.panNumber}{invoice.creator.gstNumber&&<>
<br/>GST: {invoice.creator.gstNumber}</>}</Block>
</div>
<dl className="grid grid-cols-2 gap-5 border-b-2 border-zinc-900 py-6 sm:grid-cols-4">
<div>
<dt className="text-xs text-zinc-500">Issue date</dt>
<dd className="font-bold">{dateOnly(invoice.issueDate)}</dd>
</div>
<div>
<dt className="text-xs text-zinc-500">Due date</dt>
<dd className="font-bold">{dateOnly(invoice.dueDate)}</dd>
</div>
<div>
<dt className="text-xs text-zinc-500">Currency</dt>
<dd className="font-bold">{invoice.currency}</dd>
</div>
<div>
<dt className="text-xs text-zinc-500">Updated</dt>
<dd className="font-bold">{new Date(invoice.updatedAt).toLocaleString()}</dd>
</div>
</dl>
<div className="mt-7 overflow-x-auto">
<table className="w-full min-w-[560px] text-left">
<thead>
<tr className="border-b-2 border-zinc-900">{["Description","Quantity","Rate","Amount"].map(x=>
<th key={x} scope="col" className="p-3">{x}</th>)}</tr>
</thead>
<tbody>{invoice.items.map(x=>
<tr key={x.id} className="border-b border-zinc-300">
<td className="p-3">{x.description}</td>
<td className="p-3 font-mono">{x.quantity}</td>
<td className="p-3 font-mono">{cash(x.rate,invoice.currency)}</td>
<td className="p-3 font-mono font-bold">{cash(x.amount,invoice.currency)}</td>
</tr>)}</tbody>
</table>
</div>
<dl className="ml-auto mt-7 max-w-sm space-y-3">
<div className="flex justify-between">
<dt>Subtotal</dt>
<dd className="font-mono font-bold">{cash(invoice.subtotal,invoice.currency)}</dd>
</div>
<div className="flex justify-between">
<dt>Tax ({invoice.taxRate}%)</dt>
<dd className="font-mono font-bold">{cash(invoice.taxAmount,invoice.currency)}</dd>
</div>
<div className="flex justify-between border-t-2 border-zinc-900 pt-3 text-xl">
<dt className="font-black">Total</dt>
<dd className="font-mono font-black">{cash(invoice.total,invoice.currency)}</dd>
</div>
</dl>
<div className="mt-8 grid gap-8 border-t-2 border-zinc-900 pt-8 md:grid-cols-2">
<Block title="Signature">
<span className="text-xl font-black">{invoice.typedSignature}</span>
</Block>
<Block title="Notes / payment terms">{invoice.notes||"—"}</Block>
</div>
<dl className="mt-8 grid gap-3 border-t border-zinc-300 pt-5 text-xs text-zinc-600 sm:grid-cols-3">{[["Issued",invoice.issuedAt],["Paid",invoice.paidAt],["Voided",invoice.voidedAt]].map(([l,v])=>
<div key={l}>
<dt>{l}</dt>
<dd>{v?new Date(v).toLocaleString():"—"}</dd>
</div>)}</dl>
</article>
</>:null}</div>
</main>
</InvoiceGate>}
