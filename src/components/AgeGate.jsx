import { useEffect, useRef, useState } from 'react'
import { Wordmark } from './Sections.jsx'

const KEY = 'zona-18'

export function hasConsent() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export default function AgeGate({ ready, onEnter, entered }) {
  const [denied, setDenied] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const yesRef = useRef(null)

  useEffect(() => {
    if (ready) yesRef.current?.focus({ preventScroll: true })
  }, [ready])

  const enter = () => {
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {}
    setLeaving(true)
    onEnter()
  }

  return (
    <div className={`gate ${leaving || entered ? 'is-leaving' : ''}`} role="dialog" aria-modal="true" aria-labelledby="gate-q">
      <div className="gate-inner">
        <Wordmark className="gate-mark" />
        {denied ? (
          <p className="gate-q" id="gate-q">
            Volta quando tiveres 18.
            <br />A Zona fica à tua espera.
          </p>
        ) : (
          <>
            <p className="gate-q" id="gate-q">
              Antes de entrares na Zona:
              <br />
              tens 18 anos ou mais?
            </p>
            <div className="gate-actions">
              <button ref={yesRef} className="btn btn-lime" onClick={enter} disabled={!ready} aria-busy={!ready}>
                {ready ? 'Sim, entrar' : 'A preparar'}
              </button>
              <button className="btn btn-ghost" onClick={() => setDenied(true)}>
                Não
              </button>
            </div>
          </>
        )}
        <p className="gate-legal">Bebe com moderação. Venda proibida a menores de 18 anos.</p>
      </div>
    </div>
  )
}
