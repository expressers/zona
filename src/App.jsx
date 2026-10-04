import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { Nav, Hero, Manifesto, Flavors, Essence, Origin, Lifestyle, Find, Footer } from './components/Sections.jsx'
import AgeGate, { hasConsent } from './components/AgeGate.jsx'
import { Stage } from './three/Stage.js'
import { state } from './motion/state.js'
import { createChoreo } from './motion/choreo.js'
import { FLAVORS } from './data.js'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const canvasRef = useRef(null)
  const bgRef = useRef(null)
  const stageRef = useRef(null)
  const lenisRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [entered, setEntered] = useState(false)
  const [gateGone, setGateGone] = useState(false)
  const [webgl, setWebgl] = useState(true)

  // cena 3D
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 760px)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let stage
    try {
      stage = new Stage(canvasRef.current, FLAVORS, { mobile, reduced })
    } catch (e) {
      setWebgl(false)
      setReady(true)
      return
    }
    stageRef.current = stage
    if (import.meta.env.DEV) window.__stage = stage
    stage
      .init()
      .then(() => setReady(true))
      .catch(() => {
        setWebgl(false)
        setReady(true)
      })
    const onResize = () => stage.resize()
    const onVis = () => (stage.visible = !document.hidden)
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
      stage.dispose()
    }
  }, [])

  // scroll, pins e coreografia
  useLayoutEffect(() => {
    const mobile = window.matchMedia('(max-width: 760px)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = document.documentElement

    let lenis = null
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, touchMultiplier: 1.4 })
      lenisRef.current = lenis
      lenis.on('scroll', (e) => {
        ScrollTrigger.update()
        state.rise += Math.min(Math.abs(e.velocity), 60) * 0.0025
      })
      lenis.stop()
    }

    let tick = null
    let lenisRaf = null
    const ctx = gsap.context(() => {
      gsap.set('.hero-title .split', { yPercent: 105 })
      gsap.set('.hero-foot .reveal', { opacity: 0 })
      gsap.set('.nav', { opacity: 0 })
      const pins = {}
      pins.manifesto = ScrollTrigger.create({ trigger: '#manifesto', start: 'top top', end: '+=110%', pin: true })
      pins.sabores = ScrollTrigger.create({ trigger: '#sabores', start: 'top top', end: '+=320%', pin: true })
      pins.origem = ScrollTrigger.create({ trigger: '#origem', start: 'top top', end: '+=160%', pin: true })

      const track = document.querySelector('.life-track')
      const panLen = () => Math.max(0, track.scrollWidth - window.innerWidth)
      const panDist = () => panLen() * 0.72
      const pan = gsap.to(track, {
        x: () => -panLen(),
        ease: 'none',
        scrollTrigger: {
          trigger: '#estar',
          start: 'top top',
          end: () => '+=' + panDist(),
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
      pins.estar = pan.scrollTrigger

      // palavras do lifestyle com leve paralaxe dentro do pan
      gsap.utils.toArray('.life-word').forEach((w) => {
        gsap.fromTo(
          w,
          { xPercent: 30 },
          { xPercent: -30, ease: 'none', scrollTrigger: { trigger: w, containerAnimation: pan, start: 'left right', end: 'right left', scrub: true } }
        )
      })

      // manifesto: palavras acendem ao ritmo do scroll
      gsap.fromTo(
        '.mword',
        { opacity: 0.14 },
        { opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: '#manifesto', start: 'top 60%', end: () => pins.manifesto.end - window.innerHeight * 0.35, scrub: true } }
      )
      gsap.fromTo(
        '.manifesto-sub',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: '#manifesto', start: () => pins.manifesto.start + window.innerHeight * 0.4, end: () => pins.manifesto.start + window.innerHeight * 0.75, scrub: true } }
      )

      // hero: título afasta-se com o scroll
      gsap.to('.hero-l1', { yPercent: -40, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('.hero-l2', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: '10% top', end: 'bottom top', scrub: true } })
      gsap.to('.hero-foot', { opacity: 0, y: -40, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: '50% top', scrub: true } })

      // sabores: painéis cruzam em sintonia com o enchimento do rótulo
      const panels = gsap.utils.toArray('.flavor')
      const tabs = gsap.utils.toArray('.flavor-tab')
      const ft = gsap.timeline({ scrollTrigger: { trigger: '#sabores', start: () => pins.sabores.start, end: () => pins.sabores.end, scrub: true } })
      ft.set(panels, { autoAlpha: (i) => (i === 0 ? 1 : 0) }, 0)
      panels.forEach((p, i) => {
        const giant = p.querySelector('.flavor-giant')
        const icon = p.querySelector('.flavor-icon')
        const copy = p.querySelector('.flavor-copy')
        const st0 = Math.max(0, i * 0.36 - 0.05)
        const dur = Math.min(0.4, 1 - st0)
        ft.fromTo(giant, { xPercent: 6 }, { xPercent: -6, ease: 'none', duration: dur }, st0)
        ft.fromTo(icon, { rotate: -25, scale: 0.9 }, { rotate: 25, scale: 1.05, ease: 'none', duration: dur }, st0)
        if (i > 0) {
          const at = i === 1 ? 0.3 : 0.66
          ft.to(panels[i - 1], { autoAlpha: 0, duration: 0.06, ease: 'power1.in' }, at)
          ft.fromTo(p, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.07, ease: 'power1.out' }, at + 0.03)
          ft.fromTo(copy, { y: 40 }, { y: 0, duration: 0.08, ease: 'power2.out' }, at + 0.03)
        }
      })
      ft.set({}, {}, 1)
      let current = 0
      ScrollTrigger.create({
        trigger: '#sabores',
        start: () => pins.sabores.start,
        end: () => pins.sabores.end,
        onUpdate: (self) => {
          const idx = self.progress < 0.32 ? 0 : self.progress < 0.68 ? 1 : 2
          if (idx !== current) {
            current = idx
            tabs.forEach((t, i) => t.setAttribute('aria-selected', i === idx))
            panels.forEach((p, i) => p.setAttribute('aria-hidden', i !== idx))
          }
        },
      })
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => {
          const st = pins.sabores
          const y = st.start + (st.end - st.start) * [0.1, 0.5, 0.9][i]
          if (lenis) lenis.scrollTo(y, { duration: 1.4 })
          else window.scrollTo({ top: y })
        })
      })

      // origem
      const river = gsap.utils.toArray('.river path')
      river.forEach((p) => {
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
      })
      gsap.timeline({ scrollTrigger: { trigger: '#origem', start: () => pins.origem.start - window.innerHeight * 0.3, end: () => pins.origem.end - window.innerHeight * 0.2, scrub: true } })
        .fromTo('.origin-title', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.2 })
        .fromTo('.origin-text', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.15 }, 0.12)
        .to('.river-main', { strokeDashoffset: 0, duration: 0.5, ease: 'none' }, 0.25)
        .to('.river-trib', { strokeDashoffset: 0, duration: 0.3, ease: 'none' }, 0.3)
        .to('.river-delta', { strokeDashoffset: 0, duration: 0.2, ease: 'none' }, 0.7)
        .fromTo('.river figcaption span', { opacity: 0 }, { opacity: 1, stagger: 0.3, duration: 0.1 }, 0.3)

      // entradas simples (uma vez)
      gsap.utils.toArray('.essence .reveal, .find-top > *').forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', delay: (i % 4) * 0.06, scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      })
      gsap.fromTo('.essence-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.essence-title', start: 'top 85%', once: true } })
      gsap.fromTo('.footer-mark', { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '#rodape', start: 'top bottom', end: 'bottom bottom', scrub: true } })

      const choreo = createChoreo({ pins, mobile, bgEl: bgRef.current, root })
      tick = () => {
        choreo.update(lenis ? lenis.scroll : window.scrollY)
        stageRef.current?.render()
      }
      gsap.ticker.add(tick)
      if (lenis) {
        lenisRaf = (t) => lenis.raf(t * 1000)
        gsap.ticker.add(lenisRaf)
      }
      gsap.ticker.lagSmoothing(0)
      if (!lenis) window.addEventListener('scroll', () => ScrollTrigger.update(), { passive: true })

      ScrollTrigger.refresh()
    })

    const onPointer = (e) => {
      state.pointerTarget.x = (e.clientX / window.innerWidth - 0.5) * 2
      state.pointerTarget.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    if (window.matchMedia('(pointer: fine)').matches) window.addEventListener('pointermove', onPointer)

    // âncoras internas passam pelo Lenis
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href')
      const el = document.querySelector(id)
      if (!el) return
      e.preventDefault()
      if (lenis) lenis.scrollTo(el, { duration: 1.6 })
      else el.scrollIntoView()
    }
    document.addEventListener('click', onClick)

    return () => {
      if (tick) gsap.ticker.remove(tick)
      if (lenisRaf) gsap.ticker.remove(lenisRaf)
      ctx.revert()
      lenis?.destroy()
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('click', onClick)
    }
  }, [])

  // entrada (age gate)
  const enter = () => {
    if (state.entered) return
    state.entered = true
    setEntered(true)
    setTimeout(() => setGateGone(true), 1100)
    document.documentElement.classList.add('is-in')
    lenisRef.current?.start()
    const tl = gsap.timeline({ delay: 0.25 })
    tl.fromTo('.hero-title .split', { yPercent: 105 }, { yPercent: 0, duration: 1.3, stagger: 0.12, ease: 'expo.out' })
      .fromTo('.hero-foot .reveal', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out' }, 0.5)
      .fromTo('.nav', { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 0.6)
  }

  useEffect(() => {
    if (ready && hasConsent() && !entered) enter()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  return (
    <>
      <div className="bg-layer" ref={bgRef} aria-hidden />
      <canvas className={`stage ${webgl ? '' : 'is-off'}`} ref={canvasRef} aria-hidden />
      {!webgl && <img className="fallback-cans" src="/img/lineup.webp" alt="" aria-hidden />}
      {!gateGone && <AgeGate ready={ready} onEnter={enter} entered={entered} />}
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Flavors />
        <Essence />
        <Origin />
        <Lifestyle />
        <Find />
      </main>
      <Footer />
    </>
  )
}
