# Magical Birthday Journey — An Immersive 3D Birthday Website

A cinematic, interactive 3D birthday celebration website built with Next.js, Three.js, React, Tailwind CSS, and the Web Audio API. The experience feels like physically traveling through an enchanted fantasy world rather than browsing a normal webpage.

---

## 🌟 The 6-Scene Continuous 3D Journey

The entire experience is driven by one continuous cinematic 3D camera spline without abrupt cuts, loading breaks, or disconnected animations:

1. **Scene One — Aerial Beach Introduction (`Progress: 0.00 – 0.15`)**
   - Bird's-eye view of a moonlit beach beside an ancient gothic stone castle and banquet hall.
   - Deep blue ocean with vertex-animated rolling waves and shore foam.
   - Sandy shoreline illuminated by moonlight, gentle night fog, and twinkling starfield.
   - Warm golden light glowing through tall arched gothic windows.
   - Elegant minimal introduction: *"A little magic awaits… Swipe up to begin the journey."*

2. **Scene Two — Approaching the Grand Entrance (`Progress: 0.15 – 0.35`)**
   - Camera descends smoothly from the sky down to human eye level on the stone pathway.
   - Pathway flanked by stone pedestals with wrought iron braziers and flickering amber flames.
   - Approaching the towering gothic stone façade with gatehouse turrets and arched portal.
   - **Automatic Door Traversal:** Massive carved dark oak double doors with iron strap hinges smoothly swing open inward, spilling warm golden interior light across the pathway.
   - Plays a heavy wooden door creak resonance as the camera physically passes between the doors into the hall.

3. **Scene Three — The Magical Great Hall (`Progress: 0.35 – 0.55`)**
   - Camera enters into the immense medieval banquet hall.
   - Grand hammerbeam timber roof trusses with curved oak braces and exposed rafters.
   - Tall gothic arched stained-glass windows along both walls and a circular rose window on the rear wall.
   - Clustered stone columns with molded capitals and torch sconces.
   - 4 large heraldic tapestry banners (*Order of the Phoenix*, *Order of the Pegasus*, *Order of the Dragon*, *Order of the Sun*).
   - 48 floating organic ivory candles with dripping wax and flickering teardrop flames gently bobbing in the air.
   - Drifting golden atmospheric dust motes creating volumetric depth.

4. **Scene Four — The Grand Birthday Feast (`Progress: 0.55 – 0.70`)**
   - Camera sweeps forward toward the near end of the massive dark oak banquet table.
   - Polished table surface with heavy carved trestle supports and longitudinal stretcher.
   - Royal crimson velvet table runner with gold bullion embroidered borders and fringe tassels.
   - Gothic high-backed dining chairs along both sides.
   - Abundant feast:
     - Golden herb-roasted poultry on silver platters with rosemary sprigs and drumstick frills.
     - Artisan crusty sourdough breads and braided challah on dark wood cutting boards.
     - Silver compote pedestal bowls overflowing with Concord grapes, Gala apples, and berries.
     - 10 place settings with silver chargers, golden bread plates, and golden goblets filled with deep red wine.
     - Baroque 3-branch brass candelabras with illuminated wax tapers.

5. **Scene Five — Cinematic Table Exploration (`Progress: 0.70 – 0.88`)**
   - Camera lowers to a human-eye tracking perspective.
   - Begins a smooth, controlled orbit along the side of the feast table.
   - Revels in the layered composition: food below, goblets, candelabras, floating candles above, and gothic stone arches in the background with rich parallax.
   - Curves gracefully around the far end of the banquet table.
   - Reversible when scrolling backward.

6. **Scene Six — The Birthday Cake Reveal (`Progress: 0.88 – 1.00`)**
   - Camera slows down and comes to a complete frontal stop facing the celebration cake.
   - **The Birthday Cake:**
     - 3-tier chocolate, rose-gold velvet, and vanilla cream cake on an ornate 24K gold fluted pedestal stand.
     - Ivory buttercream frosting, cascading gold drips, 32 piped icing rosettes, edible gold sugar pearls.
     - Fresh strawberries and blueberry clusters garnishing the middle tier.
     - Fluttering golden winged celestial star topper.
     - 5 glowing birthday candles with realistic molten wax and flickering flames.
     - Beside the cake: Antique Birthday Scroll with personalized calligraphy and 3D wax seal.
   - **"Make a Wish ✨" Interactive Trigger:**
     - Glowing celebration banner: *"Happy Birthday, [Name]! Tonight, the magic is all yours."*
     - Clicking *"Make a Wish ✨"* triggers bright flame flare, rising fairy dust sparks, celebratory confetti explosion, wish sound effects, and unveils the heartfelt friendship letter modal!
     - Interactive candle blow-out (`sound.playCandleBlow()`) with wish granted confirmation.
     - Replay button smoothly resets the journey to the aerial beach.

---

## 🎮 Controls & Interaction

| Interaction | Action |
|---|---|
| **Mouse Wheel / Trackpad** | Scroll up/down to continuously fly the camera forward or backward along the spline path |
| **Touch / Mobile Swipe** | Swipe upward on the screen to travel forward; swipe downward to travel backward |
| **Stage Scrubber Bar** | Click any stage pill (`1. Aerial Coast` to `6. The Cake`) or drag the slider |
| **Auto Tour Mode** | Click `Auto Tour` in the top header to sit back and watch the cinematic camera tour automatically |
| **Day / Night Toggle** | Switch between moonlit starry night (default) and sunny daylight |
| **Music & Sound Toggle** | Toggle the Web Audio API synthesizer with magical celesta and birthday melody |
| **Replay Journey** | Smoothly return to the aerial view to experience the journey anytime |

---

## 🛠️ Technology Stack & Dependencies

- **Framework**: Next.js 16 (App Router) with React 19
- **3D Engine**: Three.js (`three`) with procedural PBR materials, custom Canvas textures, Catmull-Rom 3D splines, and soft shadow mapping
- **Styling**: Tailwind CSS with custom glassmorphism, Cinzel, Outfit, and Playfair Display typography
- **Audio**: Web Audio API Sound Synthesizer (offline, zero external MP3 dependencies, low latency)
- **Animation & Particles**: `canvas-confetti`, Framer Motion, Three.js requestAnimationFrame loop
- **Icons**: `lucide-react`

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 3. Production Build

```bash
npm run build
npm run start
```

---

## 📄 License & Asset Rights

- Built with custom procedural geometry and procedural canvas textures.
- Original magical wizarding atmosphere without copyrighted logos, character likenesses, or franchise assets.
