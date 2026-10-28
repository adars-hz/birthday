"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { sound } from "../utils/audio";
import confetti from "canvas-confetti";
import { siteContent } from "../data/content";
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  Cake,
  Compass,
  Eye,
  X,
  RotateCcw,
  ChevronDown,
  Wand2,
  Heart,
  Share2,
} from "lucide-react";

// =============================================================================
// SCENE STAGE DEFINITIONS (Scenes 1 through 6)
// =============================================================================
export const JOURNEY_STAGES = [
  { id: 0, progress: 0.0, name: "Scene 1: Moonlit Coast & Castle", short: "1. Aerial Coast", desc: "Bird's-eye view of moonlit ocean and gothic party hall" },
  { id: 1, progress: 0.28, name: "Scene 2: Approaching Grand Portal", short: "2. Grand Portal", desc: "Lantern-lit stone pathway to towering carved doors" },
  { id: 2, progress: 0.44, name: "Scene 3: Entering The Great Hall", short: "3. Great Hall", desc: "Doors open inward, passing into the vaulted banquet hall" },
  { id: 3, progress: 0.65, name: "Scene 4: The Royal Feast", short: "4. Royal Feast", desc: "Massive dark oak table with abundant food and goblets" },
  { id: 4, progress: 0.82, name: "Scene 5: Cinematic Table Orbit", short: "5. Table Orbit", desc: "Cinematic tracking shot gliding along feast and floating candles" },
  { id: 5, progress: 1.0, name: "Scene 6: Birthday Cake Reveal ✨", short: "6. The Cake 🎂", desc: "Directly in front of the spectacular celebration cake" },
];

export default function ThreeSeasideHall() {
  const mountRef = useRef<HTMLDivElement>(null);

  // User state
  const [theme, setTheme] = useState<"night" | "day">("night"); // Night is default for magical moonlit aesthetic
  const [cameraProgress, setCameraProgress] = useState(0);
  const [isAutoTour, setIsAutoTour] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showCakeModal, setShowCakeModal] = useState(false);
  const [currentStageName, setCurrentStageName] = useState(JOURNEY_STAGES[0].name);
  const [recipientName, setRecipientName] = useState(siteContent.recipient.name || "My Best Friend");
  const [wishGranted, setWishGranted] = useState(false);
  const [candlesBlown, setCandlesBlown] = useState(false);

  // Animation & 3D refs
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const themeRef = useRef<"night" | "day">("night");
  const isAutoTourRef = useRef(false);
  const cakeMeshRef = useRef<THREE.Group | null>(null);
  const leftDoorRef = useRef<THREE.Group | null>(null);
  const rightDoorRef = useRef<THREE.Group | null>(null);
  const cakeCandlesRef = useRef<{ mesh: THREE.Group; light: THREE.PointLight }[]>([]);
  const portalLightRef = useRef<THREE.PointLight | null>(null);
  const hasPlayedDoorSoundRef = useRef(false);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    isAutoTourRef.current = isAutoTour;
  }, [isAutoTour]);

  // Main Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060914, 0.0055);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1200);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // =========================================================================
    // HIGH-RES PROCEDURAL TEXTURE GENERATORS
    // =========================================================================

    // A. Flagstone Castle Floor
    function createCastleStoneFloorTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#1e2025";
      ctx.fillRect(0, 0, 1024, 1024);

      const rows = 12;
      const cols = 8;
      const rh = 1024 / rows;
      const cw = 1024 / cols;

      for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * (cw / 2);
        for (let c = -1; c < cols + 1; c++) {
          const x = c * cw + offset;
          const y = r * rh;

          const stoneColors = ["#393b42", "#323338", "#44464f", "#3e3c39", "#2d2d31", "#413d39"];
          ctx.fillStyle = stoneColors[Math.floor(Math.random() * stoneColors.length)];
          ctx.fillRect(x + 3, y + 3, cw - 6, rh - 6);

          for (let p = 0; p < 30; p++) {
            ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.25)";
            ctx.fillRect(x + Math.random() * cw, y + Math.random() * rh, Math.random() * 4 + 1, Math.random() * 4 + 1);
          }
          ctx.strokeStyle = "rgba(255,255,255,0.12)";
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 4, y + 4, cw - 8, rh - 8);
        }
      }

      ctx.strokeStyle = "#111215";
      ctx.lineWidth = 5;
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * rh);
        ctx.lineTo(1024, r * rh);
        ctx.stroke();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 7);
      return tex;
    }

    // B. Ancient Gothic Stone Masonry for Walls & Pillars
    function createGothicStoneTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#3f4046";
      ctx.fillRect(0, 0, 1024, 1024);

      // Ashlar block courses
      const blockH = 64;
      const blockW = 128;
      for (let y = 0; y < 1024; y += blockH) {
        const row = y / blockH;
        const offsetX = (row % 2) * (blockW / 2);
        for (let x = -blockW; x < 1024 + blockW; x += blockW) {
          ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.12)";
          ctx.fillRect(x + offsetX + 2, y + 2, blockW - 4, blockH - 4);

          for (let s = 0; s < 18; s++) {
            ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.08)" : "rgba(10,10,15,0.2)";
            ctx.fillRect(x + offsetX + Math.random() * blockW, y + Math.random() * blockH, Math.random() * 6 + 1, Math.random() * 3 + 1);
          }

          ctx.strokeStyle = "rgba(0,0,0,0.35)";
          ctx.lineWidth = 2;
          ctx.strokeRect(x + offsetX + 1, y + 1, blockW - 2, blockH - 2);
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
      return tex;
    }

    // C. Carved Dark Oak Wood Texture for Doors & Furniture
    function createCarvedWoodTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#22140c";
      ctx.fillRect(0, 0, 1024, 1024);

      for (let i = 0; i < 900; i++) {
        const y = Math.random() * 1024;
        ctx.strokeStyle = Math.random() > 0.5 ? "rgba(12, 6, 3, 0.5)" : "rgba(58, 32, 16, 0.4)";
        ctx.lineWidth = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(340, y + Math.random() * 20 - 10, 680, y + Math.random() * 20 - 10, 1024, y);
        ctx.stroke();
      }

      // Vertical plank seams
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.lineWidth = 6;
      for (let x = 256; x < 1024; x += 256) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1024);
        ctx.stroke();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }

    // D. Glowing Gothic Stained-Glass Window Texture
    function createStainedGlassTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;

      // Deep celestial night gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 1024);
      grad.addColorStop(0, "#1e1b4b");
      grad.addColorStop(0.3, "#1e3a8a");
      grad.addColorStop(0.7, "#d97706");
      grad.addColorStop(1, "#f59e0b");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 1024);

      // Gothic arch leaded tracery
      ctx.strokeStyle = "#18181b";
      ctx.lineWidth = 8;
      // Border
      ctx.strokeRect(10, 10, 492, 1004);

      // Diamond quarry panes
      const step = 48;
      ctx.lineWidth = 3;
      for (let y = -512; y < 1536; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y + 512);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(512, y);
        ctx.lineTo(0, y + 512);
        ctx.stroke();
      }

      // Central golden star rosette
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.arc(256, 320, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#09090b";
      ctx.lineWidth = 6;
      ctx.stroke();

      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    }

    // E. 24K Gold Foil Sheen Texture
    function createGoldFoilTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;

      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, "#ffd700");
      grad.addColorStop(0.35, "#f59e0b");
      grad.addColorStop(0.65, "#fef08a");
      grad.addColorStop(1, "#d97706");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 350; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(255, 255, 255, 0.45)" : "rgba(170, 100, 10, 0.35)";
        ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 3 + 1, Math.random() * 3 + 1);
      }

      return new THREE.CanvasTexture(canvas);
    }

    // F. Royal Embroidered Velvet Runner
    function createVelvetRunnerTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#5b0610"; // Rich royal crimson velvet
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 1800; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(130, 15, 25, 0.35)" : "rgba(30, 0, 5, 0.4)";
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
      }

      // 24K Gold Bullion Embroidered Filigree Borders
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 12;
      ctx.strokeRect(12, 12, 488, 488);
      ctx.lineWidth = 2.5;
      ctx.strokeRect(28, 28, 456, 456);

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 8);
      return tex;
    }

    // G. Buttercream Frosting Texture
    function createCakeFrostingTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#fffef9";
      ctx.fillRect(0, 0, 1024, 1024);

      for (let i = 0; i < 160; i++) {
        ctx.strokeStyle = Math.random() > 0.5 ? "rgba(240, 230, 210, 0.2)" : "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = Math.random() * 22 + 8;
        ctx.beginPath();
        const y = Math.random() * 1024;
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(340, y + Math.random() * 30 - 15, 680, y + Math.random() * 30 - 15, 1024, y);
        ctx.stroke();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }

    // H. Cascading Gold Drip
    function createGoldDripTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;

      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, "#ffe066");
      grad.addColorStop(0.5, "#f59e0b");
      grad.addColorStop(1, "#b45309");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      return new THREE.CanvasTexture(canvas);
    }

    // I. Ancient Birthday Scroll Parchment with Calligraphy
    function createScrollParchmentTexture(name: string) {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#f7ede0";
      ctx.fillRect(0, 0, 1024, 1024);

      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = "rgba(150, 110, 50, 0.05)";
        ctx.fillRect(Math.random() * 1024, Math.random() * 1024, Math.random() * 60 + 10, Math.random() * 60 + 10);
      }

      // Burnt deckled edges vignette
      const grad = ctx.createRadialGradient(512, 512, 340, 512, 512, 512);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(100,60,20,0.45)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1024);

      // Gold Filigree Border
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 944, 944);

      // Seal circle
      ctx.fillStyle = "#7c0d16";
      ctx.beginPath();
      ctx.arc(512, 200, 85, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 56px 'Cinzel', serif";
      ctx.textAlign = "center";
      ctx.fillText("★", 512, 218);

      // Calligraphy Text
      ctx.fillStyle = "#1e1b4b";
      ctx.font = "bold 32px 'Cinzel', serif";
      ctx.fillText("ENCHANTED BIRTHDAY PROCLAMATION", 512, 350);

      ctx.font = "italic 24px serif";
      ctx.fillStyle = "#3c2a1a";
      ctx.fillText("To Our Most Cherished Friend & Fellow Adventurer", 512, 400);

      ctx.font = "bold 44px 'Cinzel', serif";
      ctx.fillStyle = "#7c0d16";
      ctx.fillText(name, 512, 480);

      ctx.font = "21px serif";
      ctx.fillStyle = "#2c1c0f";
      ctx.fillText("Tonight, the grand seaside hall has been enchanted in your honor.", 512, 560);
      ctx.fillText("May your journey ahead be blessed with boundless health, wonder, and triumph.", 512, 600);
      ctx.fillText("The candles burn bright, and every wish you make tonight will take flight.", 512, 640);

      for (let y = 720; y < 860; y += 38) {
        ctx.fillStyle = "rgba(60, 40, 20, 0.35)";
        ctx.fillRect(160, y, 704, 1.5);
      }

      ctx.font = "italic 24px serif";
      ctx.fillStyle = "#7c0d16";
      ctx.fillText("~ With Everlasting Love & Warmest Wishes ~", 512, 920);

      return new THREE.CanvasTexture(canvas);
    }

    // J. Magical Heraldic Tapestry Banners (Phoenix, Pegasus, Dragon, Celestial Sun)
    function createHeraldicBannerTexture(type: "phoenix" | "pegasus" | "dragon" | "sun") {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;

      let bg = "#6b0512"; // Phoenix Crimson
      let gold = "#ffd700";
      let title = "ORDER OF THE PHOENIX";
      let motto = "RESCRESCIT E CINERIBUS";
      let symbol = "✦";

      if (type === "pegasus") {
        bg = "#0f2557"; // Royal Sapphire
        title = "ORDER OF THE PEGASUS";
        motto = "AD ASTRA PER ASPERA";
        symbol = "✧";
      } else if (type === "dragon") {
        bg = "#0d3b25"; // Emerald
        title = "ORDER OF THE DRAGON";
        motto = "FORTITUDO ET HONOS";
        symbol = "❖";
      } else if (type === "sun") {
        bg = "#b45309"; // Warm Amber Gold
        title = "ORDER OF THE SUN";
        motto = "LUX ET AMICITIA";
        symbol = "☼";
      }

      // Swallowtail banner cut
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(512, 0);
      ctx.lineTo(512, 880);
      ctx.lineTo(256, 1020);
      ctx.lineTo(0, 880);
      ctx.closePath();
      ctx.fill();

      // Gold filigree border
      ctx.strokeStyle = gold;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(10, 10);
      ctx.lineTo(502, 10);
      ctx.lineTo(502, 870);
      ctx.lineTo(256, 1005);
      ctx.lineTo(10, 870);
      ctx.closePath();
      ctx.stroke();

      // Central Shield Crest
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.arc(256, 400, 140, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = gold;
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.fillStyle = gold;
      ctx.font = "bold 96px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(symbol, 256, 395);

      ctx.font = "bold 26px 'Cinzel', serif";
      ctx.fillText(title, 256, 580);

      ctx.font = "italic 20px serif";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillText(`~ ${motto} ~`, 256, 625);

      return new THREE.CanvasTexture(canvas);
    }

    // Material Instances
    const floorTex = createCastleStoneFloorTexture();
    const stoneTex = createGothicStoneTexture();
    const woodTex = createCarvedWoodTexture();
    const stainedGlassTex = createStainedGlassTexture();
    const goldTex = createGoldFoilTexture();
    const velvetTex = createVelvetRunnerTexture();
    const frostingTex = createCakeFrostingTexture();
    const goldDripTex = createGoldDripTexture();
    const parchmentTex = createScrollParchmentTexture(recipientName);

    const stoneMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.85, metalness: 0.05 });
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.72, metalness: 0.08 });
    const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.5, metalness: 0.08 });
    const goldMat = new THREE.MeshStandardMaterial({ map: goldTex, color: 0xffd700, roughness: 0.18, metalness: 0.94 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.15, metalness: 0.92 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.65, metalness: 0.82 });
    const velvetMat = new THREE.MeshStandardMaterial({ map: velvetTex, roughness: 0.92 });
    const cakeFrostingMat = new THREE.MeshStandardMaterial({ map: frostingTex, roughness: 0.35, metalness: 0.02 });
    const cakeDripMat = new THREE.MeshStandardMaterial({ map: goldDripTex, color: 0xffe066, roughness: 0.2, metalness: 0.85 });
    const candleWaxMat = new THREE.MeshStandardMaterial({ color: 0xfffdf6, roughness: 0.28 });
    const rubyWineMat = new THREE.MeshStandardMaterial({ color: 0x660012, roughness: 0.08, transparent: true, opacity: 0.88 });
    const roastMat = new THREE.MeshStandardMaterial({ color: 0xa13e15, roughness: 0.42, metalness: 0.1 });
    const leafGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, side: THREE.DoubleSide });
    const berryRedMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25 });
    const grapeBlueMat = new THREE.MeshStandardMaterial({ color: 0x241d4f, roughness: 0.35 });

    // Stained glass emissive material
    const stainedGlassMat = new THREE.MeshStandardMaterial({
      map: stainedGlassTex,
      roughness: 0.3,
      metalness: 0.1,
      emissive: 0xd97706,
      emissiveIntensity: 0.65,
    });

    // =========================================================================
    // 2. CELESTIAL ENVIRONMENT & LIGHTING
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x1e293b, 0.45);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x93c5fd, 1.35);
    moonLight.position.set(-50, 75, 45);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.bias = -0.0002;
    scene.add(moonLight);

    const sunLight = new THREE.DirectionalLight(0xfff7e6, 2.5);
    sunLight.position.set(45, 80, 40);
    sunLight.castShadow = true;
    sunLight.visible = false;
    scene.add(sunLight);

    // Warm Interior Portal Light spilling through the entrance
    const portalLight = new THREE.PointLight(0xf59e0b, 2.4, 28);
    portalLight.position.set(0, 4.5, 20);
    scene.add(portalLight);
    portalLightRef.current = portalLight;

    // Sky Dome
    const skyGeo = new THREE.SphereGeometry(600, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({ color: 0x050814, side: THREE.BackSide });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    // Starfield
    const starCount = 850;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 900;
      starPos[i + 1] = Math.random() * 260 + 20;
      starPos[i + 2] = (Math.random() - 0.5) * 900;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.4, transparent: true, opacity: 0.95 });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Luminous Crescent Moon
    const moonGroup = new THREE.Group();
    const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(9, 24, 24), new THREE.MeshBasicMaterial({ color: 0xfef9c3 }));
    moonGroup.add(moonMesh);
    moonGroup.position.set(-180, 210, -180);
    scene.add(moonGroup);

    // Dynamic Ocean Plane with vertex wave displacement
    const oceanGeo = new THREE.PlaneGeometry(900, 900, 100, 100);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x07284d,
      roughness: 0.14,
      metalness: 0.45,
      flatShading: true,
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.position.y = -0.6;
    scene.add(oceanMesh);

    // Moonlit Sandy Beach
    const sandGeo = new THREE.PlaneGeometry(240, 240, 32, 32);
    sandGeo.rotateX(-Math.PI / 2);
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xcaa97e, roughness: 0.95 });
    const sandMesh = new THREE.Mesh(sandGeo, sandMat);
    sandMesh.position.set(0, -0.38, 55);
    sandMesh.receiveShadow = true;
    scene.add(sandMesh);

    // =========================================================================
    // 3. STONE PATHWAY & BRAZIERS LEADING FROM BEACH TO ENTRANCE (Scene 1 & 2)
    // =========================================================================
    const pathwayGroup = new THREE.Group();
    scene.add(pathwayGroup);

    // Elevated flagstone path from z = 72 down to entrance at z = 22
    const pathGeo = new THREE.BoxGeometry(6.2, 0.4, 52);
    const pathMesh = new THREE.Mesh(pathGeo, floorMat);
    pathMesh.position.set(0, -0.15, 47);
    pathMesh.receiveShadow = true;
    pathwayGroup.add(pathMesh);

    // Stone Pedestals with Wrought Iron Braziers flanking the path
    const brazierPositions = [
      [-4.0, 64], [4.0, 64],
      [-4.0, 50], [4.0, 50],
      [-4.0, 38], [4.0, 38],
      [-4.0, 28], [4.0, 28],
    ];

    brazierPositions.forEach(([bx, bz]) => {
      // Stone pedestal
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.8, 12), stoneMat);
      ped.position.set(bx, 0.85, bz);
      ped.castShadow = true;
      pathwayGroup.add(ped);

      // Iron brazier bowl
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.25, 0.45, 12), ironMat);
      bowl.position.set(bx, 1.95, bz);
      pathwayGroup.add(bowl);

      // Realistic flame
      const flame = createRealisticFlameMesh();
      flame.scale.set(1.4, 1.7, 1.4);
      flame.position.set(bx, 2.3, bz);
      pathwayGroup.add(flame);

      const bLight = new THREE.PointLight(0xf59e0b, 1.2, 12);
      bLight.position.set(bx, 2.4, bz);
      pathwayGroup.add(bLight);
    });

    // =========================================================================
    // 4. GOTHIC FRONT FAÇADE WALL & AUTOMATIC OPENING DOUBLE DOORS (Scene 2)
    // =========================================================================
    const facadeGroup = new THREE.Group();
    scene.add(facadeGroup);

    // Central Entrance Archway Portal is at z = 22. Wall spans from X = -18 to 18, Y = 0 to 22
    // Left Wall Section (X = -18 to -3)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(15, 22, 1.8), stoneMat);
    leftWall.position.set(-10.5, 11, 22);
    leftWall.castShadow = true;
    facadeGroup.add(leftWall);

    // Right Wall Section (X = 3 to 18)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(15, 22, 1.8), stoneMat);
    rightWall.position.set(10.5, 11, 22);
    rightWall.castShadow = true;
    facadeGroup.add(rightWall);

    // Top Lintel Wall above the Archway (X = -3 to 3, Y = 9 to 22)
    const topLintel = new THREE.Mesh(new THREE.BoxGeometry(6.4, 13, 1.8), stoneMat);
    topLintel.position.set(0, 15.5, 22);
    topLintel.castShadow = true;
    facadeGroup.add(topLintel);

    // Gothic Pointed Arch Portal Molding
    const portalArch = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.2, 2.2), stoneMat);
    portalArch.position.set(0, 9.2, 22.1);
    facadeGroup.add(portalArch);

    // Two Flanking Gatehouse Turrets with Battlements at X = -14 and X = 14
    [-14, 14].forEach((tx) => {
      const turret = new THREE.Mesh(new THREE.BoxGeometry(4.5, 25, 4.5), stoneMat);
      turret.position.set(tx, 12.5, 22);
      turret.castShadow = true;
      facadeGroup.add(turret);

      // Crenellated battlements on top
      const crenel = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.2, 5.0), stoneMat);
      crenel.position.set(tx, 25.4, 22);
      facadeGroup.add(crenel);
    });

    // Tall Gothic Stained Glass Windows on the Exterior Façade glowing with warm light!
    [-8.5, 8.5].forEach((wx) => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 9.2), stainedGlassMat);
      win.position.set(wx, 11, 22.95);
      facadeGroup.add(win);

      // Point light giving real exterior glow from windows
      const wLight = new THREE.PointLight(0xf59e0b, 1.4, 14);
      wLight.position.set(wx, 11, 24);
      facadeGroup.add(wLight);
    });

    // --- MASSIVE CARVED DARK OAK DOUBLE DOORS WITH HINGES ---
    // Left Door Group: hinged at X = -2.9, Z = 22.0
    const leftDoorGroup = new THREE.Group();
    leftDoorGroup.position.set(-2.95, 0, 22.0);
    facadeGroup.add(leftDoorGroup);
    leftDoorRef.current = leftDoorGroup;

    const doorLeafGeo = new THREE.BoxGeometry(2.9, 8.8, 0.35);
    const leftDoorMesh = new THREE.Mesh(doorLeafGeo, woodMat);
    leftDoorMesh.position.set(1.45, 4.4, 0);
    leftDoorMesh.castShadow = true;
    leftDoorGroup.add(leftDoorMesh);

    // Iron strap hinges on left door
    [1.5, 4.4, 7.3].forEach((hy) => {
      const hinge = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.22, 0.42), ironMat);
      hinge.position.set(1.1, hy, 0);
      leftDoorGroup.add(hinge);
    });

    // Right Door Group: hinged at X = 2.9, Z = 22.0
    const rightDoorGroup = new THREE.Group();
    rightDoorGroup.position.set(2.95, 0, 22.0);
    facadeGroup.add(rightDoorGroup);
    rightDoorRef.current = rightDoorGroup;

    const rightDoorMesh = new THREE.Mesh(doorLeafGeo, woodMat);
    rightDoorMesh.position.set(-1.45, 4.4, 0);
    rightDoorMesh.castShadow = true;
    rightDoorGroup.add(rightDoorMesh);

    [1.5, 4.4, 7.3].forEach((hy) => {
      const hinge = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.22, 0.42), ironMat);
      hinge.position.set(-1.1, hy, 0);
      rightDoorGroup.add(hinge);
    });

    // Bronze ring door knockers
    const knockerGeo = new THREE.TorusGeometry(0.18, 0.04, 8, 16);
    const leftKnocker = new THREE.Mesh(knockerGeo, goldMat);
    leftKnocker.position.set(2.4, 4.2, 0.22);
    leftDoorGroup.add(leftKnocker);

    const rightKnocker = new THREE.Mesh(knockerGeo, goldMat);
    rightKnocker.position.set(-2.4, 4.2, 0.22);
    rightDoorGroup.add(rightKnocker);

    // =========================================================================
    // 5. GREAT HALL INTERIOR ARCHITECTURE (Scenes 3 & 4)
    // =========================================================================
    const hallGroup = new THREE.Group();
    scene.add(hallGroup);

    // Castle Flagstone Floor spanning from z = 22 inside down to z = -36
    const hallFloor = new THREE.Mesh(new THREE.BoxGeometry(32, 1.0, 58), floorMat);
    hallFloor.position.set(0, -0.45, -7);
    hallFloor.receiveShadow = true;
    hallGroup.add(hallFloor);

    // Left Interior Stone Wall with Gothic Windows (X = -16, Z = 22 to -36)
    const leftIntWall = new THREE.Mesh(new THREE.BoxGeometry(1.8, 22, 58), stoneMat);
    leftIntWall.position.set(-16, 11, -7);
    leftIntWall.castShadow = true;
    hallGroup.add(leftIntWall);

    // Right Interior Stone Wall with Gothic Windows (X = 16, Z = 22 to -36)
    const rightIntWall = new THREE.Mesh(new THREE.BoxGeometry(1.8, 22, 58), stoneMat);
    rightIntWall.position.set(16, 11, -7);
    rightIntWall.castShadow = true;
    hallGroup.add(rightIntWall);

    // Rear Castle Wall at Z = -36 with Grand Circular Rose Window
    const rearWall = new THREE.Mesh(new THREE.BoxGeometry(32, 22, 1.8), stoneMat);
    rearWall.position.set(0, 11, -36);
    rearWall.castShadow = true;
    hallGroup.add(rearWall);

    // Grand Rose Window in Rear Wall
    const roseGeo = new THREE.CircleGeometry(5.2, 32);
    const roseMesh = new THREE.Mesh(roseGeo, stainedGlassMat);
    roseMesh.position.set(0, 13, -35.05);
    hallGroup.add(roseMesh);

    // Grand Stone Fireplace at base of rear wall
    const fireplace = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 2.2), stoneMat);
    fireplace.position.set(0, 2.5, -35);
    hallGroup.add(fireplace);

    const hearthFlame = createRealisticFlameMesh();
    hearthFlame.scale.set(2.2, 2.5, 2.2);
    hearthFlame.position.set(0, 1.2, -34.0);
    hallGroup.add(hearthFlame);

    const hearthLight = new THREE.PointLight(0xf59e0b, 1.8, 16);
    hearthLight.position.set(0, 1.5, -33.5);
    hallGroup.add(hearthLight);

    // Interior Gothic Windows along the left and right walls
    [-24, -14, -4, 6, 16].forEach((wz) => {
      // Left window
      const winL = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 8.8), stainedGlassMat);
      winL.position.set(-15.05, 11.5, wz);
      winL.rotation.y = Math.PI / 2;
      hallGroup.add(winL);

      // Right window
      const winR = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 8.8), stainedGlassMat);
      winR.position.set(15.05, 11.5, wz);
      winR.rotation.y = -Math.PI / 2;
      hallGroup.add(winR);
    });

    // Grand Hammerbeam Timber Roof Trusses
    const trussZs = [18, 8, -2, -12, -22, -32];
    trussZs.forEach((tz) => {
      // Cross tie-beam
      const tieBeam = new THREE.Mesh(new THREE.BoxGeometry(31, 1.2, 1.4), woodMat);
      tieBeam.position.set(0, 16.5, tz);
      tieBeam.castShadow = true;
      hallGroup.add(tieBeam);

      // Left rafter
      const rafterL = new THREE.Mesh(new THREE.BoxGeometry(16, 0.9, 0.9), woodMat);
      rafterL.position.set(-7.5, 20.2, tz);
      rafterL.rotation.z = Math.PI / 6;
      hallGroup.add(rafterL);

      // Right rafter
      const rafterR = new THREE.Mesh(new THREE.BoxGeometry(16, 0.9, 0.9), woodMat);
      rafterR.position.set(7.5, 20.2, tz);
      rafterR.rotation.z = -Math.PI / 6;
      hallGroup.add(rafterR);

      // Kingpost keystone
      const kingpost = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.2, 1.4), woodMat);
      kingpost.position.set(0, 21.8, tz);
      hallGroup.add(kingpost);
    });

    // 10 Clustered Gothic Stone Columns with molded capitals & torch sconces
    const columnPositions = [
      [-13, 16], [13, 16],
      [-13, 6], [13, 6],
      [-13, -4], [13, -4],
      [-13, -14], [13, -14],
      [-13, -24], [13, -24],
    ];

    columnPositions.forEach(([cx, cz]) => {
      // Central pier
      const pier = new THREE.Mesh(new THREE.BoxGeometry(1.6, 16, 1.6), stoneMat);
      pier.position.set(cx, 8, cz);
      pier.castShadow = true;
      hallGroup.add(pier);

      // Capital & plinth
      const cap = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.8, 2.3), stoneMat);
      cap.position.set(cx, 16, cz);
      hallGroup.add(cap);

      const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 2.4), stoneMat);
      base.position.set(cx, 0.4, cz);
      hallGroup.add(base);

      // Iron wall sconce with torch
      const sconce = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.08, 0.45, 8), ironMat);
      sconce.position.set(cx > 0 ? cx - 0.95 : cx + 0.95, 7.8, cz);
      hallGroup.add(sconce);

      const torchFlame = createRealisticFlameMesh();
      torchFlame.scale.set(1.1, 1.3, 1.1);
      torchFlame.position.set(cx > 0 ? cx - 0.95 : cx + 0.95, 8.15, cz);
      hallGroup.add(torchFlame);

      const torchLight = new THREE.PointLight(0xf59e0b, 1.0, 9);
      torchLight.position.set(cx > 0 ? cx - 0.95 : cx + 0.95, 8.2, cz);
      hallGroup.add(torchLight);
    });

    // Hanging Heraldic Tapestry Banners (Phoenix, Pegasus, Dragon, Sun)
    const bannerTypes: Array<"phoenix" | "pegasus" | "dragon" | "sun"> = ["phoenix", "pegasus", "dragon", "sun"];
    const bannerZs = [-19, -9, 1, 11];

    bannerZs.forEach((bz, idx) => {
      const bTex = createHeraldicBannerTexture(bannerTypes[idx % bannerTypes.length]);
      const bMat = new THREE.MeshStandardMaterial({ map: bTex, roughness: 0.8, side: THREE.DoubleSide });

      // Left banner
      const bannerL = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 7.8), bMat);
      bannerL.position.set(-12.1, 10.5, bz);
      bannerL.rotation.y = Math.PI / 2;
      hallGroup.add(bannerL);

      // Right banner
      const bannerR = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 7.8), bMat);
      bannerR.position.set(12.1, 10.5, bz);
      bannerR.rotation.y = -Math.PI / 2;
      hallGroup.add(bannerR);
    });

    // =========================================================================
    // 6. FLOATING CANDLES (48 LEVITATING ENCHANTED CANDLES)
    // =========================================================================
    const floatingCandlesGroup = new THREE.Group();
    scene.add(floatingCandlesGroup);
    const floatingCandles: {
      mesh: THREE.Group;
      light: THREE.PointLight;
      baseY: number;
      speed: number;
      offset: number;
      swayX: number;
      swayZ: number;
    }[] = [];

    for (let i = 0; i < 48; i++) {
      const cGroup = new THREE.Group();

      // Organic ivory wax cylinder
      const cBody = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.6, 14), candleWaxMat);
      cGroup.add(cBody);

      // Melted rim
      const cRim = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.025, 8, 14), candleWaxMat);
      cRim.rotation.x = Math.PI / 2;
      cRim.position.y = 0.8;
      cGroup.add(cRim);

      // Wick
      const cWick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), ironMat);
      cWick.position.y = 0.85;
      cGroup.add(cWick);

      // Teardrop flame
      const cFlame = createRealisticFlameMesh();
      cFlame.scale.set(0.85, 1.0, 0.85);
      cFlame.position.y = 0.98;
      cGroup.add(cFlame);

      // Warm point light
      const cLight = new THREE.PointLight(0xf59e0b, 0.85, 9);
      cLight.position.y = 1.02;
      cGroup.add(cLight);

      const x = (Math.random() - 0.5) * 11;
      const z = (Math.random() - 0.5) * 38 - 6;
      const baseY = Math.random() * 5.2 + 6.8;

      cGroup.position.set(x, baseY, z);
      floatingCandlesGroup.add(cGroup);

      floatingCandles.push({
        mesh: cGroup,
        light: cLight,
        baseY,
        speed: Math.random() * 1.5 + 1.0,
        offset: Math.random() * Math.PI * 2,
        swayX: (Math.random() - 0.5) * 0.04,
        swayZ: (Math.random() - 0.5) * 0.04,
      });
    }

    // Floating Golden Dust Motes / Atmospheric Sparkles
    const dustCount = 260;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 26;
      dustPos[i + 1] = Math.random() * 14 + 1;
      dustPos[i + 2] = (Math.random() - 0.5) * 44 - 6;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.38,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    hallGroup.add(dustPoints);

    // =========================================================================
    // 7. THE GRAND BIRTHDAY FEAST BANQUET TABLE (Scenes 4 & 5)
    // =========================================================================
    const tableGroup = new THREE.Group();
    hallGroup.add(tableGroup);

    // Long dark oak tabletop (Z = 5 to -19, Length = 24, Width = 4.8)
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.45, 24), woodMat);
    tableTop.position.set(0, 2.45, -7);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    // 4 Heavy carved trestle leg pairs
    [-17, -10, -4, 3].forEach((tz) => {
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.2, 1.2), woodMat);
      legL.position.set(-1.8, 1.1, tz);
      legL.castShadow = true;
      tableGroup.add(legL);

      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.2, 1.2), woodMat);
      legR.position.set(1.8, 1.1, tz);
      legR.castShadow = true;
      tableGroup.add(legR);

      const cross = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.35, 0.5), woodMat);
      cross.position.set(0, 0.75, tz);
      tableGroup.add(cross);
    });

    // Longitudinal stretcher
    const stretcher = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 21), woodMat);
    stretcher.position.set(0, 0.75, -7);
    tableGroup.add(stretcher);

    // Royal Crimson Velvet Table Runner with gold fringe
    const runner = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 24.2), velvetMat);
    runner.position.set(0, 2.7, -7);
    tableGroup.add(runner);

    // Hanging gold fringe tassels at ends
    [5.1, -19.1].forEach((ez) => {
      const fringe = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.5, 0.05), goldMat);
      fringe.position.set(0, 2.42, ez);
      tableGroup.add(fringe);
    });

    // Gothic high-backed dining chairs along the sides
    for (let z = -17; z <= 3; z += 3.6) {
      const chairL = createRealisticGothicChair(woodMat, velvetMat, goldMat);
      chairL.position.set(-3.6, 0.4, z);
      chairL.rotation.y = Math.PI / 2;
      tableGroup.add(chairL);

      const chairR = createRealisticGothicChair(woodMat, velvetMat, goldMat);
      chairR.position.set(3.6, 0.4, z);
      chairR.rotation.y = -Math.PI / 2;
      tableGroup.add(chairR);
    }

    // Place Settings (Plates, Cutlery, Goblets with Red Wine)
    for (let z = -16.5; z <= 2.5; z += 3.8) {
      createPlaceSetting(tableGroup, -1.8, 2.71, z, goldMat, silverMat, rubyWineMat);
      createPlaceSetting(tableGroup, 1.8, 2.71, z, goldMat, silverMat, rubyWineMat);
    }

    // Centerpiece Platters (Golden Roast Poultry, Breadboard, Fruit Compotes)
    createRoastPoultryPlatter(tableGroup, 0, 2.71, 0.5, silverMat, roastMat, leafGreenMat);
    createArtisanBreadBoard(tableGroup, 0, 2.71, -4.2, woodMat, goldMat);
    createFruitCornucopiaPlatter(tableGroup, 0, 2.71, -8.5, silverMat, berryRedMat, grapeBlueMat, leafGreenMat);
    createFruitCornucopiaPlatter(tableGroup, 0, 2.71, -13.0, silverMat, berryRedMat, grapeBlueMat, leafGreenMat);

    // 3 Baroque 3-Branch Brass Candelabras
    [-2.0, -6.5, -11.0].forEach((cz) => {
      createBaroqueCandelabra(tableGroup, 0, 2.71, cz, goldMat, candleWaxMat);
    });

    // =========================================================================
    // 8. SPECTACULAR 3-TIER BIRTHDAY CAKE & ACCEPTANCE SCROLL (Scene 6)
    // =========================================================================
    const cakeGroup = new THREE.Group();
    // Positioned at the far head of the banquet table
    cakeGroup.position.set(0, 2.71, -17.8);
    tableGroup.add(cakeGroup);
    cakeMeshRef.current = cakeGroup;

    // Dedicated Cake Spotlight for cinematic focus
    const cakeSpot = new THREE.SpotLight(0xfff3d1, 3.2, 14, Math.PI / 4, 0.4, 1.2);
    cakeSpot.position.set(0, 8.5, -16.0);
    cakeSpot.target = cakeGroup;
    cakeSpot.castShadow = true;
    hallGroup.add(cakeSpot);

    // Fluted 24K Gold Pedestal Stand
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.3, 0.22, 36), goldMat);
    standBase.position.y = 0.11;
    cakeGroup.add(standBase);

    const standStem = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.0, 0.55, 24), goldMat);
    standStem.position.y = 0.45;
    cakeGroup.add(standStem);

    const standPlate = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.35, 0.12, 40), goldMat);
    standPlate.position.y = 0.74;
    cakeGroup.add(standPlate);

    const standRim = new THREE.Mesh(new THREE.TorusGeometry(2.36, 0.05, 10, 40), goldMat);
    standRim.rotation.x = Math.PI / 2;
    standRim.position.y = 0.74;
    cakeGroup.add(standRim);

    // Tier 1: Dark Chocolate & Ivory Buttercream with Cascading Gold Drips
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 1.15, 48), cakeFrostingMat);
    tier1.position.y = 1.38;
    tier1.castShadow = true;
    tier1.receiveShadow = true;
    cakeGroup.add(tier1);

    // Piped rosettes around Tier 1 base
    for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / 32) {
      const rosette = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), cakeFrostingMat);
      rosette.position.set(Math.cos(a) * 1.92, 0.88, Math.sin(a) * 1.92);
      cakeGroup.add(rosette);
    }

    // Gold drip rim and droplets
    const goldRim1 = new THREE.Mesh(new THREE.TorusGeometry(1.91, 0.07, 10, 48), cakeDripMat);
    goldRim1.rotation.x = Math.PI / 2;
    goldRim1.position.y = 1.94;
    cakeGroup.add(goldRim1);

    for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / 20) {
      const len = 0.2 + Math.abs(Math.sin(a * 4)) * 0.45;
      const dripCone = new THREE.Mesh(new THREE.ConeGeometry(0.055, len, 8), cakeDripMat);
      dripCone.position.set(Math.cos(a) * 1.92, 1.94 - len / 2, Math.sin(a) * 1.92);
      cakeGroup.add(dripCone);
    }

    // Tier 2: Rose-Gold Velvet Frosting with Fresh Berries
    const tier2Mat = new THREE.MeshStandardMaterial({
      map: frostingTex,
      color: 0xffe4e8,
      roughness: 0.35,
    });
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.95, 44), tier2Mat);
    tier2.position.y = 2.42;
    tier2.castShadow = true;
    cakeGroup.add(tier2);

    // Fresh Summer Strawberries & Blueberries on Tier 1 Ledge
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI * 2) / 10 + 0.15;
      const bx = Math.cos(a) * 1.62;
      const bz = Math.sin(a) * 1.62;

      if (i % 2 === 0) {
        const straw = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.2, 8), berryRedMat);
        straw.position.set(bx, 2.05, bz);
        straw.rotation.z = (Math.random() - 0.5) * 0.3;
        cakeGroup.add(straw);
      } else {
        const blueb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), grapeBlueMat);
        blueb.position.set(bx, 2.02, bz);
        cakeGroup.add(blueb);
      }
    }

    // Tier 3: Delicate Vanilla Cream Tier
    const tier3 = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.8, 36), cakeFrostingMat);
    tier3.position.y = 3.28;
    tier3.castShadow = true;
    cakeGroup.add(tier3);

    // Enchanted Celestial Winged Star Topper
    const starTopperGroup = new THREE.Group();
    starTopperGroup.position.set(0, 4.15, 0);
    cakeGroup.add(starTopperGroup);

    const starSphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 20), goldMat);
    starTopperGroup.add(starSphere);

    // Fluttering gold wings
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xfff9e6,
      metalness: 0.85,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
    });

    const createTopperWing = () => {
      const wing = new THREE.Group();
      for (let f = 0; f < 5; f++) {
        const vane = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.8 - f * 0.12, 4), wingMat);
        vane.position.set(0.06 * (f + 1), 0.3 + f * 0.12, 0);
        vane.rotation.z = -0.25;
        wing.add(vane);
      }
      return wing;
    };

    const leftWing = createTopperWing();
    leftWing.position.set(-0.22, 0.1, 0);
    leftWing.rotation.z = Math.PI / 3;
    starTopperGroup.add(leftWing);

    const rightWing = createTopperWing();
    rightWing.position.set(0.22, 0.1, 0);
    rightWing.rotation.z = -Math.PI / 3;
    rightWing.scale.x = -1;
    starTopperGroup.add(rightWing);

    // 5 Glowing Birthday Candles with Flickering Teardrop Flames
    const cakeCandles: { mesh: THREE.Group; light: THREE.PointLight }[] = [];
    const candlePos = [
      [-0.42, 3.68, -0.28],
      [0.42, 3.68, -0.28],
      [-0.38, 3.68, 0.32],
      [0.38, 3.68, 0.32],
      [0.0, 3.88, -0.5], // Center rear
    ];

    candlePos.forEach(([cx, cy, cz]) => {
      const cBody = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.65, 12), candleWaxMat);
      cBody.position.set(cx, cy + 0.32, cz);
      cakeGroup.add(cBody);

      const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.09, 6), ironMat);
      wick.position.set(cx, cy + 0.68, cz);
      cakeGroup.add(wick);

      const cFlame = createRealisticFlameMesh();
      cFlame.scale.set(0.7, 0.85, 0.7);
      cFlame.position.set(cx, cy + 0.8, cz);
      cakeGroup.add(cFlame);

      const cLight = new THREE.PointLight(0xff9900, 1.4, 7);
      cLight.position.set(cx, cy + 0.82, cz);
      cakeGroup.add(cLight);

      cakeCandles.push({ mesh: cFlame, light: cLight });
    });
    cakeCandlesRef.current = cakeCandles;

    // Birthday Acceptance Scroll lying beside the cake
    const scrollGeo = new THREE.PlaneGeometry(1.8, 2.4, 12, 12);
    scrollGeo.rotateX(-Math.PI / 2);
    // Curl edges slightly
    const sPos = scrollGeo.attributes.position;
    for (let i = 0; i < sPos.count; i++) {
      const u = sPos.getX(i);
      const v = sPos.getZ(i);
      sPos.setY(i, Math.sin(u * 2) * Math.sin(v * 2) * 0.03 + (Math.abs(u) > 0.6 ? 0.02 : 0));
    }
    sPos.needsUpdate = true;

    const scrollMesh = new THREE.Mesh(scrollGeo, new THREE.MeshStandardMaterial({ map: parchmentTex, roughness: 0.9 }));
    scrollMesh.position.set(-2.1, 0.06, 0.1);
    scrollMesh.rotation.y = 0.15;
    cakeGroup.add(scrollMesh);

    // 3D Crimson Wax Seal with ribbons
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.05, 20), new THREE.MeshStandardMaterial({ color: 0x8a0c14, roughness: 0.35 }));
    seal.position.set(-2.1, 0.11, -0.65);
    cakeGroup.add(seal);

    const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.6), goldMat);
    ribbon.position.set(-2.05, 0.09, -0.38);
    ribbon.rotation.y = 0.2;
    cakeGroup.add(ribbon);

    // =========================================================================
    // 9. CONTINUOUS 3D CAMERA SPLINE PATH (SCENES 1 THROUGH 6)
    // =========================================================================
    const cameraCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 44, 78),     // t = 0.00: Scene 1 Aerial Beach
      new THREE.Vector3(0, 22, 60),     // t = 0.15: Descending over path
      new THREE.Vector3(0, 8.2, 42),    // t = 0.28: Scene 2 Approaching Grand Portal
      new THREE.Vector3(0, 4.6, 30),    // t = 0.36: Doors Opening inward
      new THREE.Vector3(0, 4.2, 21),    // t = 0.44: Scene 3 Passing physically through door
      new THREE.Vector3(0, 4.0, 10),    // t = 0.55: Revealing Great Hall
      new THREE.Vector3(4.5, 3.6, 2.0), // t = 0.68: Scene 4 Approaching feast table
      new THREE.Vector3(4.8, 3.4, -12), // t = 0.80: Scene 5 Orbiting along feast table
      new THREE.Vector3(2.2, 3.6, -22), // t = 0.90: Curving around far end
      new THREE.Vector3(0, 3.65, -13.5),// t = 1.00: Scene 6 Directly facing Birthday Cake!
    ]);

    const lookAtCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 7.0, 15),     // Scene 1: Look down at hall & shoreline
      new THREE.Vector3(0, 6.0, 26),     // Descending: Look at illuminated entrance
      new THREE.Vector3(0, 5.0, 22),     // Approaching portal: Look at double doors
      new THREE.Vector3(0, 4.4, 10),     // Doors open: Look into warm Great Hall
      new THREE.Vector3(0, 4.0, 0),      // Passing threshold: Look at banquet
      new THREE.Vector3(0, 3.4, -6),     // In hall: Look at banquet table & candles
      new THREE.Vector3(0, 3.2, -6),     // Orbiting: Center table focus
      new THREE.Vector3(0, 3.3, -16),    // Gliding along: Look toward cake & delicacies
      new THREE.Vector3(0, 3.6, -17.8),  // Curving around: Look squarely at Cake
      new THREE.Vector3(0, 3.65, -17.8), // Stop: Frontal view squarely facing Cake!
    ]);

    // Raycaster for clicking cake
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (cakeMeshRef.current) {
        const hits = raycaster.intersectObjects(cakeMeshRef.current.children, true);
        if (hits.length > 0) {
          triggerWishCelebration();
        }
      }
    };
    renderer.domElement.addEventListener("click", handleCanvasClick);

    // Scroll & Touch Listeners
    let touchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const delta = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      targetProgressRef.current = Math.max(0, Math.min(1, targetProgressRef.current + delta * 0.0024));
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetProgressRef.current = Math.max(0, Math.min(1, targetProgressRef.current + e.deltaY * 0.00085));
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("wheel", handleWheel, { passive: false });

    // Keyboard navigation (Arrow keys / PageUp / PageDown)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        targetProgressRef.current = Math.min(1, targetProgressRef.current + 0.05);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        targetProgressRef.current = Math.max(0, targetProgressRef.current - 0.05);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // =========================================================================
    // 10. ANIMATION TICK & RENDER LOOP
    // =========================================================================
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Theme lighting interpolation
      const isNight = themeRef.current === "night";
      skyMesh.material.color.lerp(new THREE.Color(isNight ? 0x050814 : 0x4fa3e3), 0.05);
      scene.fog?.color.lerp(new THREE.Color(isNight ? 0x060914 : 0x87ceeb), 0.05);
      ambientLight.color.lerp(new THREE.Color(isNight ? 0x1e293b : 0xfff8ee), 0.05);
      ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, isNight ? 0.45 : 1.1, 0.05);
      sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, isNight ? 0.0 : 2.6, 0.05);
      moonLight.visible = isNight;
      moonGroup.visible = isNight;
      starMat.opacity = THREE.MathUtils.lerp(starMat.opacity, isNight ? 0.95 : 0.0, 0.05);

      // Ocean wave vertex displacement
      const oceanPos = oceanGeo.attributes.position;
      for (let i = 0; i < oceanPos.count; i++) {
        const u = oceanPos.getX(i);
        const v = oceanPos.getZ(i);
        const wave = Math.sin(u * 0.07 + elapsed * 1.6) * 0.38 + Math.cos(v * 0.05 + elapsed * 1.3) * 0.28;
        oceanPos.setY(i, wave);
      }
      oceanPos.needsUpdate = true;

      // 48 Floating Candles bobbing & swaying animation
      floatingCandles.forEach((c) => {
        c.mesh.position.y = c.baseY + Math.sin(elapsed * c.speed + c.offset) * 0.32;
        c.mesh.rotation.x = Math.sin(elapsed * 1.1 + c.offset) * c.swayX;
        c.mesh.rotation.z = Math.cos(elapsed * 1.3 + c.offset) * c.swayZ;
        c.light.intensity = 0.8 + Math.sin(elapsed * 9 + c.offset) * 0.25;
      });

      // Cake candles flicker & topper wings flutter
      cakeCandlesRef.current.forEach((c, idx) => {
        c.light.intensity = (candlesBlown ? 0.0 : 1.35) + Math.sin(elapsed * 14 + idx) * 0.3;
        c.mesh.visible = !candlesBlown;
      });

      leftWing.rotation.z = Math.PI / 3 + Math.sin(elapsed * 16) * 0.18;
      rightWing.rotation.z = -Math.PI / 3 - Math.sin(elapsed * 16) * 0.18;

      // Drifting atmospheric dust motes
      const dPos = dustGeo.attributes.position;
      for (let i = 0; i < dustCount; i++) {
        let dy = dPos.getY(i) + Math.sin(elapsed + i) * 0.006;
        if (dy > 14) dy = 1.5;
        dPos.setY(i, dy);
      }
      dPos.needsUpdate = true;

      // Auto tour progression
      if (isAutoTourRef.current) {
        targetProgressRef.current += 0.0013;
        if (targetProgressRef.current >= 1) {
          targetProgressRef.current = 1;
        }
      }

      // Smooth Camera Damping along Spline
      progressRef.current = THREE.MathUtils.lerp(progressRef.current, targetProgressRef.current, 0.055);
      const t = Math.max(0, Math.min(1, progressRef.current));

      // --- AUTOMATIC DOUBLE DOORS OPENING LOGIC ---
      // Doors open smoothly when t approaches the entrance (t in [0.26, 0.42])
      const doorOpen = THREE.MathUtils.smoothstep(t, 0.26, 0.42);
      if (leftDoorRef.current && rightDoorRef.current) {
        // Left door swings inward (-Y)
        leftDoorRef.current.rotation.y = -doorOpen * (Math.PI * 0.48);
        // Right door swings inward (+Y)
        rightDoorRef.current.rotation.y = doorOpen * (Math.PI * 0.48);
      }

      // Play door opening creak sound once when doors begin opening
      if (doorOpen > 0.15 && !hasPlayedDoorSoundRef.current) {
        hasPlayedDoorSoundRef.current = true;
        sound.playDoorOpen();
      } else if (doorOpen < 0.05) {
        hasPlayedDoorSoundRef.current = false;
      }

      // Portal light expands as doors open
      if (portalLightRef.current) {
        portalLightRef.current.intensity = 1.0 + doorOpen * 2.5;
      }

      // Sample Spline Points
      const camPos = cameraCurve.getPointAt(t);
      const camLook = lookAtCurve.getPointAt(t);

      // Subtle breathing drift in idle view
      if (t < 0.1) {
        camPos.x += Math.sin(elapsed * 0.7) * 0.35;
        camPos.y += Math.cos(elapsed * 0.5) * 0.2;
      }

      camera.position.copy(camPos);
      camera.lookAt(camLook);

      setCameraProgress(t);

      // Update Stage Name
      if (t < 0.18) {
        setCurrentStageName(JOURNEY_STAGES[0].name);
      } else if (t < 0.36) {
        setCurrentStageName(JOURNEY_STAGES[1].name);
      } else if (t < 0.52) {
        setCurrentStageName(JOURNEY_STAGES[2].name);
      } else if (t < 0.72) {
        setCurrentStageName(JOURNEY_STAGES[3].name);
      } else if (t < 0.90) {
        setCurrentStageName(JOURNEY_STAGES[4].name);
      } else {
        setCurrentStageName(JOURNEY_STAGES[5].name);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("wheel", handleWheel);
      renderer.domElement.removeEventListener("click", handleCanvasClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [recipientName, candlesBlown]);

  // =========================================================================
  // HELPER 3D GEOMETRY GENERATORS
  // =========================================================================
  function createRealisticFlameMesh() {
    const group = new THREE.Group();
    // Inner white core
    const coreGeo = new THREE.ConeGeometry(0.045, 0.18, 10);
    coreGeo.rotateX(Math.PI);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    group.add(new THREE.Mesh(coreGeo, coreMat));

    // Outer amber flame tear
    const haloGeo = new THREE.ConeGeometry(0.08, 0.3, 10);
    haloGeo.rotateX(Math.PI);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    group.add(new THREE.Mesh(haloGeo, haloMat));
    return group;
  }

  function createRealisticGothicChair(woodMat: THREE.Material, velvetMat: THREE.Material, goldMat: THREE.Material) {
    const chair = new THREE.Group();
    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.15, 1.3), woodMat);
    seat.position.y = 1.3;
    chair.add(seat);

    // Cushion
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.14, 1.18), velvetMat);
    cushion.position.y = 1.42;
    chair.add(cushion);

    // High Arched Backrest
    const backStileL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 8), woodMat);
    backStileL.position.set(-0.55, 2.5, -0.55);
    chair.add(backStileL);

    const backStileR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 8), woodMat);
    backStileR.position.set(0.55, 2.5, -0.55);
    chair.add(backStileR);

    // Carved pointed arch tracery back panel
    const backPanel = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.7, 0.06), woodMat);
    backPanel.position.set(0, 2.55, -0.55);
    chair.add(backPanel);

    // Turned front legs
    const legGeo = new THREE.CylinderGeometry(0.065, 0.055, 1.3, 8);
    [[-0.52, -0.52], [0.52, -0.52], [-0.52, 0.52], [0.52, 0.52]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(x, 0.65, z);
      chair.add(leg);
    });

    return chair;
  }

  function createPlaceSetting(
    parent: THREE.Group,
    x: number,
    tableY: number,
    z: number,
    goldMat: THREE.Material,
    silverMat: THREE.Material,
    wineMat: THREE.Material
  ) {
    // Silver Charger Plate
    const charger = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.6, 0.05, 22), silverMat);
    charger.position.set(x, tableY + 0.03, z);
    charger.castShadow = true;
    parent.add(charger);

    // Gold Bread Plate
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.44, 0.04, 18), goldMat);
    plate.position.set(x, tableY + 0.06, z);
    parent.add(plate);

    // Golden Goblet with Red Wine
    const goblet = new THREE.Group();
    const gBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.05, 14), goldMat);
    goblet.add(gBase);

    const gStem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.35, 10), goldMat);
    gStem.position.y = 0.18;
    goblet.add(gStem);

    const gBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.13, 0.42, 16), goldMat);
    gBowl.position.y = 0.5;
    goblet.add(gBowl);

    const gWine = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 14), wineMat);
    gWine.position.y = 0.64;
    goblet.add(gWine);

    goblet.position.set(x > 0 ? x + 0.55 : x - 0.55, tableY + 0.04, z - 0.5);
    parent.add(goblet);
  }

  function createRoastPoultryPlatter(
    parent: THREE.Group,
    x: number,
    tableY: number,
    z: number,
    silverMat: THREE.Material,
    roastMat: THREE.Material,
    leafGreenMat: THREE.Material
  ) {
    const group = new THREE.Group();
    const platter = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.1, 0.08, 22), silverMat);
    platter.scale.set(1.4, 1, 0.95);
    group.add(platter);

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.52, 14, 12), roastMat);
    body.scale.set(1.3, 0.75, 0.88);
    body.position.y = 0.32;
    group.add(body);

    [-0.3, 0.3].forEach((oz) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.5, 8), roastMat);
      leg.position.set(0.62, 0.35, oz);
      leg.rotation.z = Math.PI / 4;
      group.add(leg);
    });

    group.position.set(x, tableY + 0.04, z);
    parent.add(group);
  }

  function createFruitCornucopiaPlatter(
    parent: THREE.Group,
    x: number,
    tableY: number,
    z: number,
    silverMat: THREE.Material,
    berryRedMat: THREE.Material,
    grapeBlueMat: THREE.Material,
    leafGreenMat: THREE.Material
  ) {
    const group = new THREE.Group();
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.45, 0.35, 18), silverMat);
    group.add(bowl);

    const apple1 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), berryRedMat);
    apple1.position.set(-0.3, 0.4, 0.1);
    group.add(apple1);

    const apple2 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), berryRedMat);
    apple2.position.set(0.3, 0.38, -0.1);
    group.add(apple2);

    for (let g = 0; g < 18; g++) {
      const grape = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), grapeBlueMat);
      const angle = (g * 0.7) % (Math.PI * 2);
      const dist = 0.2 + (g / 18) * 0.5;
      grape.position.set(Math.cos(angle) * dist, 0.42 - (g / 18) * 0.25, Math.sin(angle) * dist);
      group.add(grape);
    }

    group.position.set(x, tableY + 0.08, z);
    parent.add(group);
  }

  function createArtisanBreadBoard(
    parent: THREE.Group,
    x: number,
    tableY: number,
    z: number,
    woodMat: THREE.Material,
    goldMat: THREE.Material
  ) {
    const group = new THREE.Group();
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.0), woodMat);
    group.add(board);

    const breadMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.75 });
    const boule = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), breadMat);
    boule.scale.set(1.2, 0.65, 0.85);
    boule.position.set(-0.2, 0.24, 0);
    group.add(boule);

    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.42, 10), breadMat);
    roll.rotation.z = Math.PI / 2;
    roll.position.set(0.35, 0.15, 0.1);
    group.add(roll);

    group.position.set(x, tableY + 0.04, z);
    parent.add(group);
  }

  function createBaroqueCandelabra(
    parent: THREE.Group,
    x: number,
    tableY: number,
    z: number,
    goldMat: THREE.Material,
    candleWaxMat: THREE.Material
  ) {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 0.14, 14), goldMat);
    group.add(base);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 1.25, 10), goldMat);
    stem.position.y = 0.65;
    group.add(stem);

    [-0.65, 0, 0.65].forEach((cx) => {
      const cCup = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.05, 0.09, 8), goldMat);
      cCup.position.set(cx, 1.2, 0);
      group.add(cCup);

      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.65, 8), candleWaxMat);
      candle.position.set(cx, 1.55, 0);
      group.add(candle);

      const flame = createRealisticFlameMesh();
      flame.scale.set(0.65, 0.75, 0.65);
      flame.position.set(cx, 1.95, 0);
      group.add(flame);
    });

    const pLight = new THREE.PointLight(0xf59e0b, 1.1, 7);
    pLight.position.set(0, 2.1, 0);
    group.add(pLight);

    group.position.set(x, tableY + 0.07, z);
    parent.add(group);
  }

  // =========================================================================
  // USER ACTIONS & MODAL CONTROLS
  // =========================================================================
  const triggerWishCelebration = useCallback(() => {
    sound.playWishSparkle();
    sound.playGiftUnbox();

    confetti({
      particleCount: 160,
      spread: 95,
      origin: { y: 0.6 },
      colors: ["#ffd700", "#f59e0b", "#fb7185", "#38bdf8", "#ec4899", "#ffffff"],
    });

    setWishGranted(true);
    setShowCakeModal(true);
  }, []);

  const blowOutCandles = () => {
    sound.playCandleBlow();
    setCandlesBlown(true);

    confetti({
      particleCount: 180,
      spread: 120,
      origin: { y: 0.55 },
      colors: ["#ffd700", "#f59e0b", "#ec4899", "#a855f7", "#ffffff"],
    });
  };

  const jumpToStage = (progressVal: number) => {
    sound.playSlideClick();
    targetProgressRef.current = progressVal;
    setIsAutoTour(false);
  };

  const toggleTheme = () => {
    sound.playSlideClick();
    setTheme((t) => (t === "night" ? "day" : "night"));
  };

  const toggleAudio = () => {
    const active = sound.toggleMusic((p) => setIsAudioPlaying(p));
    setIsAudioPlaying(active);
  };

  const replayJourney = () => {
    sound.playSlideClick();
    setShowCakeModal(false);
    setCandlesBlown(false);
    setWishGranted(false);
    targetProgressRef.current = 0;
    setIsAutoTour(false);
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-black">
      {/* 1. Three.js 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 2. Top Header HUD with Magical Emblem, Navigation & Audio Controls */}
      <header className="absolute top-5 inset-x-0 z-40 px-4 sm:px-6 max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2 rounded-full glass-luxury border border-amber-400/40 shadow-2xl backdrop-blur-xl">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span className="font-cinzel text-xs sm:text-sm font-bold tracking-widest text-amber-200">
            MAGICAL BIRTHDAY JOURNEY
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Day / Night Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-2xl transition-all duration-300 border ${
              theme === "day"
                ? "bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                : "glass-luxury text-amber-200 border-amber-400/50 hover:bg-white/10 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            }`}
            title="Toggle Day & Night Mode"
          >
            {theme === "day" ? (
              <>
                <Sun className="w-4 h-4 text-slate-950 animate-spin" style={{ animationDuration: "12s" }} />
                <span>Day</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-amber-300" />
                <span>Night</span>
              </>
            )}
          </button>

          {/* Auto-Flight Tour Toggle */}
          <button
            onClick={() => {
              sound.playSlideClick();
              setIsAutoTour(!isAutoTour);
            }}
            className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              isAutoTour
                ? "bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                : "glass-luxury text-zinc-300 border-white/20 hover:text-white"
            }`}
            title="Sit back and watch the cinematic camera tour automatically"
          >
            {isAutoTour ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden sm:inline">{isAutoTour ? "Pause Tour" : "Auto Tour"}</span>
          </button>

          {/* Audio Music Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2 sm:p-2.5 rounded-full border transition-all ${
              isAudioPlaying
                ? "bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                : "glass-luxury text-zinc-300 border-white/15 hover:border-amber-400/40"
            }`}
            title={isAudioPlaying ? "Mute Music" : "Play Magical Ambient Music"}
          >
            {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 3. Top Stage Indicator */}
      <div className="absolute top-20 inset-x-0 z-30 flex justify-center pointer-events-none px-4">
        <div className="glass-luxury px-4 sm:px-5 py-2 rounded-full border border-amber-400/30 text-xs sm:text-sm text-amber-200 font-medium flex items-center gap-2 shadow-2xl backdrop-blur-md">
          <Eye className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{currentStageName}</span>
        </div>
      </div>

      {/* 4. Scene 1 Welcome Callout (visible at start of journey) */}
      {cameraProgress < 0.12 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none text-center max-w-md px-6">
          <div className="glass-luxury-gold p-6 sm:p-8 rounded-3xl border border-amber-400/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-fade-in">
            <span className="text-amber-400 text-xs font-mono tracking-widest uppercase block mb-2">
              ✦ An Enchanted Birthday ✦
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-amber-100 mb-3 drop-shadow-lg">
              A little magic awaits…
            </h1>
            <p className="text-zinc-300 text-xs sm:text-sm font-light leading-relaxed mb-5">
              Swipe upward or scroll to descend from the moonlit ocean toward the great banquet hall.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/20 text-amber-200 text-xs font-semibold animate-bounce border border-amber-400/30">
              <ChevronDown className="w-4 h-4" />
              <span>Swipe up or scroll down</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Scene 6 Cake Reveal Message & "Make a Wish ✨" Button */}
      {cameraProgress >= 0.88 && !showCakeModal && (
        <div className="absolute bottom-28 sm:bottom-24 inset-x-0 z-40 flex flex-col items-center pointer-events-auto px-4 text-center">
          <div className="glass-luxury-gold px-6 py-4 rounded-3xl border border-amber-400/60 shadow-[0_0_40px_rgba(245,158,11,0.5)] mb-3 max-w-lg">
            <h2 className="text-xl sm:text-2xl font-black font-cinzel text-amber-200 mb-1">
              Happy Birthday, {recipientName}!
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm font-light">
              Tonight, the magic is all yours.
            </p>
          </div>

          <button
            onClick={triggerWishCelebration}
            className="px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-rose-500 text-slate-950 font-black text-sm sm:text-base shadow-[0_0_35px_rgba(245,158,11,0.85)] border-2 border-white flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all animate-bounce cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
            <span>MAKE A WISH ✨</span>
          </button>
        </div>
      )}

      {/* 6. Bottom Timeline Scrubber & Stage Navigation */}
      <div className="absolute bottom-4 inset-x-0 z-40 px-3 sm:px-4 max-w-2xl mx-auto flex flex-col items-center gap-2 pointer-events-auto">
        {/* Stage jump pills */}
        <div className="flex items-center gap-1 sm:gap-2 w-full justify-between glass-luxury px-2 sm:px-4 py-2 rounded-2xl border border-white/15 backdrop-blur-xl text-[10px] sm:text-xs overflow-x-auto">
          {JOURNEY_STAGES.map((s) => {
            const isActive =
              Math.abs(cameraProgress - s.progress) < 0.12 ||
              (s.id === 5 && cameraProgress >= 0.88);
            return (
              <button
                key={s.id}
                onClick={() => jumpToStage(s.progress)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-amber-400 text-slate-950 shadow-[0_0_12px_#f59e0b]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {s.short}
              </button>
            );
          })}
        </div>

        {/* Scrub slider */}
        <div className="w-full flex items-center gap-2 sm:gap-3">
          <span className="text-[10px] text-zinc-400 font-mono">0%</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={cameraProgress}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              targetProgressRef.current = val;
              setIsAutoTour(false);
            }}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-white/20 rounded-lg"
          />
          <span className="text-[10px] text-amber-300 font-mono font-bold">100%</span>
        </div>

        <p className="text-[10px] sm:text-[11px] text-zinc-400 drop-shadow flex items-center gap-1.5 font-light">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Scroll mouse wheel, swipe up on mobile, or drag slider to travel through the magical world</span>
        </p>
      </div>

      {/* 7. Luxury Birthday Letter & Wish Celebration Modal */}
      {showCakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg glass-luxury-gold rounded-3xl p-6 sm:p-9 border border-amber-400/60 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-center relative overflow-hidden">
            <button
              onClick={() => setShowCakeModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] mb-5">
              <Cake className="w-8 h-8 text-slate-950" />
            </div>

            <span className="text-amber-400 text-xs font-mono tracking-widest uppercase block mb-1">
              ✦ Special Birthday Proclamation ✦
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-amber-200 mb-2">
              Happy Birthday, {recipientName}! 🎂✨
            </h3>

            <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed font-light mb-5">
              You have arrived in front of your celebration cake and enchanted birthday decree! The floating candles burn bright, and the entire seaside banquet hall was prepared to celebrate you.
            </p>

            {/* Heartfelt friendship letter parchment box */}
            <div className="p-4 rounded-2xl bg-black/40 border border-amber-400/30 text-xs sm:text-sm text-amber-100 font-serif leading-relaxed mb-5 text-left max-h-48 overflow-y-auto">
              <p className="font-bold text-amber-300 mb-1">To Someone Truly Irreplaceable 💖</p>
              <p className="text-zinc-300 text-xs leading-relaxed">
                On this special day, I want you to know how grateful I am to have you in my life. You bring warmth, comfort, and unconditional joy wherever you go. Life's greatest adventures are the ones we share together. May this new chapter bring you boundless health, love, triumphs, and everything your heart dreams of!
              </p>
              <p className="text-right text-amber-300 text-xs italic mt-2">
                ~ With all my love & warmest wishes ✨
              </p>
            </div>

            {/* Actions: Blow out candles, fireworks, replay */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {!candlesBlown ? (
                <button
                  onClick={blowOutCandles}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Blow Out Candles 🎂</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Wish Granted! ✨</span>
                </div>
              )}

              <button
                onClick={() => {
                  sound.playPop();
                  confetti({
                    particleCount: 120,
                    spread: 85,
                    origin: { y: 0.5 },
                  });
                }}
                className="px-4 py-2.5 rounded-full glass-card hover:bg-white/10 text-amber-200 text-xs sm:text-sm font-semibold transition-all border-amber-400/40 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Fireworks!</span>
              </button>

              <button
                onClick={replayJourney}
                className="px-4 py-2.5 rounded-full glass-card hover:bg-white/10 text-zinc-300 text-xs sm:text-sm font-semibold transition-all border-white/20 cursor-pointer flex items-center gap-1.5"
                title="Restart the 3D journey from the aerial beach view"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Journey</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
