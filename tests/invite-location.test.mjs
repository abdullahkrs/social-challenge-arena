import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { encodeInvite, parseInvite } from '../src/core.mjs';
import { classifyLocationInvite, stripInviteKeysFromUrl } from '../src/invite-location.mjs';

test('empty and benign-only queries are normal discovery entries without validation', () => {
  let calls = 0;
  const parser = () => { calls += 1; return { ok: false, reason: 'unexpected' }; };
  assert.deepEqual(classifyLocationInvite('', parser), { ok: true, invite: null, present: false });
  assert.deepEqual(classifyLocationInvite('?production-review=abc123&lang=ar', parser), { ok: true, invite: null, present: false });
  assert.equal(calls, 0);
});

test('valid invitation remains deterministic beside benign parameters', () => {
  const invite = encodeInvite({ challengeId: 'mirror-fuse', seed: 77, target: 900 });
  invite.set('production-review', 'abc123');
  invite.set('lang', 'tr');
  assert.deepEqual(classifyLocationInvite(invite, parseInvite), {
    ok: true,
    invite: { challengeId: 'mirror-fuse', seed: 77, target: 900 },
    present: true
  });
});

test('incomplete duplicate and unsupported invitation values remain rejected', () => {
  assert.deepEqual(classifyLocationInvite('?v=1&production-review=abc', parseInvite), { ok: false, reason: 'shape', present: true });
  assert.deepEqual(classifyLocationInvite('?v=1&v=1&c=orbit-lock&s=1&t=10&ck=x', parseInvite), { ok: false, reason: 'shape', present: true });
  assert.deepEqual(classifyLocationInvite('?v=2&c=orbit-lock&s=1&t=10&ck=x&debug=1', parseInvite), { ok: false, reason: 'version', present: true });
  assert.deepEqual(classifyLocationInvite('?v=1&c=unknown&s=1&t=10&ck=x', parseInvite), { ok: false, reason: 'challenge', present: true });
});

test('malformed invitation cleanup preserves unrelated parameters and hash', () => {
  assert.equal(
    stripInviteKeysFromUrl('https://example.com/arena?v=1&c=bad&s=1&t=10&ck=x&production-review=abc&lang=ar#catalog'),
    '/arena?production-review=abc&lang=ar#catalog'
  );
  assert.equal(stripInviteKeysFromUrl('https://example.com/arena?v=1#catalog'), '/arena#catalog');
});

test('browser integration tracks invalid state only after invitation classification fails', async () => {
  const source = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');
  assert.match(source, /classifyLocationInvite\(window\.location\.search, parseInvite\)/);
  assert.match(source, /if \(!parsed\.ok\)[\s\S]*track\('invite_invalid'/);
  assert.match(source, /stripInviteKeysFromUrl\(window\.location\.href\)/);
});
