// Rótulos das latas desenhados em canvas, a partir da linguagem real do packaging:
// cor do sabor em cima, faixa branca em baixo, wordmark, "Hard Seltzer" em slab,
// ícone de linhas e a informação base.
import * as THREE from 'three'

const W = 3072
const H = 2048
const BAND = 0.735 // onde começa a faixa branca

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// pinta uma máscara branca (PNG/WebP com alfa) numa cor
function tinted(img, color, w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')
  x.drawImage(img, 0, 0, w, h)
  x.globalCompositeOperation = 'source-in'
  x.fillStyle = color
  x.fillRect(0, 0, w, h)
  return c
}

// ícone do maracujá: fita torcida feita de anéis finos (como na lata)
function drawRibbon(ctx, cx, cy, size, color) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.strokeStyle = color
  ctx.lineWidth = size * 0.0036
  const N = 54
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    const a = t * Math.PI * 1.15 - 0.35
    const px = Math.cos(a) * size * 0.2 - size * 0.02
    const py = Math.sin(a * 1.4) * size * 0.11
    const rx = size * (0.26 - 0.1 * Math.sin(t * Math.PI))
    const ry = size * (0.07 + 0.11 * Math.abs(Math.cos(t * Math.PI * 1.2)))
    ctx.globalAlpha = 0.55 + 0.45 * Math.sin(t * Math.PI)
    ctx.beginPath()
    ctx.ellipse(px, py, rx, ry, -0.5 + t * 1.6, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
}

function spaced(ctx, text, x, y, spacing) {
  // texto centrado com tracking manual (canvas letterSpacing ainda não é universal)
  const chars = [...text]
  const widths = chars.map((ch) => ctx.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
  let cx = x - total / 2
  chars.forEach((ch, i) => {
    ctx.fillText(ch, cx + widths[i] / 2, y)
    cx += widths[i] + spacing
  })
}

export async function buildLabels(flavors, maxAniso = 8) {
  await Promise.all([
    document.fonts.load('700 80px "Zilla Slab"'),
    document.fonts.load('600 80px "Zilla Slab"'),
    document.fonts.load('600 60px "Red Hat Text Variable"'),
    document.fonts.load('800 60px "Red Hat Text Variable"'),
  ]).catch(() => {})

  const [wordmark, fan, cone, sweep] = await Promise.all([
    loadImage('/brand/wordmark.png'),
    loadImage('/brand/el-fan.webp'),
    loadImage('/brand/el-cone.webp'),
    loadImage('/brand/el-sweep.webp'),
  ])

  return flavors.map((f) => {
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const x = c.getContext('2d')
    const bandY = H * BAND

    // corpo de cor com leve gradiente vertical, como alumínio pintado
    const g = x.createLinearGradient(0, 0, 0, bandY)
    g.addColorStop(0, f.bg)
    g.addColorStop(1, shade(f.bg, -0.06))
    x.fillStyle = g
    x.fillRect(0, 0, W, bandY)

    // faixa branca
    x.fillStyle = '#EEF0EC'
    x.fillRect(0, bandY, W, H - bandY)
    x.fillStyle = 'rgba(0,0,0,0.05)'
    x.fillRect(0, bandY, W, 6)

    // costas: elemento gráfico grande e suave, contínuo na emenda (x=0 e x=W)
    const back = tinted(sweep, f.ink, 1300, 1000)
    x.globalAlpha = 0.12
    x.drawImage(back, -650, 120)
    x.drawImage(back, W - 650, 120)
    x.globalAlpha = 1

    const cx = W / 2
    x.textAlign = 'center'
    x.textBaseline = 'alphabetic'
    x.fillStyle = f.ink

    // wordmark
    const wmW = 760
    const wmH = (wordmark.height / wordmark.width) * wmW
    x.drawImage(tinted(wordmark, f.ink, wmW, wmH), cx - wmW / 2, 150)

    x.font = '600 66px "Zilla Slab"'
    spaced(x, 'ÁGUA GASEIFICADA', cx, 520, 9)
    spaced(x, 'COM ÁLCOOL', cx, 600, 9)
    x.font = '700 104px "Zilla Slab"'
    spaced(x, 'HARD SELTZER', cx, 728, 10)

    // ícone
    const iy = 1000
    if (f.icon === 'fan') {
      x.drawImage(tinted(fan, f.ink, 470, 470), cx - 250, iy - 245)
    } else if (f.icon === 'cone') {
      x.drawImage(tinted(cone, f.ink, 520, 428), cx - 260, iy - 214)
    } else {
      drawRibbon(x, cx, iy, 980, f.ink)
    }

    x.fillStyle = f.ink
    x.font = '700 92px "Zilla Slab"'
    spaced(x, f.labelName, cx, 1385, 12)

    // texto da faixa
    x.fillStyle = '#3B3F3C'
    x.font = '600 50px "Red Hat Text Variable"'
    spaced(x, 'SABOR NATURAL', cx, bandY + 112, 5)
    spaced(x, 'FEITO COM VODKA PREMIUM', cx, bandY + 178, 5)

    const stats = [
      ['5%', 'ALC. VOL.'],
      ['8g', 'AÇÚCAR'],
      ['18+', 'BEBE COM MODERAÇÃO'],
    ]
    stats.forEach(([big, small], i) => {
      const sx = cx + (i - 1) * 300
      x.font = '800 78px "Red Hat Text Variable"'
      x.fillText(big, sx, bandY + 330)
      x.font = '600 30px "Red Hat Text Variable"'
      x.fillText(small, sx, bandY + 380)
    })

    // lateral: hashtag discreta
    x.save()
    x.fillStyle = f.ink
    x.globalAlpha = 0.85
    x.font = '700 56px "Zilla Slab"'
    x.translate(cx + 720, bandY / 2)
    x.rotate(Math.PI / 2)
    spaced(x, '#ENTRANAZONA', 0, 0, 14)
    x.restore()

    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = maxAniso
    tex.wrapS = THREE.RepeatWrapping
    tex.needsUpdate = true
    return tex
  })
}

// mapa de normais com gotas de condensação
export function buildDropletNormals(size = 1024) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const x = c.getContext('2d')
  x.fillStyle = 'rgb(128,128,255)'
  x.fillRect(0, 0, size, size)
  let seed = 7
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const drops = 1500
  for (let i = 0; i < drops; i++) {
    const r = rnd() < 0.92 ? 2 + rnd() * 6 : 8 + rnd() * 12
    const px = rnd() * size
    const py = rnd() * size
    const stretch = 1 + rnd() * 0.5
    // gradiente que codifica a inclinação da gota em R/G
    for (const ox of [-size, 0, size]) {
      const gx = x.createLinearGradient(px + ox - r, 0, px + ox + r, 0)
      gx.addColorStop(0, 'rgb(40,128,255)')
      gx.addColorStop(1, 'rgb(215,128,255)')
      x.save()
      x.beginPath()
      x.ellipse(px + ox, py, r, r * stretch, 0, 0, Math.PI * 2)
      x.clip()
      x.fillStyle = gx
      x.fillRect(px + ox - r, py - r * stretch, r * 2, r * 2 * stretch)
      const gy = x.createLinearGradient(0, py - r * stretch, 0, py + r * stretch)
      gy.addColorStop(0, 'rgba(128,215,255,0.5)')
      gy.addColorStop(1, 'rgba(128,40,255,0.5)')
      x.fillStyle = gy
      x.fillRect(px + ox - r, py - r * stretch, r * 2, r * 2 * stretch)
      x.restore()
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 1.3)
  return tex
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  let r = (n >> 16) & 255
  let g = (n >> 8) & 255
  let b = n & 255
  r = Math.round(Math.min(255, Math.max(0, r + r * amt)))
  g = Math.round(Math.min(255, Math.max(0, g + g * amt)))
  b = Math.round(Math.min(255, Math.max(0, b + b * amt)))
  return `rgb(${r},${g},${b})`
}
