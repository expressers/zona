// Capturas de verificação (desktop + mobile) com o Chrome local.
// uso: bun scripts/shots.mjs [url] [outdir]
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const url = process.argv[2] || 'http://127.0.0.1:5188/?snap'
const out = process.argv[3] || '.impeccable/review'
fs.mkdirSync(out, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'],
})

const viewports = [
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
]

// pontos: [nome, função que devolve y]
const points = [
  ['01-hero', 'hero', 0],
  ['02-manifesto', 'pin:manifesto', 0.7],
  ['03-lima', 'pin:sabores', 0.1],
  ['04-wipe', 'pin:sabores', 0.33],
  ['05-maracuja', 'pin:sabores', 0.5],
  ['06-manga', 'pin:sabores', 0.93],
  ['07-essencia', 'essencia', 0.25],
  ['08-origem', 'pin:origem', 0.75],
  ['09-estar', 'pin:estar', 0.02],
  ['10-estar-mid', 'pin:estar', 0.5],
  ['11-encontrar', 'encontrar', 0],
  ['12-rodape', 'end', 0],
]

for (const vp of viewports) {
  const page = await browser.newPage()
  await page.setViewport(vp)
  await page.evaluateOnNewDocument(() => sessionStorage.setItem('zona-18', '1'))
  await page.goto(url, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 2500))
  for (const [name, target, frac] of points) {
    await page.evaluate(
      ({ target, frac }) => {
        let y = 0
        if (target === 'end') y = document.documentElement.scrollHeight
        else if (target.startsWith('pin:')) {
          const el = document.getElementById(target.slice(4))
          const sp = el.parentElement
          const top = sp.getBoundingClientRect().top + window.scrollY
          y = top + (sp.offsetHeight - window.innerHeight) * frac
        } else {
          const el = document.getElementById(target)
          y = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight * frac
        }
        window.scrollTo(0, y)
      },
      { target, frac }
    )
    await new Promise((r) => setTimeout(r, 900))
    await page.screenshot({ path: `${out}/${vp.name}-${name}.jpg`, type: 'jpeg', quality: 70 })
  }
  await page.close()
}
await browser.close()
console.log('ok')
