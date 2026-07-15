const INVITE_QUERY_KEYS = Object.freeze(['c', 'ck', 's', 't', 'v']);
const INVITE_QUERY_KEY_SET = new Set(INVITE_QUERY_KEYS);

function toSearchParams(input) {
  return input instanceof URLSearchParams
    ? new URLSearchParams(input)
    : new URLSearchParams(input || '');
}

export function classifyLocationInvite(input, parseInvite) {
  if (typeof parseInvite !== 'function') throw new TypeError('Invite parser is required');
  const source = toSearchParams(input);
  const inviteParams = new URLSearchParams();
  let present = false;

  for (const [key, value] of source) {
    if (!INVITE_QUERY_KEY_SET.has(key)) continue;
    present = true;
    inviteParams.append(key, value);
  }

  if (!present) return { ok: true, invite: null, present: false };
  return { ...parseInvite(inviteParams), present: true };
}

export function stripInviteKeysFromUrl(input, baseUrl = 'https://local.invalid/') {
  const url = input instanceof URL ? new URL(input.toString()) : new URL(String(input), baseUrl);
  for (const key of INVITE_QUERY_KEYS) url.searchParams.delete(key);
  const search = url.searchParams.toString();
  return `${url.pathname}${search ? `?${search}` : ''}${url.hash}`;
}

export { INVITE_QUERY_KEYS };
