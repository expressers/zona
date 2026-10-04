import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildLabels, buildDropletNormals } from './labels.js'
import { state } from '../motion/state.js'

// Lata slim 330 ml: 57 mm x 146 mm. 1 unidade = 100 mm.
const R = 0.285
const SNAP = typeof location !== 'undefined' && location.search.includes('snap')
const BODY_BOTTOM = -0.6
const BODY_TOP = 0.6

function canProfile() {
  const p = [
    [0.0, -0.715],
    [0.15, -0.712],
    [0.205, -0.73],
    [0.232, -0.728],
    [0.25, -0.705],
    [0.272, -0.665],
    [R, -0.62],
    [R, BODY_BOTTOM],
    [R, BODY_TOP],
    [R, 0.625],
    [0.272, 0.668],
    [0.249, 0.703],
    [0.243, 0.718],
    [0.246, 0.728],
    [0.252, 0.734],
    [0.247, 0.741],
    [0.236, 0.736],
    [0.233, 0.722],
    [0.0, 0.716],
  ]
  return p.map(([r, y]) => new THREE.Vector2(r, y))
}

function makeTab(material) {
  const s = new THREE.Shape()
  const w = 0.075
  const h = 0.16
  s.moveTo(-w, -h / 2 + w)
  s.absarc(0, -h / 2 + w, w, Math.PI, 0, false)
  s.lineTo(w, h / 2 - w)
  s.absarc(0, h / 2 - w, w, 0, Math.PI, false)
  s.closePath()
  const hole = new THREE.Path()
  hole.absellipse(0, h / 2 - w * 0.95, w * 0.62, w * 0.5, 0, Math.PI * 2, false)
  s.holes.push(hole)
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.006, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 2, curveSegments: 24 })
  const m = new THREE.Mesh(g, material)
  m.rotation.x = -Math.PI / 2
  m.position.set(0, 0.725, 0.03)
  return m
}

// material do rótulo que mistura dois sabores com uma "linha de líquido" a subir
function labelMaterial(normals) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.16,
    roughness: 0.36,
    envMapIntensity: 0.85,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    normalMap: normals,
    normalScale: new THREE.Vector2(0.55, 0.55),
  })
  const uniforms = {
    uMapB: { value: null },
    uMix: { value: 0 },
    uTime: { value: 0 },
    uCold: { value: 1 },
  }
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform sampler2D uMapB;
        uniform float uMix;
        uniform float uTime;
        uniform float uCold;`
      )
      .replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
          vec4 cA = texture2D( map, vMapUv );
          vec4 cB = texture2D( uMapB, vMapUv );
          float wave = 0.025 * sin(vMapUv.x * 37.7 + uTime * 2.4) + 0.012 * sin(vMapUv.x * 81.0 - uTime * 3.1);
          float level = uMix * 1.16 - 0.08;
          float edge = smoothstep(level - 0.012, level + 0.012, vMapUv.y + wave);
          vec4 texel = mix(cB, cA, edge);
          float rim = (1.0 - smoothstep(0.0, 0.03, abs(vMapUv.y + wave - level))) * step(0.001, uMix) * step(uMix, 0.999);
          texel.rgb += rim * 0.35;
          diffuseColor *= texel;
        #endif`
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        normal = normalize(mix(nonPerturbedNormal, normal, uCold));`
      )
  }
  mat.userData.uniforms = uniforms
  return mat
}

function buildCan(labelTex, normals, metal, lid) {
  const group = new THREE.Group()
  const shell = new THREE.Mesh(new THREE.LatheGeometry(canProfile(), 96), metal)
  group.add(shell)

  const top = new THREE.Mesh(new THREE.CircleGeometry(0.234, 64), lid)
  top.rotation.x = -Math.PI / 2
  top.position.y = 0.717
  group.add(top)
  group.add(makeTab(lid))

  const mat = labelMaterial(normals)
  mat.map = labelTex
  mat.userData.uniforms.uMapB.value = labelTex
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.0015, R + 0.0015, BODY_TOP - BODY_BOTTOM, 128, 1, true, Math.PI, Math.PI * 2),
    mat
  )
  label.position.y = (BODY_TOP + BODY_BOTTOM) / 2
  group.add(label)
  group.userData.label = mat
  return group
}

// bolhas: pontos com shader de anel (borda clara, centro transparente)
function buildBubbles(count) {
  const g = new THREE.BufferGeometry()
  const pos = new Float32Array(count * 3)
  const seed = new Float32Array(count * 4)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 7
    pos[i * 3 + 1] = (Math.random() - 0.5) * 6
    pos[i * 3 + 2] = (Math.random() - 0.5) * 3.2 - 0.3
    seed[i * 4] = Math.random()
    seed[i * 4 + 1] = 0.35 + Math.random() * 0.9 // velocidade
    seed[i * 4 + 2] = Math.pow(Math.random(), 2.2) // tamanho
    seed[i * 4 + 3] = Math.random() * 6.283
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4))
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0.6 },
      uPx: { value: 1 },
      uRise: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute vec4 aSeed;
      uniform float uTime;
      uniform float uPx;
      uniform float uRise;
      varying float vA;
      void main() {
        vec3 p = position;
        float t = uTime * aSeed.y * 0.32 + uRise * (0.6 + aSeed.y);
        p.y = mod(p.y + t + 3.0, 6.0) - 3.0;
        p.x += sin(uTime * 1.7 * aSeed.y + aSeed.w) * 0.05 * (0.4 + aSeed.z);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float size = (5.0 + aSeed.z * 34.0) * uPx;
        gl_PointSize = size * (4.2 / -mv.z);
        vA = smoothstep(3.0, 2.2, abs(p.y)) * (0.45 + aSeed.x * 0.55);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying float vA;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float ring = smoothstep(0.5, 0.42, d) * smoothstep(0.18, 0.44, d);
        float glint = smoothstep(0.16, 0.0, length(c - vec2(-0.16, -0.16)));
        float a = (ring * 0.75 + glint * 0.9 + 0.06) * vA * uOpacity;
        gl_FragColor = vec4(vec3(1.0), a);
      }
    `,
  })
  const points = new THREE.Points(g, mat)
  points.frustumCulled = false
  return points
}

// luz de água (cáusticas) em plano de fundo
function buildWater() {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uTint: { value: new THREE.Color('#bdf5d4') },
      uAspect: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uAspect;
      uniform vec3 uTint;
      // cáusticas iterativas (técnica clássica de água em shader)
      float caustic(vec2 uv, float time) {
        vec2 p = mod(uv * 6.2831, 6.2831) - 250.0;
        vec2 i = p;
        float c = 1.0;
        float inten = 0.005;
        for (int n = 0; n < 5; n++) {
          float t = time * (1.0 - (3.5 / float(n + 1)));
          i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
          c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
        }
        c /= 5.0;
        c = 1.17 - pow(c, 1.4);
        return pow(abs(c), 8.0);
      }
      void main() {
        vec2 uv = vUv;
        uv.x *= uAspect;
        float t = uTime * 0.35;
        float c = caustic(uv * 0.55 + vec2(0.0, t * 0.04), t);
        float depth = smoothstep(1.1, -0.1, vUv.y); // mais luz em cima
        float a = clamp(c, 0.0, 1.0) * (0.25 + 0.75 * (1.0 - depth)) * uOpacity;
        // raios de luz vindos da superfície
        float rays = 0.0;
        for (int k = 0; k < 4; k++) {
          float fk = float(k);
          float x = uv.x * (1.3 + fk * 0.37) + sin(t * (0.6 + fk * 0.2) + fk) * 0.4;
          rays += pow(0.5 + 0.5 * sin(x * 6.0 + fk * 1.7), 18.0) * (0.3 - fk * 0.05);
        }
        rays *= smoothstep(0.0, 1.0, vUv.y) * uOpacity * 0.55;
        gl_FragColor = vec4(uTint, a * 0.55 + rays);
      }
    `,
  })
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
  m.frustumCulled = false
  m.renderOrder = -10
  return m
}

export class Stage {
  constructor(canvas, flavors, { mobile = false, reduced = false } = {}) {
    this.canvas = canvas
    this.flavors = flavors
    this.mobile = mobile
    this.reduced = reduced
    this.clock = new THREE.Clock()
    this.ready = false
    this.visible = true
    this.idle = 0

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NeutralToneMapping
    renderer.toneMappingExposure = 1.0
    this.renderer = renderer

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50)
    this.camera.position.set(0, 0, 5)

    const pmrem = new THREE.PMREMGenerator(renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture

    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(2.5, 3, 4)
    this.scene.add(key)
    this.rim = new THREE.DirectionalLight(0xd9e24a, 2.2)
    this.rim.position.set(-3, 1.5, -2.5)
    this.scene.add(this.rim)
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.25))

    this.water = buildWater()
    this.scene.add(this.water)
    this.bubbles = buildBubbles(mobile ? 220 : 520)
    this.scene.add(this.bubbles)

    this.root = new THREE.Group()
    this.scene.add(this.root)
    this.lineup = new THREE.Group()
    this.scene.add(this.lineup)
  }

  async init() {
    const aniso = this.renderer.capabilities.getMaxAnisotropy()
    this.labels = await buildLabels(this.flavors, Math.min(8, aniso))
    const normals = buildDropletNormals(this.mobile ? 512 : 1024)
    const metal = new THREE.MeshStandardMaterial({ color: 0xd5d8da, metalness: 1, roughness: 0.24 })
    const lid = new THREE.MeshStandardMaterial({ color: 0xc7cbcd, metalness: 1, roughness: 0.32 })

    this.can = buildCan(this.labels[0], normals, metal, lid)
    this.root.add(this.can)

    // alinhamento em linha para a secção final
    this.mates = [0, 2].map((i) => {
      const c = buildCan(this.labels[i], normals, metal, lid)
      this.lineup.add(c)
      return c
    })

    this.resize()
    this.ready = true
    this.renderer.compile(this.scene, this.camera)
  }

  resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    const vh = 2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    this.view = { w: vh * this.camera.aspect, h: vh }
    // em ecrãs estreitos a lata encolhe para caber na largura
    this.fit = Math.min(1, (w / h) / 0.78)
    this.water.material.uniforms.uAspect.value = w / h
    this.bubbles.material.uniforms.uPx.value = this.renderer.getPixelRatio() * (this.mobile ? 0.8 : 1)
  }

  render() {
    if (!this.ready || !this.visible) return
    const dt = Math.min(this.clock.getDelta(), 0.05)
    const t = this.clock.elapsedTime
    const s = state

    // suavização das posições (sensação de massa)
    const k = SNAP ? 1 : 1 - Math.pow(0.0008, dt)
    const sm = this.smooth || (this.smooth = { ...s.target })
    for (const key in s.target) sm[key] += (s.target[key] - sm[key]) * k
    const kp = 1 - Math.pow(0.02, dt)
    s.pointer.x += (s.pointerTarget.x - s.pointer.x) * kp
    s.pointer.y += (s.pointerTarget.y - s.pointer.y) * kp

    const { w, h } = this.view
    const baseScale = 1.0 * this.fit * (h / 2.5)
    const can = this.can
    const sway = this.reduced ? 0 : Math.sin(t * 0.55) * 0.34 * sm.idle

    can.position.set(sm.x * w * 0.5, sm.y * h * 0.5 + (this.reduced ? 0 : Math.sin(t * 1.1) * 0.025 * sm.idle), sm.z)
    can.scale.setScalar(sm.s * baseScale * (0.001 + sm.vis))
    can.rotation.set(sm.rx + s.pointer.y * 0.08, sm.ry + sway + s.pointer.x * 0.25, sm.rz)
    can.visible = sm.vis > 0.01

    // sabor: mistura entre dois rótulos
    const f = Math.max(0, Math.min(this.labels.length - 1, sm.flavor))
    const a = Math.floor(f)
    const b = Math.min(this.labels.length - 1, a + 1)
    const mix = f - a
    const L = can.userData.label
    L.map = this.labels[a]
    L.userData.uniforms.uMapB.value = this.labels[b]
    L.userData.uniforms.uMix.value = mix < 0.002 ? 0 : mix > 0.998 ? 1 : mix
    L.userData.uniforms.uTime.value = t
    L.userData.uniforms.uCold.value = sm.cold

    // lineup final
    const ln = sm.line
    this.lineup.visible = ln > 0.01
    if (this.lineup.visible) {
      const spread = Math.min(w * 0.31, 1.25 * baseScale)
      this.mates.forEach((m, i) => {
        const side = i === 0 ? -1 : 1
        m.position.set(can.position.x + side * spread * (0.6 + 0.4 * ln), can.position.y - 0.04 * baseScale + (1 - ln) * -0.6, -0.35)
        m.scale.setScalar(sm.s * baseScale * 0.92 * Math.max(0.001, ln))
        m.rotation.set(0.04, side * 0.32 + Math.sin(t * 0.5 + side) * 0.25, side * 0.07)
        m.userData.label.userData.uniforms.uTime.value = t
        m.userData.label.userData.uniforms.uCold.value = sm.cold
      })
    }

    this.water.material.uniforms.uTime.value = t
    this.water.material.uniforms.uOpacity.value = sm.water
    const bu = this.bubbles.material.uniforms
    bu.uTime.value = this.reduced ? t * 0.2 : t
    bu.uOpacity.value = sm.bub
    bu.uRise.value = s.rise

    this.rim.color.setRGB(sm.rr, sm.rg, sm.rb)
    this.rim.intensity = 1.2 + sm.rimI * 2.2
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.renderer.dispose()
  }
}
