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
      if (!deleting) {
        index += 1
        output.textContent = text.slice(0, index)

        if (index === text.length) {
          deleting = true
          window.setTimeout(tick, 1800)
          return
        }

        window.setTimeout(tick, 70)
        return
      }

      index -= 1
      output.textContent = text.slice(0, index)

      if (index === 0) {
        deleting = false
        window.setTimeout(tick, 450)
        return
      }

      window.setTimeout(tick, 35)
    }

    tick()
  }
}
