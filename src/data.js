// Fonte única para sabores, cores e copy.
// Valores nutricionais: só o que aparece de forma consistente nas latas (5% e 8 g).
// Calorias e volume variam entre materiais da marca; validar antes de publicar.

export const FLAVORS = [
  {
    id: 'lima',
    name: 'Yuzu & Lima',
    labelName: 'YUZU & LIMA',
    note: 'Cítrico e brilhante.',
    line: 'Yuzu e lima com gás fino. O primeiro gole acorda tudo.',
    bg: '#D9E24A',
    ink: '#17713E',
    deep: '#0F4D2C',
    icon: 'fan',
  },
  {
    id: 'maracuja',
    name: 'Maracujá',
    labelName: 'MARACUJÁ',
    note: 'Frescura doce do maracujá.',
    line: 'Ácido na medida certa, doce no fim. Sabe a fim de tarde.',
    bg: '#F79B3B',
    ink: '#A8173F',
    deep: '#6E0F2A',
    icon: 'ribbon',
  },
  {
    id: 'manga',
    name: 'Manga',
    labelName: 'MANGA',
    note: 'Frescura doce da manga.',
    line: 'Manga madura, bem gelada. O verão inteiro numa lata.',
    bg: '#F7BC3B',
    ink: '#D9481F',
    deep: '#8A2C0F',
    icon: 'cone',
  },
]

export const COLORS = {
  night: '#0B3024',
  brand: '#2E7F55',
  water: '#0A3A33',
  mist: '#EDF2EA',
  lime: '#D9E24A',
}

export const LINKS = {
  shop: 'https://entranazona.com/produtos/',
  partner: 'https://entranazona.com/parceiros/',
  instagram: 'https://www.instagram.com/entranazona/',
}

export const RETAILERS = [
  { id: 'shoprite', name: 'Shoprite' },
  { id: 'kero', name: 'Kero' },
  { id: 'maxi', name: 'Maxi' },
  { id: 'alimenta', name: 'Alimenta Angola' },
  { id: 'frescos', name: 'Casa dos Frescos' },
  { id: 'pumangol', name: 'Pumangol' },
  { id: 'sonangol', name: 'Sonangol' },
]
