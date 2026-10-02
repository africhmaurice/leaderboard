// The "share this board" card for the leaderboard (index.html) and the act standings (act.html).
// LBShare.mount(after, get) puts a SHARE THIS BOARD button under `after`; get() returns what is on screen now:
//   { title: 'Act Two Standings', region: 'United States', when: 'Updated October 2' or 'Final',
//     stat: '59,835 crew points' (optional), rows: [{ rank, name, handle, points }], theme: 'teal' }
// The card is 1080x1350 (a portrait post), in any of the six brand colors.
var LBShare = (function () {
  var THEMES = {
    violet: { bg: '#482d85', band: '#2d1c53', text: '#fffffe', soft: 'rgba(255,255,254,.72)', hi: '#c3a6ff', rule: 'rgba(255,255,254,.22)' },
    scarlet: { bg: '#c53200', band: '#912501', text: '#fffffe', soft: 'rgba(255,255,254,.78)', hi: '#ffd9c4', rule: 'rgba(255,255,254,.25)' },
    green: { bg: '#2c6021', band: '#1b3b15', text: '#fffffe', soft: 'rgba(255,255,254,.74)', hi: '#a2f590', rule: 'rgba(162,245,144,.3)' },
    teal: { bg: '#1a5e41', band: '#0f3a27', text: '#fffffe', soft: 'rgba(255,255,254,.74)', hi: '#89fbcb', rule: 'rgba(137,251,203,.3)' },
    ink: { bg: '#0b170f', band: '#213226', text: '#fffffe', soft: '#8fa596', hi: '#3adb97', rule: 'rgba(162,245,144,.22)' },
    parchment: { bg: '#fffffe', band: '#c53200', text: '#0b170f', soft: '#607667', hi: '#c53200', rule: 'rgba(11,23,15,.18)' }
  };
  var NAMES = { violet: 'Violet', scarlet: 'Scarlet', green: 'Green', teal: 'Teal', ink: 'Ink', parchment: 'Parchment' };
  var css = document.createElement('style');
  css.textContent =
    '.lbs-open{display:block;margin:clamp(20px,3vw,28px) auto 0;font-family:"Almarai",sans-serif;font-weight:700;font-size:15px;letter-spacing:.08em;color:#fff;background:rgba(12,26,8,.35);border:2px solid #f3ead9;border-radius:0;padding:12px 26px;cursor:pointer;transition:transform .15s ease,background .15s ease}' +
    '.lbs-open:hover{transform:scale(1.04);background:rgba(12,26,8,.55)}' +
    '.lbs{max-width:1000px;margin:clamp(16px,2.4vw,22px) auto 0;background:#0b170f;border:3px solid #111;padding:clamp(22px,3.5vw,34px) clamp(16px,3vw,30px);display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;color:#fffffe}' +
    '.lbs[hidden]{display:none}' +
    '.lbs-h{font-family:"Atomic Marker",Impact,sans-serif;font-weight:400;font-size:clamp(28px,4.5vw,42px);line-height:1.25;letter-spacing:.03em;color:#a2f590;margin:0}' +
    '.lbs img{display:block;width:100%;max-width:360px;aspect-ratio:4/5;border:2px solid rgba(162,245,144,.35);background:#0b170f}' +
    '.lbs-sw{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:0;padding:0;border:0}' +
    '.lbs-sw legend{width:100%;padding:0;margin:0 0 10px;font-weight:700;font-size:14px;letter-spacing:.08em}' +
    '.lbs-sw button{width:34px;height:34px;border:2px solid rgba(255,255,254,.55);border-radius:0;padding:0;cursor:pointer}' +
    '.lbs-sw button[aria-pressed="true"]{outline:3px solid #a2f590;outline-offset:3px}' +
    '.lbs-save{font-family:"Almarai",sans-serif;font-weight:700;font-size:15px;letter-spacing:.08em;color:#fffffe;background:#c53200;border:2px solid #fffffe;border-radius:0;padding:12px 26px;min-width:220px;cursor:pointer}' +
    '.lbs-save:hover{background:#ff4c0f}' +
    '.lbs p{margin:0;font-size:clamp(14px,1.6vw,16px);line-height:1.6;max-width:520px}';
  document.head.appendChild(css);

  function mount(after, get) {
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'lbs-open'; btn.textContent = 'SHARE THIS BOARD';
    var box = document.createElement('div'); box.className = 'lbs'; box.hidden = true;
    after.parentNode.insertBefore(btn, after.nextSibling); btn.parentNode.insertBefore(box, btn.nextSibling);
    var theme = null, url = null, board = null;
    function paint() {
      board = get(); if (!theme) theme = board.theme || 'ink';
      box.innerHTML = '<div class="lbs-h">SHARE THIS BOARD</div><img alt="Card of the ' + board.title + ' board">' +
        '<fieldset class="lbs-sw"><legend>PICK YOUR COLOR</legend>' + Object.keys(THEMES).map(function (k) {
          return '<button type="button" data-t="' + k + '" aria-pressed="' + (k === theme) + '" aria-label="' + NAMES[k] + '" title="' + NAMES[k] + '" style="background:' + THEMES[k].bg + '"></button>';
        }).join('') + '</fieldset><button type="button" class="lbs-save">SAVE THE CARD</button>' +
        '<p>Post it anywhere and tag the sky pirates on the board.</p>';
      draw(board, theme).then(function (u) { url = u; var im = box.querySelector('img'); if (im) im.src = u; report(); });
      report();
    }
    btn.onclick = function () { box.hidden = !box.hidden; btn.textContent = box.hidden ? 'SHARE THIS BOARD' : 'CLOSE'; if (!box.hidden) paint(); else report(); };
    box.addEventListener('click', function (e) {
      var sw = e.target.closest('[data-t]');
      if (sw) { theme = sw.getAttribute('data-t'); paint(); return; }
      if (e.target.closest('.lbs-save') && url) save(url, board, e.target);
    });
    return { refresh: function () { if (!box.hidden) paint(); } };
  }
  function report() { setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 30); }

  function draw(b, theme) {
    var T = THEMES[theme] || THEMES.ink;
    var ready = document.fonts ? Promise.all([document.fonts.load('80px "Atomic Marker"'), document.fonts.load('700 30px Almarai'), document.fonts.load('800 30px Almarai')]).catch(function () {}) : Promise.resolve();
    return ready.then(function () {
      var W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
      var x = c.getContext('2d'), L = 80, R = W - 80;
      x.fillStyle = T.bg; x.fillRect(0, 0, W, H);
      x.fillStyle = T.band; x.fillRect(0, 0, W, 18); x.fillRect(0, H - 18, W, 18);
      x.strokeStyle = T.rule; x.lineWidth = 2; x.strokeRect(44, 58, W - 88, H - 116);
      x.textBaseline = 'alphabetic'; x.textAlign = 'center';
      x.fillStyle = T.soft; x.font = '800 24px Almarai, sans-serif'; spaced(x, "CELLO'S GATE TREASURE HUNT", W / 2, 134, 4);
      x.fillStyle = T.text; x.font = '96px "Atomic Marker",Impact,sans-serif'; fit(x, b.title.toUpperCase(), W / 2, 252, R - L);
      x.fillStyle = T.hi; x.font = '800 30px Almarai, sans-serif'; spaced(x, (b.region + (b.when ? '  ·  ' + b.when : '')).toUpperCase(), W / 2, 316, 3);
      if (b.stat) { x.fillStyle = T.soft; x.font = '700 26px Almarai, sans-serif'; spaced(x, b.stat.toUpperCase(), W / 2, 362, 2); }
      // the top ten
      var top = 410, rowH = 80, rows = (b.rows || []).slice(0, 10);
      x.strokeStyle = T.rule; x.lineWidth = 2;
      rows.forEach(function (p, i) {
        var y = top + i * rowH;
        if (i) { x.beginPath(); x.moveTo(L, y); x.lineTo(R, y); x.stroke(); }
        x.textAlign = 'center'; x.fillStyle = p.rank <= 3 ? T.hi : T.text; x.font = '46px "Atomic Marker",Impact,sans-serif'; x.fillText(String(p.rank), L + 34, y + 58);
        x.textAlign = 'left'; x.fillStyle = T.text; x.font = '800 32px Almarai, sans-serif'; fit(x, p.name || p.handle || '', L + 96, y + 40, 470);
        x.fillStyle = T.soft; x.font = '700 22px Almarai, sans-serif'; fit(x, p.handle || '', L + 96, y + 68, 470);
        x.textAlign = 'right'; x.fillStyle = p.rank <= 3 ? T.hi : T.text; x.font = '44px "Atomic Marker",Impact,sans-serif'; fit(x, Number(p.points || 0).toLocaleString('en-US'), R - 66, y + 56, 260);
        x.fillStyle = T.soft; x.font = '700 18px Almarai, sans-serif'; x.fillText('PTS', R, y + 56);
      });
      if (!rows.length) { x.textAlign = 'center'; x.fillStyle = T.soft; x.font = '700 30px Almarai, sans-serif'; x.fillText('The first points take the top spot!', W / 2, top + 120); }
      x.textAlign = 'center'; x.fillStyle = T.text; x.font = '800 26px Almarai, sans-serif'; spaced(x, 'JOIN THE HUNT AT MAURICEAFRICH.COM', W / 2, H - 96, 3);
      return c.toDataURL('image/png');
    });
  }
  function spaced(x, s, px, py, gap) {
    if ('letterSpacing' in x) { x.letterSpacing = gap + 'px'; x.fillText(s, px, py); x.letterSpacing = '0px'; return; }
    x.fillText(s, px, py);
  }
  function fit(x, s, px, py, max) {
    var m = /^(.*?)(\d+)px\s*(.*)$/.exec(x.font), size = +m[2];
    while (x.measureText(s).width > max && size > 12) { size -= 1; x.font = m[1] + size + 'px ' + m[3]; }
    x.fillText(s, px, py);
  }
  function save(url, b, btn) {
    fetch(url).then(function (r) { return r.blob(); }).then(function (blob) {
      var name = (b.title + ' ' + b.region).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.png';
      var file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : null;
      if (file && navigator.canShare && navigator.canShare({ files: [file] }) && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
        return navigator.share({ files: [file] }).catch(function () {});
      }
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      btn.textContent = 'SAVED!'; setTimeout(function () { btn.textContent = 'SAVE THE CARD'; }, 2200);
    });
  }
  return { mount: mount };
})();
