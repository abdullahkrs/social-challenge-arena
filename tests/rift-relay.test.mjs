import test from 'node:test';
import assert from 'node:assert/strict';
import { difficultyFor, generateRiftRun, generateRiftZone, RIFT_RELAY_ID, RIFT_STAGES, scoreRiftAction } from '../src/rift-relay-model.mjs';
import { buildInviteUrl, CHALLENGE_IDS, dailyChallengeFor, parseInvite } from '../src/core.mjs';
import { catalog } from '../src/catalog.mjs';

test('Rift Relay is the only shipped challenge',()=>{assert.equal(RIFT_RELAY_ID,'rift-relay');assert.deepEqual(CHALLENGE_IDS,['rift-relay']);assert.equal(catalog.length,1);assert.equal(catalog[0].id,'rift-relay')});
test('same seed produces the same escalating route',()=>{assert.deepEqual(generateRiftRun(123456,18),generateRiftRun(123456,18));assert.notDeepEqual(generateRiftRun(123456,18),generateRiftRun(654321,18))});
test('first cycle follows understanding through mastery and recovery',()=>{const zones=generateRiftRun(42,7);assert.deepEqual(zones.map(z=>z.stage),RIFT_STAGES);assert.ok(zones.some(z=>z.zone==='surge'));assert.ok(zones.some(z=>z.difficulty.recovery));assert.ok(zones.every(z=>z.segments.length>=4))});
test('difficulty grows across decisions memory rules decoys and hazards',()=>{const early=difficultyFor(0),late=difficultyFor(12);assert.ok(late.speed>early.speed);assert.ok(late.decisionMs<early.decisionMs);assert.ok(late.memory>early.memory);assert.ok(late.rules>early.rules);assert.ok(late.decoys>early.decoys);assert.ok(late.hazards>early.hazards)});
test('rule families and obstacle families diversify',()=>{const zones=generateRiftRun(77,14);const rules=new Set(),obstacles=new Set();for(const z of zones)for(const s of z.segments){if(s.rule)rules.add(s.rule.family);obstacles.add(s.obstacle.type)}assert.ok(rules.size>=4);assert.ok(obstacles.size>=4);assert.deepEqual(generateRiftZone(42,5),generateRiftZone(42,5))});
test('score rewards accuracy streak risk puzzle and stage mastery',()=>{const basic=scoreRiftAction({distance:10,accuracy:.5,streak:0,risk:1,puzzle:false,stage:0});const mastered=scoreRiftAction({distance:10,accuracy:1,streak:8,risk:1.6,puzzle:true,stage:5});assert.ok(mastered>basic)});
test('friend links only accept Rift Relay and preserve seed and target',()=>{const url=buildInviteUrl('https://example.test/game',{seed:987,target:4321});const parsed=parseInvite(new URL(url).search);assert.deepEqual(parsed,{ok:true,invite:{challengeId:'rift-relay',seed:987,target:4321}});assert.equal(parseInvite('?v=2&c=unknown&s=1&t=2&ck=x').ok,false)});
test('daily challenge always resolves to flagship with stable seed',()=>{const a=dailyChallengeFor(new Date('2026-07-15T00:00:00Z'));const b=dailyChallengeFor(new Date('2026-07-15T20:00:00Z'));assert.deepEqual(a,b);assert.equal(a.challengeId,'rift-relay')});
