/**
 * SEC EDGAR fair-access contact (one place for every script).
 * SEC requires automated clients to send a User-Agent with a real, reachable contact email.
 * Default: the site's own dedicated inbox. SEC_CONTACT env may override it ("Name email@domain"),
 * but a placeholder / personal-name contact is refused ⇒ no SEC call (callers keep last official data).
 */
import { createHash } from "node:crypto";

/**
 * The owner's personal name/handle must never appear in a contact string or in repo sources.
 * Only a hash of it is kept here (the plain name is not written anywhere in this repo).
 * Rabin–Karp prefilter over lowercase letter runs, confirmed with SHA-256.
 */
export const OWNER_WORD = Object.freeze({ len: 9, rk: 268766235, sha256: "0e9da38478694ae8e4eada9724bcd314e40b3a1cf8e8474c35b0f7a5e613031e" });
const RK_B = 131, RK_M = 2147483647;
export function rkOf(word) { let h = 0; for (const ch of word) h = (h * RK_B + ch.charCodeAt(0)) % RK_M; return h; }
export function containsHashedWord(text, { len, rk, sha256 } = OWNER_WORD) {
  const t = String(text || "").toLowerCase();
  let pow = 1; for (let i = 1; i < len; i++) pow = (pow * RK_B) % RK_M;
  let h = 0, run = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    if (c < 97 || c > 122) { h = 0; run = 0; continue; }
    if (run === len) { h = (h - ((t.charCodeAt(i - len) * pow) % RK_M) + RK_M) % RK_M; run--; }
    h = (h * RK_B + c) % RK_M; run++;
    if (run === len && h === rk && createHash("sha256").update(t.slice(i - len + 1, i + 1)).digest("hex") === sha256) return true;
  }
  return false;
}

export const SEC_DEFAULT_CONTACT = "JustMathAndLuck justmathluck@mail.grokbot.com";

/** A contact is usable only if it has a real-looking email and is not a placeholder or the owner's name. */
export function isRealSecContact(s) {
  if (!s || typeof s !== "string") return false;
  const t = s.trim();
  if (!/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+/.test(t)) return false;
  if (/example\.(com|org|net)|@test\.|@localhost|placeholder/i.test(t) || containsHashedWord(t)) return false;
  return true;
}

export function resolveSecContact(env = process.env) {
  const c = env.SEC_CONTACT && env.SEC_CONTACT.trim() ? env.SEC_CONTACT.trim() : SEC_DEFAULT_CONTACT;
  return isRealSecContact(c) ? c : null;
}

/** Full User-Agent string, or null when no real contact (⇒ caller must not call SEC). */
export const SEC_UA = resolveSecContact();
