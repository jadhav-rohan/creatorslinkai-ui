import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

let nextKey = 0;
const clientKey = () => `auto-dm-product-${Date.now()}-${nextKey++}`;

export function deriveProductLink(element = {}) {
  return (
    element.productLink ||
    element.defaultActionUrl ||
    element.buttons?.find((button) => button.type === "WEB_URL")?.url ||
    ""
  );
}

export const createTemplateElement = (element = {}) => ({
  clientKey: element.clientKey || clientKey(),
  id: element.id,
  title: element.title || "",
  subtitle: element.subtitle || "",
  productLink: deriveProductLink(element),
  // Returned enrichment is retained for previews but never serialized.
  imageUrl: element.imageUrl || "",
  defaultActionUrl: element.defaultActionUrl || "",
  buttons: Array.isArray(element.buttons) ? element.buttons : [],
});

export function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function productPlatform(value) {
  if (!isHttpsUrl(value)) return { name: "Other", button: "Shop Here" };
  const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  if (host === "amazon.com" || host.endsWith(".amazon.com") || /^amazon\.[a-z.]+$/.test(host))
    return { name: "Amazon", button: "Shop on Amazon" };
  if (host === "nykaa.com" || host.endsWith(".nykaa.com"))
    return { name: "Nykaa", button: "Shop on Nykaa" };
  if (host === "myntra.com" || host.endsWith(".myntra.com"))
    return { name: "Myntra", button: "Shop on Myntra" };
  if (host === "flipkart.com" || host.endsWith(".flipkart.com"))
    return { name: "Flipkart", button: "Shop on Flipkart" };
  return { name: "Other", button: "Shop Here" };
}

export function validateTemplate(elements) {
  if (!Array.isArray(elements) || elements.length < 1 || elements.length > 10)
    return "Generic templates require between 1 and 10 products.";
  for (let index = 0; index < elements.length; index += 1) {
    const element = elements[index];
    const label = `Product ${index + 1}`;
    if (element.title.trim().length > 80)
      return `${label} title must be 80 characters or fewer.`;
    if (element.subtitle.trim().length > 80)
      return `${label} subtitle must be 80 characters or fewer.`;
    if (!element.productLink.trim())
      return `${label} product link is required.`;
    if (!isHttpsUrl(element.productLink.trim()))
      return `${label} product link must begin with https://.`;
  }
  return "";
}

export function serializeTemplate(elements) {
  return elements.map((element) => ({
    ...(element.title.trim() ? { title: element.title.trim() } : {}),
    ...(element.subtitle.trim()
      ? { subtitle: element.subtitle.trim() }
      : {}),
    productLink: element.productLink.trim(),
  }));
}

function move(items, index, direction) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export default function AutoDmTemplateFields({ elements, onChange }) {
  const update = (index, patch) =>
    onChange(
      elements.map((element, current) =>
        current === index ? { ...element, ...patch } : element,
      ),
    );
  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-black">Carousel products</h3>
          <p className="mt-1 text-sm text-zinc-600">
            Add 1–10 products. CreatorLinksAI retrieves product metadata after
            you save.
          </p>
        </div>
        <button
          type="button"
          disabled={elements.length >= 10}
          onClick={() => onChange([...elements, createTemplateElement()])}
          className="flex items-center gap-2 border-2 border-zinc-900 bg-sky-200 px-4 py-2 font-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={17} /> Add product
        </button>
      </div>

      {elements.map((element, index) => {
        const platform = productPlatform(element.productLink.trim());
        const missingLegacyLink =
          Boolean(element.id) && !element.productLink.trim();
        return (
          <section
            key={element.clientKey || element.id || index}
            className="border-2 border-zinc-900 bg-white p-4 sm:p-5"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-zinc-900 pb-3">
              <h4 className="text-lg font-black">Product {index + 1}</h4>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-label={`Move product ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() => onChange(move(elements, index, -1))}
                  className="border-2 border-zinc-900 p-2 disabled:opacity-30"
                >
                  <ChevronUp size={17} />
                </button>
                <button
                  type="button"
                  aria-label={`Move product ${index + 1} down`}
                  disabled={index === elements.length - 1}
                  onClick={() => onChange(move(elements, index, 1))}
                  className="border-2 border-zinc-900 p-2 disabled:opacity-30"
                >
                  <ChevronDown size={17} />
                </button>
                <button
                  type="button"
                  disabled={elements.length === 1}
                  onClick={() =>
                    onChange(
                      elements.filter((_, current) => current !== index),
                    )
                  }
                  className="flex items-center gap-1 border-2 border-red-700 px-3 py-2 text-sm font-black text-red-800 disabled:opacity-30"
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </header>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="font-bold">
                Carousel title (optional){" "}
                <span className="font-normal text-zinc-500">
                  ({element.title.length}/80)
                </span>
                <input
                  maxLength={80}
                  value={element.title}
                  onChange={(event) =>
                    update(index, { title: event.target.value })
                  }
                  className="brutal-field mt-2 w-full"
                />
                <span className="mt-1 block text-xs font-normal text-zinc-500">
                  Leave blank to automatically fetch the product title.
                </span>
              </label>
              <label className="font-bold">
                Subtitle{" "}
                <span className="font-normal text-zinc-500">
                  ({element.subtitle.length}/80)
                </span>
                <input
                  maxLength={80}
                  value={element.subtitle}
                  onChange={(event) =>
                    update(index, { subtitle: event.target.value })
                  }
                  className="brutal-field mt-2 w-full"
                />
              </label>
              <label className="font-bold sm:col-span-2">
                Product link *
                <input
                  type="url"
                  inputMode="url"
                  placeholder="https://…"
                  value={element.productLink}
                  onChange={(event) =>
                    update(index, {
                      productLink: event.target.value,
                      imageUrl: "",
                      defaultActionUrl: "",
                      buttons: [],
                    })
                  }
                  className="brutal-field mt-2 w-full"
                />
              </label>
            </div>
            {missingLegacyLink && (
              <p role="alert" className="mt-3 border-2 border-amber-700 bg-amber-50 p-3 text-sm font-bold text-amber-900">
                This older carousel item does not have a product link. Add one
                before saving.
              </p>
            )}
            <p className="mt-3 border-l-4 border-zinc-900 bg-sky-50 p-3 text-sm">
              <strong>{platform.name}:</strong> Button text will be generated as
              “{platform.button}”.
            </p>
          </section>
        );
      })}
    </div>
  );
}
