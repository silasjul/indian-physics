# Three.js Physics — Chapter 3, Lesson 20

An interactive 3D physics simulation built with [Three.js](https://threejs.org/) and [Rapier](https://rapier.rs/). Spheres spawn inside a semi-transparent cage, bounce around with realistic physics, and explode outward when clicked.

## Features

- Real-time rigid body physics via **Rapier3D** (WASM)
- Click any sphere to apply an explosive impulse force
- Hit sound effects on click
- Background music
- Performance stats overlay (FPS / MS)
- Debug GUI to tweak physics and spawn settings at runtime

## GUI Controls

| Control | Description |
|---|---|
| **Restitution** | Bounciness of the spheres (0–2) |
| **Mass** | Mass of each sphere (0–3) |
| **Friction** | Surface friction (0–1) |
| **Min Ball Size** | Minimum random scale for new spheres |
| **Spawn Rate** | How fast new spheres are created (0 = paused, 100 = burst) |
| **Click Force** | Impulse magnitude applied when clicking a sphere |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+

### Install & Run

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `three` | ^0.183.2 | 3D rendering |
| `@dimforge/rapier3d` | ^0.19.3 | WASM physics engine |
| `lil-gui` | ^0.21.0 | Debug GUI |
| `stats.js` | ^0.17.0 | Performance overlay |
| `vite` | ^7.3.1 | Dev server & bundler |
| `vite-plugin-wasm` | ^3.5.0 | WASM support for Rapier |
| `vite-plugin-top-level-await` | ^1.6.0 | Top-level await for Rapier init |
