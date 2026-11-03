// Tiny client-side RAG (PAL Physiotherapy demo build): BM25 retrieval over document sections + extractive answer with citations.
const STOP = new Set("a an the is are was were be been of to in on for and or with at by from as it its this that these those do does did can could will would should i you we they he she my our your their me us what when where which who whom how why any there here have has had not no yes if then than so such into about after before per also just only please tell know want need get much".split(" "));
const SYN = { fee:"fees cost price charge consultation", fees:"fee cost price charge", cost:"fee fees price charge", price:"fee cost charge", charge:"fee cost price", charges:"fee cost price", pay:"fee cost payment", timing:"timings hours open", timings:"timing hours open", time:"timings hours", hours:"timings open", open:"hours timings", close:"hours timings", sunday:"weekends days seven", weekend:"weekends days", saturday:"weekends", home:"home visit visits", visit:"visits home", house:"home visit", doorstep:"home visit", come:"visit home", book:"booking appointment", booking:"book appointment", appointment:"book booking", reserve:"book appointment", schedule:"book appointment", where:"located location address clinics", address:"location located", location:"located address clinic", located:"address location", near:"closest nearest far", directions:"reach", reach:"directions", treatment:"treatments therapy", treatments:"treatment therapy", treat:"treatment conditions", conditions:"treat", therapy:"treatment", offer:"available provide", bring:"wear reports", wear:"bring", offered:"available", provide:"offer available", online:"online video consultations", video:"online", doctor:"bhuvana physiotherapist", physio:"physiotherapy", referral:"referral", insurance:"insurance claims", parking:"parking", whatsapp:"whatsapp call", phone:"call whatsapp", contact:"call whatsapp phone", number:"call whatsapp phone" };
function stem(w){ w=w.replace(/ies$/,"y").replace(/(ss|x|ch|sh)es$/,"$1").replace(/([^su])s$/,"$1"); if(w.length>5) w=w.replace(/ing$/,""); return w; }
function tokens(s){ return (s.toLowerCase().match(/[a-z0-9]+/g)||[]).filter(w=>!STOP.has(w)).map(stem); }
function expandW(q){ const m=new Map(); for(const w of (q.toLowerCase().match(/[a-z0-9]+/g)||[])){ if(STOP.has(w)) continue; m.set(stem(w),1); if(SYN[w]) for(const s of SYN[w].split(" ")){ const t=stem(s); if(!m.has(t)) m.set(t,0.4); } } return m; }
function expand(q){ return [...expandW(q).keys()]; }
function buildIndex(DOCS){
  const chunks=[]; for(const d of DOCS) for(const s of d.sections) chunks.push({file:d.file,url:d.url,doc:d.title,h:s.h,t:s.t,toks:tokens(s.h+" "+s.h+" "+s.t),htoks:[...new Set(tokens(s.h))]});
  const df={}; for(const c of chunks) for(const w of new Set(c.toks)) df[w]=(df[w]||0)+1;
  const avg=chunks.reduce((a,c)=>a+c.toks.length,0)/chunks.length;
  return {chunks,df,avg,N:chunks.length};
}
function search(ix,q,k=3){
  const qw=expandW(q), k1=1.4, b=0.75;
  const scored=ix.chunks.map(c=>{ const tf={}; for(const w of c.toks) tf[w]=(tf[w]||0)+1; let s=0;
    for(const [w,wt] of qw){ if(!tf[w]) continue; const idf=Math.log(1+(ix.N-ix.df[w]+0.5)/(ix.df[w]+0.5)); s+=wt*idf*(tf[w]*(k1+1))/(tf[w]+k1*(1-b+b*c.toks.length/ix.avg)); }
    // Prefer passages whose heading is about what was asked: each distinctive heading word the question did not mention costs 20%.
    let miss=0; for(const w of c.htoks){ if(qw.has(w)) continue; const d=ix.df[w]||0; if(Math.log(1+(ix.N-d+0.5)/(d+0.5))>2.5) miss++; }
    s*=Math.max(0.5,Math.pow(0.8,miss));
    return {c,s}; });
  return scored.filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,k);
}
const ABBR=/\b(No|Dr|St|Mr|Mrs|Ms|Rd|approx)\.\s/g;
function sentences(t){ const p=t.replace(ABBR,(m,a)=>a+"\u2024 "); return (p.match(/[^.!?]+[.!?]+/g)||[p]).map(s=>s.replace(/\u2024/g,".")); }
function idf(ix,w){ const d=ix.df[w]||0; return Math.log(1+(ix.N-d+0.5)/(d+0.5)); }
const FALLBACK="I couldn't find that on the clinic's website, so I won't guess. Please contact the clinic: call or WhatsApp +91 86393 98229 (open 7 AM to 9 PM, all days).";
function answer(ix,q){
  const hits=search(ix,q,3);
  if(!hits.length || hits[0].s<1.2) return {text:FALLBACK, sources:[]};
  // Coverage guard: the best passage must contain most of the question's distinctive words.
  const qw=expandW(q); const orig=[...qw].filter(([w,wt])=>wt===1).map(([w])=>w);
  const topToks=new Set(hits[0].c.toks); let tot=0, got=0;
  for(const w of orig){ const v=idf(ix,w); tot+=v; if(topToks.has(w) || [...qw].some(([s,wt])=>wt<1&&topToks.has(s)&&SYN_OF(w).includes(s))) got+=v; }
  if(tot>0 && got/tot<0.5) return {text:FALLBACK, sources:[]};
  const top=hits[0].s, used=hits.filter(h=>h.s>=top*0.6).slice(0,2);
  const parts=[], kept=[], seenT=[];
  const jac=(a,b)=>{ const A=new Set(tokens(a)),B=new Set(tokens(b)); let i=0; for(const x of A) if(B.has(x)) i++; return i/Math.max(1,A.size+B.size-i); };
  for(const h of used){
    if(seenT.some(t=>jac(t,h.c.t)>0.5)) continue; seenT.push(h.c.t); kept.push(h);
    const sents=sentences(h.c.t);
    if(sents.length<=3 && h.c.t.length<=320){ parts.push(h.c.t.trim()+" ["+(parts.length+1)+"]"); continue; }
    const ranked=sents.map((s,i)=>{ const ts=new Set(tokens(s)); let sc=0; for(const [w,wt] of qw) if(ts.has(w)) sc+=wt*idf(ix,w); if(/\b(PAL|we|our|us)\b/i.test(s)) sc*=1.3; return {s:s.trim(),i,sc}; }).sort((a,b)=>b.sc-a.sc||a.i-b.i);
    const keep=ranked.filter(x=>x.sc>0 && x.sc>=ranked[0].sc*0.6).slice(0,2); if(!keep.length) keep.push(ranked[0]);
    keep.sort((a,b)=>a.i-b.i); parts.push(keep.map(x=>x.s).join(" ")+" ["+(parts.length+1)+"]");
  }
  return {text:parts.join(" "), sources:kept.map((h,i)=>({n:i+1,file:h.c.file,url:h.c.url,doc:h.c.doc,section:h.c.h,score:h.s.toFixed(2)}))};
}
function SYN_OF(w){ for(const k in SYN) if(stem(k)===w) return SYN[k].split(" ").map(stem); return []; }
if (typeof module !== "undefined") module.exports = { buildIndex, search, answer, sentences };
