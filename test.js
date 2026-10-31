const {DOCS}=require('./docs.js'); const {buildIndex,answer}=require('./rag.js');
const ix=buildIndex(DOCS);
for(const q of process.argv.slice(2)){ const a=answer(ix,q); console.log("Q:",q,"\nA:",a.text); for(const s of a.sources) console.log("   ["+s.n+"] "+s.file+" > "+s.section+" ("+s.score+")"); console.log(); }
