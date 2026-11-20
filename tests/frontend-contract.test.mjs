import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const FRONTEND_BASE = process.env.FRONTEND_URL || 'http://127.0.0.1:5173'

test('production build artifacts exist in dist/', () => {
  const indexHtml = path.join(ROOT, 'dist', 'index.html')
  assert.equal(fs.existsSync(indexHtml), true, 'dist/index.html should exist after npm run build')
  const html = fs.readFileSync(indexHtml, 'utf8')
  assert.match(html, /<div id="root"><\/div>/)
})

test('Vite dev proxy forwards /api/home/summary and matches Home stats schema', async () => {
  const res = await fetch(`${FRONTEND_BASE}/api/home/summary`)
  assert.equal(res.status, 200)
  const data = await res.json()
  assert.ok(data.stats.total_books >= 28)
  assert.ok(data.stats.total_tests >= 370)
  assert.ok(data.stats.total_questions >= 8000)
  assert.equal(data.cambridgeBooksRange, 'C1–C21')
})

test('Question bank & Jijing contracts match TypeScript frontend models', async () => {
  const [listenRes, readARes, writeARes, jijingRes, setsRes] = await Promise.all([
    fetch(`${FRONTEND_BASE}/api/question-banks/listening`),
    fetch(`${FRONTEND_BASE}/api/question-banks/reading?variant=A`),
    fetch(`${FRONTEND_BASE}/api/question-banks/writing?variant=A`),
    fetch(`${FRONTEND_BASE}/api/jijing/listening`),
    fetch(`${FRONTEND_BASE}/api/sets?category=practice-a`),
  ])

  for (const r of [listenRes, readARes, writeARes, jijingRes, setsRes]) {
    assert.equal(r.status, 200)
  }

  const listen = await listenRes.json()
  assert.ok(Array.isArray(listen.books) && listen.books.length >= 20)
  const sampleItem = listen.books[0].tests[0].parts[0].items[0]
  assert.equal(typeof sampleItem.testId, 'number')
  assert.equal(typeof sampleItem.sectionId, 'number')
  assert.ok(['未开始', '练习中', '已完成'].includes(sampleItem.status))

  const readA = await readARes.json()
  assert.ok(Array.isArray(readA.books) && readA.books.length >= 10)
  assert.ok(Array.isArray(readA.scenes))

  const writeA = await writeARes.json()
  assert.ok(Array.isArray(writeA.papers) && writeA.papers.length >= 20)
  assert.equal(typeof writeA.papers[0].prompt, 'string')

  const jijing = await jijingRes.json()
  assert.equal(jijing.total, 20)
  assert.equal(typeof jijing.items[0].testId, 'number')

  const sets = await setsRes.json()
  assert.ok(sets.books.length >= 10)
  assert.equal(sets.books[0].tests[0].subjects.length, 4)
})

test('Demo WeChat login + Exam runner detail contract works through Vite proxy', async () => {
  const loginRes = await fetch(`${FRONTEND_BASE}/api/auth/demo-wechat-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  assert.equal(loginRes.status, 200)
  const { token, user } = await loginRes.json()
  assert.ok(token.length > 16)
  assert.equal(user.username, 'demo_student')

  const listen = await (await fetch(`${FRONTEND_BASE}/api/question-banks/listening`)).json()
  const firstItem = listen.books[0].tests[0].parts[0].items[0]

  const detailRes = await fetch(
    `${FRONTEND_BASE}/api/tests/${firstItem.testId}?section_id=${firstItem.sectionId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  assert.equal(detailRes.status, 200)
  const detail = await detailRes.json()
  assert.equal(detail.id, firstItem.testId)
  assert.equal(detail.sections.length, 1)
  assert.ok(detail.total_questions > 0)
})
