# Zona

Website da Zona, a primeira hard seltzer angolana. Um projecto Expressers.

Experiência cinematográfica de uma página: a lata em 3D atravessa o site enquanto se faz scroll,
muda de sabor com uma linha de líquido que sobe pelo rótulo, mergulha na água (Okavango) e termina
alinhada com os três sabores.

## Stack

- React 19 + Vite, gerido com Bun
- Three.js (lata modelada por torno, rótulos desenhados em canvas a partir do packaging real, bolhas e cáusticas em shader)
- GSAP ScrollTrigger + Lenis (scroll suave, pins e coreografia por keyframes)

## Desenvolvimento

```bash
bun install
bun run dev
bun run build
```

## Deploy

Render, serviço estático (`render.yaml`). Build: `bun install --frozen-lockfile && bun run build`, publica `dist/`.

## Notas de conteúdo

- Valores nutricionais mostrados: apenas 5% de álcool e 8 g de açúcar, que são consistentes em todo o material da marca.
  Calorias (120/121/130) e volume (300/330 ml) variam entre fontes e devem ser validados com a Genesis BevCo.
- Fotografias e elementos gráficos vêm dos materiais públicos da marca (entranazona.com e Packaging of the World).
