# 同桌英语自学网 (itongzhuo IELTS) — Platform Catalogue, Feature Map & Design Analysis

> **Subject:** `https://ielts.itongzhuo.com/business/ielts/student/stuIndex.do?courseType=1`
> **Operator:** 珠海同桌教育科技有限公司 (Zhuhai Tongzhuo Education Technology Co., Ltd.)
> **Brand:** 同桌英语自学网 / 同桌英语 ("Study IELTS with a deskmate")
> **Audit date:** 1 November 2026 · **Viewport:** 1440 × 900 desktop, Chrome 156
> **Method:** anonymous crawl of public pages (headless Chrome + DOM/CSS extraction), screenshots retained in `images/`
> **Coverage:** all publicly reachable pages and modals. Authenticated areas (the actual test runner, results, account centre) sit behind WeChat login and are **not** covered visually — see §10.

---

## 1. At a glance

| Item | Observation |
|---|---|
| Product type | IELTS self-study platform: question banks, full mocks, vocabulary corpus, live/recorded classes, 1-to-1 speaking mocks |
| Market | Mainland China, Simplified Chinese UI, IELTS Academic + General Training |
| Business model | Freemium content + tiered membership (time-boxed passes) + 1-to-1 services + B2B white-label for teachers/institutions |
| Login | WeChat QR scan (primary), password / SMS fallback; separate account for tutors |
| Front-end stack | JSP server pages + jQuery 1.11.1 **and** 3.3.1 + Bootstrap 3 **and** 4 + Vue 2 + Element UI + Vant + layer.js + SweetAlert |
| Static assets | Aliyun OSS CDN (`ai-oss3.oss-cn-shenzhen.aliyuncs.com`), versioned `v90_1` |
| Third parties | WeChat OAuth/JS-SDK, Aliyun CAPTCHA, 7moor live chat, Zhuge analytics, Google Analytics (`G-FDS6ZF9F0R`) |
| Layout | Fixed **1300 px** content column, 70 px side gutters, desktop-only (see §7.6) |
| Currency / locale | CNY, `￥`, Chinese numerals in marketing copy |

The root URL the user shared (`stuIndex.do?courseType=1`) is a **marketing / video-course landing page**, not the study home. The "首页" nav item actually goes to a *different* page, `ielts_index.jsp?index=0`. Two homepages coexist (a real IA wrinkle — §9).

---

## 2. Information architecture

```
ielts.itongzhuo.com
├── 营销首页 stuIndex.do?courseType=1        ← the shared link
│   ├── 中教1V1 / 小班 / 刷题营 / 外教1V1 cards
│   ├── 01 同桌公开课 (free live, countdown, 预约)
│   ├── 02 同桌精品课 (paid, 咨询领劵)
│   └── 03 同桌体验课 (free trial lectures)
│
├── 学习首页 ielts_index.jsp?index=0          ← nav "首页"
│   ├── Hero (BC/IELTS partner badge, 10000+ users)
│   ├── 听力真题题库 / 口语题库 / 阅读题库 / 写作题库
│   └── 登录 · 注册 CTAs
│
├── 雅思语料库 (corpus)
│   ├── 听力语料库   jumpAnswerWordDictation.do
│   ├── 阅读语料库   jumpReadAnswerWordDictation.do
│   ├── 听力审题训练 jumpListeningTraining.do
│   └── 听阅自学营   jumpSelfStudyCampPage.do
│
├── 口语题库 jumpIeltsQuestionList.do?sSubjects=3
│   └── 口语模考 jumpOralMockTaobaoBuy.do (paid 1v1)
│
├── 剑雅题库 (Cambridge)
│   ├── 听力 A/G   sSubjects=0&type=1
│   ├── 阅读 A     sSubjects=1&type=4
│   ├── 写作 A     sSubjects=4&type=6
│   ├── 阅读 G     sSubjects=1&type=10
│   ├── 写作 G     sSubjects=4&type=10
│   └── 全文精听    sSubjects=0&type=8
│
├── 机经题库 (recall/"jijing" papers)
│   ├── 听力 A/G   sSubjects=0&type=20
│   ├── 阅读 A     sSubjects=1&type=20
│   └── 写作 A     sSubjects=4&type=7
│
├── 套题模考 (sets & mocks)
│   ├── 单科套题练习 A/G   sSubjects=11&type=0 / 10
│   ├── 三科全真模考 A/G   sSubjects=10&type=0 / 10
│   ├── 单科机经模考       setPractice/stu/jumpSetGenerate.do
│   └── 三科机经真题 A     sSubjects=16&type=0
│
├── 视频课 jumpCourseVideo.do?courseType=5 (录播课)
├── 机构/老师入驻 tutor/jumpTutorHomePage.do
├── 登录/注册 loginModel2.jsp
└── 会员中心 / 支付 / 错题本 / 消息 — modal + gated pages
```

### URL grammar (inferred from observed links)

`jumpIeltsQuestionList.do?sSubjects=<subject>&type=<paperType>&aiType=<0|1>`

| `sSubjects` | Subject |
|---|---|
| `0` | 听力 Listening |
| `1` | 阅读 Reading |
| `3` | 口语 Speaking |
| `4` | 写作 Writing |
| `10` | 三科全真模考 (3-subject mock) |
| `11` | 单科套题练习 (single-subject set) |
| `16` | 三科机经真题 |

| `type` | Paper family |
|---|---|
| `1` | Cambridge Listening (A/G) |
| `4` | Cambridge Reading (A) · `10` = General Training |
| `6` | Cambridge Writing (A) · `10` = GT |
| `7` | 机经 Writing |
| `8` | 全文精听 (full-text intensive listening) |
| `20` | 机经 Listening / Reading |

---

## 3. Categories — what is actually on sale

The catalogue collapses into **six content families × three exam skills (+ speaking)**.

| # | Family | Skills | What the student gets |
|---|---|---|---|
| 1 | **剑雅题库** Cambridge past papers (C4–C21) | L / R / W (+ 全文精听) | A/G listening, A/G reading, A/G writing, per-Part or per-Passage items |
| 2 | **机经题库** Recall papers | L / R / W | "High-frequency hit list" of 20 ranked items per skill, updated daily |
| 3 | **套题模考** Sets & full mocks | L / R / W / S | Whole tests per Cambridge book, 3-subject full mock, auto-generated 机经 mock, 三科机经真题 |
| 4 | **口语题库** Speaking bank | S | 2026 Sep–Dec question bank, Part 1/2/3, new/retained/must-know tags, topic taxonomy, model answers, AI-customised materials + audio |
| 5 | **语料库** Vocabulary corpus (刘夏来) | L / R | Dictation word books, scene vocabulary, phrase chunks, question-reading drills, error book |
| 6 | **课程与服务** Courses & services | — | Free live classes, paid recorded courses, free trial lectures, 1v1 speaking mock, 4-week self-study camp, teacher/institution white-label |

Cross-cutting taxonomy used for filtering everywhere: **题型 (question type)**, **场景 (topic/scene)**, **模块/Part**, **新旧 (new/retained)**, and **progress state (未开始 / 练习中 / 已完成)**.

### 3.1 Cambridge listening taxonomy (observed filter chips)

题型: 填空 · 单选 · 配对 · 地图 · 多选
场景 (10): 日常生活与社交活动 · 求职与工作 · 旅游与参观 · 城市规划与设施建设 · 文化与历史交流 · 自然与环境保护 · 商业与人文研究 · 教育与学习 · 食品与健康 · 科技与自然科学

Content grid is organised **book → Test 1–4 → Part 1–4**, using Cambridge 20 down to 4.

### 3.2 Reading taxonomy

A类 题型: 填空 · 判断 · 单选 · 配对 · 小标题 · 多选
A类 场景 (10): 历史与考古 · 科技与发展 · 语言与教育 · 商业与经济 · 植物类 · 动物类 · 自然与环境保护 · 医疗与健康 · 心理学与社会行为 · 文化与艺术
G类: same filters, no scene list; passages grouped Part 1/2/3 with per-part question types.

### 3.3 Writing taxonomy

- **Task 1 (A)**: 柱状图 · 饼图 · 表格 · 曲线图 · 混合图 · 地图 · 流程图
- **Task 1 (G)**: 投诉信 · 咨询信 · 求助信 · 道歉信 · 建议信 · 邀请信 · 感谢信 · 求职信 · 请求信
- **Task 2**: essay prompts (no sub-type filter exposed)
- Item numbering runs `C20 Test4 … C4 Test1`, plus 考场真题 1–19 for the 机经 writing set.

### 3.4 Speaking taxonomy

- **模块**: Part 1 / Part 2 / Part 3
- **新旧**: 全部 · 本季新题 · 保留话题 · 必考话题
- **主题**: 全部 · 人物 · 地点 · 经历 · 事物
- **Secondary tabs**: 题库&素材 · 答题元素 `Beta` · 答题结构 `Beta`
- Cards carry a red **新题** ribbon; content is a checkbox selection grid (multi-select to build a practice set), with search.

### 3.5 Corpus (语料库) taxonomy

**Listening corpus — 3 chapters**

| Chapter | Theme |
|---|---|
| Chapter 1 | 填空题答案词拼写训练 — fixes "can't spell / can't catch the word" |
| Chapter 2 | 考点分析能力提升训练 — unfamiliar distractors |
| Chapter 3 | 听音辨音能力提升训练 — sounds you can't decode |

Word books (observed counts, dynamic per account):

| Book | Words | Tag | Target |
|---|---|---|---|
| 高频答案词 | 984 | 必修 · HOT明星词书 | 95 % (C1 whole-corpus hit rate 93 %, of which this book = 73 %) |
| 基础答案词 | 598 | 必修 · 目标分 ≤ 6.5 · A1–B2 | accuracy derived from a self-set target band |
| 进阶答案词 | 195 | 选修 · 目标分 ≥ 7.0 · C1–C2 | derived from target band |
| 短语答案词 | 315 | 选修 | derived from target band |
| 错词本 | auto | — | 98 % |

Specialty sets (专项答案词), four tabs, 14 cards:

| Series | Cards (word counts) |
|---|---|
| 单复数系列 `#高频易错` | 复数 153 (必加 s) · 同词单复数 386 (单复数都考过，需听题干判断) · 不可数 35 (绝不加 s) |
| 数字系列 | 号码 81 · 价格 77 · 数字 140 |
| 时间系列 | 月份 12 · 星期 7 · 序数词 21 · 日期 110 · 时间 63 |
| 专有名词系列 | 地址 83 · 人名 59 · 邮编/航班号 41 · 其他名称 31 |

Chapter cards carry explanatory tooltips: Ch.1 "仅学习 2000 词即可覆盖 93% 的听力填空题答案词，1~2 周即可解决听力答案拼写问题"; Ch.2 "对替换或考点不够熟悉会导致丢分，可通过《替换训练》和《考点专项训练》提升"; Ch.3 "听不懂原文或跟不上音频速度往往是对发音不熟悉，刷完《核心词》+《场景词》+《语块》的听音识词训练，95% 的词汇就都能听懂".

**Reading corpus**

| Book | Count | Suggested accuracy |
|---|---|---|
| 雅思阅读核心词 A1–B2 | 2,467 | 90 % |
| 雅思阅读核心语块 (phrases) | 1,216 | 80 % |
| Scene 1 历史与考古 | 578 | 80 % |
| Scene 2 科技与发展 | 508 | 80 % |
| Scene 3 语言与教育 | 378 | 80 % |
| Scene 4 商业与经济 | 288 | 80 % |
| Scene 5 植物类 | 114 | 80 % |
| Scene 6 动物类 | 215 | 75 % |
| Scene 7 自然与环境保护 | 319 | 75 % |
| Scene 8 医疗与健康 | 142 | 75 % |
| Scene 9 心理学与社会行为 | 340 | 70 % |
| Scene 10 文化与艺术 | 87 | 70 % |

**Question-reading drills (听力审题训练)**: 填空题 (Part 1 preconditioning, 76 items; Part 4, 55 items), 选择题, 配对题, 地图题, each with "今日建议复习 N 题".

---

## 4. Feature inventory

### 4.1 Global shell

| Feature | Behaviour |
|---|---|
| Brand bar (90 px, white) | Logo 313 × 40, divider, tagline 让雅思学习更简单, dark pill **机构/老师入驻** |
| Primary nav (50 px, `#383838`) | 首页 · 雅思语料库 `hot` · 口语题库 ▾ · 剑雅题库 ▾ · 机经题库 ▾ · 套题模考 ▾ · 听阅自学营; right side 登录 / 注册 |
| Active state | Red block `#FF4B40`, white text, square corners, sits flush to nav |
| Dropdowns | Hover-opened `<ul>`; 剑雅 has 6 items, 套题 has 6–7, 口语 2, 机经 3 |
| Context nav (corpus pages) | 雅思题库 · 听力语料库 · 阅读语料库 · 听力审题训练 · 听阅自学营 |
| Breadcrumb | `首页 > <current>` with blue links, on every inner page |
| Footer (black) | 3 columns: 同桌教育 contact block (email `eric@itongzhuo.com`, Zhuhai address), site links (雅思题库 / 刘夏来语料库 / 刘夏来视频课 / 雅思资讯), QR block (题库客服 Candy) + ICP 粤ICP备14060018 |
| Floating widget | Green **咨询客服** pill, bottom-right, opens 7moor webchat |
| Session guard | `refresh_session_expiration.js`, `sessionInvalidHandle.js` — keeps the JSP session alive, shows re-login on expiry |

### 4.2 Marketing home (`stuIndex.do`)

- Hero: "中教1v1 三对一管家式的专属服务", 99 元 trial bubble, 3 benefit rows (提分 / 陪学 / 协助), QR "扫码体验", right rail of four product cards: 雅思1V1 (专属1对1 规划课) · 雅思小班 (全科班) · 雅思刷题营 (听力/阅读) · 口语外教1V1.
- **01 同桌公开课 — FREE**: featured live class card with teacher photo, subject tag, title, host, scheduled time, live countdown `03天01时25分06秒`, 预约 button, social proof `413人已预约`; 4 secondary class cards (预约 / 看回放), "查看更多视频课程 →".
- **02 同桌精品课**: four paid course cards, each with 咨询领劵 (lead-gen).
- **03 同桌体验课 — FREE**: trial lecture cards showing 主讲老师, 课程数量, 课程时长 (e.g. 2讲 / 0小时45分钟).
- Persistent right-edge quick actions: 课程 / 我的课程.

### 4.3 Study home (`ielts_index.jsp`)

- Hero: British Council / IELTS "白金级合作伙伴" claim (TS000046), trophy + certificate imagery, headline "10000+同期考生在用的线上雅思题库", four value props (真题 · 答案解析 · 口语素材 · 写作范文), twin CTAs 登录 / 注册.
- Four alternating full-width sections — 听力 / 口语 / 阅读 / 写作 — each: English eyebrow (`→ Listening`), Chinese H2, 4–5 benefit bullets, product screenshot, red CTA 进入题库.
- Benefit bullets double as the product's feature list (full machine exam UI, C4–20 真题, 68 sets A / 50 sets G, 9 机经 sets, expert answer explanations, transcripts + segmented audio, AI speaking materials, AI writing feedback).

### 4.4 Question bank list pages

**Shared pattern** — a 1300 px page with breadcrumb, optional promo banner (auto-dismiss after 15 s), filter bar, content, and a 300 px right rail.

| Feature | Detail |
|---|---|
| Filter chips | Rounded pills, grey idle, red active; multi-row groups (题型 / 场景 / progress) |
| Progress filter | 全部 · 未开始 · 练习中 · 已完成 |
| Accordion cards | One card per Cambridge book (20 → 4); header shows `LISTENING / CAMBRIDGE 20`, body shows Test 1–4 as 4-column groups of Part 1–4 chips with 填空/单选 tags and per-item status |
| Status dots | 未开始 (grey), 练习中 (amber), 已完成 (green) |
| Master-detail (writing) | Left list 268 px of paper titles + type icon + type label; right pane 690 px renders the prompt, the Task box ("You should spend about 20 minutes…"), the diagram image, and 写作文 / 看范文 buttons |
| Reading list | Passage cards with part number, question types, status |
| 全文精听 | Tabs 剑雅真题 / 考场真题 / 我的收藏; book → test → part tree |
| Right rail | Promo (VIP 双十一, 会员费用报销), 新手小贴士 links, 常见问题 (Safari issue, Highlight/Notes/Review, membership differences, overseas access), 异常/错误反馈 QR, WeChat group QR |
| Gate | Clicking 写作文 without a session redirects to the login page — practice is fully gated |

**机经 pages** add a different hero: **同桌机经高频命中榜**, "实时更新 · 考前必刷", `共 20 篇 · 已完成 0 篇`, `榜单更新于 10-31 18:33:48`, then a numbered ranking (rank, title, 未开始 badge, Part + scene tag).

### 4.5 Sets & mocks

- **单科套题练习 A/G** and **三科全真模考 A/G**: grid of Cambridge books × Tests; each test row exposes LISTENING / READING / WRITING / SPEAKING cells with status, and speaking shows **前往报名模考** (it is a paid human service, not an online test).
- Full-mock page carries a warning: *"三科全真模考必须三科题目都完成后才可查看分数答案!"*
- **单科机经模考** (`jumpSetGenerate.do`) is a generator: tabs 听力 / 阅读 / 模考记录, exam tips panel ("音频只放一遍，不能暂停、不能回放；4 个 part × 10 题；拼写错误算错"), and a generated paper.
- **三科机经真题 A** shows a retention notice explaining the page is kept for existing users.

### 4.6 Speaking bank & speaking mock

- **Bank**: banner for the "2026 年 9–12 月题库 PDF" download (QR), tabs 题库&素材 / 答题元素 Beta / 答题结构 Beta, filters as §3.4, checkbox question grid with 新题 ribbons, search box, right rail with a **口语全真模考** promo (今日报名 301, 7 日 2,552, ¥18.8/节, "每 30 天仅可购买一节"), 新手小贴士, 移动口语题库 QR.
- **Mock (paid)**: long-form sales page — price anchor (¥18.8 起, 原价 ¥71.7), 50-minute exam, pain-point cards, deliverables (测试 + Feedback + 备考技巧录音 30 min, 课堂笔记 + 模考报告, 熟悉流程/缓解紧张), user testimonials, teacher credentials (平均教龄 8 年+, 本科以上, 授课态度), teaching certificates, 4-step flow, sample report gallery, FAQ accordion, floating 咨询.

### 4.7 Corpus pages

- Three chapter cards (black Chapter 1 active, grey others), **学习模式 / 测试模式** segmented switch, "高效刷词指南" link.
- Word-book cards: name + 必修/选修 tag + target band + rationale + progress/accuracy gauge + `全部 984 词，未开始学习` + 查看我的测试记录 + start CTA.
- 错词本 card with 0 % / 98 % ring.
- 专项答案词 block with 4 sub-tabs and a two-column card grid (14 sets total — see §4.12).
- Right rail: promo "你的会员费用，我们来报销", 自学攻略 links, 新手小贴士, 异常/错误反馈.

> The listening corpus (`jumpAnswerWordDictation.do?sSubjects=0&leftType=1`) is documented in depth in **§4.12** — it is the most product-like page on the site and the only one where the full interaction model is publicly inspectable.

### 4.8 Video courses

精品课程 → 录播课程; filters 全部 / 听力 / 阅读 / 口语 / 写作 / 基础课程; empty state "当前课程暂无，请敬请期待~~" (the catalogue was empty at audit time).

### 4.9 Self-study camp (听阅自学营)

A single long-form sales page, not a course player: teacher intro (刘夏来), manifesto ("我为什么劝你自学"), 4-week / 6-step method (先诊断 → 抢分规划 → 每日反馈 → 自习室 → 结营诊断 → 自己走), annotated screenshots of real feedback, pricing block — **先诊断 ¥198** (原价 ¥428) and **报自学营 · 听阅双科 ¥1,700** — plus "如果仍认可这套学习方法 → 立即点击咨询".

### 4.10 Tutor / institution landing

For B2B: 独立老师 vs 工作室/机构/学校. Claimed capabilities: bind students (专属师生关系), dashboard of student attempts and answer detail, learning analytics (score trend, weakness by scene/question type/part), white-label custom domain + logo, ad-free environment. Left column is a QR "扫码联系商务经理" with social proof **50+ 国际学校/机构, 1000+ 雅思老师/工作室**.

### 4.11 Account & commercial flows (modal-driven)

| Flow | What exists |
|---|---|
| Login / register | `loginModel2.jsp` popup page: WeChat QR ("使用微信扫一扫登录 '同桌英语'"), link to password / SMS login, 注册, tutor entry footer |
| Membership upsell | Six modals: 普通会员, 题库VIP, 语料库VIP, 口语VIP, 写作VIP, 视频课VIP — each with benefit list, 月/季/年 price cards, 权益说明 link, 支付金额, 立即支付 / 兑换 |
| Permission-expiry nags | "你的会员权限已到期" variants: cannot enter question / cannot submit / cannot view answers / can view but not submit (with 继续查看题目) |
| Payment | WeChat QR modal, ¥ amount, "打开微信扫一扫", poll "我已支付 (Ns)", "未查询到订单，请重新扫码支付", success states per product |
| Redemption | 兑换码 input; failure help → add 客服 Candy on WeChat |
| Gifts | Post-purchase gift chooser (题库VIP月卡 vs 语料库VIP月卡), expiry countdown banner |
| Refund | Modal instructing to add 客服 Sandy and reply "退款" |
| Error notebook (错题本) | Add-to-notebook modal with 题目, 题型 (听力/阅读 × 单选/多选/判断/地图/配对/填空/小标题/简答), 是否已复习, 备注; edit existing entry |
| Dictionary | Word lookup overlay: dictionary switcher (牛津 / 柯林斯 / 韦式 / 默认 / 百度 / 有道), phonetics, 查释义 / 查同义, AI-generated content note, notes + tags, 加入单词本 |
| Messages | Message centre with 全部 / 精选 / 绑定申请 / 一键已读 tabs, read state, expiry, detail jump |
| Tutor binding | 我发起的 / 我收到的 requests, 机构/老师名称, 申请时间, 同意绑定 / 拒绝 with confirm copy |
| Exam mode | 纸笔考模式 vs 机考模式 chooser ("请根据您报名的考试方式选择") |
| Study aids | 配对题/小标题 drag-and-drop instruction modal; Highlight / Notes / Review features referenced in FAQ; 15 s auto-dismiss banners |

### 4.12 Deep dive — 听力语料库 (Listening corpus / answer-word dictation)

**URL:** `jumpAnswerWordDictation.do?sSubjects=0&leftType=1` · page height 1,639 px · context nav 雅思题库 / 听力语料库 / 阅读语料库 / 听力审题训练 / 听阅自学营

This is the practice engine that manufactures the daily habit: recognise and spell the *answer words* that IELTS Listening fill-in-the-blank questions actually test, then move on to question-reading prediction drills. It is the most complete product surface that can be inspected without an account.

#### 4.12.1 Page anatomy

```
Header (brand 90px + context nav 50px)
└── Breadcrumb: 首页 > 刘夏来雅思听力语料库
    ├── Chapter selector — 3 cards (Ch1 black/active, Ch2–3 grey), hover tooltips
    ├── Mode bar — [学习模式 | 测试模式]  +  💡 高效刷词指南 ›
    ├── Word books
    │   ├── Hero card  高频答案词 (HOT ribbon, full width)
    │   └── 2×2 grid  基础 / 进阶 / 短语 / 错词本
    ├── 专项答案词 (targeted drill sets)
    │   ├── 4 tabs: 单复数系列 #高频易错 · 数字系列 · 时间系列 · 专有名词系列
    │   └── Card grid (2 columns; 3–5 cards per series)
    └── Right rail (300px): 会员报销 promo · 9分听力自学攻略 · 新手小贴士 · 异常/错误反馈 QR
Footer
```

Every card follows the same anatomy: **title + 必修/选修 tag + band tag → one-line rationale → mastery counters → 展开词表详情 → 建议今日复习单词 N 词 → primary CTA**. Nothing is hidden behind hover except the chapter explanations.

#### 4.12.2 Two modes

There is **one URL and one layout**; the segmented control swaps the card internals. Mode is **not** reflected in the URL or history.

| | 测试模式 (default) | 学习模式 |
|---|---|---|
| Job | Diagnose: separate known from unknown words | Acquire: work through words with review scheduling |
| Card visual | Ring gauge **我的正确率 / 目标** (e.g. 暂无 / 95 %) | Mastery bar **已掌握 x / y，学习中 x，未学习 y** |
| Primary CTA | 开始测试 | 开始学习 |
| Search | — | **搜索 Chapter1 的单词** input + 搜索 button |
| Book copy | Short marketing line ("…正确率达到 95% 才算达标") | Longer sequencing advice ("英语基础弱的同学练完《基础》再去练《高频》") |
| 错词本 copy | "Chapter1 学习模式中拼错的单词，建议正确率 98 %" | "Chapter1 拼错过的答案词都收录在这里啦！考前去测试模式快速过一遍…" |
| Specialty tabs | In anonymous testing only the 单复数系列 card set rendered; tab clicks did not swap content | All four series swap correctly and render their own cards |

#### 4.12.3 Book catalogue and state model

Counts are per-account and were zero-state at audit time (see §3.5 for the full table). Observed on the page:

| Card | Copy | Counters |
|---|---|---|
| 高频答案词 | 历年听力考试中经常考到的答案词…正确率达到 95 % 才算达标 · HOT 明星词书 · "C1 全部词书命中率 93 %，高频占其中 73 %" | 0 / 984 |
| 基础答案词 | 简单的答案词，基础弱的同学练完《基础》再去练《高频》 · 必修 · ≤6.5 · A1–B2 | 0 / 598 |
| 进阶答案词 | 较难的答案词，建议《高频》正确率达标后再开始 · 选修 · ≥7.0 · C1–C2 | 0 / 195 |
| 短语答案词 | 答案由两个及以上词构成，`no more than two words` 易丢分的同学要练 · 选修 | 0 / 315 |
| 错词本 | 学习模式/测试模式中拼错的词自动收录，考前快速过一遍 · 目标 98 % | 0 / 0 (复习中 / 未复习) |
| 专项 ×14 | 复数 · 同词单复数 · 不可数 · 号码 · 价格 · 数字 · 月份 · 星期 · 序数词 · 日期 · 时间 · 地址 · 人名 · 邮编/航班号 · 其他名称 | 0 / n each |

State vocabulary is consistent: **已掌握 / 学习中 / 未学习** (learning) and **复习中 / 未复习** (error book), plus a per-day quota **建议今日复习单词 N 词**. Target accuracy is either fixed (95 / 98 / 100 %) or derived from a **self-declared target band**, which prompts "去填写目标分，获取目标正确率~" when unset.

#### 4.12.4 The 4-step study method (高效刷词指南)

A four-slide stepper modal (`tips-modal`, numbered 1-2-3-4, annotated screenshots, 下一步 / 知道了):

1. **别急着学，先去测试模式测一测** — you don't need to spend time on words you already know; use testing to filter. ⚠️ If you miss several in a row, stop and go learn first.
2. **学习模式，系统掌握词汇** — misspelled words are pushed back to learning mode the next day. With time, follow the recommended daily review; close to the exam, skip ahead to step 3.
   **Recommended book order: 高频 → 专项 → 基础 → 进阶 → 词组**, with the first two prioritised.
3. **查漏补缺，错词本精准复习** — re-test after learning; same-day errors land in the error book; clear it, then test again.
4. **刷完单词了，下一步去练听力审题** — knowing words is not enough if you blank out on audio; go to 听力审题训练 and drill **答案词预判** so you can predict answers before the audio starts.

The guide is the clearest articulation of the platform's pedagogy: *test first → learn only what you missed → recycle errors → transfer to exam technique*. It also explains why the mode switch exists at all.

#### 4.12.5 Gating and dead ends

- **开始测试 / 开始学习** produced no navigation and no login modal in an anonymous session — a silent dead click.
- **展开词表详情** expanded nothing anonymously (no table rows), so per-word lists are account-bound.
- Counts, gauges and review quotas all render as zero states, which makes the page look inert to a first-time visitor.
- The chapter cards do expose their full explanatory tooltips without login, and the guide modal is fully readable — good for evaluation, inconsistent as a gate.

#### 4.12.6 Design notes specific to this page

- **Deliberate accent shift.** Specialty tabs use a blue utility palette — active `#D4ECFF` with `1px solid rgba(41,165,255,.2)`, idle `#F4FAFF`, 8 px radius — the only place in the audited flow where the brand red yields to blue. It reads as "tooling", not "offer".
- **Flat cards.** 10 px radius, white fill, no shadow (vs. the marketing pages' `0 0 10px rgba(142,142,142,.1)`), keeping 20+ cards on one screen calm.
- **Chapter 1 as the recommended entry.** Near-black card, white type, red progress strip; chapters 2–3 are grey with a thin red left label. Visual weight encodes the intended sequence before you read a word.
- **Mode switch** is a 196 × 40 px white capsule, 10 px radius, 3 px inset, 8 px-radius active pill, 600-weight label — the densest control on the page.
- **Quantified motivation.** Almost every element carries a number: word count, accuracy target, today's review quota, mastery split. Progress is the product.
- **HOT ribbon** straddles the hero card's top-left corner and overlaps the card boundary — the only decorative element in the grid.

#### 4.12.7 Issues found on this page

1. **Mode is not bookmarked.** Refresh or back always returns to 测试模式; a learner mid-way through 学习模式 loses context (same class of bug as the practice-state persistence issue elsewhere).
2. **Tab switching is broken or gated in 测试模式** — the four series render but only 单复数系列's cards appear. Either lazy-load properly or disable the tabs until data is available.
3. **Silent dead clicks on the primary CTA.** Logged-out users get no prompt; the button should say 登录后测试 or open the login QR.
4. **Two different card layouts for the same object.** Rings in test mode vs bars in learn mode make cross-mode comparison hard; pick one progress primitive.
5. **Stale counts in marketing copy.** The home page says 596 base words; the live page says 598.
6. **Zero-state everywhere.** No sample word, demo test or preview is offered, so the value proposition is invisible until after signup.
7. **Chapter cards carry the only explanation of *why* this book exists**, but it is hover-only — keyboard and touch users never see it.

**Screenshots:** `images/corpus-listening.png` (测试模式) · `images/corpus-listen-learn.png` (学习模式, 专有名词系列) · `images/corpus-listen-guide-1.png` … `-4.png` (the four guide steps).

---

## 5. Membership & pricing (observed in modals, Nov 2026)

| Tier | Term | Price | Entitlement summary |
|---|---|---|---|
| **普通会员 Standard** | 31 d | ¥79 | Cambridge 4–21 + 机经 questions, transcripts & audio, 2026 Sep–Dec speaking bank + AI materials, most of the 刘夏来 corpus. **No answer explanations** |
| | 92 d | ¥89 | same, no explanations |
| | 366 d | ¥99 | same + gift 题库/语料库 VIP month |
| **题库VIP Question-bank VIP** | 31 d | ¥99 (¥3.19/day) | Explanations for Cambridge 4–21 + 机经, high-score writing samples, AI marking of Task 1/2; first purchase gifts 1 year Standard |
| | 92 d | ¥188 (¥2.04/day) | |
| | 366 d | ¥396 (¥1.08/day) | |
| **语料库VIP Corpus VIP** | 31 / 92 / 366 d | ¥99 / ¥188 / ¥396 | Full 刘夏来 corpus: listening answer words, core/scene vocabulary, synonym drills, sentence-breakthrough drills |
| **口语VIP Speaking VIP** | 31 d / 92 d | ¥79 / ¥99 | Speaking bank + model answers & audio + AI oral assistant |
| **写作VIP Writing VIP** | 31 d / 92 d | ¥79 / ¥99 | Model essays (6.5+), A/G Cambridge coverage, teacher reasoning, translations, AI essay feedback/rewrite |
| **题库VIP周卡** | 7 d | ¥9.9 | Trial pass |
| **视频课VIP** | — | — | Recorded-course access (modal exists; no price captured) |

Service pricing: **口语模考** ¥18.8 / session from ¥71.7, tiered by examiner (优选菲教 / 精英菲教 / 母语外教), one discounted session per 30 days; **中教 1v1 三对一** ¥99 experience; **自学营** ¥198 diagnostic (原价 ¥428), ¥1,700 listening+reading.

Commercial mechanics: 新人券 (¥1 / ¥20), "新人到手价" strikethrough pricing, 双十一 季卡/年卡 promo, membership-reimbursement campaign, referral/invite binding, gift-with-purchase, 30-day repurchase caps, countdown timers.

---

## 6. Key user journeys

1. **Anonymous browse** → marketing home → nav dropdown → question-bank list (fully viewable) → click a test → **login wall**.
2. **Sign-up** → WeChat QR scan (or password/SMS) → return to the list → choose paper → paywall modal if membership expired → WeChat Pay QR → gift redemption → practice.
3. **Practice** → pick paper → exam-mode choice (paper-based vs computer-based) → timed runner with highlight/notes/review, drag-and-drop answer sheet, dictionary overlay → submit → score + explanations (VIP-gated) → add wrong answers to 错题本.
4. **Mock** → 三科全真 → complete all three subjects → unified score → speaking upsell to a human 口语模考.
5. **Corpus drill** → learn mode → test mode → ring gauge accuracy → auto error book → daily review quota.
6. **B2B** → 机构/老师入驻 → QR → sales contact → white-label tenant with student dashboards.

---

## 7. Design analysis

### 7.1 Design intent

A **conversion-led Chinese ed-tech catalogue**: a neutral, dense, information-first study surface wrapped in a red promotional skin. Two visual registers coexist:

- **Study register** — white background, thin grey borders, 12–14 px text, small radii, minimal decoration, high data density. Optimised for scanning hundreds of paper titles.
- **Marketing register** — red gradients, oversized headlines, teacher photography, certificates/trophies, countdowns, QR codes, urgency badges.

### 7.2 Layout & grid

| Token | Value |
|---|---|
| Content column | `1300px` fixed (`width:1300px; margin:0 70px`) |
| Side gutters | 70 px at 1440; no max-width breakpoints |
| Header | 90 px brand bar + 50 px nav |
| Common inner layout | main 975 px = left rail 268 px + detail 690 px; right promo rail ~300 px |
| Vertical rhythm | 20–40 px section gaps; card padding 15–25 px |
| Footer | ~240 px, full-bleed black |
| Z-layers | nav dropdown > sticky promo rail > floating CS widget > modal layer |

The grid is **hard-coded**, not fluid: at 1024 px the nav switches to a compact variant, but content stays 1300 px (see §7.6).

### 7.3 Colour

| Role | Hex | Usage |
|---|---|---|
| Brand red | `#FF4B40` | nav active block, CTAs, chips, accents (70 declarations) |
| Deep red | `#EB1F11` | hover / emphasis |
| Red tints | `#FFEFEE`, `#FFE7E7`, `#FFBCB8`, `#FF7465` | promo backgrounds, ribbons, alt rows |
| Ink | `#333333` | body headings |
| Secondary text | `#666666`, `#999999` | meta, captions |
| Nav / footer | `#383838` (footer near-black `#1F1F1F`) | chrome |
| Page wash | `#F5F7FA` | section backgrounds, rails |
| Border | `#E6E9ED`, `#DEDEDE`, `#CCCCCC` | cards, inputs, dividers |
| Muted slate | `#AAB2BD`, `#656D78` | disabled, icons |
| WeChat green | `#00CC66` | pay / success / CS |
| Info blue | `#0077BB` | inline links |
| Orange | `#F5A623` | warnings, 练习中 |
| Sky | `#38B5FC`, `#47BCFC` | secondary tags |

Palette distribution is roughly **white 70 % / red 12 % / grey 15 % / accents 3 %** — red is reserved for the *one* action you should take on any screen.

### 7.4 Typography

- Families: `arial, 微软雅黑` as the global default; `"Microsoft YaHei","PingFang SC","Helvetica Neue",Arial` for components; `SourceHanSansSC` / `PingFangSC` for marketing headlines.
- Base **14 px / 1.5**; UI labels 12–13; section titles 18; page titles 21–22; hero 25–30; weights 400 / 600 / 700, with **900** used on the home hero.
- Numbers and English labels are set in the same stack, giving the paper codes (`C20 Test4`, `LISTENING`) a slightly technical, exam-like feel.
- No responsive type scale — sizes are absolute pixels.

### 7.5 Components

| Component | Notes |
|---|---|
| Nav + hover dropdown | Two-level, red active block, `hot` ribbon on 语料库 |
| Breadcrumb | `首页 > …`, blue links |
| Filter chips | Pill, 20 px radius, red fill when active, dense 5-item rows |
| Tabs | Underline tabs (writing Task 1/2, corpus chapters) and pill tabs (corpus 专项) |
| Card | White, 4–6 px radius, border `#E6E9ED`, soft shadow, 15–25 px padding |
| Paper card (listening) | Dark gradient header `LISTENING · CAMBRIDGE 20` + 4-column Test groups |
| Master-detail list | 268 px index with edit icon + type label; selected row red-tinted with left accent |
| Status pill | 未开始 / 练习中 / 已完成 colour-coded |
| Ring gauge | SVG circle showing 我的正确率 against 目标 |
| Sidebar rail | Stack of promo card + link list + QR block + feedback QR |
| Promo banner | Full-width illustration, 15 s auto-close, "立即关闭" |
| Countdown | D/H/M/S, red numerals, used on live classes and gifts |
| Modal | Centred, 500–700 px, layer.js; payment modal uses QR + polling |
| Toast / alert | SweetAlert + layer |
| Empty state | Centred grey illustration + "敬请期待" |
| Floating CS | Green rounded rect, bottom-right, persistent |
| QR block | Ubiquitous — login, mobile hand-off, CS, feedback, group join, PDF download |

### 7.6 Responsiveness — measured

| Viewport | Result |
|---|---|
| 1440 | 1440 client / 1440 scroll — container 1300 centred |
| 390 (mobile) | **980 client / 1100 scroll** — no `viewport` scaling, layout overflows horizontally |

The site is **desktop-only by construction**; mobile access is funnelled to WeChat H5 via QR ("移动口语题库 — 微信扫码即可打开"). The header does have a `<1300px` compact mode, but the content grid does not reflow.

### 7.7 Imagery & tone

- Real product screenshots (exam UI) as proof, always framed in a light device/paper mock-up.
- Teacher portraits on every course card, name + subject as a coloured overlaying wordmark.
- Credential signalling: British Council / IELTS partner badge, framed certificate, trophy, "12 周年" rosette.
- Mascot-ish smiley logo and penguin/chick decorations; warm red/orange seasonal art.
- Copy tone: direct, benefit-led, second person ("你"), heavy numerals (93 %, 10000+, 7 冲 8), scarcity ("限时", "仅剩").

### 7.8 Accessibility & usability observations

- 12 px body text and `#999` on white appear frequently → low contrast for long reading.
- Text baked into images (banners, chapter cards) — not selectable, not screen-reader friendly.
- No visible focus styles; hover-only dropdowns are keyboard-hostile.
- Drag-and-drop matching interaction has a text fallback modal, but is described as "长按拖动" only.
- `notF12.js` actively interferes with developer tools — also blocks assistive inspection workflows.
- Colour is the only carrier of status in some pills (未开始/练习中/已完成 also have text, but the ring gauges are colour-only).

---

## 8. Suggested design system (normalised from the above)

```css
:root{
  /* brand */
  --brand-500:#FF4B40; --brand-600:#EB1F11; --brand-100:#FFEFEE; --brand-50:#FFF7F6;
  /* ink */
  --ink-900:#1F1F1F; --ink-800:#333333; --ink-600:#666666; --ink-400:#999999; --ink-300:#AAB2BD;
  /* surface */
  --surface:#FFFFFF; --surface-alt:#F5F7FA; --chrome:#383838;
  --border:#E6E9ED; --border-strong:#CCCCCC;
  /* semantic */
  --success:#00CC66; --warning:#F5A623; --info:#0077BB;
  /* radius */
  --r-xs:2px; --r-sm:4px; --r-md:6px; --r-lg:10px; --r-pill:20px;
  /* type */
  --font-sans:"PingFang SC","Microsoft YaHei",Arial,sans-serif;
  --fs-xs:12px; --fs-sm:13px; --fs-md:14px; --fs-lg:16px; --fs-xl:18px; --fs-2xl:22px; --fs-3xl:28px;
  /* spacing */
  --sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px; --sp-5:20px; --sp-6:24px; --sp-8:32px; --sp-10:40px;
  /* elevation */
  --shadow-card:0 0 10px rgba(142,142,142,.10);
  --shadow-promo:10px 10px 30px rgba(239,231,231,.20);
  /* layout */
  --container:1300px; --gutter:70px; --header:90px; --nav:50px;
}
```

---

## 9. Findings & recommendations

Ordered by impact, based on what was observed.

1. **Two homepages compete.** `stuIndex.do` (marketing/video) and `ielts_index.jsp?index=0` (study home) both call themselves 首页. Pick one canonical home, and make the other a `/courses` marketing page.
2. **No responsive layout.** 390 px viewport renders a 980 px canvas. Either ship a responsive grid (the 1300 px container and fixed 268/690 split convert cleanly to a single column ≤ 1024 px) or add a device hand-off interstitial that states the desktop requirement before the user invests effort.
3. **Front-end stack collision.** Four UI frameworks load on every page (jQuery 1.11 + 3.3, Bootstrap 3 + 4, Vue 2 + Element + Vant). This inflates payload (30+ scripts) and produces inconsistent components (two different modals, two chip styles, three button styles). Consolidating on one would cut weight and visual drift.
4. **Paywall timing.** A user can browse a whole paper list and only learns on click that answers are gated. Surface entitlement state on the card (`答案解析 · VIP`) before the click, and show a comparison in-place rather than a modal interruption.
5. **Filter model is unlabelled.** `未开始 / 练习中 / 已完成` reads as status but acts as a filter; two adjacent rows of pills (题型 and 场景) look identical. Differentiate filter groups with a label column and a "clear all" affordance.
6. **Speaking bank interaction is ambiguous.** Checkboxes imply multi-select but there is no visible "build set" action near the grid; the primary CTA sits in the sidebar. Add a sticky selection bar with count and action.
7. **Duplicated taxonomy in the nav.** The corpus area swaps the global nav for a 5-item context nav, which removes 口语/剑雅/机经/套题 from reach. Keep the global nav and add a secondary row.
8. **Terminology drift.** 剑雅 vs 剑桥 vs 剑雅真题; 机考 vs 题库; 套题 vs 模考 vs 全真模考. Publish a glossary and use one label per concept in nav, breadcrumbs and titles.
9. **Anti-devtools script.** `notF12.js` provides no product value and blocks accessibility auditing and bug reports. Remove it; rely on server-side integrity checks.
10. **Contrast and type size.** Raise body copy to 14–16 px for long-form content and darken `#999` meta text to at least `#767676` on white.
11. **QR density.** Eight distinct QR codes appear across the shell (login, CS, feedback, group, PDF, mobile, tutor, refund). Consolidate into one "contact / hand-off" sheet to reduce visual noise.
12. **Empty video catalogue.** The 视频课 page renders "当前课程暂无" while the nav promotes 自学视频课 and the footer links 刘夏来视频课. Either hide the entry point when empty or show teaser content.

---

## 10. Coverage, gaps and how to extend this audit

**Covered anonymously (screenshots in `images/`):** marketing home, study home, nav dropdown, login, speaking bank, speaking mock, listening/reading/writing banks, 机经 listening, set practice, full mock, set generator, corpus reading, listening drills, video course, self-study camp, tutor landing, 390 px mobile check — plus a full interaction pass over the listening corpus in both modes and all four 高效刷词指南 steps (§4.12).

**Not covered (login-gated):** the exam runner itself (paper, audio player, answer sheet, highlight/notes/review), result and score-report screens, 错题本 list view, account/membership centre, message centre list, teacher dashboard, and the payment success/failure variants beyond their modal copy.

**To extend:** log in with a WeChat-linked test account, then capture the runner at 1440 and 1280 (question pane + answer sheet + audio controls), a score report, and the 错题本. Add a timed walkthrough to document the real interaction model (navigation guards, autosave, session expiry) — none of which is visible from the public catalogue.

**Confidence:** page structure, navigation, filters, pricing and copy are directly observed. Anything about backend behaviour, autosave or scoring is inferred from UI text and is marked as such.

---

### Appendix A — page inventory

| Page | URL | Height @1440 |
|---|---|---|
| 营销首页 | `/business/ielts/student/stuIndex.do?courseType=1` | 2,844 |
| 学习首页 | `/ielts_test/student/ielts_index.jsp?index=0` | 2,262 |
| 口语题库 | `jumpIeltsQuestionList.do?sSubjects=3&type=0` | 1,439 |
| 口语模考 | `jumpOralMockTaobaoBuy.do` | 5,875 |
| 听力题库 | `…sSubjects=0&type=1` | 5,882 |
| 阅读题库 A | `…sSubjects=1&type=4` | 5,493 |
| 阅读题库 G | `…sSubjects=1&type=10` | 4,944 |
| 写作题库 A | `…sSubjects=4&type=6` | 1,314 |
| 写作题库 G | `…sSubjects=4&type=10` | 1,314 |
| 全文精听 | `…sSubjects=0&type=8` | 5,865 |
| 机经听力 | `…sSubjects=0&type=20` | 1,877 |
| 机经阅读 | `…sSubjects=1&type=20` | 1,719 |
| 机经写作 | `…sSubjects=4&type=7` | 1,314 |
| 单科套题 A/G | `…sSubjects=11&type=0 / 10` | 5,614 / 5,084 |
| 三科全真 A/G | `…sSubjects=10&type=0 / 10` | 5,614 / 5,084 |
| 单科机经模考 | `/business/setPractice/stu/jumpSetGenerate.do` | 1,527 |
| 三科机经真题 | `…sSubjects=16&type=0` | 2,109 |
| 听阅自学营 | `jumpSelfStudyCampPage.do` | 4,596 |
| 机构入驻 | `/business/ielts/tutor/jumpTutorHomePage.do` | 1,323 |
| 听力语料库 | `jumpAnswerWordDictation.do?sSubjects=0` | 1,639 |
| 阅读语料库 | `jumpReadAnswerWordDictation.do?sSubjects=1` | 1,990 |
| 听力审题训练 | `jumpListeningTraining.do?sSubjects=0` | 1,273 |
| 视频课 | `jumpCourseVideo.do?courseType=5` | 900 |
| 登录 | `/ielts_test/student/model/loginModel2.jsp` | 933 |

### Appendix B — screenshot index

| File | Shows |
|---|---|
| `images/home-marketing.png` | 营销首页: 1v1 hero, live classes, paid + trial course sections |
| `images/home-index.png` | 学习首页: BC/IELTS badge, four subject sections |
| `images/nav-dropdown.png` | 剑雅题库 hover dropdown, red active tab |
| `images/login.png` | WeChat QR login card |
| `images/mobile-390.png` | 390 px viewport — horizontal overflow |
| `images/speaking-bank.png` | Speaking filters, question grid, mock-exam rail |
| `images/speaking-mock.png` | Paid 1v1 speaking mock sales page |
| `images/listening-bank.png` | Cambridge listening accordion (20 → 4) |
| `images/reading-bank.png` | Reading A list with 题型/场景 filters |
| `images/writing-bank.png` | Master-detail writing workspace, 写作文/看范文 |
| `images/listening-jijing.png` | 机经 high-frequency ranking |
| `images/set-practice.png` | 套题 grid (Listening/Reading/Writing/Speaking per test) |
| `images/set-generate.png` | 单科机经模考 generator + exam tips |
| `images/corpus-listening.png` | 听力语料库 — 测试模式: chapters, ring gauges, 专项 tabs |
| `images/corpus-listen-learn.png` | 听力语料库 — 学习模式: search, mastery bars, 专有名词系列 cards |
| `images/corpus-listen-guide-1.png` | 高效刷词指南 step 1 — test before you learn |
| `images/corpus-listen-guide-2.png` | 高效刷词指南 step 2 — learning mode + book order |
| `images/corpus-listen-guide-3.png` | 高效刷词指南 step 3 — error-book recycling |
| `images/corpus-listen-guide-4.png` | 高效刷词指南 step 4 — hand-off to 听力审题训练 |
| `images/corpus-reading.png` | 阅读语料库 core words + 10 scenes |
| `images/listening-training.png` | 审题训练 drill catalogue |
| `images/video-course.png` | 录播课 with empty state |
| `images/self-study-camp.png` | 听阅自学营 long-form sales page |
| `images/tutor-home.png` | B2B 机构/老师入驻 landing |
