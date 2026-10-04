import { ArrowDownRight, ArrowUpRight, InstagramLogo } from '@phosphor-icons/react'
import { FLAVORS, LINKS, RETAILERS } from '../data.js'

const ICONS = { fan: '/brand/el-fan.webp', ribbon: '/brand/el-rings.webp', cone: '/brand/el-cone.webp' }

export function Wordmark({ className = '', label = 'Zona' }) {
  return <span className={`wordmark ${className}`} role="img" aria-label={label} />
}

export function Nav() {
  return (
    <header className="nav">
      <a href="#hero" className="nav-logo" aria-label="Zona, voltar ao início">
        <Wordmark />
      </a>
      <nav aria-label="Principal" className="nav-links">
        <a href="#sabores">Sabores</a>
        <a href="#origem">Origem</a>
        <a href="#encontrar">Onde comprar</a>
      </nav>
      <a className="btn btn-sm btn-lime" href={LINKS.shop} target="_blank" rel="noreferrer">
        Comprar <ArrowUpRight weight="bold" aria-hidden />
      </a>
    </header>
  )
}

export function Hero() {
  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <h1 id="hero-title" className="hero-title">
        <span className="line hero-l1">
          <span className="split">Entra na</span>
        </span>
        <span className="line hero-l2">
          <span className="split">
            Zona<i>.</i>
          </span>
        </span>
      </h1>
      <div className="hero-foot">
        <p className="hero-sub reveal">
          A primeira hard seltzer de Angola. Água com gás, vodka premium e fruta a sério.
        </p>
        <a href="#sabores" className="btn btn-lime reveal">
          Ver sabores <ArrowDownRight weight="bold" aria-hidden />
        </a>
      </div>
    </section>
  )
}

export function Manifesto() {
  const words = 'Uma forma diferente de te divertires.'.split(' ')
  return (
    <section id="manifesto" className="manifesto" aria-label="Manifesto">
      <div className="manifesto-inner">
        <p className="manifesto-text">
          {words.map((w, i) => (
            <span className="mword" key={i}>
              {w}{' '}
            </span>
          ))}
        </p>
        <p className="manifesto-sub">
          Leve, frutada e com gás fino. Criada em Luanda para se partilhar, do fim de tarde até à última música.
        </p>
      </div>
    </section>
  )
}

export function Flavors() {
  return (
    <section id="sabores" className="flavors" aria-label="Sabores">
      <h2 className="flavors-head">Escolhe a tua zona.</h2>
      {FLAVORS.map((f, i) => (
        <div
          key={f.id}
          className="flavor"
          data-i={i}
          style={{ '--ink': f.ink, '--deep': f.deep, '--fbg': f.bg }}
          aria-hidden={i !== 0}
        >
          <div className="flavor-giant" aria-hidden>
            {f.labelName}
          </div>
          <span
            className="flavor-icon"
            aria-hidden
            style={{ WebkitMaskImage: `url(${ICONS[f.icon]})`, maskImage: `url(${ICONS[f.icon]})` }}
          />
          <div className="flavor-copy">
            <h3>{f.note}</h3>
            <p>{f.line}</p>
          </div>
        </div>
      ))}
      <div className="flavor-tabs" role="tablist" aria-label="Sabores">
        {FLAVORS.map((f, i) => (
          <button key={f.id} role="tab" className="flavor-tab" data-i={i} aria-selected={i === 0}>
            <span className="dot" style={{ background: f.bg }} />
            {f.name}
          </button>
        ))}
      </div>
    </section>
  )
}

export function Essence() {
  const facts = [
    ['5%', 'de álcool, feita com vodka premium'],
    ['8 g', 'de açúcar por lata'],
    ['0', 'glúten, zero conservantes'],
    ['100%', 'angolana, de Luanda para o país'],
  ]
  return (
    <section id="essencia" className="essence" aria-labelledby="essence-title">
      <div className="essence-inner">
        <h2 id="essence-title" className="essence-title reveal-lines">
          Leve no corpo.
          <br />
          Cheia de sabor.
        </h2>
        <dl className="facts">
          {facts.map(([n, t]) => (
            <div className="fact reveal" key={n}>
              <dt>{n}</dt>
              <dd>{t}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export function Origin() {
  return (
    <section id="origem" className="origin" aria-labelledby="origin-title">
      <div className="origin-inner">
        <h2 id="origin-title" className="origin-title">
          Nasce
          <br />
          na água.
        </h2>
        <p className="origin-text">
          A Zona inspira-se nas nascentes do planalto do Huambo, que dão vida ao sistema do Okavango. Água que corre, renova e liga
          tudo o que toca.
        </p>
        <figure className="river" aria-label="Das nascentes do Huambo ao delta do Okavango">
          <svg viewBox="0 0 520 300" fill="none" aria-hidden>
            <path className="river-trib" d="M20 40 C 70 60, 90 30, 130 70" />
            <path className="river-trib" d="M60 150 C 90 120, 110 110, 150 105" />
            <path className="river-main" d="M40 20 C 120 60, 110 120, 170 110 S 260 160, 300 190 S 380 250, 470 240" />
            <path className="river-delta" d="M470 240 C 485 225, 500 215, 512 200" />
            <path className="river-delta" d="M470 240 C 490 240, 505 246, 515 258" />
            <path className="river-delta" d="M470 240 C 482 256, 488 270, 492 288" />
            <circle className="river-dot" cx="40" cy="20" r="6" />
            <circle className="river-dot river-dot-end" cx="470" cy="240" r="6" />
          </svg>
          <figcaption>
            <span className="river-a">Nascentes, Huambo</span>
            <span className="river-b">Delta do Okavango</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

const SCENES = [
  { type: 'img', src: '/img/duo-sky.webp', alt: 'Duas amigas sorriem ao sol com latas de Zona', w: 'tall' },
  { type: 'word', text: 'Amigos.' },
  { type: 'img', src: '/img/toast.webp', alt: 'Grupo de amigos brinda com latas de Zona à mesa', w: 'wide' },
  { type: 'img', src: '/img/sky-hand.webp', alt: 'Mão ergue uma lata de Yuzu e Lima contra o céu azul', w: 'wide' },
  { type: 'word', text: 'Sol.' },
  { type: 'img', src: '/img/brothers.webp', alt: 'Dois amigos de boina brindam com Zona', w: 'tall' },
  { type: 'img', src: '/img/laugh.webp', alt: 'Mulher ri num evento ao ar livre com uma Zona na mão', w: 'wide' },
  { type: 'word', text: 'Música.' },
  { type: 'img', src: '/img/cooler.webp', alt: 'Latas de Zona tiradas de uma geleira na praia', w: 'wide' },
  { type: 'img', src: '/img/garden.webp', alt: 'Almoço no quintal com Zona Maracujá', w: 'tall' },
  { type: 'word', text: 'Noite.' },
  { type: 'img', src: '/img/pour.webp', alt: 'Zona Yuzu e Lima a ser servida num copo com gelo e lima', w: 'wide' },
]

export function Lifestyle() {
  return (
    <section id="estar" className="life" aria-labelledby="life-title">
      <div className="life-track">
        <div className="life-intro">
          <h2 id="life-title">
            Estar na
            <br />
            Zona.
          </h2>
          <p>Música, amigos, verão, noite. A Zona vive onde as pessoas se encontram.</p>
        </div>
        {SCENES.map((s, i) =>
          s.type === 'img' ? (
            <figure className={`life-shot ${s.w}`} key={i}>
              <img src={s.src} alt={s.alt} loading="lazy" decoding="async" />
            </figure>
          ) : (
            <p className="life-word" key={i} aria-hidden>
              {s.text}
            </p>
          )
        )}
        <a className="life-end" href={LINKS.instagram} target="_blank" rel="noreferrer">
          <span>#EntraNaZona</span>
          <span className="life-end-cta">
            <InstagramLogo weight="bold" aria-hidden /> Segue @entranazona
          </span>
        </a>
      </div>
    </section>
  )
}

export function Find() {
  return (
    <section id="encontrar" className="find" aria-labelledby="find-title">
      <div className="find-top">
        <h2 id="find-title">Encontra a Zona.</h2>
        <p>Nas prateleiras de quem já entrou. E na tua casa, com entrega.</p>
        <div className="find-ctas">
          <a className="btn btn-lime" href={LINKS.shop} target="_blank" rel="noreferrer">
            Comprar <ArrowUpRight weight="bold" aria-hidden />
          </a>
          <a className="btn btn-ghost" href={LINKS.partner} target="_blank" rel="noreferrer">
            Ser parceiro <ArrowUpRight weight="bold" aria-hidden />
          </a>
        </div>
      </div>
      <div className="find-bottom">
        <div className="marquee" aria-label="Onde encontrar: Shoprite, Kero, Maxi, Alimenta Angola, Casa dos Frescos, Pumangol e Sonangol">
          <div className="marquee-track" aria-hidden>
            {[0, 1].map((k) =>
              RETAILERS.map((r) => (
                <span
                  key={`${k}-${r.id}`}
                  className={`retailer r-${r.id}`}
                  style={{ WebkitMaskImage: `url(/logos/${r.id}.png)`, maskImage: `url(/logos/${r.id}.png)` }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer id="rodape" className="footer">
      <div className="footer-cols">
        <p className="footer-claim">
          Uma forma diferente
          <br />
          de te divertires.
        </p>
        <nav aria-label="Rodapé" className="footer-links">
          <a href="#sabores">Sabores</a>
          <a href="#origem">Origem</a>
          <a href="#encontrar">Onde comprar</a>
          <a href={LINKS.partner} target="_blank" rel="noreferrer">
            Ser parceiro
          </a>
          <a href={LINKS.instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
        </nav>
        <div className="footer-legal">
          <p>Bebe com moderação. Venda proibida a menores de 18 anos.</p>
          <p>Zona é uma marca Genesis BevCo. Luanda, Angola.</p>
        </div>
      </div>
      <Wordmark className="footer-mark" />
    </footer>
  )
}
