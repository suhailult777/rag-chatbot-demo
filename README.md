# RAG Chatbot Demo: AI enquiry assistant for a coaching institute

> ⚠️ **Demo only.** "DemoPrep Academy" is a **fictional** institute. All fees, timings and policies are **made-up sample data**.

**Live demo:** https://suhailult777.github.io/rag-chatbot-demo/

A small retrieval-augmented (RAG) chatbot that answers student and parent questions **only from an institute's own documents** (fee sheet, timings, admissions FAQ), with **numbered source citations**. If the answer isn't in the documents, it says so instead of making something up.

- Retrieval: BM25 over document sections, with a small synonym map (fee → cost/price, timing → schedule, …). Runs entirely in the browser.
- Answer: an extractive summary of the best-matching passages, plus citations (file › section).
- Zero backend and zero cost. Hosted on GitHub Pages.

For a real business, the same pattern runs on their brochure, PDFs or website, deployed on the website or on WhatsApp. An LLM can optionally write the answers in natural language while staying grounded in the cited passages.

Files: `docs.js` (sample documents), `rag.js` (index, search and answer), `index.html` (UI), `test.js` (`node test.js "your question"`).

Built by [Mohd Suhail Idrisi](https://github.com/suhailult777).
