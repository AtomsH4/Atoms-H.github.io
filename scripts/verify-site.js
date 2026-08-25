const fs = require('fs')
const path = require('path')
const vm = require('vm')

const root = path.resolve(__dirname, '..')
const indexPath = path.join(root, 'index.html')
const cssPath = path.join(root, 'styles.css')
const scriptPath = path.join(root, 'script.js')
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

if (fs.existsSync(cnamePath)) {
  fail('CNAME should be removed so the project publishes under the GitHub Pages project URL')
}

const html = fs.readFileSync(indexPath, 'utf8')
const css = fs.readFileSync(cssPath, 'utf8')
const script = fs.readFileSync(scriptPath, 'utf8')
const expectedTypewriterText = 'Any sufficiently advanced technology is indistinguishable from magic.'

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

const expectHtmlTagAttributes = (source, label, pattern, requiredAttributes) => {
  const tag = source.match(pattern)?.[0]

  if (!tag) {
    fail(`index.html should include a ${label} tag`)
  }

  for (const attribute of requiredAttributes) {
    if (!tag.includes(attribute)) {
      fail(`${label} should include ${attribute}`)
    }
  }
}

const requiredHtml = [
  '<!doctype html>',
  'lang="zh-CN"',
  '<link rel="stylesheet" href="styles.css?v=glass-v1">',
  '<script src="script.js" defer></script>',
  '<h1 id="hero-title">AtomsH4</h1>',
  'data-typewriter="Any sufficiently advanced technology is indistinguishable from magic."',
  'class="typewriter-text"',
  'class="typewriter-cursor"',
  'Any sufficiently advanced technology is indistinguishable from magic.',
  'class="glass-pixel-matrix"',
  'class="glass-pixel"',
  'id="quests"',
  'id="skills"',
  'id="projects"',
  'id="contact"',
  'https://github.com/AtomsH4',
  'https://www.cnblogs.com/atomsh',
  'https://github.com/AtomsH4/frontend-tools',
  'https://github.com/AtomsH4/CourseSelectionSystem',
  'https://github.com/AtomsH4/text-classification-cnn-rnn'
]

const forbiddenHtml = [
  'Gu JiaMing',
  'PLAYER DATA',
  'PROGRAMMER',
  'LV. ???',
  'aria-label="Experience"',
  'STATUS: CODING',
  'assets/avatar-pixel.png',
  'class="player-card"',
  'class="pixel-avatar"'
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

const typewriterQuoteBlock = html.match(
  /<p\b[^>]*class="typewriter-quote"[^>]*>[\s\S]*?<\/p>/
)?.[0]

if (!typewriterQuoteBlock) {
  fail('index.html should include a complete p.typewriter-quote block')
}

expectHtmlTagAttributes(
  typewriterQuoteBlock,
  'p.typewriter-quote',
  /<p\b[^>]*class="typewriter-quote"[^>]*>/,
  [
    `data-typewriter="${expectedTypewriterText}"`,
    `aria-label="${expectedTypewriterText}"`
  ]
)

expectHtmlTagAttributes(
  typewriterQuoteBlock,
  'span.typewriter-text',
  /<span\b[^>]*class="typewriter-text"[^>]*>/,
  ['aria-hidden="true"']
)

expectHtmlTagAttributes(
  typewriterQuoteBlock,
  'span.typewriter-cursor',
  /<span\b[^>]*class="typewriter-cursor"[^>]*>/,
  ['aria-hidden="true"']
)

const fallbackTypewriterText = typewriterQuoteBlock.match(
  /<span\b[^>]*class="typewriter-text"[^>]*>([^<]*)<\/span>/
)?.[1]

if (fallbackTypewriterText !== expectedTypewriterText) {
  fail(`span.typewriter-text should contain ${expectedTypewriterText}`)
}

const glassMatrixTag = html.match(
  /<div\b[^>]*class="glass-pixel-matrix"[^>]*>/
)?.[0]

if (!glassMatrixTag?.includes('aria-hidden="true"')) {
  fail('glass pixel matrix should be hidden from assistive technology')
}

const glassPixels = [...html.matchAll(/class="glass-pixel"/g)]
if (glassPixels.length !== 20) {
  fail(`expected 20 glass pixels, found ${glassPixels.length}`)
}

const projectCards = [...html.matchAll(/data-project="/g)]
if (projectCards.length < 5) {
  fail(`expected at least 5 project cards, found ${projectCards.length}`)
}

for (const fragment of [
  '--glass-bg',
  '--glass-border',
  '--glass-shadow',
  '.hero',
  '.typewriter-quote',
  '.typewriter-cursor',
  '.glass-pixel-matrix',
  '.glass-pixel',
  '@supports not ((backdrop-filter: blur(1px))',
  '@media (max-width: 860px)',
  '@media (max-width: 520px)',
  '@media (prefers-reduced-motion: reduce)'
]) {
  if (!css.includes(fragment)) {
    fail(`styles.css should include ${fragment}`)
  }
}

expectCssRule('.typewriter-quote', [
  'width: min(100%, 480px)',
  'min-height: 4.3em'
])

expectCssRule('.typewriter-cursor', [
  'position: relative',
  'width: 0',
  'margin-left: 0',
  'background: transparent'
])

expectCssRule('.typewriter-cursor::after', [
  'content: ""',
  'position: absolute',
  'left: 0.12em',
  'width: 0.7ch',
  'height: 100%',
  'background: var(--accent)'
])

expectCssRule('.glass-pixel-matrix', [
  'grid-template-columns: repeat(5, 1fr)'
])

expectCssRule('.glass-pixel', [
  'backdrop-filter: blur(18px) saturate(145%)',
  'border-radius: 18px'
])

expectCssRule('.site-nav', [
  'backdrop-filter: blur(24px) saturate(135%)'
])

const reducedMotionCursorRule =
  /@media \(prefers-reduced-motion: reduce\) \{\s*html \{[^{}]*\}\s*\.typewriter-cursor \{[^{}]*animation: none;[^{}]*\}\s*\}/

if (!reducedMotionCursorRule.test(css)) {
  fail('reduced-motion .typewriter-cursor should include animation: none')
}

for (const fragment of [
  'typewriter.dataset.typewriter',
  "window.matchMedia('(prefers-reduced-motion: reduce)')",
  'if (output && text && !reducedMotion.matches)',
  'window.setTimeout(tick, 70)',
  'window.setTimeout(tick, 1800)',
  'window.setTimeout(tick, 35)',
  'window.setTimeout(tick, 450)'
]) {
  if (!script.includes(fragment)) {
    fail(`script.js should include ${fragment}`)
  }
}

const executeTypewriter = ({
  reducedMotion = false,
  hasTypewriter = true,
  hasOutput = true
} = {}) => {
  const output = { textContent: expectedTypewriterText }
  const timers = []
  const typewriter = {
    dataset: { typewriter: expectedTypewriterText },
    querySelector: (selector) => (
      hasOutput && selector === '.typewriter-text' ? output : null
    )
  }
  const document = {
    querySelector: (selector) => (
      hasTypewriter && selector === '[data-typewriter]' ? typewriter : null
    )
  }
  const window = {
    matchMedia: () => ({ matches: reducedMotion }),
    setTimeout: (callback, delay) => {
      timers.push({ callback, delay })
    }
  }

  vm.runInNewContext(script, { document, window })

  return { output, timers }
}

const reducedMotionTypewriter = executeTypewriter({ reducedMotion: true })
if (reducedMotionTypewriter.output.textContent !== expectedTypewriterText) {
  fail('reduced motion should preserve the complete fallback typewriter text')
}
if (reducedMotionTypewriter.timers.length !== 0) {
  fail('reduced motion should not schedule typewriter timers')
}

for (const scenario of [
  { label: 'missing typewriter', options: { hasTypewriter: false } },
  { label: 'missing typewriter output', options: { hasOutput: false } }
]) {
  const result = executeTypewriter(scenario.options)
  if (result.timers.length !== 0) {
    fail(`${scenario.label} should not schedule typewriter timers`)
  }
}

const animatedTypewriter = executeTypewriter()
const visibleChanges = [{
  text: animatedTypewriter.output.textContent,
  time: 0
}]
let elapsed = 0
let previousText = animatedTypewriter.output.textContent

for (let step = 0; step < expectedTypewriterText.length * 3; step += 1) {
  const timer = animatedTypewriter.timers.shift()
  if (!timer) {
    fail('typewriter animation should continue scheduling timers')
  }

  elapsed += timer.delay
  timer.callback()

  if (animatedTypewriter.output.textContent !== previousText) {
    previousText = animatedTypewriter.output.textContent
    visibleChanges.push({ text: previousText, time: elapsed })
  }
}

const firstCharacter = expectedTypewriterText.slice(0, 1)
const typingStart = visibleChanges.findIndex(({ text }) => text === firstCharacter)
if (typingStart === -1) {
  fail('typewriter should render its first visible character')
}

for (let length = 1; length <= expectedTypewriterText.length; length += 1) {
  const change = visibleChanges[typingStart + length - 1]
  const expectedText = expectedTypewriterText.slice(0, length)

  if (!change || change.text !== expectedText) {
    fail(`typewriter should render ${length} characters during typing`)
  }

  if (length > 1) {
    const previousChange = visibleChanges[typingStart + length - 2]
    if (change.time - previousChange.time !== 70) {
      fail('typewriter input changes should be 70ms apart')
    }
  }
}

const fullTextChange = typingStart + expectedTypewriterText.length - 1
const timingFailures = []

for (let length = expectedTypewriterText.length - 1; length >= 0; length -= 1) {
  const changeIndex = fullTextChange + expectedTypewriterText.length - length
  const change = visibleChanges[changeIndex]
  const previousChange = visibleChanges[changeIndex - 1]
  const expectedText = expectedTypewriterText.slice(0, length)
  const expectedDelay = length === expectedTypewriterText.length - 1 ? 1800 : 35

  if (!change || change.text !== expectedText) {
    fail(`typewriter should render ${length} characters during deletion`)
  }

  const actualDelay = change.time - previousChange.time
  if (actualDelay !== expectedDelay) {
    timingFailures.push(
      `${previousChange.text.length}->${length} characters expected ${expectedDelay}ms, received ${actualDelay}ms`
    )
  }
}

const emptyTextChange = fullTextChange + expectedTypewriterText.length
const nextFirstCharacter = visibleChanges[emptyTextChange + 1]

if (!nextFirstCharacter || nextFirstCharacter.text !== firstCharacter) {
  fail('typewriter should restart with its first character after deletion')
}

const restartDelay = nextFirstCharacter.time - visibleChanges[emptyTextChange].time
if (restartDelay !== 450) {
  timingFailures.push(`0->1 characters expected 450ms, received ${restartDelay}ms`)
}

if (timingFailures.length > 0) {
  fail(`typewriter visible timing mismatch: ${timingFailures.join('; ')}`)
}

console.log('Site verification passed')
