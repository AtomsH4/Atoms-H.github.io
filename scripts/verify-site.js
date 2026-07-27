const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const indexPath = path.join(root, 'index.html')
const cssPath = path.join(root, 'styles.css')
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
expectFile(avatarPath, 'pixel avatar')

if (fs.existsSync(cnamePath)) {
  fail('CNAME should be removed so the project publishes under the GitHub Pages project URL')
}

const html = fs.readFileSync(indexPath, 'utf8')
const css = fs.readFileSync(cssPath, 'utf8')
const avatar = fs.readFileSync(avatarPath)

const requiredHtml = [
  '<!doctype html>',
  'lang="zh-CN"',
  '<h1 id="hero-title">AtomsH4</h1>',
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

const projectCards = [...html.matchAll(/data-project="/g)]
if (projectCards.length < 5) {
  fail(`expected at least 5 project cards, found ${projectCards.length}`)
}

for (const fragment of [
  '--pink',
  '--cyan',
  '.hero',
  '.typewriter-quote',
  '.player-card',
  '.player-data',
  '.xp-track',
  '.portrait-frame',
  'overflow: hidden',
  'image-rendering: pixelated',
  '@media (max-width: 860px)'
]) {
  if (!css.includes(fragment)) {
    fail(`styles.css should include ${fragment}`)
  }
}

const pngSignature = avatar.subarray(0, 8).toString('hex')
if (pngSignature !== '89504e470d0a1a0a') {
  fail('assets/avatar-pixel.png is not a PNG file')
}

console.log('Site verification passed')
