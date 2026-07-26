import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  PackageOpen,
} from "lucide-react";
import {
  deriveProductLink,
  productPlatform,
} from "./AutoDmTemplateFields";

function ProductImage({ element }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [element.imageUrl]);
  if (!element.imageUrl || failed)
    return (
      <div className="flex h-36 w-full flex-col items-center justify-center border-b-2 border-zinc-900 bg-zinc-200 text-zinc-500">
        <PackageOpen size={32} />
        <span className="mt-2 text-xs font-black">Product preview</span>
      </div>
    );
  return (
    <img
      src={element.imageUrl}
      alt={`${element.title || "Product"} preview`}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-36 w-full border-b-2 border-zinc-900 object-cover"
    />
  );
}

export default function AutoDmTemplatePreview({
  elements = [],
  collapsible = false,
}) {
  const [open, setOpen] = useState(!collapsible);
  return (
    <div className="mt-4">
      {collapsible && (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full items-center justify-between border-2 border-zinc-900 bg-yellow-100 px-4 py-3 text-left font-black"
        >
          <span>Preview carousel ({elements.length})</span>
          {open ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
        </button>
      )}
      {open && (
        <div
          className={
            collapsible
              ? "border-x-2 border-b-2 border-zinc-900 p-4"
              : "border-2 border-zinc-900 bg-zinc-50 p-4"
          }
        >
          <div
            className="flex snap-x gap-4 overflow-x-auto pb-3"
            aria-label="Approximate Instagram product carousel preview"
          >
            {elements.map((element, index) => {
              const link = deriveProductLink(element);
              const generatedButton =
                element.buttons?.find((button) => button.type === "WEB_URL") ||
                null;
              const buttonTitle =
                generatedButton?.title || productPlatform(link).button;
              const buttonUrl =
                generatedButton?.url || element.defaultActionUrl || link;
              return (
                <article
                  key={element.id || element.clientKey || index}
                  className="w-[78vw] min-w-[220px] max-w-[280px] flex-none snap-start overflow-hidden border-2 border-zinc-900 bg-white"
                >
                  <ProductImage element={element} />
                  <div className="p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Product {index + 1}
                    </p>
                    <h5 className="mt-1 break-words text-lg font-black">
                      {element.title || "Product title will be fetched"}
                    </h5>
                    {element.subtitle && (
                      <p className="mt-2 break-words text-sm text-zinc-600">
                        {element.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="border-t-2 border-zinc-900">
                    {buttonUrl ? (
                      <a
                        href={buttonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-3 text-center text-sm font-black"
                      >
                        {buttonTitle} <ExternalLink size={14} />
                      </a>
                    ) : (
                      <div className="px-3 py-3 text-center text-sm font-black text-zinc-500">
                        {buttonTitle}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-zinc-600">
            <strong>Approximate preview:</strong> Instagram controls the final
            rendering, which may differ from this preview. Product metadata is
            retrieved by the backend after saving.
          </p>
        </div>
      )}
    </div>
  );
}
