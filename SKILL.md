---
name: story-clip-slides
description: 把一篇文本（故事、課文、社會性故事、繪本、短文）切成段落，每段配一支 Claude 自己用 SVG 畫的 5～8 秒「簡單醜萌」小動畫，嵌在課堂投影簡報裡（文字＋動畫並排，重點詞用螢光筆，點一下才亮）。當使用者給一段文本並說「做成動畫簡報」、「每段配動畫」、「分段＋動畫」、「故事動畫簡報」、「文本配小動畫」、「上課投影的故事簡報」時一定要使用。產出是單一 HTML 簡報＋一支課程資料檔，不需要影片檔、不用生圖、不連網。只做分段＋動畫，不做預測投票或答案卡。
---

# 故事動畫簡報（story-clip-slides）

給一篇文本 → 分段 → 每段一支 SVG 小動畫 → 投影簡報。
來源：2026-10 〈倒立的老鼠〉課堂實測，學生最喜歡的就是那些「醜醜的」動畫；畫面簡單反而讓學生專注在情節。

## 檔案

| 檔案 | 用途 | 要改嗎 |
|---|---|---|
| `assets/clips-engine.js` | 動畫引擎＋繪圖小工具（人物、老鼠、室內、戶外、對話泡泡、emoji） | 不改；缺通用角色時可以加進來 |
| `assets/slides-template.html` | 簡報播放器（讀 LESSON 自動產生投影片、自動縮字） | 不改，只換 3 個佔位字 |
| `examples/lunyu/lesson.js` | 完整範例《論語》選三則：3 段＋封面／結尾共 5 支動畫（含白話 note） | 參考用，寫新課前先讀 |

**每一課只要寫一支 `lesson.js`**（分段文字＋動畫場景），播放器和引擎都共用。

## 流程

### 1. 分段
- 一段＝一個畫面＝一件事。中文約 40～130 字；對話連續的可以併成一段。
- **原文照抄，不改寫**。明顯錯字可修，但要在回覆裡列出改了哪些。
- 段數通常 5～12。太長的文本先問使用者要不要只做前半或節選。
- 對話段落以「開頭的句子會自動不縮排。
- 古文課本的注釋編號（①②…）不放進投影片；白話翻譯寫在 `note`（按一下才出現）。

### 2. 螢光筆重點（可選）
- 用 `[[字]]` 標，每段 0～3 個：關鍵事件、轉折、課堂要討論的詞。
- 播放行為已定案：**字一開始就完整顯示，老師按一下才亮螢光**（不要做成字先隱藏）。
- 不需要的話整篇都不標也可以。

### 3. 設計每段動畫（先寫分鏡，再寫程式）
在回覆前先替每段想好：場景（室內／戶外／白天／夜晚）、角色、3～5 個節拍、總長 5～8 秒。

風格規則：
- 畫風預設是**蠟筆繪本風**（抖動線條、蠟筆顆粒、粗輪廓、紙紋；文字不加顆粒保持清楚）。使用者要乾淨幾何風時寫 `clipStyle: 'flat'`。場景程式碼完全一樣，只是開關。
- **簡單醜萌**：幾何人物＋emoji 道具＋對話泡泡。不要追求精緻，畫面元素越少越好。
- **只演這一段**，不能劇透下一段（例如下一段才揭曉的東西不能先出現）。
- 對話泡泡 ≤ 12 字，用原文的關鍵句或口語化濃縮。
- 情緒用表情換嘴型（`mouth('smile')`→`mouth('frown')`）、💢❗❓💡😂😳 等 emoji、搖晃／彈跳動畫表現。
- **最後一格要停在有資訊的畫面**（動畫播完會停住，學生看最久的是結尾）。
- 每支動畫的 `t`（標題）寫「第 N 段：一句話重點」，顯示在左下角；畫面左下角不要放重要東西。
- 同一角色每段長相要一致：在 lesson.js 裡包成函式（例 `const kongzi = (x,m) => h.person(x,250,{shirt:'#b45309',hair:'black',mouths:m})`）。
- 可另做封面動畫（`coverClip`）和結尾動畫（`endClip`）。

### 4. 寫 lesson.js
```js
window.LESSON = {
  title: '論語選', kicker: '國文 ‧ 古文', subtitle: '三則孔子的話，配上小動畫',
  coverClip: 0,                       // 可省略
  clipStyle: 'flat',                  // 可省略：預設是蠟筆繪本風；寫 'flat' 改成乾淨幾何風
  passages: [
    { clip: 1, text: ['第一段第一個自然段……[[重點]]……', '第二個自然段……'] },
    { clip: 2, text: '單一自然段可以直接給字串', label: '第 2 段', note: '🤔 可選：段落下方的提問（按一下才出現）' },
  ],
  endClip: 10, endKicker: '結局', endLine: '最後一張的大標（可用 <br>）', endNote: '可選：最後一句話',
};
StoryClips.define((() => {
  const h = StoryClips.h; const { A, pop, inn, out, popOut, move, emoji, bubble, mouth, person, mouse, room, outdoor, tree, house, text } = h;
  return {
    1: { t: '第 1 段：xxx', svg: () => room({ win: 'sun' }) + person(110, 262) + bubble(240, 80, '你好！', pop(1.2)) },
  };
})());
```

引擎速查（座標 viewBox 480×300；天花板 y 0～27、室內地板 y≥262、戶外地面 y≥250）：

| 小工具 | 說明 |
|---|---|
| `room({night, win:'sun'/'moon', hole})`、`outdoor({night, ground:'grass'/'road'/'sand'})` | 背景 |
| `person(x, 腳底y, {shirt, pants, skin, hair:'white'/'black'/'brown'/'none', glasses, kid, mouths})` | 人物；`kid:true` 縮小 |
| `mouth('smile'/'frown'/'flat'/'grin'/'open', attr)` | 嘴巴；換表情＝舊嘴 `out(t)`＋新嘴 `inn(t)` |
| `mouse(x, y, 寬, attr, flip)` | 小老鼠 |
| `emoji(x, y, '🧀', 大小, attr)`、`text(x, y, 字, 大小, 顏色)`、`bubble(x, y, 字, attr, 字級)` | 道具、文字、對話泡泡 |
| `tree(x, y, 縮放)`、`house(x, 地面y, 招牌字)` | 戶外景物 |
| `rain(條數, 開始秒, heavy)` | 下雨（一直下）；`heavy:true` 大雨 |
| `pop(t)` 彈出、`inn(t)` 淡入、`out(t)` 淡出、`popOut(t出現, t消失)` | 出場時機（秒） |
| `move(t, 秒數, dx, dy)` | 平移，例 `<g ${move(1, 2, 200, 0)}>…</g>` |
| `A(名稱, 秒數, 延遲, 次數或'infinite')` | 其他動畫：`bounce` `shake` `wobble` `spin` `bob` `walk`(--dx) `walkin`(--dx 從哪裡走進來) `fly`(--dy 飛上去並翻轉) `flip` `grow` `rise` `sweep` |

要旋轉整個場景（例如「世界顛倒」）用 `style="animation:sc-flip 1.6s 1.2s 1 both;transform-box:view-box;transform-origin:240px 150px"` 包住。

### 5. 組簡報
1. 引擎複製到專案（同一專案共用一份，已存在就不複製）。
2. 複製 `slides-template.html` 成 `<名稱>-slides.html`，替換：`__ENGINE_JS__`→引擎相對路徑、`__LESSON_JS__`→lesson.js 路徑、`__TITLE__`→標題。
3. 簡報結構自動產生：封面 → 每段一張（左文字、右動畫）→ 結尾。字太多會自動縮字級與動畫寬度，不用手調。

### 6. 自我檢查（交付前一定做）
用 preview server 開簡報（`file://` 開的頁面不能跑檢查程式），在頁面執行：

```js
// ① 溢位：每張投影片內容不能超過 678px
const st=stage.getBoundingClientRect(),sc=st.height/720,res=[];
slides.forEach((s,k)=>{show(k,true);let mb=0;s.querySelectorAll('.body *, .title *').forEach(e=>{const r=e.getBoundingClientRect();if(r.height)mb=Math.max(mb,(r.bottom-st.top)/sc)});if(mb>678)res.push(k+1)});show(0);res
// ② 動畫總覽：每支凍結在 1.5 秒、3 秒、結尾，截圖逐支看
StoryClips.sheet([1500, 3000, 99999]);
```

總覽要檢查：東西有沒有飛出畫面或被天花板／左下標題擋住、對話泡泡有沒有被切到、結尾畫面是否有資訊、有沒有劇透下一段。改完重看。

## 踩過的坑
- **內建瀏覽器的預覽窗被藏起來時，CSS 動畫不會跑**，截圖永遠是第 0 格。一律用 `StoryClips.sheet()`／`StoryClips.freeze(el, ms)` 檢查，不要等動畫自己播。
- 總覽／凍結的元素必須**先放進頁面**才拿得到動畫物件（引擎已處理）。
- 改了 js 但瀏覽器還在用舊檔：先 `await fetch('檔名',{cache:'reload'})` 再重新整理。
- emoji 的 `dominant-baseline:central` 讓 y 是**中心點**；用 `fly` 黏到天花板時 `--dy`＝目標中心 y − 原本中心 y（例：地上 y=240 → 天花板中心 47，dy≈-193）。
- 動畫標題放左下（`.ttl`），因為天花板上的道具常在左上；不要把標題移回上方。
- 螢光筆用 `class="hl fx"`：`fx` 代表「一直看得到、按了才變」。少了 `fx` 字會被當成逐步出現而先隱藏（實際發生過，老師以為字不見了）。
- 簡報上點動畫是「重播」，不會換頁（引擎已 stopPropagation）。

## 放進自己的教材網站時
- 同一個網站共用一份引擎，每課兩個檔：`<名稱>-slides.html`、`<名稱>-lesson.js`。
- 使用者要求才 commit／push。

## 交付時告訴使用者
- 檔案路徑、段數、每段動畫一句話內容。
- 改過的錯字、節選或合併段落的地方。
- 操作：點一下／→ 下一步；有螢光筆的段落第一下是亮重點；點動畫重播；F 全螢幕。
