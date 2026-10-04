// Estado partilhado entre o scroll (DOM) e a cena 3D.
export const state = {
  target: {
    x: 0, // fração da meia-largura visível
    y: -1.9, // fração da meia-altura visível (a lata entra de baixo na intro)
    z: 0,
    s: 1,
    rx: 0.08,
    ry: -1.2,
    rz: -0.14,
    flavor: 0,
    water: 0.55,
    bub: 0.55,
    vis: 1,
    line: 0,
    cold: 1,
    idle: 1,
    rr: 0.85,
    rg: 0.89,
    rb: 0.29,
    rimI: 1,
  },
  pointer: { x: 0, y: 0 },
  pointerTarget: { x: 0, y: 0 },
  rise: 0,
  entered: false,
}
