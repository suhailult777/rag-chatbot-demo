# RAG Chatbot Demo: AI enquiry assistant for a coaching institute

> **Demo only.** "DemoPrep Academy" is a **fictional** institute. All fees, timings and policies are **made-up sample data**.

**Live demo:** https://suhailult777.github.io/rag-chatbot-demo/

A small retrieval-augmented (RAG) assistant that answers student and parent questions **only from an institute's own documents** (fee sheet, timings, admissions FAQ). Every answer carries **numbered citations**, and each one expands to show the source file and the highlighted passage. If the answer isn't in the documents, it says so instead of guessing.

**Features**
- Chat UI with a welcome state, suggested questions, a typing indicator, streamed answers and expandable source citations.
- "See it on your website" preview: the same assistant shown as a floating widget on a mock site.
- Light and dark mode (follows the system setting, with a toggle), responsive layout, keyboard and screen-reader friendly.
- Retrieval is BM25 over document sections with a small synonym map, running entirely in the browser. No backend, no API keys, zero cost.

**Files**
- `docs.js`: the sample documents
- `rag.js`: index, search and answer
- `app.js`: the UI
- `styles.css`
- `index.html`
- `test.js`: run `node test.js "your question"`

For a real business, the same pattern runs on their brochure, PDFs or website, deployed on the website or on WhatsApp. An LLM can optionally write the answers in natural language while staying grounded in the cited passages.

Built by [Mohd Suhail Idrisi](https://github.com/suhailult777) · enquiries: suhailult123@gmail.com
