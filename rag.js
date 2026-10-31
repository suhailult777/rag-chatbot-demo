// Tiny client-side RAG: BM25 retrieval over document sections + extractive answer with citations.
const STOP = new Set("a an the is are was were be been of to in on for and or with at by from as it its this that these those do does did can could will would should i you we they he she my our your their me us what when where which who whom how why any there here have has had not no yes if then than so such into about after before per also just only please tell know want need get".split(" "));
const SYN = { fee:"fees cost price charge amount pay tuition", fees:"fee cost price charge", cost:"fee fees price", price:"fee fees cost", charges:"fee fees", timing:"timings time schedule batch hours", timings:"timing time schedule batch hours", time:"timing timings schedule", schedule:"timing timings batch", hours:"timing timings open", open:"hours office", refund:"refund withdraw cancel money back", cancel:"refund withdraw", withdraw:"refund", scholarship:"scholarship discount dast", discount:"scholarship discount concession", concession:"discount scholarship", installment:"instalment instalments", installments:"instalment instalments", emi:"loan emi instalment", hostel:"hostel accommodation stay", stay:"hostel", bus:"transport bus", transport:"bus transport", demo:"demo trial free", trial:"demo free", online:"online live recordings", eamcet:"eapcet", weekend:"weekend saturday sunday", sunday:"weekend sunday", start:"start dates begin", begin:"start", where:"location located address", address:"location located", location:"located address", jee:"jee", neet:"neet", documents:"bring photos aadhaar memo", admission:"admission apply", join:"admission apply", parents:"parent parents", contact:"contact phone whatsapp" };
function stem(w){ return w.replace(/(ings|ing|es|s)$/,"").replace(/ies$/,"y"); }
function tokens(s){ return (s.toLowerCase().match(/[a-z0-9]+/g)||[]).filter(w=>!STOP.has(w)).map(stem); }
function expandW(q){ const m=new Map(); for(const w of (q.toLowerCase().match(/[a-z0-9]+/g)||[])){ if(STOP.has(w)) continue; m.set(stem(w),1); if(SYN[w]) for(const s of SYN[w].split(" ")){ const t=stem(s); if(!m.has(t)) m.set(t,0.4); } } return m; }
function expand(q){ return [...expandW(q).keys()]; }
const EXAMS=["jee","neet","eapcet"];
function buildIndex(DOCS){
  const chunks=[]; for(const d of DOCS) for(const s of d.sections) chunks.push({file:d.file,doc:d.title,h:s.h,t:s.t,toks:tokens(s.h+" "+s.h+" "+s.t)});
  const df={}; for(const c of chunks) for(const w of new Set(c.toks)) df[w]=(df[w]||0)+1;
  const avg=chunks.reduce((a,c)=>a+c.toks.length,0)/chunks.length;
  return {chunks,df,avg,N:chunks.length};
}
function search(ix,q,k=3){
  const qw=expandW(q), k1=1.4, b=0.75; const qEx=EXAMS.filter(e=>qw.get(e)===1||(e==="eapcet"&&/eamcet/i.test(q)));
  const scored=ix.chunks.map(c=>{ const tf={}; for(const w of c.toks) tf[w]=(tf[w]||0)+1; let s=0;
    for(const [w,wt] of qw){ if(!tf[w]) continue; const idf=Math.log(1+(ix.N-ix.df[w]+0.5)/(ix.df[w]+0.5)); s+=wt*idf*(tf[w]*(k1+1))/(tf[w]+k1*(1-b+b*c.toks.length/ix.avg)); }
    if(qEx.length){ const cEx=EXAMS.filter(e=>tf[e]); if(cEx.length && !cEx.some(e=>qEx.includes(e))) s*=0.3; }
    return {c,s}; });
  return scored.filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,k);
}
function answer(ix,q){
  const hits=search(ix,q,3);
  if(!hits.length || hits[0].s<1.2) return {text:"I couldn't find that in the institute's documents, so I won't guess. Please contact the front desk during office hours (9 AM to 7 PM, Mon-Sat) and they'll help you.", sources:[]};
  const top=hits[0].s, used=hits.filter(h=>h.s>=top*0.6).slice(0,2);
  const qt=new Set(expand(q)); const parts=[];
  for(const h of used){
    const sents=h.c.t.match(/[^.!?]+[.!?]+/g)||[h.c.t];
    const ranked=sents.map((s,i)=>({s:s.trim(),i,sc:tokens(s).filter(w=>qt.has(w)).length})).sort((a,b)=>b.sc-a.sc||a.i-b.i);
    const keep=ranked.filter(x=>x.sc>0).slice(0,2); if(!keep.length) keep.push(ranked[0]);
    keep.sort((a,b)=>a.i-b.i); parts.push(keep.map(x=>x.s).join(" ")+" ["+(parts.length+1)+"]");
  }
  return {text:parts.join(" "), sources:used.map((h,i)=>({n:i+1,file:h.c.file,doc:h.c.doc,section:h.c.h,score:h.s.toFixed(2)}))};
}
if (typeof module !== "undefined") module.exports = { buildIndex, search, answer };
