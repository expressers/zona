# Zona: sistema visual do website

## Direcção

A lata é o fio condutor. Um único objecto 3D atravessa a página inteira: nasce na água (hero),
gira para a direita no manifesto, muda de sabor com uma linha de líquido que sobe pelo rótulo,
mergulha no Okavango e termina alinhada com os três sabores. Cada secção é uma "zona" com a sua cor.

## Cor (60-30-10)

| Papel | Token | Hex |
| --- | --- | --- |
| Noite (hero, rodapé) | `--night` | `#0B3024` |
| Verde marca (onde comprar) | `--brand` | `#2E7F55` |
| Água (origem) | `--water` | `#0A3A33` |
| Névoa (texto claro, fundos claros) | `--mist` | `#EDF2EA` |
| Acento | `--lime` | `#D9E24A` |

- Página: 60% verdes (noite, marca, água), 30% névoa, 10% lima (CTA, ponto do "Zona.", wordmark do rodapé).
- Capítulo de sabores: 60% cor do sabor, 30% branco (faixa da lata, linhas do ícone), 10% tinta do sabor.

| Sabor | Fundo | Tinta |
| --- | --- | --- |
| Yuzu & Lima | `#D9E24A` | `#17713E` |
| Maracujá | `#F79B3B` | `#A8173F` |
| Manga | `#F7BC3B` | `#D9481F` |

O fundo é uma camada fixa cuja cor é interpolada pelo scroll (`src/motion/choreo.js`), por isso as transições
entre zonas são contínuas.

## Tipografia

- Display: Bricolage Grotesque (variável, `wdth` 75-90, peso 700-800), tracking negativo.
- Texto: Red Hat Text (a mesma família do site actual da marca).
- Slab: Zilla Slab, só para o que ecoa a lata (nomes gigantes dos sabores e o rótulo 3D).

## Forma

- Botões em pílula; media com raio 18 px. Nada de cards.
- Ícones: Phosphor (bold).

## Movimento

- Coreografia da lata por keyframes ancorados ao scroll (interpolação determinística + suavização com massa).
- Easing UI: `cubic-bezier(0.23, 1, 0.32, 1)`; transições de cena: `cubic-bezier(0.77, 0, 0.175, 1)`.
- `prefers-reduced-motion`: sem scroll suave, sem oscilação da lata, bolhas quase paradas, marquee parado.

## Verificação

`bun scripts/shots.mjs` (com `bun run dev` a correr) gera capturas desktop e mobile em `.impeccable/review/`.
O parâmetro `?snap` desliga a suavização da lata para capturas determinísticas.
