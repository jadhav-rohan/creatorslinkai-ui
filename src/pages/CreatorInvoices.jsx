import {Link} from "react-router-dom";import {useCreatorInvoiceAccess} from "../hooks/useCreatorInvoiceAccess";import {useInvoiceList} from "../hooks/useInvoices";import {InvoiceGate,LoadError,Status,cash,dateOnly} from "../components/InvoiceShared";
export default function CreatorInvoices(){const access=useCreatorInvoiceAccess(),query=useInvoiceList({workspaceId:access.workspaceId,token:access.token,enabled:access.workspaceAllowed&&access.canView,onUnauthorized:access.logout});const items=Array.isArray(query.data)?query.data:[],counts={total:items.length,draft:items.filter(x=>x.status==="DRAFT").length,unpaid:items.filter(x=>x.status==="ISSUED"||x.status==="OVERDUE").length,paid:items.filter(x=>x.status==="PAID").length};return <InvoiceGate access={access}>
<main className="brutal-page min-h-[calc(100vh-82px)] p-4 sm:p-6 md:p-8">
<div className="mx-auto max-w-7xl">
<header className="flex flex-col gap-5 border-b-2 border-zinc-900 pb-6 sm:flex-row sm:items-end sm:justify-between">
<div>
<p className="brutal-overline">Creator workspace</p>
<h1 className="mt-2 text-4xl font-black">Invoices</h1>
<p className="mt-2 text-zinc-600">Create, issue, and track brand invoices.</p>
</div>{access.canEdit&&<Link to="/creator/invoices/new" className="brutal-button inline-flex">New Invoice</Link>}</header>{query.loading&&!query.data?<div className="mt-7 animate-pulse space-y-6">
<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1,2,3,4].map(x=>
<div key={x} className="h-28 border-2 border-zinc-900 bg-zinc-200"/>)}</div>
<div className="h-72 border-2 border-zinc-900 bg-zinc-200"/>
</div>:query.error?<div className="mt-7">
<LoadError error={query.error} retry={query.refetch} label="invoice list"/>
</div>:<>
<section aria-label="Invoice summary" className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">{[["Total invoices",counts.total],["Draft",counts.draft],["Unpaid",counts.unpaid],["Paid",counts.paid]].map(([l,v])=>
<article key={l} className="brutal-card p-5">
<p className="brutal-overline text-zinc-500">{l}</p>
<p className="mt-4 font-mono text-3xl font-black">{v}</p>
</article>)}</section>{!items.length?<section className="brutal-card mt-7 p-8 text-center">
<h2 className="text-2xl font-black">You haven’t created any invoices yet.</h2>{access.canEdit&&<Link to="/creator/invoices/new" className="brutal-button mt-6 inline-flex">Create your first invoice</Link>}</section>:<section className="brutal-card mt-7 overflow-hidden">
<div className="hidden overflow-x-auto md:block">
<table className="w-full border-collapse text-left">
<thead className="bg-yellow-200">
<tr>{["Invoice","Brand","Issue date","Due date","Total","Status","Updated",""].map(x=>
<th key={x} scope="col" className="border-b-2 border-zinc-900 p-4 text-sm">{x}</th>)}</tr>
</thead>
<tbody>{items.map(x=>
<tr key={x.id} className="border-b border-zinc-300 last:border-0">
<td className="p-4 font-mono font-bold">{x.invoiceNumber}</td>
<td className="p-4 font-bold">{x.brand?.name}</td>
<td className="p-4">{dateOnly(x.issueDate)}</td>
<td className="p-4">{dateOnly(x.dueDate)}</td>
<td className="p-4 font-mono font-bold">{cash(x.total,x.currency)}</td>
<td className="p-4">
<Status value={x.status}/>
</td>
<td className="p-4 text-sm">{new Date(x.updatedAt||x.createdAt).toLocaleDateString()}</td>
<td className="p-4">
<Link to={`/creator/invoices/${x.id}`} className="font-black underline">Open</Link>
</td>
</tr>)}</tbody>
</table>
</div>
<div className="divide-y-2 divide-zinc-900 md:hidden">{items.map(x=>
<article key={x.id} className="p-5">
<div className="flex items-start justify-between gap-3">
<div>
<p className="font-mono font-black">{x.invoiceNumber}</p>
<h2 className="mt-1 text-xl font-black">{x.brand?.name}</h2>
</div>
<Status value={x.status}/>
</div>
<dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
<div>
<dt className="text-zinc-500">Due</dt>
<dd>{dateOnly(x.dueDate)}</dd>
</div>
<div>
<dt className="text-zinc-500">Total</dt>
<dd className="font-mono font-bold">{cash(x.total,x.currency)}</dd>
</div>
</dl>
<Link to={`/creator/invoices/${x.id}`} className="mt-4 inline-flex font-black underline">Open invoice</Link>
</article>)}</div>
</section>}</>}</div>
</main>
</InvoiceGate>}
