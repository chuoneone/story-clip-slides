/* 故事短動畫引擎（story-clip-slides skill）
 * 每段故事一支 5～8 秒的 SVG 小動畫。畫風刻意「簡單、醜萌」：幾何圖形＋emoji＋對話泡泡。
 *
 * 用法：
 *   1. HTML 放容器：<div class="sclip" data-clip="1"></div>（data-notitle 可隱藏左下標題）
 *   2. 載入本檔，再寫一支場景檔：
 *        StoryClips.define({ 1: { t: '第 1 段：xxx', svg: h => h.room() + h.person(120, 262) + h.bubble(240, 80, '你好！', h.pop(1)) } });
 *   3. StoryClips.play(el) 從頭重播；點動畫本身也會重播；捲進畫面時自動重播。
 *
 * 原理：動畫全部寫在 SVG 元素的 inline style（animation: ... both），重新塞 innerHTML 就會從頭播。
 * 座標系固定 viewBox 0 0 480 300；天花板 y=0～27，地板從 y=262 開始。
 */
(function () {
  const css = `
.sclip{position:relative;aspect-ratio:8/5;border-radius:14px;overflow:hidden;background:#0f172a;cursor:pointer;box-shadow:0 4px 14px rgba(15,23,42,.18)}
.sclip svg.scene{display:block;width:100%;height:100%}
.sclip .rp{position:absolute;right:8px;bottom:8px;width:34px;height:34px;border-radius:50%;background:rgba(15,23,42,.55);color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;pointer-events:none;font-family:sans-serif}
.sclip .ttl{position:absolute;left:8px;bottom:8px;background:rgba(15,23,42,.6);color:#fff;font-size:13px;border-radius:8px;padding:1px 8px;pointer-events:none;font-family:"Noto Sans TC",sans-serif}
.sclip svg *{transform-box:fill-box;transform-origin:center}
.sclip text{font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif}
@keyframes sc-pop{0%{transform:scale(0);opacity:0}70%{transform:scale(1.18);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes sc-in{from{opacity:0}to{opacity:1}}
@keyframes sc-out{from{opacity:1}to{opacity:0}}
@keyframes sc-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes sc-shake{0%,100%{transform:rotate(0)}25%{transform:rotate(-9deg)}75%{transform:rotate(9deg)}}
@keyframes sc-wobble{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(12deg)}}
@keyframes sc-spin{to{transform:rotate(360deg)}}
@keyframes sc-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes sc-walk{from{transform:translateX(0)}to{transform:translateX(var(--dx))}}
@keyframes sc-walkin{from{transform:translateX(var(--dx));opacity:0}15%{opacity:1}to{transform:translateX(0);opacity:1}}
@keyframes sc-move{from{transform:translate(0,0)}to{transform:translate(var(--dx,0px),var(--dy,0px))}}
@keyframes sc-fly{0%{transform:translateY(0) rotate(0)}70%{transform:translateY(var(--dy)) rotate(0)}100%{transform:translateY(var(--dy)) rotate(180deg)}}
@keyframes sc-flip{from{transform:rotate(0)}to{transform:rotate(180deg)}}
@keyframes sc-grow{from{transform:scale(.3)}to{transform:scale(1)}}
@keyframes sc-rise{from{transform:translateY(60px)}to{transform:translateY(0)}}
@keyframes sc-sweep{from{transform:translateX(0)}to{transform:translateX(560px)}}
@keyframes sc-fall{0%{transform:translateY(-40px);opacity:0}15%{opacity:1}100%{transform:translateY(320px);opacity:.2}}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---------- 動畫屬性 ----------
  // A(名稱, 秒數, 延遲秒, 次數|'infinite', 額外 style) → 放進元素的屬性字串
  const A = (name, dur, delay, count, extra) =>
    `style="animation:sc-${name} ${dur}s ${delay}s ${count || 1} both${extra ? ';' + extra : ''}"`;
  const pop = d => A('pop', .45, d);
  const inn = (d, dur) => A('in', dur || .5, d);
  const out = (d, dur) => A('out', dur || .5, d);
  // 先出現、之後消失（例如換一句對話）
  const popOut = (d, end) => `style="animation:sc-pop .45s ${d}s both, sc-out .4s ${end}s both"`;
  // 位移：move(延遲, 秒數, dx, dy)；配合 <g ${move(...)}>…</g>
  const move = (d, dur, dx, dy) => `style="--dx:${dx || 0}px;--dy:${dy || 0}px;animation:sc-move ${dur}s ${d}s 1 both"`;

  // ---------- 圖形 ----------
  const emoji = (x, y, e, size, attr) => `<text x="${x}" y="${y}" font-size="${size || 40}" text-anchor="middle" dominant-baseline="central" ${attr || ''}>${e}</text>`;
  const text = (x, y, s, size, color, attr) => `<text x="${x}" y="${y}" font-size="${size || 18}" font-weight="700" fill="${color || '#0f172a'}" text-anchor="middle" dominant-baseline="central" ${attr || ''}>${s}</text>`;
  const bubble = (x, y, s, attr, fs) => {
    fs = fs || 20; const w = s.length * fs + 26;
    return `<g ${attr || ''}><rect x="${x - w / 2}" y="${y - 20}" width="${w}" height="40" rx="18" fill="#fff" stroke="#334155" stroke-width="2"/><text x="${x}" y="${y + 1}" font-size="${fs}" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#0f172a">${s}</text></g>`;
  };
  // 嘴巴：smile / frown / flat / grin / open
  const mouth = (k, attr) => {
    const d = { smile: 'M-7 -94 Q0 -87 7 -94', frown: 'M-7 -90 Q0 -96 7 -90', flat: 'M-6 -92 L6 -92', grin: 'M-8 -95 Q0 -84 8 -95', open: 'M-5 -93 Q0 -84 5 -93 Z' }[k] || k;
    return `<path d="${d}" fill="${k === 'open' ? '#7c2d12' : 'none'}" stroke="#7c2d12" stroke-width="2.5" stroke-linecap="round" ${attr || ''}/>`;
  };
  // 人物：x 中心、y 腳底。o = { shirt, pants, skin, hair:'white'|'black'|'brown'|'none', glasses, kid, mouths }
  // 換表情：mouths: h.mouth('smile', h.out(2)) + h.mouth('frown', h.inn(2.1))
  const person = (x, y, o) => {
    o = o || {}; const sk = o.skin || '#fcd9b6', sh = o.shirt || '#60a5fa', pa = o.pants || '#475569';
    const s = o.kid ? .8 : 1;
    const hairC = { white: '#f8fafc', black: '#1f2937', brown: '#7c4a1e' }[o.hair || 'black'];
    const hair = o.hair === 'none' ? '' : (o.hair === 'white'
      ? `<circle cx="-17" cy="-112" r="8" fill="${hairC}"/><circle cx="17" cy="-112" r="8" fill="${hairC}"/><ellipse cx="0" cy="-123" rx="10" ry="4" fill="${hairC}"/>`
      : `<path d="M-20 -106 Q-18 -128 0 -126 Q18 -128 20 -106 Q10 -116 0 -114 Q-10 -116 -20 -106 Z" fill="${hairC}"/>`);
    const gl = o.glasses ? `<circle cx="-7" cy="-105" r="5.5" fill="none" stroke="#334155" stroke-width="2"/><circle cx="7" cy="-105" r="5.5" fill="none" stroke="#334155" stroke-width="2"/><line x1="-1.5" y1="-105" x2="1.5" y2="-105" stroke="#334155" stroke-width="2"/>` : `<circle cx="-7" cy="-105" r="2.6" fill="#111827"/><circle cx="7" cy="-105" r="2.6" fill="#111827"/>`;
    return `<g transform="translate(${x},${y}) scale(${s})">
      <rect x="-13" y="-32" width="9" height="32" rx="3" fill="${pa}"/><rect x="4" y="-32" width="9" height="32" rx="3" fill="${pa}"/>
      <rect x="-22" y="-86" width="44" height="58" rx="12" fill="${sh}"/>
      <rect x="-30" y="-80" width="10" height="36" rx="5" fill="${sh}"/><rect x="20" y="-80" width="10" height="36" rx="5" fill="${sh}"/>
      <circle cx="0" cy="-104" r="20" fill="${sk}"/>${hair}${gl}
      ${o.mouths || mouth('smile')}
    </g>`;
  };
  // 小老鼠（內建 symbol）：x,y 左上角、寬 w；flip 往左看
  const mouseSym = `<symbol id="sc-mouse" viewBox="0 0 150 100"><path d="M30 70 C10 72 4 88 18 92 C30 95 40 86 34 80" fill="none" stroke="#f9a8b8" stroke-width="5" stroke-linecap="round"/><ellipse cx="72" cy="66" rx="42" ry="26" fill="#6b7280"/><circle cx="112" cy="54" r="20" fill="#6b7280"/><circle cx="104" cy="32" r="12" fill="#6b7280"/><circle cx="104" cy="32" r="7" fill="#f9a8b8"/><circle cx="122" cy="34" r="10" fill="#6b7280"/><circle cx="122" cy="34" r="5.5" fill="#f9a8b8"/><circle cx="118" cy="52" r="3.5" fill="#111827"/><circle cx="131" cy="60" r="4" fill="#f472b6"/><path d="M128 62 L146 58 M128 64 L146 66" stroke="#374151" stroke-width="1.5"/><ellipse cx="56" cy="90" rx="8" ry="4" fill="#4b5563"/><ellipse cx="88" cy="90" rx="8" ry="4" fill="#4b5563"/></symbol>`;
  const mouse = (x, y, w, attr, flip) => {
    w = w || 60; const hh = w * 2 / 3;
    const u = `<use href="#sc-mouse" x="${x}" y="${y}" width="${w}" height="${hh}"/>`;
    return `<g ${attr || ''}>${flip ? `<g transform="translate(${2 * x + w},0) scale(-1,1)">${u}</g>` : u}</g>`;
  };
  // 室內：o = { night, win:'sun'|'moon'|'', hole }
  const room = o => {
    o = o || {}; const n = o.night;
    return `<rect width="480" height="300" fill="${n ? '#334155' : '#fef9e7'}"/>
    <rect x="360" y="70" width="80" height="70" rx="6" fill="${n ? '#0f172a' : '#bae6fd'}" stroke="#78350f" stroke-width="5"/>
    ${o.win === 'moon' ? emoji(400, 105, '🌙', 34) : ''}${o.win === 'sun' ? emoji(400, 105, '☀️', 34) : ''}
    <line x1="400" y1="70" x2="400" y2="140" stroke="#78350f" stroke-width="3"/>
    <rect width="480" height="24" fill="${n ? '#475569' : '#e7e5e4'}"/><rect y="24" width="480" height="3" fill="#a8a29e"/>
    <rect y="262" width="480" height="38" fill="${n ? '#78350f' : '#d6a76b'}"/>
    ${o.hole ? '<path d="M18 262 V242 A16 16 0 0 1 50 242 V262 Z" fill="#1c1917"/>' : ''}`;
  };
  // 戶外：o = { night, ground:'grass'|'road'|'sand' }
  const outdoor = o => {
    o = o || {}; const n = o.night;
    const g = { grass: '#86efac', road: '#a8a29e', sand: '#fde68a' }[o.ground || 'grass'];
    return `<rect width="480" height="300" fill="${n ? '#1e293b' : '#e0f2fe'}"/>
    ${n ? emoji(420, 50, '🌙', 34) : emoji(420, 50, '☀️', 38)}
    <rect y="250" width="480" height="50" fill="${g}"/>`;
  };
  const tree = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s || 1})"><rect x="-8" y="-60" width="16" height="60" fill="#92400e"/><circle cx="0" cy="-80" r="36" fill="#22c55e"/></g>`;
  const house = (x, y, label) => `<g transform="translate(${x},${y})"><rect x="0" y="-110" width="140" height="110" fill="#fde68a" stroke="#92400e" stroke-width="4"/><path d="M-10 -110 L70 -165 L150 -110 Z" fill="#dc2626"/><rect x="55" y="-55" width="30" height="55" fill="#92400e"/>${label ? text(70, -88, label, 20, '#7c2d12') : ''}</g>`;

  // 下雨：n 條雨絲，從 start 秒開始一直下（heavy 變大雨）
  const rain = (n, start, heavy) => {
    let r = '';
    for (let k = 0; k < (n || 24); k++) {
      const x = (k * 53) % 480 + 6, d = (start || 0) + (k % 6) * .17 + (k % 4) * .05, sp = heavy ? .55 : .9;
      r += `<line x1="${x}" y1="0" x2="${x - 6}" y2="${heavy ? 26 : 18}" stroke="#60a5fa" stroke-width="${heavy ? 3 : 2}" stroke-linecap="round" style="animation:sc-fall ${sp}s ${d}s infinite both"/>`;
    }
    return `<g>${r}</g>`;
  };
  const h = { A, pop, inn, out, popOut, move, emoji, text, bubble, mouth, person, mouse, room, outdoor, tree, house, rain };

  // ---------- 播放 ----------
  const S = {};
  function render(el) {
    const s = S[el.dataset.clip]; if (!s) return;
    el.innerHTML = `<svg class="scene" viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><defs>${mouseSym}</defs>${s.svg(h)}</svg>` +
      (el.dataset.notitle != null ? '' : `<span class="ttl">${s.t || ''}</span>`) + `<span class="rp">↻</span>`;
  }
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting && !en.target.closest('.locked') && !en.target.dataset.frozen) render(en.target);
  }), { threshold: .5 }) : null;
  function init(root) {
    (root || document).querySelectorAll('.sclip[data-clip]').forEach(el => {
      if (el.dataset.ready) return; el.dataset.ready = '1';
      el.addEventListener('click', e => { e.stopPropagation(); render(el); });
      render(el);
      if (io) io.observe(el);
    });
  }
  function define(scenes) { Object.assign(S, scenes); init(); }
  // 檢查用：把一支動畫凍結在第 ms 毫秒（不會被自動重播蓋掉）
  function freeze(el, ms) {
    render(el); el.dataset.frozen = '1';
    el.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = ms; });
  }
  // 檢查用：全部動畫排成總覽（每支一列：1.5 秒、3 秒、結尾），再按一次關閉
  function sheet(times) {
    const old = document.getElementById('sc-sheet'); if (old) { old.remove(); return; }
    times = times || [1500, 3000, 99999];
    const g = document.createElement('div'); g.id = 'sc-sheet';
    g.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#fff;overflow:auto;padding:8px;font:14px sans-serif';
    const w = `calc((100% - 130px) / ${times.length} - 6px)`;
    g.innerHTML = Object.keys(S).map(id => `<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
      <div style="width:120px;flex-shrink:0">#${id} ${S[id].t || ''}</div>
      ${times.map(ms => `<div class="sclip" data-clip="${id}" data-notitle data-ms="${ms}" style="width:${w};flex-shrink:0"></div>`).join('')}</div>`).join('');
    g.addEventListener('click', () => g.remove());
    document.body.appendChild(g); // 先放進頁面，動畫物件才會存在
    g.querySelectorAll('.sclip').forEach(d => { freeze(d, +d.dataset.ms); d.querySelector('.rp').remove(); });
  }
  window.StoryClips = { h, define, play: render, init, freeze, sheet };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init()); else init();
})();
