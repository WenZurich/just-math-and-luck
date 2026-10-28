/**
 * SEC EDGAR fair-access contact (one place for every script).
 * SEC requires automated clients to send a User-Agent with a real, reachable contact email.
 * Default: the site's own dedicated inbox. SEC_CONTACT env may override it ("Name email@domain"),
 * but a placeholder / personal-name contact is refused ⇒ no SEC call (callers keep last official data).
 */
export const SEC_DEFAULT_CONTACT = "JustMathAndLuck justmathluck@mail.grokbot.com";

/** A contact is usable only if it has a real-looking email and is not a placeholder or the owner's name. */
export function isRealSecContact(s) {
  if (!s || typeof s !== "string") return false;
  const t = s.trim();
  if (!/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+/.test(t)) return false;
  if (/example\.(com|org|net)|@test\.|@localhost|placeholder|tzuhsiang/i.test(t)) return false;
  return true;
}

export function resolveSecContact(env = process.env) {
  const c = env.SEC_CONTACT && env.SEC_CONTACT.trim() ? env.SEC_CONTACT.trim() : SEC_DEFAULT_CONTACT;
  return isRealSecContact(c) ? c : null;
}

/** Full User-Agent string, or null when no real contact (⇒ caller must not call SEC). */
export const SEC_UA = resolveSecContact();
