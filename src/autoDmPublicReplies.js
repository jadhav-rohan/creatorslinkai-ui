export const MAX_PUBLIC_REPLIES = 5;
export const MAX_PUBLIC_REPLY_LENGTH = 1000;

export function repliesFromRule(rule = {}) {
  const current = Array.isArray(rule.publicReplyMessages)
    ? rule.publicReplyMessages
        .filter((value) => typeof value === "string" && value.trim())
        .slice(0, MAX_PUBLIC_REPLIES)
    : [];
  if (current.length) return current;
  if (typeof rule.publicReplyMessage === "string" && rule.publicReplyMessage.trim())
    return [rule.publicReplyMessage];
  return [""];
}

export function normalizePublicReplies(values = []) {
  return values.map((value) => value.trim()).filter(Boolean);
}

export function validatePublicReplies(values = []) {
  if (values.length > MAX_PUBLIC_REPLIES)
    return "You can add a maximum of 5 public replies.";
  const normalized = normalizePublicReplies(values);
  if (normalized.some((value) => value.length > MAX_PUBLIC_REPLY_LENGTH))
    return "Each public reply must be 1,000 characters or fewer.";
  const unique = new Set(normalized.map((value) => value.toLocaleLowerCase()));
  if (unique.size !== normalized.length)
    return "Public reply variations must be unique.";
  return "";
}
