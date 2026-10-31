(() => {
  const ix = buildIndex(DOCS);
  const $ = (s, r = document) => r.querySelector(s);
  const params = new URLSearchParams(location.search);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const ICON_SPARK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9z"/><circle cx="18.5" cy="18.5" r="2"/></svg>';
  const ICON_ARROW = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>';
  const ICON_DOC = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>';

  const sectionText = (file, h) => (DOCS.find(d => d.file === file)?.sections.find(s => s.h === h) || {}).t || '';

  function highlight(text, answerText) {
    const sents = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sents.map(s => answerText.includes(s.trim()) ? `<mark>${esc(s.trim())}</mark> ` : esc(s.trim()) + ' ').join('').trim();
  }

  /* ---------- Chat engine bound to a thread element ---------- */
  function createChat({ thread, scroller, input, form, onStart }) {
    let busy = false;
    const scroll = () => {
      if (scroller === window) window.scrollTo(0, document.documentElement.scrollHeight);
      else scroller.scrollTop = scroller.scrollHeight;
    };

    function addUser(q) {
      const li = document.createElement('li');
      li.className = 'msg msg--user'; li.textContent = q;
      thread.appendChild(li); scroll();
    }

    function botShell() {
      const li = document.createElement('li');
      li.className = 'msg msg--bot';
      li.innerHTML = `<span class="avatar" aria-hidden="true">${ICON_SPARK}</span><div class="bot-body"><div class="bot-text"></div></div>`;
      thread.appendChild(li); scroll();
      return li;
    }

    function toggleSource(li, n, sources, answerText) {
      const body = $('.bot-body', li);
      const open = $('.src-card', body);
      const was = open && open.dataset.n === String(n);
      if (open) open.remove();
      li.querySelectorAll('[data-cite]').forEach(b => b.setAttribute('aria-expanded', 'false'));
      if (was) return;
      const s = sources.find(x => x.n === n); if (!s) return;
      li.querySelectorAll(`[data-cite="${n}"]`).forEach(b => b.setAttribute('aria-expanded', 'true'));
      const card = document.createElement('div');
      card.className = 'src-card'; card.dataset.n = n; card.id = `${li.dataset.id}-src-${n}`;
      card.innerHTML = `<div class="src-card__meta"><span class="file">${ICON_DOC} ${esc(s.file)}</span><span class="tag">Sample data</span></div>
        <h4>${esc(s.section)}</h4><p>${highlight(sectionText(s.file, s.section), answerText)}</p>`;
      body.appendChild(card);
    }

    async function stream(el, text, li, sources) {
      const parts = text.split(/(\[\d+\])/).filter(Boolean);
      const caret = document.createElement('span'); caret.className = 'caret';
      el.appendChild(caret);
      for (const part of parts) {
        const m = part.match(/^\[(\d+)\]$/);
        if (m) {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'cite'; b.textContent = m[1];
          b.dataset.cite = m[1]; b.setAttribute('aria-expanded', 'false');
          b.setAttribute('aria-label', `Show source ${m[1]}`);
          b.onclick = () => toggleSource(li, +m[1], sources, text);
          el.insertBefore(b, caret);
          continue;
        }
        const words = part.split(/(\s+)/);
        for (const w of words) {
          el.insertBefore(document.createTextNode(w), caret);
          if (!reduced && w.trim()) await sleep(16 + Math.random() * 22);
        }
        scroll();
      }
      caret.remove();
    }

    let counter = 0;
    async function ask(q) {
      q = q.trim(); if (!q || busy) return;
      busy = true; onStart && onStart();
      addUser(q);
      const li = botShell(); li.dataset.id = `m${++counter}`;
      const textEl = $('.bot-text', li);
      textEl.innerHTML = '<span class="typing" aria-label="Assistant is typing"><i></i><i></i><i></i></span>';
      await sleep(reduced ? 0 : 650);
      const a = answer(ix, q);
      textEl.innerHTML = '';
      if (!a.sources.length) {
        textEl.classList.add('muted');
        await stream(textEl, a.text, li, []);
        const nf = document.createElement('div'); nf.className = 'nofound';
        nf.innerHTML = `${ICON_DOC} No matching source in the documents, so no guess`;
        $('.bot-body', li).appendChild(nf);
      } else {
        await stream(textEl, a.text, li, a.sources);
        const row = document.createElement('div'); row.className = 'sources';
        row.innerHTML = '<span class="sources__label">Sources</span>' + a.sources.map(s =>
          `<button type="button" class="src-chip" data-cite="${s.n}" aria-expanded="false"><b>${s.n}</b><span>${esc(s.section)}</span></button>`).join('');
        row.querySelectorAll('.src-chip').forEach(b => b.onclick = () => toggleSource(li, +b.dataset.cite, a.sources, a.text));
        $('.bot-body', li).appendChild(row);
      }
      scroll(); busy = false;
      if (input && !matchMedia('(pointer: coarse)').matches && !params.get('demo')) input.focus({ preventScroll: true });
    }

    if (form && input) {
      const send = form.querySelector('.send');
      const grow = () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 200) + 'px'; if (send) send.disabled = !input.value.trim(); };
      input.addEventListener('input', grow);
      input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
      form.addEventListener('submit', e => { e.preventDefault(); const v = input.value; input.value = ''; grow(); ask(v); });
      grow();
    }
    return { ask, botShell, stream };
  }

  /* ---------- Main chat ---------- */
  const main = createChat({
    thread: $('#thread'), scroller: window, input: $('#input'), form: $('#composer'),
    onStart: () => document.body.classList.add('started')
  });

  const SUGGEST = [
    ['What is the fee for NEET?', 'Fees & instalments'],
    ['What are the weekend batch timings?', 'Batches & timings'],
    ['Can I get a refund if I leave?', 'Refund policy'],
    ['Is there a scholarship test?', 'Scholarships']
  ];
  $('#chips').innerHTML = SUGGEST.map(([q, s]) => `<button type="button" class="chip" data-q="${esc(q)}"><span>${esc(q)}<small>${esc(s)}</small></span>${ICON_ARROW}</button>`).join('');
  $('#chips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) main.ask(b.dataset.q); });

  // Greeting (welcome state)
  (function greet() {
    const li = main.botShell();
    $('.bot-text', li).innerHTML = 'Hi! I\'m the enquiry assistant for <strong>DemoPrep Academy</strong>, Ameerpet. Ask me about fees, batch timings, scholarships, refunds, hostels or admissions. Every answer links to the document it came from.';
  })();

  /* ---------- Theme ---------- */
  $('#theme').addEventListener('click', () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
  });

  /* ---------- Docs dialog ---------- */
  $('#docs-body').innerHTML = DOCS.map(d => `<section class="doc"><div class="doc__file">${ICON_DOC} ${esc(d.file)} <span class="pill">Sample</span></div>
    ${d.sections.map(s => `<h4>${esc(s.h)}</h4><p>${esc(s.t)}</p>`).join('')}</section>`).join('');
  $('#open-docs').onclick = () => $('#docs').showModal();
  $('#close-docs').onclick = () => $('#docs').close();
  $('#docs').addEventListener('click', e => { if (e.target === $('#docs')) $('#docs').close(); });

  /* ---------- Tabs: chat vs website preview ---------- */
  const tabs = [$('#tab-chat'), $('#tab-site')];
  function show(which) {
    const site = which === 'site';
    tabs[0].setAttribute('aria-selected', String(!site)); tabs[1].setAttribute('aria-selected', String(site));
    $('#view-chat').hidden = site; $('#view-site').hidden = !site;
    window.scrollTo(0, 0);
  }
  tabs[0].onclick = () => show('chat'); tabs[1].onclick = () => show('site');
  $('.seg').addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const i = tabs.indexOf(document.activeElement); if (i < 0) return;
    const n = tabs[(i + 1) % 2]; n.focus(); n.click();
  });

  /* ---------- Widget ---------- */
  const wpanel = $('#wpanel'), wbubble = $('#wbubble');
  const mini = createChat({ thread: $('#wthread'), scroller: $('#wthread'), input: $('#winput'), form: $('#wcomposer') });
  let greeted = false;
  function setWidget(open) {
    wpanel.hidden = !open; wbubble.setAttribute('aria-expanded', String(open));
    $('#wnudge').hidden = open;
    if (open && !greeted) {
      greeted = true;
      const li = mini.botShell();
      $('.bot-text', li).innerHTML = 'Hi! 👋 Ask me anything about fees, batches or admissions.';
    }
    if (open && !matchMedia('(pointer: coarse)').matches) $('#winput').focus({ preventScroll: true });
  }
  wbubble.onclick = () => setWidget(wpanel.hidden);
  $('#wclose').onclick = () => { setWidget(false); wbubble.focus(); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !wpanel.hidden) { setWidget(false); wbubble.focus(); } });

  /* ---------- Deep links for demos/tests: ?view=site&open=1, ?demo=1 ---------- */
  if (params.get('view') === 'site') { show('site'); if (params.get('open')) { setWidget(true); if (params.get('demo')) setTimeout(() => mini.ask('What is the fee for NEET?'), 200); } }
  else if (params.get('demo')) {
    (async () => {
      for (const q of ['What is the fee for NEET?', 'What are the weekend batch timings?', 'Who won the cricket match yesterday?']) await main.ask(q);
      const c = params.get('cite'); if (c) document.querySelector('#thread .cite')?.click();
    })();
  }
})();
