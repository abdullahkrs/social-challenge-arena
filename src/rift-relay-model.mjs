export const RIFT_RELAY_ID = 'rift-relay';
export const RIFT_LANES = Object.freeze([0, 1, 2]);
export const RIFT_STAGES = Object.freeze(['understanding','application','combination','deception','pressure','mastery','recovery']);
export const RIFT_ZONES = Object.freeze(['foundry','skyway','vault','horizon','surge','resonance','sanctuary']);

export function normalizeSeed(value){const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(0xffffffff,Math.trunc(n)))>>>0:0}
export function createRiftRng(seed){let s=normalizeSeed(seed)||0x6d2b79f5;return()=>{s+=0x6d2b79f5;let x=s;x=Math.imul(x^(x>>>15),x|1);x^=x+Math.imul(x^(x>>>7),x|61);return((x^(x>>>14))>>>0)/4294967296}}
const pick=(rng,list)=>list[Math.floor(rng()*list.length)%list.length];
const shuffle=(rng,list)=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

export function difficultyFor(index){const cycle=Math.floor(index/RIFT_STAGES.length);const stage=index%RIFT_STAGES.length;return Object.freeze({
  stage:RIFT_STAGES[stage],
  zone:RIFT_ZONES[stage],
  speed:Math.min(2.55,0.82+stage*0.13+cycle*0.09),
  decisionMs:Math.max(620,1900-stage*155-cycle*65),
  memory:Math.min(5,Math.max(0,stage-1)+Math.floor(cycle/2)),
  rules:Math.min(4,1+Math.floor(stage/2)+Math.floor(cycle/3)),
  decoys:Math.min(4,Math.max(0,stage-2)+Math.floor(cycle/2)),
  hazards:Math.min(3,1+Math.floor(stage/2)+Math.floor(cycle/4)),
  recovery:stage===6
})}

function ruleFor(rng,d){
  const families=['match'];
  if(d.rules>=2)families.push('direction','count');
  if(d.rules>=3)families.push('invert','memory');
  if(d.rules>=4)families.push('transform');
  const family=pick(rng,families);
  const lanes=shuffle(rng,RIFT_LANES);
  const cue=Math.floor(rng()*4);
  const memory=Array.from({length:Math.max(2,d.memory)},()=>Math.floor(rng()*4));
  return Object.freeze({family,cue,memory,correctLane:lanes[0],decoyLanes:Object.freeze(lanes.slice(1,1+d.decoys))});
}

function obstacleFor(rng,d,rule){
  const types=['gate','gap'];
  if(d.hazards>=2)types.push('sweeper','crusher');
  if(d.hazards>=3)types.push('prism','false-beacon');
  const lanes=shuffle(rng,RIFT_LANES);
  const blocked=Math.min(2,d.hazards>=2&&rng()>.46?2:1);
  const requiresJump=rng()>.72||pick(rng,types)==='gap';
  return Object.freeze({type:pick(rng,types),blockedLanes:Object.freeze(lanes.slice(0,blocked)),safeLane:rule?.correctLane??lanes[blocked]??lanes[2],requiresJump,moving:d.hazards>=2&&rng()>.58});
}

export function generateRiftZone(seed,index=0){
  const safe=Math.max(0,Math.trunc(Number(index)||0));
  const d=difficultyFor(safe);
  const rng=createRiftRng(normalizeSeed(seed)^Math.imul(safe+1,0x9e3779b1));
  const count=d.recovery?4:6+Math.min(5,Math.floor(safe/3));
  const segments=[];
  for(let i=0;i<count;i++){
    const puzzle=!d.recovery&&(i===count-1||rng()>.57);
    const rule=puzzle?ruleFor(rng,d):null;
    const obstacle=obstacleFor(rng,d,rule);
    segments.push(Object.freeze({index:i,kind:puzzle?'puzzle':'movement',rule,obstacle,risk:rng()>.72?1.6:1,spacing:100+Math.round(rng()*70)}));
  }
  return Object.freeze({id:`${safe}`,index:safe,stage:d.stage,zone:d.zone,difficulty:d,variant:Math.floor(rng()*4),segments:Object.freeze(segments)});
}

export function generateRiftRun(seed,count=14){return Object.freeze(Array.from({length:Math.max(1,Math.min(120,Math.trunc(count)||14))},(_,i)=>generateRiftZone(seed,i)))}
export function scoreRiftAction({distance=0,accuracy=0,streak=0,risk=1,puzzle=false,stage=0}={}){const base=60+Math.round(Math.max(0,distance)*3)+Math.round(Math.max(0,Math.min(1,accuracy))*180);return Math.round((base+Math.min(360,Math.max(0,streak)*14)+(puzzle?150:0)+Math.max(0,stage)*25)*Math.max(1,Math.min(2,risk)))}
