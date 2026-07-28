const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const indexPath = path.join(root, 'index.html')
const cssPath = path.join(root, 'styles.css')
const scriptPath = path.join(root, 'script.js')
const avatarPath = path.join(root, 'assets', 'avatar-pixel.png')
const cnamePath = path.join(root, 'CNAME')

const fail = (message) => {
  throw new Error(message)
}

const expectFile = (filePath, label) => {
  if (!fs.existsSync(filePath)) {
    fail(`${label} is missing: ${path.relative(root, filePath)}`)
  }
}

expectFile(indexPath, 'index.html')
expectFile(cssPath, 'styles.css')
expectFile(scriptPath, 'typewriter script')
expectFile(avatarPath, 'pixel avatar')

if (fs.existsSync(cnamePath)) {
  fail('CNAME should be removed so the project publishes under the GitHub Pages project URL')
}

const html = fs.readFileSync(indexPath, 'utf8')
const css = fs.readFileSync(cssPath, 'utf8')
const script = fs.readFileSync(scriptPath, 'utf8')
const avatar = fs.readFileSync(avatarPath)

const expectCssRule = (selector, requiredDeclarations) => {
  const ruleMarker = `${selector} {`
  const ruleStart = css.indexOf(ruleMarker)
  const ruleEnd = css.indexOf('}', ruleStart)

  if (ruleStart === -1 || ruleEnd === -1) {
    fail(`styles.css should include a ${selector} rule`)
  }

  const rule = css.slice(ruleStart + ruleMarker.length, ruleEnd)

  for (const declaration of requiredDeclarations) {
    if (!rule.includes(declaration)) {
      fail(`${selector} should include ${declaration}`)
    }
  }
}

const requiredHtml = [
  '<!doctype html>',
  'lang="zh-CN"',
  '<script src="script.js" defer></script>',
  '<h1 id="hero-title">AtomsH4</h1>',
  'data-typewriter="What I cannot create, I do not understand."',
  'class="typewriter-text"',
  'class="typewriter-cursor"',
  'What I cannot create, I do not understand.',
  'KEEP CODING',
  'KEEP PLAYING',
  'PLAYER DATA',
  'PROGRAMMER',
  'LV. ???',
  'aria-valuenow="72"',
  '72%',
  'STATUS: CODING',
  'HP ▰▰▰▰▰',
  'id="quests"',
  'id="skills"',
  'id="projects"',
  'id="contact"',
  'assets/avatar-pixel.png',
  'https://github.com/AtomsH4',
  'https://www.cnblogs.com/atomsh',
  'https://github.com/AtomsH4/frontend-tools',
  'https://github.com/AtomsH4/CourseSelectionSystem',
  'https://github.com/AtomsH4/text-classification-cnn-rnn'
]

const forbiddenHtml = [
  'Gu JiaMing',
  'hero-subtitle',
  'hero-description',
  'status-window',
  'status-grid',
  'float-chip'
]

for (const fragment of requiredHtml) {
  if (!html.includes(fragment)) {
    fail(`index.html should include ${fragment}`)
  }
}

for (const fragment of forbiddenHtml) {
  if (html.includes(fragment)) {
    fail(`index.html should not include ${fragment}`)
  }
}

const xpTrackTag = html.match(/<span\b[^>]*class="xp-track"[^>]*>/)?.[0]
if (!xpTrackTag) {
  fail('index.html should include a span.xp-track tag')
}

for (const attribute of [
  'role="progressbar"',
  'aria-label="Experience"',
  'aria-valuemin="0"',
  'aria-valuemax="100"',
  'aria-valuenow="72"'
]) {
  if (!xpTrackTag.includes(attribute)) {
    fail(`span.xp-track should include ${attribute}`)
  }
}

const projectCards = [...html.matchAll(/data-project="/g)]
if (projectCards.length < 5) {
  fail(`expected at least 5 project cards, found ${projectCards.length}`)
}

for (const fragment of [
  '--pink',
  '--cyan',
  '.hero',
  '.typewriter-quote',
  '.typewriter-cursor',
  '.player-card',
  '.player-data',
  '.xp-track',
  '.portrait-frame',
  'overflow: hidden',
  'image-rendering: pixelated',
  '@media (max-width: 860px)',
  '@media (prefers-reduced-motion: reduce)'
]) {
  if (!css.includes(fragment)) {
    fail(`styles.css should include ${fragment}`)
  }
}

expectCssRule('.portrait-frame', [
  'overflow: hidden'
])

expectCssRule('.pixel-avatar', [
  'width: 132%',
  'image-rendering: pixelated',
  'transform: translate(3%, 1%)'
])

for (const fragment of [
  'typewriter.dataset.typewriter',
  "window.matchMedia('(prefers-reduced-motion: reduce)')",
  'window.setTimeout(tick, 70)',
  'window.setTimeout(tick, 1800)',
  'window.setTimeout(tick, 35)',
  'window.setTimeout(tick, 450)'
]) {
  if (!script.includes(fragment)) {
    fail(`script.js should include ${fragment}`)
  }
}

const pngSignature = avatar.subarray(0, 8).toString('hex')
if (pngSignature !== '89504e470d0a1a0a') {
  fail('assets/avatar-pixel.png is not a PNG file')
}

console.log('Site verification passed')
