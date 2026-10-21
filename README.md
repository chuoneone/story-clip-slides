# story-clip-slides（故事動畫簡報 Skill）

給 AI 一篇文本（故事、課文、古文、社會性故事、繪本），它會**自動分段**，替**每一段畫一支 5～8 秒的簡單小動畫**，做成上課投影用的簡報：左邊文字、右邊動畫，重點詞用螢光筆標出（老師點一下才亮）。

- ✅ 不需要影片檔、不用生圖、不用連網：一個 HTML 播放器＋一支課程資料檔就能播
- ✅ 動畫是 AI 用程式（SVG）自己畫的「簡單醜萌」風格：幾何人物＋emoji＋對話泡泡
- ✅ 點動畫可以重播，字太多會自動縮小，不會超出投影畫面

適用於 Claude Code、Antigravity、Cursor 等支援 `SKILL.md` 的 AI 工具。

---

## 為什麼要做這個？

這是特教老師在閱讀課的實測心得：每段文本配上一支醜醜的小動畫，學生看得超開心，也更專注在情節上。
畫面越簡單，學生越能把注意力放在「這一段發生了什麼事」，而不是被華麗的圖片分心。

---

## 範例：《論語》選三則

`examples/lunyu/`：〈學而〉、〈述而〉、〈衛靈公〉三則，每則一支動畫，白話翻譯按一下才出現。

在專案資料夾執行任一本機伺服器後開啟：

```bash
python -m http.server 8000
```

然後在瀏覽器打開 `http://localhost:8000/examples/lunyu/slides.html`。

---

## 安裝方式

**Claude Code**（所有專案通用）：
```bash
git clone https://github.com/chuoneone/story-clip-slides.git ~/.claude/skills/story-clip-slides
```

**Antigravity**：
```bash
git clone https://github.com/chuoneone/story-clip-slides.git ~/.gemini/config/skills/story-clip-slides
```

只想給單一專案用，改放專案裡的 `.claude/skills/` 或 `.agent/skills/`。

## 怎麼用

對 AI 說：

> 「把這篇做成動畫簡報」＋貼上文本

AI 會依 `SKILL.md` 的流程：分段 → 標重點 → 每段設計分鏡並畫動畫 → 組成簡報 → 自己檢查版面和每一支動畫。

## 上課操作

| 動作 | 效果 |
|---|---|
| 點一下／→／空白鍵 | 下一步（有螢光筆的段落，第一下是亮重點） |
| ← | 上一步 |
| 點動畫 | 重播 |
| F | 全螢幕 |

---

## 檔案結構

```
SKILL.md                    AI 的工作流程與動畫設計規則
assets/clips-engine.js      動畫引擎（人物、動物、場景、對話泡泡、各種動作）
assets/slides-template.html 簡報播放器（讀課程資料自動產生投影片）
examples/lunyu/             範例：論語選三則
```

每一課只要一支 `lesson.js`（分段文字＋動畫場景），播放器和引擎共用。

---

作者：SPEDMIX 米克師（特教老師）｜授權：MIT
