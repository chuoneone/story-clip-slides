/* 範例：《論語》選三則（古文，公有領域）— 3 段文本＋封面／結尾共 5 支動畫
 * 一課的全部內容就是這支檔案：LESSON（分段文字）＋ StoryClips.define（每段動畫）。
 * [[字]] = 螢光筆重點（字先顯示，老師按一下才亮）；note = 按一下才出現的白話翻譯。
 * 原文的注釋編號（①②…）不放進投影片。 */
window.LESSON = {
  title: '論語選',
  kicker: '國文 ‧ 古文',
  subtitle: '三則孔子的話，配上小動畫',
  coverClip: 0,
  passages: [
    { clip: 1, label: '第一則〈學而〉',
      text: '子曰：「[[學而時習之]]，不亦說乎？[[有朋自遠方來]]，不亦樂乎？[[人不知而不慍]]，不亦君子乎？」',
      note: '💡 白話：學了又時常複習，不是很開心嗎？有朋友從遠方來，不是很快樂嗎？別人不了解我，我也不生氣，不就是君子嗎？' },
    { clip: 2, label: '第二則〈述而〉',
      text: '子曰：「[[三人行，必有我師焉]]。[[擇其善者而從之]]，[[其不善者而改之]]。」',
      note: '💡 白話：幾個人走在一起，其中一定有值得我學習的人。看到別人的優點就學習；看到別人的缺點，就反省、改正自己。' },
    { clip: 3, label: '第三則〈衛靈公〉',
      text: '子貢問曰：「有一言而可以終身行之者乎？」子曰：「其[[恕]]乎！[[己所不欲，勿施於人]]。」',
      note: '💡 白話：子貢問：「有沒有一個字，可以讓人一輩子照著做？」孔子說：「大概就是『恕』吧！自己不喜歡的事，就不要加在別人身上。」' },
  ],
  endClip: 4,
  endKicker: '三則讀完了',
  endLine: '愛學習、會反省、<br>替別人著想',
  endNote: '💬 這三句話，哪一句你今天就能做到？',
};

StoryClips.define((() => {
  const h = StoryClips.h;
  const { A, pop, inn, out, popOut, move, emoji, bubble, mouth, person, outdoor, tree, text } = h;
  // 本課角色：孔子（深色長袍＋鬍子）、學生（小孩）
  const kongzi = (x, m) => person(x, 250, { shirt: '#b45309', pants: '#78350f', hair: 'black', mouths: m || mouth('smile') }) +
    `<path transform="translate(${x},250)" d="M-9 -86 Q0 -66 9 -86 Z" fill="#4b5563"/>`;
  const kid = (x, shirt, m) => person(x, 250, { kid: true, hair: 'black', shirt, mouths: m || mouth('smile') });
  const yard = () => outdoor({ ground: 'sand' }) + tree(40, 250, .9) + tree(450, 250, .7);
  const label = (s, attr) => `<g ${attr || ''}><rect x="190" y="12" width="100" height="34" rx="10" fill="#0c4a6e"/>${text(240, 29, s, 22, '#fff')}</g>`;

  return {
    0: { t: '論語選', svg: () => yard() + kongzi(150) +
      `<g ${A('bob', .6, 0, 'infinite')}>${kid(250, '#f97316')}</g><g ${A('bob', .6, .2, 'infinite')}>${kid(310, '#22c55e')}</g><g ${A('bob', .6, .4, 'infinite')}>${kid(370, '#3b82f6')}</g>` +
      bubble(150, 70, '子曰……', pop(.6)) },

    // 第一則：三個畫面接力 —— 複習（說）→ 朋友來（樂）→ 被誤會也不生氣（君子）
    1: { t: '第一則：學而時習之', svg: () => yard() +
      kid(150, '#f97316', mouth('flat', out(1.2, .3)) + mouth('grin', inn(1.3, .3))) +
      `<g ${popOut(.3, 2.6)}>${emoji(200, 190, '📖', 40)}${emoji(235, 160, '✏️', 30)}</g>` +
      `<g ${popOut(.8, 2.6)}>${bubble(170, 70, '學了常複習，好開心！', '', 18)}</g>` +
      `<g style="--dx:220px;animation:sc-walkin 1.4s 2.8s 1 both">${kid(250, '#22c55e')}${emoji(278, 170, '🎒', 26)}</g>` +
      `<g ${popOut(3.6, 5.4)}>${bubble(220, 70, '朋友從遠方來了！', '', 18)}${emoji(320, 120, '🎉', 34)}</g>` +
      `<g ${inn(5.6, .3)}>${emoji(370, 160, '❓', 34)}${person(390, 250, { hair: 'brown', shirt: '#64748b', mouths: mouth('flat') })}</g>` +
      bubble(200, 70, '別人不懂我，也不生氣', pop(6.2), 18) + emoji(150, 120, '😌', 30, pop(6.8)) },

    // 第二則：三人同行 —— 學好的、改自己
    2: { t: '第二則：三人行，必有我師', svg: () => yard() +
      `<g ${move(.2, 1.6, 60, 0)}>${kongzi(120)}${kid(190, '#22c55e')}${kid(250, '#3b82f6')}</g>` +
      `<g ${inn(2.0, .3)}>${emoji(250, 236, '🗑️', 30)}</g>` +
      emoji(250, 110, '⭐', 30, pop(2.4)) + bubble(250, 60, '他撿垃圾，我學他！', popOut(2.6, 4.6), 18) +
      emoji(310, 110, '❌', 28, pop(4.8)) + text(310, 236, '亂丟', 16, '#b91c1c', inn(4.8, .3)) +
      bubble(230, 60, '他做不好，我改自己！', pop(5.3), 18) + emoji(180, 120, '🤔', 28, pop(5.9)) },

    // 第三則：子貢問一個字 → 恕 → 己所不欲，勿施於人
    3: { t: '第三則：其恕乎', svg: () => yard() + kongzi(130) + kid(330, '#22c55e') +
      bubble(300, 60, '有一個字能做一輩子嗎？', popOut(.4, 2.4), 17) +
      `<g ${popOut(2.6, 4.6)}><circle cx="240" cy="110" r="44" fill="#fef08a" stroke="#eab308" stroke-width="5"/>${text(240, 112, '恕', 54, '#7c2d12')}</g>` +
      emoji(240, 150, '🙅', 44, pop(4.9)) + text(240, 108, '我不喜歡被推', 18, '#0f172a', inn(4.9, .3)) +
      bubble(240, 60, '自己不要的，不給別人', pop(5.6), 18) + emoji(240, 212, '🤝', 34, pop(6.3)) },

    4: { t: '論語選', svg: () => yard() + kongzi(130, mouth('grin')) +
      kid(240, '#f97316', mouth('grin')) + kid(310, '#22c55e', mouth('grin')) + kid(380, '#3b82f6', mouth('grin')) +
      label('論語', pop(.3)) + emoji(240, 120, '📖', 30, pop(.9)) + emoji(310, 120, '🔍', 30, pop(1.3)) + emoji(380, 120, '🤝', 30, pop(1.7)) },
  };
})());
