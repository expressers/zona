// Coreografia da lata: keyframes ancorados a posições de scroll.
// Interpolação determinística (sem tweens concorrentes), o que mantém a lata
// coerente mesmo com scroll rápido ou saltos por âncora.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { state } from './state.js'
import { FLAVORS, COLORS } from '../data.js'

const TAU = Math.PI * 2

const hex = (h) => {
  const n = parseInt(h.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}
const bg = (h) => {
  const [r, g, b] = hex(h)
  return { br: r, bgc: g, bb: b }
}
const rim = (h, i = 1) => {
  const [r, g, b] = hex(h)
  return { rr: r, rg: g, rb: b, rimI: i }
}

const [LIMA, MARA, MANGA] = FLAVORS

function keys(mobile) {
  const side = mobile ? 0.0 : 1 // em mobile a lata fica centrada
  return [
    { at: ['#hero', 'top top'], v: { x: mobile ? 0.14 : -0.115, y: mobile ? -0.14 : -0.04, z: 0, s: mobile ? 0.8 : 0.94, rx: 0.06, ry: 0, rz: -0.14, flavor: 0, water: 0.6, bub: 0.55, vis: 1, line: 0, cold: 1, idle: 1, ...bg(COLORS.night), ...rim(COLORS.lime, 1) } },
    { at: ['#hero', 'bottom 75%'], v: { x: mobile ? 0.2 : 0.1, y: mobile ? 0.1 : 0, ry: 0.9, rz: -0.02 } },
    { pin: ['manifesto', 0], v: { x: 0.5 * side, y: mobile ? 0.42 : 0, s: mobile ? 0.62 : 0.92, rx: 0.12, ry: TAU - 0.3, rz: 0.18, water: 0.12, bub: 0.3, idle: 0.6, ...bg(COLORS.mist), ...rim(COLORS.brand, 0.8) } },
    { pin: ['manifesto', 1], v: { x: 0.52 * side, y: mobile ? 0.46 : 0.02, ry: TAU + 0.3, rz: 0.1 } },
    { pin: ['sabores', 0], v: { x: 0, y: mobile ? 0.12 : -0.02, s: mobile ? 0.82 : 1.04, rx: 0.04, ry: TAU * 2, rz: -0.07, flavor: 0, water: 0, bub: 0.4, idle: 0.45, ...bg(LIMA.bg), ...rim('#ffffff', 0.6) } },
    { pin: ['sabores', 0.22], v: { ry: TAU * 2 + 0.12, flavor: 0, ...bg(LIMA.bg) } },
    { pin: ['sabores', 0.42], v: { ry: TAU * 3, flavor: 1, rz: 0.06, ...bg(MARA.bg) } },
    { pin: ['sabores', 0.58], v: { ry: TAU * 3 + 0.12, flavor: 1, ...bg(MARA.bg) } },
    { pin: ['sabores', 0.78], v: { ry: TAU * 4, flavor: 2, rz: -0.06, ...bg(MANGA.bg) } },
    { pin: ['sabores', 1], v: { ry: TAU * 4 + 0.12, flavor: 2, ...bg(MANGA.bg) } },
    { at: ['#essencia', 'top 35%'], v: { x: 0.56 * side, y: mobile ? 1.6 : 0.04, s: mobile ? 0.5 : 0.8, rx: 0.1, ry: TAU * 5 - 0.35, rz: 0.3, bub: 0.2, idle: 0.8, ...bg(COLORS.mist), ...rim(COLORS.lime, 0.9) } },
    { at: ['#essencia', 'bottom 70%'], v: { y: mobile ? 1.9 : 0.1, ry: TAU * 5 + 0.25, rz: 0.22 } },
    { at: ['#origem', 'top 55%'], v: { y: 1.9, ry: TAU * 5 + 1.2, flavor: 2 } },
    { pin: ['origem', 0], v: { x: 0.36 * side, y: 1.9, s: mobile ? 0.58 : 0.86, flavor: 0, rz: -0.25, ry: TAU * 5 + 2.4, water: 1, bub: 1, cold: 0.4, ...bg(COLORS.water), ...rim('#9ff0c8', 1.2) } },
    { pin: ['origem', 0.45], v: { y: mobile ? 0.36 : 0.02, rz: -0.12, ry: TAU * 6 } },
    { pin: ['origem', 1], v: { y: mobile ? 0.3 : -0.04, ry: TAU * 6 + 0.3, rz: 0.05 } },
    { at: ['#estar', 'top 70%'], v: { y: -1.9, ry: TAU * 7, water: 0.6, ...bg(COLORS.water) } },
    { pin: ['estar', 0], v: { vis: 0, water: 0, bub: 0, cold: 1, flavor: 1, x: 0, ...bg(COLORS.mist) } },
    { pin: ['estar', 1], v: { vis: 0, ...bg(COLORS.mist) } },
    { at: ['#encontrar', 'top 90%'], v: { vis: 1, y: -1.9, s: mobile ? 0.46 : 0.54, line: 0, ry: TAU * 7, rz: 0, rx: 0.05, ...bg(COLORS.brand), ...rim(COLORS.lime, 1) } },
    { at: ['#encontrar', 'top top'], v: { y: mobile ? -0.2 : -0.33, line: 1, ry: TAU * 8, bub: 0.45, water: 0.25, idle: 0.6 } },
    { at: ['#rodape', 'top bottom'], v: { y: mobile ? -0.16 : -0.29 } },
    { at: ['#rodape', 'top 45%'], v: { y: 1.9, ...bg(COLORS.night) } },
  ]
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function createChoreo({ pins, mobile, bgEl, root }) {
  const list = keys(mobile)
  // completa cada keyframe com os valores do anterior
  let prev = list[0].v
  list.forEach((k) => {
    k.v = { ...prev, ...k.v }
    prev = k.v
  })

  const triggers = list.map((k) =>
    k.at ? ScrollTrigger.create({ trigger: k.at[0], start: k.at[1] }) : null
  )
  let positions = []
  const measure = () => {
    positions = list.map((k, i) => {
      if (k.at) return triggers[i].start
      const st = pins[k.pin[0]]
      return st.start + (st.end - st.start) * k.pin[1]
    })
    // garante ordem monótona
    for (let i = 1; i < positions.length; i++) positions[i] = Math.max(positions[i], positions[i - 1] + 1)
  }
  ScrollTrigger.addEventListener('refreshInit', () => {})
  ScrollTrigger.addEventListener('refresh', measure)
  measure()

  let lastBg = ''
  let lastInk = ''
  const out = {}
  const update = (y) => {
    let i = 0
    while (i < positions.length - 1 && y >= positions[i + 1]) i++
    const a = list[i].v
    const b = list[Math.min(i + 1, list.length - 1)].v
    const p0 = positions[i]
    const p1 = positions[Math.min(i + 1, positions.length - 1)]
    const t = p1 > p0 ? ease(Math.min(1, Math.max(0, (y - p0) / (p1 - p0)))) : 0
    for (const key in a) out[key] = a[key] + (b[key] - a[key]) * (y < positions[0] ? 0 : t)

    if (state.entered) {
      for (const key in state.target) if (key in out) state.target[key] = out[key]
    }
    const r = Math.round(out.br * 255)
    const g = Math.round(out.bgc * 255)
    const bl = Math.round(out.bb * 255)
    const css = `rgb(${r},${g},${bl})`
    if (css !== lastBg) {
      bgEl.style.backgroundColor = css
      lastBg = css
      const lum = 0.2126 * out.br + 0.7152 * out.bgc + 0.0722 * out.bb
      const ink = lum > 0.42 ? 'dark' : 'light'
      if (ink !== lastInk) {
        root.dataset.ink = ink
        lastInk = ink
      }
    }
  }
  return { update, measure }
}

export { gsap }
