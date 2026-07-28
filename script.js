const typewriter = document.querySelector('[data-typewriter]')

if (typewriter) {
  const text = typewriter.dataset.typewriter
  const output = typewriter.querySelector('.typewriter-text')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  if (output && text && !reducedMotion.matches) {
    let index = 0
    let deleting = false

    output.textContent = ''

    const tick = () => {
      output.textContent = text.slice(0, index)

      if (!deleting && index < text.length) {
        index += 1
        window.setTimeout(tick, 70)
        return
      }

      if (!deleting) {
        deleting = true
        window.setTimeout(tick, 1800)
        return
      }

      if (index > 0) {
        index -= 1
        window.setTimeout(tick, 35)
        return
      }

      deleting = false
      window.setTimeout(tick, 450)
    }

    tick()
  }
}
