"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { sound } from "../utils/audio";
import confetti from "canvas-confetti";
import { siteContent } from "../data/content";
import RealisticBeachHall from "./RealisticBeachHall";
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
  Camera,
  Layers,
  Wand2,
} from "lucide-react";

export default function ThreeSeasideHall() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"day" | "night">("day");
  const [cameraProgress, setCameraProgress] = useState(0); // 0 = Top Aerial View, 1 = In front of Cake
  const [isAutoTour, setIsAutoTour] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showCakeModal, setShowCakeModal] = useState(false);
  const [viewMode, setViewMode] = useState<"3d" | "cinematic">("3d");
  const [currentStageName, setCurrentStageName] = useState("Stage 1: Top Aerial View of Great Hall & Coast");

  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const themeRef = useRef<"day" | "night">("day");
  const isAutoTourRef = useRef(false);
  const cakeMeshRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    isAutoTourRef.current = isAutoTour;
  }, [isAutoTour]);

  useEffect(() => {
    if (viewMode !== "3d" || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer with Cinematic Atmosphere & Soft Shadowing
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.0045);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // =========================================================================
    // HIGH-RES PROCEDURAL HOGWARTS TEXTURE GENERATORS
    // =========================================================================

    // A. Hogwarts Medieval Flagstone Castle Floor
    function createCastleStoneFloorTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#27282b";
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

          const stoneColors = ["#44454b", "#3b3c40", "#51525a", "#484643", "#38383c", "#4c4844"];
          ctx.fillStyle = stoneColors[Math.floor(Math.random() * stoneColors.length)];
          ctx.fillRect(x + 3, y + 3, cw - 6, rh - 6);

          // Chisel stipples & surface weathering
          for (let p = 0; p < 35; p++) {
            ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.22)";
            ctx.fillRect(x + Math.random() * cw, y + Math.random() * rh, Math.random() * 4 + 1, Math.random() * 4 + 1);
          }
          // Edge chamfer highlight
          ctx.strokeStyle = "rgba(255,255,255,0.12)";
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 4, y + 4, cw - 8, rh - 8);
        }
      }

      ctx.strokeStyle = "#141517";
      ctx.lineWidth = 6;
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * rh);
        ctx.lineTo(1024, r * rh);
        ctx.stroke();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 6);
      return tex;
    }

    // B. Ancient Carved Stone Texture for Pillars & Arches
    function createStonePillarTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#525359";
      ctx.fillRect(0, 0, 1024, 1024);

      for (let i = 0; i < 700; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.07)" : "rgba(18,18,22,0.18)";
        ctx.fillRect(Math.random() * 1024, Math.random() * 1024, Math.random() * 24 + 2, Math.random() * 8 + 1);
      }

      // Vertical fluting & carving lines
      for (let x = 32; x < 1024; x += 64) {
        ctx.strokeStyle = "rgba(0,0,0,0.25)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1024);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 4, 0);
        ctx.lineTo(x + 4, 1024);
        ctx.stroke();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }

    // C. Hogwarts House Banners (Gryffindor, Slytherin, Ravenclaw, Hufflepuff) with Woven Cloth Texture
    function createHouseBannerTexture(house: "gryffindor" | "slytherin" | "ravenclaw" | "hufflepuff") {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;

      let mainColor = "#740001"; // Gryffindor scarlet
      let secondaryColor = "#d3a625"; // Gold
      let houseName = "GRYFFINDOR";
      let motto = "FORTITUDO";

      if (house === "slytherin") {
        mainColor = "#1a472a";
        secondaryColor = "#aaaaaa";
        houseName = "SLYTHERIN";
        motto = "AMBITIO";
      } else if (house === "ravenclaw") {
        mainColor = "#0e1a40";
        secondaryColor = "#946b2d";
        houseName = "RAVENCLAW";
        motto = "SAPIENTIA";
      } else if (house === "hufflepuff") {
        mainColor = "#ecb939";
        secondaryColor = "#1b1b1b";
        houseName = "HUFFLEPUFF";
        motto = "FIDELITAS";
      }

      // Banner background with swallowtail cut
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(512, 0);
      ctx.lineTo(512, 880);
      ctx.lineTo(256, 1024);
      ctx.lineTo(0, 880);
      ctx.closePath();
      ctx.fill();

      // Fabric weave stipples
      for (let y = 0; y < 1024; y += 4) {
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        ctx.fillRect(0, y, 512, 1);
      }
      for (let x = 0; x < 512; x += 4) {
        ctx.fillStyle = "rgba(255,255,255,0.04)";
        ctx.fillRect(x, 0, 1, 1024);
      }

      // Gold / Silver Embroidered Border
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(10, 10);
      ctx.lineTo(502, 10);
      ctx.lineTo(502, 870);
      ctx.lineTo(256, 1008);
      ctx.lineTo(10, 870);
      ctx.closePath();
      ctx.stroke();

      // Inner filigree frame
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, 452, 820);

      // Central Shield Crest
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.arc(256, 400, 150, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 6;
      ctx.stroke();

      // House Heraldic Animal Emblem
      ctx.fillStyle = secondaryColor;
      ctx.font = "bold 96px 'Cinzel', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(house[0].toUpperCase(), 256, 390);

      // House Name
      ctx.font = "bold 34px 'Cinzel', serif";
      ctx.fillText(houseName, 256, 590);

      // Latin Motto
      ctx.font = "italic 22px serif";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillText(`~ ${motto} ~`, 256, 640);

      // Gold bullion hanging fringe tassels
      ctx.fillStyle = secondaryColor;
      for (let x = 20; x < 490; x += 22) {
        ctx.fillRect(x, 14, 12, 28);
      }

      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    }

    // D. Aged Hogwarts Parchment Acceptance Letter with Calligraphy
    function createParchmentTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#f6ebd7";
      ctx.fillRect(0, 0, 1024, 1024);

      // Aged vellum staining & burns
      for (let i = 0; i < 600; i++) {
        ctx.fillStyle = "rgba(160, 120, 60, 0.06)";
        ctx.fillRect(Math.random() * 1024, Math.random() * 1024, Math.random() * 60 + 10, Math.random() * 60 + 10);
      }

      // Deckled burnt border vignette
      const grad = ctx.createRadialGradient(512, 512, 350, 512, 512, 512);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(110,70,30,0.45)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1024);

      // Hogwarts Wax Seal Impression
      ctx.fillStyle = "#8a0c14";
      ctx.beginPath();
      ctx.arc(512, 220, 90, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 60px 'Cinzel', serif";
      ctx.textAlign = "center";
      ctx.fillText("H", 512, 240);

      // Official Calligraphy Script in Emerald Ink
      ctx.fillStyle = "#0c3b24"; // Emerald green ink
      ctx.font = "bold 32px 'Cinzel', serif";
      ctx.fillText("HOGWARTS SCHOOL OF WITCHCRAFT & WIZARDRY", 512, 380);

      ctx.font = "italic 24px serif";
      ctx.fillStyle = "#2c1c0f";
      ctx.fillText("Headmaster: Albus Dumbledore", 512, 425);
      ctx.fillText("Order of Merlin, First Class, Grand Sorc.", 512, 455);

      ctx.font = "bold 28px 'Cinzel', serif";
      ctx.fillStyle = "#740001";
      ctx.fillText(`Special Birthday Invitation for ${siteContent.recipient.name}`, 512, 520);

      ctx.font = "20px serif";
      ctx.fillStyle = "#2c1c0f";
      ctx.fillText("We are pleased to invite you to the Grand Seaside Banquet.", 512, 580);
      ctx.fillText("The Great Hall has been prepared on the shores in your honor.", 512, 615);
      ctx.fillText("May your year be filled with boundless wonder, triumph, and happiness.", 512, 650);

      for (let y = 720; y < 900; y += 38) {
        ctx.fillStyle = "rgba(44, 28, 15, 0.4)";
        ctx.fillRect(160, y, 704, 2);
      }

      ctx.font = "italic 22px serif";
      ctx.fillStyle = "#0c3b24";
      ctx.fillText("Yours Sincerely, Minerva McGonagall (Deputy Headmistress)", 512, 940);

      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    }

    // E. Realistic Dark Oak Wood
    function createWoodTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#24160d";
      ctx.fillRect(0, 0, 1024, 1024);

      for (let i = 0; i < 800; i++) {
        const y = Math.random() * 1024;
        ctx.strokeStyle = Math.random() > 0.5 ? "rgba(15, 8, 4, 0.45)" : "rgba(65, 38, 20, 0.35)";
        ctx.lineWidth = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(340, y + Math.random() * 20 - 10, 680, y + Math.random() * 20 - 10, 1024, y);
        ctx.stroke();
      }

      // Plank separation grooves
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      ctx.lineWidth = 4;
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

    // F. Golden Leaf Foil with Radial Metallic Sheen
    function createGoldFoilTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;

      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, "#ffd700");
      grad.addColorStop(0.3, "#f59e0b");
      grad.addColorStop(0.7, "#fef08a");
      grad.addColorStop(1, "#d97706");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 400; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(255, 255, 255, 0.5)" : "rgba(180, 110, 10, 0.4)";
        ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 3 + 1, Math.random() * 3 + 1);
      }

      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    }

    // G. Realistic Creamy Buttercream Cake Frosting Texture
    function createCakeFrostingTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#fffdf7";
      ctx.fillRect(0, 0, 1024, 1024);

      // Artisanal spatula swirl ripples
      for (let i = 0; i < 180; i++) {
        ctx.strokeStyle = Math.random() > 0.5 ? "rgba(245, 235, 215, 0.25)" : "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = Math.random() * 24 + 10;
        ctx.beginPath();
        const y = Math.random() * 1024;
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(340, y + Math.random() * 40 - 20, 680, y + Math.random() * 40 - 20, 1024, y);
        ctx.stroke();
      }

      // Micro sugar crystals
      for (let i = 0; i < 1200; i++) {
        ctx.fillStyle = Math.random() > 0.6 ? "rgba(255, 255, 255, 0.6)" : "rgba(235, 215, 185, 0.2)";
        ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }

    // H. Cascading Gold Drip Texture
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

      for (let i = 0; i < 200; i++) {
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
      }

      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    }

    // I. Woven Velvet Runner Texture
    function createVelvetTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#63000b"; // Deep Gryffindor crimson velvet
      ctx.fillRect(0, 0, 512, 512);

      // Fine velvet nap
      for (let i = 0; i < 1500; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(140, 20, 30, 0.3)" : "rgba(40, 0, 5, 0.4)";
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
      }

      // Gold embroidered filigree along borders
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 10;
      ctx.strokeRect(10, 10, 492, 492);
      ctx.lineWidth = 2;
      ctx.strokeRect(25, 25, 462, 462);

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 8);
      return tex;
    }

    // J. Sand Texture
    function createSandTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#ebd5b3";
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 1500; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(200, 175, 140, 0.3)" : "rgba(255, 245, 225, 0.4)";
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(12, 12);
      return tex;
    }

    // Instantiate Textures & Materials
    const floorStoneTex = createCastleStoneFloorTexture();
    const stonePillarTex = createStonePillarTexture();
    const woodTexture = createWoodTexture();
    const goldFoilTex = createGoldFoilTexture();
    const sandTex = createSandTexture();
    const parchmentTex = createParchmentTexture();
    const cakeFrostingTex = createCakeFrostingTexture();
    const goldDripTex = createGoldDripTexture();
    const velvetTex = createVelvetTexture();

    // Hogwarts PBR Materials
    const castleFloorMat = new THREE.MeshStandardMaterial({
      map: floorStoneTex,
      roughness: 0.72,
      metalness: 0.06,
    });

    const castleStoneMat = new THREE.MeshStandardMaterial({
      map: stonePillarTex,
      color: 0x8f8a84,
      roughness: 0.85,
      metalness: 0.04,
    });

    const darkOakMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.48,
      metalness: 0.08,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      map: goldFoilTex,
      color: 0xffd700,
      metalness: 0.94,
      roughness: 0.16,
    });

    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.92,
      roughness: 0.12,
    });

    const velvetRunnerMat = new THREE.MeshStandardMaterial({
      map: velvetTex,
      roughness: 0.92,
    });

    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      metalness: 0.85,
      roughness: 0.55,
    });

    const cakeFrostingMat = new THREE.MeshStandardMaterial({
      map: cakeFrostingTex,
      roughness: 0.32,
      metalness: 0.02,
    });

    const cakeDripMat = new THREE.MeshStandardMaterial({
      map: goldDripTex,
      color: 0xffe066,
      metalness: 0.88,
      roughness: 0.18,
    });

    const candleWaxMat = new THREE.MeshStandardMaterial({
      color: 0xfffdf6,
      roughness: 0.28,
      metalness: 0.04,
    });

    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const flameHaloMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const wineMat = new THREE.MeshStandardMaterial({
      color: 0x58000d,
      roughness: 0.08,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88,
    });

    const berryRedMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.22,
      metalness: 0.05,
    });

    const blueberryMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.35,
    });

    const leafGreenMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.55,
      side: THREE.DoubleSide,
    });

    const roastMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      roughness: 0.45,
      metalness: 0.15,
    });

    // 2. Realistic Sky & Cinematic Sun / Moon Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.05);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7e6, 2.8);
    sunLight.position.set(45, 80, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.00025;
    scene.add(sunLight);

    const moonLight = new THREE.DirectionalLight(0x93c5fd, 0.95);
    moonLight.position.set(-35, 60, -30);
    moonLight.castShadow = true;
    moonLight.visible = false;
    scene.add(moonLight);

    // Sky Dome with Sun Glint
    const skyGeo = new THREE.SphereGeometry(450, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, side: THREE.BackSide });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    // Starfield for Night
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 850;
      starPos[i + 1] = Math.random() * 220 + 30;
      starPos[i + 2] = (Math.random() - 0.5) * 850;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.5, transparent: true, opacity: 0 });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Luminous Crescent Moon
    const moonGroup = new THREE.Group();
    const moonGeo = new THREE.SphereGeometry(8, 24, 24);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moonMesh);
    moonGroup.position.set(-160, 190, -200);
    moonGroup.visible = false;
    scene.add(moonGroup);

    // 3. Dynamic Ocean & Sandy Beach
    const oceanGeo = new THREE.PlaneGeometry(800, 800, 100, 100);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.12,
      metalness: 0.35,
      flatShading: true,
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.position.y = -0.55;
    scene.add(oceanMesh);

    const sandGeo = new THREE.PlaneGeometry(180, 180, 24, 24);
    sandGeo.rotateX(-Math.PI / 2);
    const sandMat = new THREE.MeshStandardMaterial({
      map: sandTex,
      roughness: 0.95,
    });
    const sandMesh = new THREE.Mesh(sandGeo, sandMat);
    sandMesh.position.set(0, -0.35, -20);
    sandMesh.receiveShadow = true;
    scene.add(sandMesh);

    // =========================================================================
    // 4. HOGWARTS SEASIDE GREAT HALL ARCHITECTURE
    // =========================================================================
    const hallGroup = new THREE.Group();
    scene.add(hallGroup);

    // Medieval Castle Flagstone Floor
    const deckGeo = new THREE.BoxGeometry(32, 1, 48);
    const deckMesh = new THREE.Mesh(deckGeo, castleFloorMat);
    deckMesh.position.set(0, 0, 0);
    deckMesh.receiveShadow = true;
    hallGroup.add(deckMesh);

    // Foundation Steps
    const foundationGeo = new THREE.BoxGeometry(34, 0.6, 50);
    const foundation = new THREE.Mesh(foundationGeo, castleStoneMat);
    foundation.position.set(0, -0.6, 0);
    hallGroup.add(foundation);

    // Clustered Gothic Stone Columns with Fluting & Molded Capitals
    const pillarPositions = [
      [-15, 7.5, -22], [15, 7.5, -22],
      [-15, 7.5, -11], [15, 7.5, -11],
      [-15, 7.5, 0], [15, 7.5, 0],
      [-15, 7.5, 11], [15, 7.5, 11],
      [-15, 7.5, 22], [15, 7.5, 22],
    ];

    pillarPositions.forEach(([x, y, z]) => {
      // Clustered central pier
      const p = new THREE.Mesh(new THREE.BoxGeometry(1.6, 15, 1.6), castleStoneMat);
      p.position.set(x, y, z);
      p.castShadow = true;
      p.receiveShadow = true;
      hallGroup.add(p);

      // Engaged cylindrical stone shafts at 4 cardinal corners for true Gothic column profile
      const shaftGeo = new THREE.CylinderGeometry(0.35, 0.35, 14.8, 12);
      [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]].forEach(([ox, oz]) => {
        const shaft = new THREE.Mesh(shaftGeo, castleStoneMat);
        shaft.position.set(x + ox, y, z + oz);
        hallGroup.add(shaft);
      });

      // Molded Capital
      const cap = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.9, 2.3), castleStoneMat);
      cap.position.set(x, 14.6, z);
      hallGroup.add(cap);

      // Stepped Column Plinth & Base
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 2.4), castleStoneMat);
      base.position.set(x, 0.8, z);
      hallGroup.add(base);

      // Medieval Wrought Iron Wall Sconces with Blazing Torches
      const torchBracket = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.4, 8), ironMat);
      torchBracket.position.set(x > 0 ? x - 0.9 : x + 0.9, 7.6, z);
      torchBracket.rotation.z = x > 0 ? 0.32 : -0.32;
      hallGroup.add(torchBracket);

      // Iron Torch Basket
      const torchBasket = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.12, 0.35, 8), ironMat);
      torchBasket.position.set(x > 0 ? x - 1.2 : x + 1.2, 8.2, z);
      hallGroup.add(torchBasket);

      const torchFlame = createRealisticFlameMesh();
      torchFlame.scale.set(1.2, 1.4, 1.2);
      torchFlame.position.set(x > 0 ? x - 1.2 : x + 1.2, 8.45, z);
      hallGroup.add(torchFlame);

      const torchLight = new THREE.PointLight(0xf59e0b, 1.1, 10);
      torchLight.position.set(x > 0 ? x - 1.2 : x + 1.2, 8.5, z);
      hallGroup.add(torchLight);
    });

    // Four Hogwarts House Banners hanging proudly from columns
    const houses: Array<"gryffindor" | "slytherin" | "ravenclaw" | "hufflepuff"> = [
      "gryffindor", "slytherin", "ravenclaw", "hufflepuff"
    ];
    const bannerGeo = new THREE.PlaneGeometry(3.4, 7.8, 12, 24);
    const bannerZs = [-16.5, -5.5, 5.5, 16.5];

    bannerZs.forEach((bz, idx) => {
      const houseType = houses[idx % houses.length];
      const bannerTex = createHouseBannerTexture(houseType);
      const bannerMat = new THREE.MeshStandardMaterial({
        map: bannerTex,
        roughness: 0.75,
        side: THREE.DoubleSide,
        transparent: true,
      });

      // Left column banner
      const leftBanner = new THREE.Mesh(bannerGeo, bannerMat);
      leftBanner.position.set(-14.1, 10, bz);
      leftBanner.rotation.y = Math.PI / 2;
      hallGroup.add(leftBanner);

      // Hanging bronze rod & spearhead finials
      const rodGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.8, 12);
      rodGeo.rotateZ(Math.PI / 2);
      const leftRod = new THREE.Mesh(rodGeo, goldMat);
      leftRod.position.set(-14.05, 13.9, bz);
      hallGroup.add(leftRod);

      // Right column banner
      const rightBanner = new THREE.Mesh(bannerGeo, bannerMat);
      rightBanner.position.set(14.1, 10, bz);
      rightBanner.rotation.y = -Math.PI / 2;
      hallGroup.add(rightBanner);

      const rightRod = new THREE.Mesh(rodGeo, goldMat);
      rightRod.position.set(14.05, 13.9, bz);
      hallGroup.add(rightRod);
    });

    // Gothic Stone Pointed Arches & Open Timber Hammerbeam Ceiling Trusses
    const archRoofZs = [-22, -11, 0, 11, 22];
    archRoofZs.forEach((z) => {
      const archBeam = new THREE.Mesh(new THREE.BoxGeometry(32, 1.2, 1.5), castleStoneMat);
      archBeam.position.set(0, 15, z);
      archBeam.castShadow = true;
      hallGroup.add(archBeam);

      // Hammerbeam trusses
      const rafterLeftGeo = new THREE.BoxGeometry(17, 0.85, 0.85);
      rafterLeftGeo.rotateZ(Math.PI / 6);
      const rafterLeft = new THREE.Mesh(rafterLeftGeo, darkOakMat);
      rafterLeft.position.set(-7.5, 18.5, z);
      rafterLeft.castShadow = true;
      hallGroup.add(rafterLeft);

      const rafterRightGeo = new THREE.BoxGeometry(17, 0.85, 0.85);
      rafterRightGeo.rotateZ(-Math.PI / 6);
      const rafterRight = new THREE.Mesh(rafterRightGeo, darkOakMat);
      rafterRight.position.set(7.5, 18.5, z);
      rafterRight.castShadow = true;
      hallGroup.add(rafterRight);

      // Crown keystone
      const keystone = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), castleStoneMat);
      keystone.position.set(0, 22.8, z);
      hallGroup.add(keystone);
    });

    // Warm Hanging Fairy String Lights
    const fairyLightsGroup = new THREE.Group();
    hallGroup.add(fairyLightsGroup);
    const fairyLightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    archRoofZs.forEach((z) => {
      for (let lx = -13; lx <= 13; lx += 2.8) {
        const fMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), fairyLightMat);
        fMesh.position.set(lx, 14.8 - Math.sin(((lx + 13) / 26) * Math.PI) * 0.9, z);
        fairyLightsGroup.add(fMesh);
      }
    });

    // =========================================================================
    // 5. HOGWARTS BANQUET FEAST TABLE, CHAIRS & DELICACIES
    // =========================================================================
    const tableGroup = new THREE.Group();
    hallGroup.add(tableGroup);

    // Thick English Dark Oak Planks with Chamfered Edges
    const plankWidth = 1.7;
    for (let pIdx = 0; pIdx < 4; pIdx++) {
      const px = (pIdx - 1.5) * (plankWidth + 0.05);
      const plank = new THREE.Mesh(new THREE.BoxGeometry(plankWidth, 0.45, 26), darkOakMat);
      plank.position.set(px, 2.5, 0);
      plank.castShadow = true;
      plank.receiveShadow = true;
      tableGroup.add(plank);
    }

    // Heavy Trestle Legs & Arched Undercarriage
    [-9, 0, 9].forEach((tz) => {
      const trestleLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.3, 1.2), darkOakMat);
      trestleLeft.position.set(-2.4, 1.15, tz);
      trestleLeft.castShadow = true;
      tableGroup.add(trestleLeft);

      const trestleRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.3, 1.2), darkOakMat);
      trestleRight.position.set(2.4, 1.15, tz);
      trestleRight.castShadow = true;
      tableGroup.add(trestleRight);

      // Carved Trestle Cross-Beam
      const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.4, 0.6), darkOakMat);
      crossBeam.position.set(0, 0.8, tz);
      tableGroup.add(crossBeam);
    });

    // Central longitudinal stretcher beam connecting all trestles
    const centralStretcher = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 22), darkOakMat);
    centralStretcher.position.set(0, 0.8, 0);
    tableGroup.add(centralStretcher);

    // Royal Gryffindor Velvet Table Runner with Gold Embroidered Borders
    const runnerGeo = new THREE.BoxGeometry(3.6, 0.06, 26.2);
    const runner = new THREE.Mesh(runnerGeo, velvetRunnerMat);
    runner.position.set(0, 2.76, 0);
    tableGroup.add(runner);

    // Hanging bullion fringe tassels at the ends of the table runner
    [-13.1, 13.1].forEach((endZ) => {
      const fringeDrop = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 0.05), goldMat);
      fringeDrop.position.set(0, 2.45, endZ);
      tableGroup.add(fringeDrop);
    });

    // Gothic High-Back Banquet Dining Chairs
    for (let z = -10; z <= 10; z += 3.5) {
      const leftChair = createRealisticGothicChair(darkOakMat, velvetRunnerMat, goldMat);
      leftChair.position.set(-4.6, 0.5, z);
      leftChair.rotation.y = Math.PI / 2;
      tableGroup.add(leftChair);

      const rightChair = createRealisticGothicChair(darkOakMat, velvetRunnerMat, goldMat);
      rightChair.position.set(4.6, 0.5, z);
      rightChair.rotation.y = -Math.PI / 2;
      tableGroup.add(rightChair);
    }

    // Banquet Feast Tableware: Golden Hogwarts Goblets, Silver Chargers & Cutlery
    for (let z = -10; z <= 10; z += 3.5) {
      // Left side place setting
      createPlaceSetting(tableGroup, -2.2, 2.76, z, goldMat, silverMat, wineMat);
      // Right side place setting
      createPlaceSetting(tableGroup, 2.2, 2.76, z, goldMat, silverMat, wineMat);
    }

    // Centered Feast Platters (Herb-Roasted Golden Turkey, Fruit Cornucopia, Crusty Artisan Bread)
    createRoastPoultryPlatter(tableGroup, 0, 2.76, -7.5, silverMat, roastMat, leafGreenMat);
    createFruitCornucopiaPlatter(tableGroup, 0, 2.76, -2.5, silverMat, berryRedMat, blueberryMat, leafGreenMat);
    createArtisanBreadBoard(tableGroup, 0, 2.76, 2.5, darkOakMat, goldMat);
    createFruitCornucopiaPlatter(tableGroup, 0, 2.76, 6.8, silverMat, berryRedMat, blueberryMat, leafGreenMat);

    // Baroque 3-Branch Brass Candelabras
    [-5.0, 0.0, 4.8].forEach((z) => {
      createBaroqueCandelabra(tableGroup, 0, 2.76, z, goldMat, candleWaxMat, flameMat, flameHaloMat);
    });

    // =========================================================================
    // 6. ICONIC LEVITATING HARRY POTTER FLOATING CANDLES (32 Candles!)
    // =========================================================================
    const floatingCandlesGroup = new THREE.Group();
    scene.add(floatingCandlesGroup);
    const floatingCandles: {
      mesh: THREE.Group;
      light: THREE.PointLight;
      baseHeight: number;
      speed: number;
      offset: number;
      swayX: number;
      swayZ: number;
    }[] = [];

    for (let i = 0; i < 32; i++) {
      const cGroup = new THREE.Group();

      // Organic tapered ivory wax cylinder with melted scalloped rim
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 1.8, 16), candleWaxMat);
      cGroup.add(body);

      // Melted wax collar
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.025, 10, 16), candleWaxMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.9;
      cGroup.add(rim);

      // Molten wax drips trailing down the cylinder sides
      [[-0.12, 0.45, 0.05, 0.4], [0.12, 0.25, -0.04, 0.6], [0.03, 0.1, 0.12, 0.8]].forEach(([dx, dy, dz, scale]) => {
        const drip = new THREE.Mesh(new THREE.SphereGeometry(0.045 * scale, 8, 8), candleWaxMat);
        drip.position.set(dx, dy, dz);
        cGroup.add(drip);
      });

      // Charred black wick
      const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 8), ironMat);
      wick.position.y = 0.96;
      cGroup.add(wick);

      // Realistic teardrop flame
      const flame = createRealisticFlameMesh();
      flame.scale.set(0.9, 1.1, 0.9);
      flame.position.y = 1.08;
      cGroup.add(flame);

      // Warm candle glow point light
      const pLight = new THREE.PointLight(0xf59e0b, 0.95, 10);
      pLight.position.y = 1.12;
      cGroup.add(pLight);

      const x = (Math.random() - 0.5) * 8.5;
      const z = (Math.random() - 0.5) * 24;
      const baseHeight = Math.random() * 4.8 + 7.6;
      cGroup.position.set(x, baseHeight, z);
      floatingCandlesGroup.add(cGroup);

      floatingCandles.push({
        mesh: cGroup,
        light: pLight,
        baseHeight,
        speed: Math.random() * 1.4 + 1.1,
        offset: Math.random() * Math.PI * 2,
        swayX: (Math.random() - 0.5) * 0.05,
        swayZ: (Math.random() - 0.5) * 0.05,
      });
    }

    // =========================================================================
    // 7. ULTRA-REALISTIC MULTI-TIER HOGWARTS BIRTHDAY CAKE & ACCEPTANCE LETTER
    // =========================================================================
    const cakeGroup = new THREE.Group();
    cakeGroup.position.set(1.8, 2.76, 9.5); // Corner of the table
    tableGroup.add(cakeGroup);
    cakeMeshRef.current = cakeGroup;

    // A. Ornate Fluted Golden Pedestal Stand
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.25, 36), goldMat);
    standBase.position.y = 0.12;
    cakeGroup.add(standBase);

    const standStem = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 0.55, 24), goldMat);
    standStem.position.y = 0.48;
    cakeGroup.add(standStem);

    const standPlate = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.14, 40), goldMat);
    standPlate.position.y = 0.78;
    cakeGroup.add(standPlate);

    // Scalloped gold rim around the stand plate
    const standRim = new THREE.Mesh(new THREE.TorusGeometry(2.41, 0.06, 12, 40), goldMat);
    standRim.rotation.x = Math.PI / 2;
    standRim.position.y = 0.78;
    cakeGroup.add(standRim);

    // B. Tier 1 (Base Tier - Ivory Buttercream with Cascading Gold Drips & Piped Rosettes)
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.95, 1.15, 48), cakeFrostingMat);
    tier1.position.y = 1.42;
    tier1.castShadow = true;
    tier1.receiveShadow = true;
    cakeGroup.add(tier1);

    // Ring of 36 sculpted piped royal icing rosettes around Tier 1 base
    for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / 36) {
      const rx = Math.cos(a) * 1.97;
      const rz = Math.sin(a) * 1.97;
      const rosette = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), cakeFrostingMat);
      rosette.position.set(rx, 0.9, rz);
      cakeGroup.add(rosette);
    }

    // Cascading Gold Drip Icing Rim around Tier 1 top
    const goldDripCollar = new THREE.Mesh(new THREE.TorusGeometry(1.96, 0.075, 12, 48), cakeDripMat);
    goldDripCollar.rotation.x = Math.PI / 2;
    goldDripCollar.position.y = 1.98;
    cakeGroup.add(goldDripCollar);

    // Individual organic dripping teardrops running down Tier 1
    for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / 24) {
      const dripLen = 0.2 + Math.abs(Math.sin(a * 5)) * 0.45;
      const dx = Math.cos(a) * 1.97;
      const dz = Math.sin(a) * 1.97;

      const dripCone = new THREE.Mesh(new THREE.ConeGeometry(0.06, dripLen, 8), cakeDripMat);
      dripCone.position.set(dx, 1.98 - dripLen / 2, dz);
      cakeGroup.add(dripCone);

      const dripDrop = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), cakeDripMat);
      dripDrop.position.set(dx, 1.98 - dripLen, dz);
      cakeGroup.add(dripDrop);
    }

    // Edible Gold Dragee Sugar Pearls on Tier 1
    for (let i = 0; i < 32; i++) {
      const a = (i * Math.PI * 2) / 32 + (i % 2) * 0.1;
      const px = Math.cos(a) * 1.965;
      const pz = Math.sin(a) * 1.965;
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), goldMat);
      pearl.position.set(px, 1.25 + (i % 3) * 0.25, pz);
      cakeGroup.add(pearl);
    }

    // C. Tier 2 (Middle Tier - Rose-Gold Velvet & Buttercream)
    const tier2Mat = new THREE.MeshStandardMaterial({
      map: cakeFrostingTex,
      color: 0xfff0f2,
      roughness: 0.35,
    });
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.98, 48), tier2Mat);
    tier2.position.y = 2.48;
    tier2.castShadow = true;
    tier2.receiveShadow = true;
    cakeGroup.add(tier2);

    // Tier 2 base piped rosettes
    for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / 28) {
      const rx = Math.cos(a) * 1.42;
      const rz = Math.sin(a) * 1.42;
      const rosette = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), cakeFrostingMat);
      rosette.position.set(rx, 2.02, rz);
      cakeGroup.add(rosette);
    }

    // Gold filigree waist band on Tier 2
    const goldRibbon2 = new THREE.Mesh(new THREE.TorusGeometry(1.415, 0.06, 12, 36), goldMat);
    goldRibbon2.rotation.x = Math.PI / 2;
    goldRibbon2.position.y = 2.48;
    cakeGroup.add(goldRibbon2);

    // Fresh Summer Berries Garnishing the Tier 1 Ledge around Tier 2
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI * 2) / 10 + 0.2;
      const bx = Math.cos(a) * 1.68;
      const bz = Math.sin(a) * 1.68;

      if (i % 2 === 0) {
        // Ripe strawberry
        const straw = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 10), berryRedMat);
        straw.position.set(bx, 2.1, bz);
        straw.rotation.z = (Math.random() - 0.5) * 0.4;
        cakeGroup.add(straw);

        const calyx = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.04, 5), leafGreenMat);
        calyx.position.set(bx, 2.21, bz);
        cakeGroup.add(calyx);
      } else {
        // Blueberry cluster
        const blueb1 = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), blueberryMat);
        blueb1.position.set(bx, 2.05, bz);
        cakeGroup.add(blueb1);

        const blueb2 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), blueberryMat);
        blueb2.position.set(bx + 0.08, 2.04, bz + 0.06);
        cakeGroup.add(blueb2);
      }
    }

    // D. Tier 3 (Top Tier - Delicate Vanilla with Scalloped Crown)
    const tier3 = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.82, 40), cakeFrostingMat);
    tier3.position.y = 3.38;
    tier3.castShadow = true;
    tier3.receiveShadow = true;
    cakeGroup.add(tier3);

    // Top Tier Crown Piped Rosettes
    for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / 20) {
      const rx = Math.cos(a) * 0.89;
      const rz = Math.sin(a) * 0.89;
      const rosette = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), cakeFrostingMat);
      rosette.position.set(rx, 3.8, rz);
      cakeGroup.add(rosette);
    }

    // E. Magnificent Articulated Golden Snitch Topper
    const snitchGroup = new THREE.Group();
    snitchGroup.position.set(0, 4.35, 0);
    cakeGroup.add(snitchGroup);

    // 24K Gold Snitch Sphere with Quidditch Seams
    const snitchSphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), goldMat);
    snitchGroup.add(snitchSphere);

    const snitchSeam = new THREE.Mesh(new THREE.TorusGeometry(0.242, 0.015, 12, 32), goldMat);
    snitchSeam.rotation.x = Math.PI / 2;
    snitchGroup.add(snitchSeam);

    // Translucent Shimmering Feathered Wings
    const snitchWingMat = new THREE.MeshStandardMaterial({
      color: 0xfff8e7,
      metalness: 0.85,
      roughness: 0.18,
      transparent: true,
      opacity: 0.88,
    });

    const createSnitchWing = () => {
      const wing = new THREE.Group();
      // Primary wing feather quill
      const quill = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.035, 1.1, 8), goldMat);
      quill.position.set(0, 0.55, 0);
      wing.add(quill);

      // Feather vanes
      for (let f = 0; f < 5; f++) {
        const vaneLen = 0.85 - f * 0.12;
        const vane = new THREE.Mesh(new THREE.ConeGeometry(0.07, vaneLen, 4), snitchWingMat);
        vane.position.set(0.06 * (f + 1), 0.35 + f * 0.14, 0);
        vane.rotation.z = -0.25;
        wing.add(vane);
      }
      return wing;
    };

    const leftWing = createSnitchWing();
    leftWing.position.set(-0.25, 0.1, 0);
    leftWing.rotation.z = Math.PI / 3;
    snitchGroup.add(leftWing);

    const rightWing = createSnitchWing();
    rightWing.position.set(0.25, 0.1, 0);
    rightWing.rotation.z = -Math.PI / 3;
    rightWing.scale.x = -1;
    snitchGroup.add(rightWing);

    // F. Realistic Birthday Candles with Molten Wax Drips & Tear Flame
    const cakeCandles: { mesh: THREE.Group; light: THREE.PointLight }[] = [];
    const candlePos = [
      [-0.45, 3.8, -0.3],
      [0.45, 3.8, -0.3],
      [-0.4, 3.8, 0.35],
      [0.4, 3.8, 0.35],
      [0, 4.0, -0.55], // Rear candle
    ];

    candlePos.forEach(([cx, cy, cz]) => {
      const cBody = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.65, 12), candleWaxMat);
      cBody.position.set(cx, cy + 0.32, cz);
      cakeGroup.add(cBody);

      // Melted rim & wax drops
      const cRim = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.015, 8, 12), candleWaxMat);
      cRim.rotation.x = Math.PI / 2;
      cRim.position.set(cx, cy + 0.65, cz);
      cakeGroup.add(cRim);

      const cWick = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.1, 6), ironMat);
      cWick.position.set(cx, cy + 0.7, cz);
      cakeGroup.add(cWick);

      const cFlame = createRealisticFlameMesh();
      cFlame.scale.set(0.65, 0.75, 0.65);
      cFlame.position.set(cx, cy + 0.82, cz);
      cakeGroup.add(cFlame);

      const clight = new THREE.PointLight(0xffa01c, 1.4, 7);
      clight.position.set(cx, cy + 0.85, cz);
      cakeGroup.add(clight);

      cakeCandles.push({ mesh: cFlame, light: clight });
    });

    // G. Hogwarts Birthday Acceptance Letter Lying on the Table
    const letterGeo = new THREE.PlaneGeometry(1.9, 2.5, 16, 16);
    letterGeo.rotateX(-Math.PI / 2);
    // Subtle curl on the edges of the parchment for natural realism
    const pos = letterGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getZ(i);
      const curl = (Math.sin(u * 1.5) * Math.sin(v * 1.5) * 0.04) + (Math.abs(u) > 0.7 ? 0.025 : 0);
      pos.setY(i, curl);
    }
    pos.needsUpdate = true;

    const letterMat = new THREE.MeshStandardMaterial({
      map: parchmentTex,
      roughness: 0.88,
    });
    const letterMesh = new THREE.Mesh(letterGeo, letterMat);
    letterMesh.position.set(-1.8, 0.08, 0.2);
    letterMesh.rotation.y = 0.18;
    cakeGroup.add(letterMesh);

    // 3D Raised Crimson Hogwarts Wax Seal
    const waxSeal = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.06, 24), new THREE.MeshStandardMaterial({
      color: 0x8a0c14,
      roughness: 0.35,
      metalness: 0.1,
    }));
    waxSeal.position.set(-1.8, 0.14, -0.6);
    cakeGroup.add(waxSeal);

    // Trailing satin ribbons underneath the seal
    const ribbon1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.6), new THREE.MeshStandardMaterial({ color: 0x740001, roughness: 0.7 }));
    ribbon1.position.set(-1.75, 0.12, -0.3);
    ribbon1.rotation.y = 0.3;
    cakeGroup.add(ribbon1);

    const ribbon2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.55), goldMat);
    ribbon2.position.set(-1.85, 0.12, -0.3);
    ribbon2.rotation.y = -0.25;
    cakeGroup.add(ribbon2);

    // 8. Dynamic 3D Flying Birds in Ocean Sky
    const birds: { mesh: THREE.Group; speed: number; angle: number; radius: number; height: number; wingL: THREE.Group; wingR: THREE.Group }[] = [];
    for (let i = 0; i < 6; i++) {
      const birdObj = createRealisticBirdMesh();
      scene.add(birdObj.group);
      birds.push({
        mesh: birdObj.group,
        wingL: birdObj.wingL,
        wingR: birdObj.wingR,
        speed: 0.007 + i * 0.0016,
        angle: (i * Math.PI) / 3,
        radius: 70 + i * 15,
        height: 34 + (i % 3) * 8,
      });
    }

    // 9. Tropical Palm Trees Flanking Seaside Pavilion
    const createPalmTree = (px: number, pz: number) => {
      const palm = new THREE.Group();
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 0.88 });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 1.15, 18, 12), trunkMat);
      trunk.position.y = 9;
      trunk.rotation.z = (Math.random() - 0.5) * 0.22;
      palm.add(trunk);

      // Coconuts cluster
      const coconutMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.9 });
      for (let c = 0; c < 5; c++) {
        const coconut = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), coconutMat);
        coconut.position.set(Math.cos(c * 1.2) * 0.8, 17.6, Math.sin(c * 1.2) * 0.8);
        palm.add(coconut);
      }

      // Drooping Feather Palm Fronds
      const frondMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.65, side: THREE.DoubleSide });
      for (let f = 0; f < 10; f++) {
        const frond = new THREE.Mesh(new THREE.ConeGeometry(2.4, 9.5, 5), frondMat);
        frond.position.set(0, 18, 0);
        frond.rotation.z = Math.PI / 3 + Math.sin(f) * 0.1;
        frond.rotation.y = (f * Math.PI) / 5;
        palm.add(frond);
      }

      palm.position.set(px, 0, pz);
      scene.add(palm);
    };

    createPalmTree(-25, -15);
    createPalmTree(-28, 15);
    createPalmTree(26, -18);
    createPalmTree(28, 12);

    // 10. Ambient Golden Floating Dust Motes (Volumetric atmosphere)
    const dustMoteCount = 200;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustMoteCount * 3);
    for (let i = 0; i < dustMoteCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 24;
      dustPos[i + 1] = Math.random() * 12 + 2;
      dustPos[i + 2] = (Math.random() - 0.5) * 36;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.35,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    hallGroup.add(dustPoints);

    // =========================================================================
    // 11. CONTINUOUS 3D CAMERA SPLINE PATH
    // =========================================================================
    const cameraCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 48, 55),
      new THREE.Vector3(0, 22, 34),
      new THREE.Vector3(12, 6.5, 16),
      new THREE.Vector3(14, 5.0, -2),
      new THREE.Vector3(0, 4.8, -12),
      new THREE.Vector3(-12, 4.8, 2),
      new THREE.Vector3(-4, 4.4, 11),
      new THREE.Vector3(1.8, 4.4, 14.2), // RIGHT IN FRONT OF BIRTHDAY CAKE!
    ]);

    const lookAtCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 4, 0),
      new THREE.Vector3(0, 3.5, 6),
      new THREE.Vector3(0, 3.0, 4),
      new THREE.Vector3(0, 3.2, 0),
      new THREE.Vector3(0, 3.5, 4),
      new THREE.Vector3(1.8, 3.8, 9.5),
      new THREE.Vector3(1.8, 3.8, 9.5),
      new THREE.Vector3(1.8, 3.8, 9.5),
    ]);

    // Raycaster for clicking the cake
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (cakeMeshRef.current) {
        const intersects = raycaster.intersectObjects(cakeMeshRef.current.children, true);
        if (intersects.length > 0) {
          triggerCakeCelebration();
        }
      }
    };
    renderer.domElement.addEventListener("click", handleCanvasClick);

    // Touch & Mouse Wheel Gesture Listeners
    let touchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const delta = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      targetProgressRef.current = Math.max(0, Math.min(1, targetProgressRef.current + delta * 0.0022));
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetProgressRef.current = Math.max(0, Math.min(1, targetProgressRef.current + e.deltaY * 0.0009));
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("wheel", handleWheel, { passive: false });

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 12. ANIMATION LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Theme lighting transitions
      const isNight = themeRef.current === "night";
      skyMesh.material.color.lerp(new THREE.Color(isNight ? 0x050814 : 0x60a5fa), 0.05);
      scene.fog?.color.lerp(new THREE.Color(isNight ? 0x070b18 : 0x87ceeb), 0.05);
      ambientLight.color.lerp(new THREE.Color(isNight ? 0x1e293b : 0xfff8ee), 0.05);
      ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, isNight ? 0.35 : 1.05, 0.05);
      sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, isNight ? 0.0 : 2.8, 0.05);
      moonLight.visible = isNight;
      moonGroup.visible = isNight;
      starMat.opacity = THREE.MathUtils.lerp(starMat.opacity, isNight ? 0.95 : 0.0, 0.05);

      // Ocean wave dynamic vertex animation
      const posAttr = oceanGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const u = posAttr.getX(i);
        const v = posAttr.getZ(i);
        const wave = Math.sin(u * 0.08 + elapsed * 1.5) * 0.35 + Math.cos(v * 0.06 + elapsed * 1.2) * 0.25;
        posAttr.setY(i, wave);
      }
      posAttr.needsUpdate = true;

      // Floating Harry Potter Candles bobbing & swaying animation
      floatingCandles.forEach((c) => {
        c.mesh.position.y = c.baseHeight + Math.sin(elapsed * c.speed + c.offset) * 0.35;
        c.mesh.rotation.x = Math.sin(elapsed * 1.2 + c.offset) * c.swayX;
        c.mesh.rotation.z = Math.cos(elapsed * 1.4 + c.offset) * c.swayZ;
        c.light.intensity = 0.8 + Math.sin(elapsed * 8 + c.offset) * 0.25;
      });

      // Cake candle flame flicker & Snitch wings flutter
      cakeCandles.forEach((c, idx) => {
        c.light.intensity = 1.1 + Math.sin(elapsed * 12 + idx) * 0.35;
      });

      snitchGroup.position.y = 4.35 + Math.sin(elapsed * 2.5) * 0.08;
      leftWing.rotation.z = Math.PI / 3 + Math.sin(elapsed * 18) * 0.22;
      rightWing.rotation.z = -Math.PI / 3 - Math.sin(elapsed * 18) * 0.22;

      // Flying articulated birds
      birds.forEach((b) => {
        b.angle += b.speed;
        b.mesh.position.x = Math.cos(b.angle) * b.radius;
        b.mesh.position.z = Math.sin(b.angle) * b.radius;
        b.mesh.position.y = b.height + Math.sin(elapsed * 2 + b.angle) * 1.5;
        b.mesh.rotation.y = -b.angle + Math.PI / 2;

        const wingFlap = Math.sin(elapsed * 8 + b.angle) * 0.35;
        b.wingL.rotation.z = 0.2 + wingFlap;
        b.wingR.rotation.z = -0.2 - wingFlap;
      });

      // Dust motes drifting
      const dustPosArr = dustGeo.attributes.position;
      for (let i = 0; i < dustMoteCount; i++) {
        let dy = dustPosArr.getY(i) + Math.sin(elapsed + i) * 0.005;
        if (dy > 14) dy = 2;
        dustPosArr.setY(i, dy);
      }
      dustPosArr.needsUpdate = true;

      // Auto flight tour
      if (isAutoTourRef.current) {
        targetProgressRef.current += 0.0016;
        if (targetProgressRef.current >= 1) {
          targetProgressRef.current = 1;
        }
      }

      // Camera Damping along 3D Spline Curve
      progressRef.current = THREE.MathUtils.lerp(progressRef.current, targetProgressRef.current, 0.06);
      const t = Math.max(0, Math.min(1, progressRef.current));

      const camPos = cameraCurve.getPointAt(t);
      const camLook = lookAtCurve.getPointAt(t);

      camera.position.copy(camPos);
      camera.lookAt(camLook);

      setCameraProgress(t);
      if (t < 0.2) {
        setCurrentStageName("Stage 1: Top Aerial View of Great Hall & Coast");
      } else if (t < 0.45) {
        setCurrentStageName("Stage 2: Descending into Hogwarts Great Hall");
      } else if (t < 0.85) {
        setCurrentStageName("Stage 3: Orbiting Feast Table & House Banners");
      } else {
        setCurrentStageName("Stage 4: In Front of Birthday Cake & Letter 🎂");
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("wheel", handleWheel);
      renderer.domElement.removeEventListener("click", handleCanvasClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [viewMode]);

  // =========================================================================
  // HELPER 3D GEOMETRY GENERATORS FOR OBJECTS
  // =========================================================================

  function createRealisticFlameMesh() {
    const group = new THREE.Group();
    // Inner luminous white-blue flame core
    const coreGeo = new THREE.ConeGeometry(0.045, 0.18, 10);
    coreGeo.rotateX(Math.PI);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Outer warm amber flame tear
    const haloGeo = new THREE.ConeGeometry(0.08, 0.3, 10);
    haloGeo.rotateX(Math.PI);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    group.add(halo);

    return group;
  }

  function createRealisticGothicChair(woodMat: THREE.Material, velvetMat: THREE.Material, goldMat: THREE.Material) {
    const chair = new THREE.Group();

    // Seat frame
    const seatFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.16, 1.4), woodMat);
    seatFrame.position.y = 1.3;
    chair.add(seatFrame);

    // Plush Velvet Cushion
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.16, 1.24), velvetMat);
    cushion.position.y = 1.42;
    chair.add(cushion);

    // Brass Upholstery Studs around cushion perimeter
    for (let i = -0.55; i <= 0.55; i += 0.28) {
      [-0.58, 0.58].forEach((edge) => {
        const stud1 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), goldMat);
        stud1.position.set(i, 1.48, edge);
        chair.add(stud1);

        const stud2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), goldMat);
        stud2.position.set(edge, 1.48, i);
        chair.add(stud2);
      });
    }

    // High Arched Backrest
    const backStileL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8), woodMat);
    backStileL.position.set(-0.6, 2.5, -0.6);
    chair.add(backStileL);

    const backStileR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8), woodMat);
    backStileR.position.set(0.6, 2.5, -0.6);
    chair.add(backStileR);

    // Top Crest Rail & Finials
    const finialL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 6), woodMat);
    finialL.position.set(-0.6, 3.85, -0.6);
    chair.add(finialL);

    const finialR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 6), woodMat);
    finialR.position.set(0.6, 3.85, -0.6);
    chair.add(finialR);

    // Carved Pointed Arch Backrest Tracery Slats
    const backPanel = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.8, 0.08), woodMat);
    backPanel.position.set(0, 2.6, -0.6);
    chair.add(backPanel);

    // Turned front legs with ring mouldings
    const legGeo = new THREE.CylinderGeometry(0.07, 0.06, 1.3, 10);
    [[-0.58, 0.65, -0.58], [0.58, 0.65, -0.58], [-0.58, 0.65, 0.58], [0.58, 0.65, 0.58]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(x, y, z);
      chair.add(leg);
    });

    // Cross-stretchers
    const stretcher = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.06), woodMat);
    stretcher.position.set(0, 0.45, 0);
    chair.add(stretcher);

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
    // Silver Charger Plate with Beveled Rim
    const charger = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.62, 0.06, 24), silverMat);
    charger.position.set(x, tableY + 0.03, z);
    charger.castShadow = true;
    parent.add(charger);

    // Inner Gold Bread Plate
    const plateInner = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.48, 0.04, 20), goldMat);
    plateInner.position.set(x, tableY + 0.06, z);
    parent.add(plateInner);

    // Hogwarts Golden Goblet with Fluted Stem & Red Wine Meniscus
    const gobletGroup = new THREE.Group();
    const gBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.06, 16), goldMat);
    gobletGroup.add(gBase);

    const gStem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12), goldMat);
    gStem.position.y = 0.18;
    gobletGroup.add(gStem);

    const gBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.14, 0.45, 18), goldMat);
    gBowl.position.y = 0.52;
    gobletGroup.add(gBowl);

    const gWine = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.02, 16), wineMat);
    gWine.position.y = 0.66;
    gobletGroup.add(gWine);

    gobletGroup.position.set(x > 0 ? x + 0.55 : x - 0.55, tableY + 0.04, z - 0.55);
    gobletGroup.castShadow = true;
    parent.add(gobletGroup);
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
    const platterGroup = new THREE.Group();
    // Silver Oval Platter
    const platter = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.1, 0.1, 24), silverMat);
    platter.scale.set(1.4, 1, 0.95);
    platterGroup.add(platter);

    // Contoured Golden Roast Body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), roastMat);
    body.scale.set(1.3, 0.75, 0.9);
    body.position.y = 0.35;
    platterGroup.add(body);

    // Drumsticks with white chef frills
    [-0.32, 0.32].forEach((offsetZ) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.55, 10), roastMat);
      leg.position.set(0.65, 0.38, offsetZ);
      leg.rotation.z = Math.PI / 4;
      platterGroup.add(leg);

      const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8), new THREE.MeshStandardMaterial({ color: 0xfffbee }));
      bone.position.set(0.9, 0.55, offsetZ);
      bone.rotation.z = Math.PI / 4;
      platterGroup.add(bone);
    });

    // Rosemary garnishes
    for (let r = 0; r < 4; r++) {
      const rosemary = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.08), leafGreenMat);
      rosemary.position.set(-0.5 + r * 0.3, 0.15, 0.5);
      rosemary.rotation.y = (r * Math.PI) / 3;
      platterGroup.add(rosemary);
    }

    platterGroup.position.set(x, tableY + 0.05, z);
    parent.add(platterGroup);
  }

  function createFruitCornucopiaPlatter(
    parent: THREE.Group,
    x: number,
    tableY: number,
    z: number,
    silverMat: THREE.Material,
    berryRedMat: THREE.Material,
    blueberryMat: THREE.Material,
    leafGreenMat: THREE.Material
  ) {
    const fruitGroup = new THREE.Group();
    // Silver Pedestal Compote Bowl
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.45, 0.38, 20), silverMat);
    fruitGroup.add(bowl);

    // Royal Gala Red Apples with curved stems
    const apple1 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 14), berryRedMat);
    apple1.position.set(-0.35, 0.45, 0.1);
    fruitGroup.add(apple1);

    const apple2 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 14), berryRedMat);
    apple2.position.set(0.35, 0.42, -0.15);
    fruitGroup.add(apple2);

    // Cascading Concord Grapes bunch
    for (let g = 0; g < 22; g++) {
      const grape = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), blueberryMat);
      const angle = (g * 0.7) % (Math.PI * 2);
      const dist = 0.2 + (g / 22) * 0.55;
      grape.position.set(Math.cos(angle) * dist, 0.48 - (g / 22) * 0.3, Math.sin(angle) * dist);
      fruitGroup.add(grape);
    }

    // Grape vine leaf
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.35), leafGreenMat);
    leaf.position.set(0, 0.55, 0.4);
    leaf.rotation.y = 0.5;
    fruitGroup.add(leaf);

    fruitGroup.position.set(x, tableY + 0.1, z);
    parent.add(fruitGroup);
  }

  function createArtisanBreadBoard(
    parent: THREE.Group,
    x: number,
    tableY: number,
    z: number,
    darkOakMat: THREE.Material,
    goldMat: THREE.Material
  ) {
    const breadGroup = new THREE.Group();
    // Olive Wood Cutting Board
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.1), darkOakMat);
    breadGroup.add(board);

    // Crusty Scored Sourdough Boule
    const breadMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.75 });
    const boule = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10), breadMat);
    boule.scale.set(1.2, 0.65, 0.85);
    boule.position.set(-0.25, 0.25, 0);
    breadGroup.add(boule);

    // Braided Challah rolls
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.45, 10), breadMat);
    roll.rotation.z = Math.PI / 2;
    roll.position.set(0.4, 0.16, 0.1);
    breadGroup.add(roll);

    breadGroup.position.set(x, tableY + 0.04, z);
    parent.add(breadGroup);
  }

  function createBaroqueCandelabra(
    parent: THREE.Group,
    x: number,
    tableY: number,
    z: number,
    goldMat: THREE.Material,
    candleWaxMat: THREE.Material,
    flameMat: THREE.Material,
    flameHaloMat: THREE.Material
  ) {
    const candGroup = new THREE.Group();
    // Stepped Brass Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.32, 0.15, 16), goldMat);
    candGroup.add(base);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.3, 12), goldMat);
    stem.position.y = 0.7;
    candGroup.add(stem);

    // Curved S-Arms
    const armL = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.035, 8, 16, Math.PI), goldMat);
    armL.position.set(-0.35, 1.15, 0);
    candGroup.add(armL);

    const armR = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.035, 8, 16, Math.PI), goldMat);
    armR.position.set(0.35, 1.15, 0);
    armR.rotation.y = Math.PI;
    candGroup.add(armR);

    // 3 Taper Candles
    [-0.7, 0, 0.7].forEach((cx, idx) => {
      const cCup = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.06, 0.1, 10), goldMat);
      cCup.position.set(cx, 1.25, 0);
      candGroup.add(cCup);

      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.7, 10), candleWaxMat);
      candle.position.set(cx, 1.62, 0);
      candGroup.add(candle);

      const flame = createRealisticFlameMesh();
      flame.scale.set(0.65, 0.75, 0.65);
      flame.position.set(cx, 2.05, 0);
      candGroup.add(flame);
    });

    const pLight = new THREE.PointLight(0xf59e0b, 1.2, 8);
    pLight.position.set(0, 2.2, 0);
    candGroup.add(pLight);

    candGroup.position.set(x, tableY + 0.08, z);
    parent.add(candGroup);
  }

  function createRealisticBirdMesh() {
    const group = new THREE.Group();
    const plumageMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
    const wingTipMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });

    // Streamlined seagull body
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.4, 8), plumageMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    // Beak
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 6), beakMat);
    beak.rotation.x = -Math.PI / 2;
    beak.position.z = 0.8;
    group.add(beak);

    // Articulated wings with dark wingtips
    const wingL = new THREE.Group();
    const wingGeo = new THREE.BoxGeometry(1.6, 0.04, 0.45);
    const wMeshL = new THREE.Mesh(wingGeo, plumageMat);
    wMeshL.position.x = -0.8;
    wingL.add(wMeshL);
    const tipL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.45), wingTipMat);
    tipL.position.x = -1.55;
    wingL.add(tipL);
    group.add(wingL);

    const wingR = new THREE.Group();
    const wMeshR = new THREE.Mesh(wingGeo, plumageMat);
    wMeshR.position.x = 0.8;
    wingR.add(wMeshR);
    const tipR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.45), wingTipMat);
    tipR.position.x = 1.55;
    wingR.add(tipR);
    group.add(wingR);

    return { group, wingL, wingR };
  }

  const triggerCakeCelebration = () => {
    sound.playGiftUnbox();
    confetti({
      particleCount: 150,
      spread: 95,
      origin: { y: 0.6 },
      colors: ["#ffd700", "#740001", "#1a472a", "#0e1a40", "#ecb939", "#ffffff"],
    });
    setShowCakeModal(true);
  };

  const jumpToStage = (progressValue: number) => {
    sound.playSlideClick();
    targetProgressRef.current = progressValue;
    setIsAutoTour(false);
  };

  const toggleTheme = () => {
    sound.playSlideClick();
    setTheme((t) => (t === "day" ? "night" : "day"));
  };

  const toggleAudio = () => {
    const active = sound.toggleMusic((p) => setIsAudioPlaying(p));
    setIsAudioPlaying(active);
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-black">
      {/* View Mode Switching: 3D Interactive WebGL Scene vs Photorealistic Cinematic View */}
      {viewMode === "cinematic" ? (
        <div className="w-full h-full relative">
          <RealisticBeachHall />
          {/* Quick Return to 3D Button in HUD */}
          <button
            onClick={() => setViewMode("3d")}
            className="absolute top-20 right-6 z-50 px-4 py-2 rounded-full glass-luxury-gold text-amber-200 border border-amber-400/60 shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-bold hover:scale-105 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Switch to 3D Interactive Hall</span>
          </button>
        </div>
      ) : (
        <>
          {/* 1. Three.js Canvas Mount */}
          <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

          {/* 2. Top Header HUD with Hogwarts House Badges & Mode Switcher */}
          <header className="absolute top-5 inset-x-0 z-40 px-6 max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full glass-luxury border-amber-400/40 shadow-2xl backdrop-blur-xl">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="font-cinzel text-xs sm:text-sm font-bold tracking-widest text-amber-200">
                HOGWARTS SEASIDE GREAT HALL
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Cinematic Studio View Toggle */}
              <button
                onClick={() => setViewMode("cinematic")}
                className="hidden md:flex px-3.5 py-2 rounded-full glass-luxury border-amber-400/30 text-amber-200 text-xs sm:text-sm font-semibold items-center gap-1.5 hover:bg-white/10 transition-all shadow-xl"
                title="Switch to 4-Stage Studio Photographic View"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Cinematic View</span>
              </button>

              {/* Day / Night Theme Switcher */}
              <button
                onClick={toggleTheme}
                className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xl transition-all duration-300 border ${
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

              {/* Auto Flight Toggle */}
              <button
                onClick={() => {
                  sound.playSlideClick();
                  setIsAutoTour(!isAutoTour);
                }}
                className={`px-3.5 py-2 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  isAutoTour
                    ? "bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                    : "glass-luxury text-zinc-300 border-white/20 hover:text-white"
                }`}
                title="Auto-fly camera around the hall"
              >
                {isAutoTour ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span className="hidden sm:inline">{isAutoTour ? "Pause Tour" : "Auto Flight"}</span>
              </button>

              {/* Music Toggle */}
              <button
                onClick={toggleAudio}
                className={`p-2.5 rounded-full border transition-all ${
                  isAudioPlaying
                    ? "bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                    : "glass-luxury text-zinc-300 border-white/15 hover:border-amber-400/40"
                }`}
                title={isAudioPlaying ? "Mute Music" : "Play Birthday Music"}
              >
                {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* 3. Floating 3D Interactive Stage Indicator (Top Center) */}
          <div className="absolute top-20 inset-x-0 z-30 flex justify-center pointer-events-none">
            <div className="glass-luxury px-5 py-2 rounded-full border border-amber-400/30 text-xs sm:text-sm text-amber-200 font-medium flex items-center gap-2 shadow-2xl backdrop-blur-md">
              <Eye className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{currentStageName}</span>
            </div>
          </div>

          {/* 4. Tap The Cake Prompt when camera reaches the Cake */}
          {cameraProgress > 0.88 && !showCakeModal && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-auto">
              <button
                onClick={triggerCakeCelebration}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-rose-500 text-slate-950 font-black text-sm sm:text-base shadow-[0_0_40px_rgba(245,158,11,0.9)] border-2 border-white flex items-center gap-2 hover:scale-105 active:scale-95 transition-all animate-bounce cursor-pointer"
              >
                <Cake className="w-5 h-5 text-slate-950" />
                <span>⚡ TAP TO CUT THE HOGWARTS CAKE ⚡</span>
              </button>
            </div>
          )}

          {/* 5. Bottom 3D Flight Scrubber & Navigation */}
          <div className="absolute bottom-6 inset-x-0 z-40 px-4 max-w-2xl mx-auto flex flex-col items-center gap-3 pointer-events-auto">
            {/* Stage quick jump buttons */}
            <div className="flex items-center gap-2 w-full justify-between glass-luxury px-4 py-2.5 rounded-2xl border border-white/15 backdrop-blur-xl text-[11px] sm:text-xs">
              <button
                onClick={() => jumpToStage(0)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  cameraProgress < 0.2 ? "bg-amber-400 text-slate-950 shadow-[0_0_12px_#f59e0b]" : "text-zinc-400 hover:text-white"
                }`}
              >
                1. Top View
              </button>
              <button
                onClick={() => jumpToStage(0.35)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  cameraProgress >= 0.2 && cameraProgress < 0.55
                    ? "bg-amber-400 text-slate-950 shadow-[0_0_12px_#f59e0b]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                2. Enter Hall
              </button>
              <button
                onClick={() => jumpToStage(0.7)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  cameraProgress >= 0.55 && cameraProgress < 0.88
                    ? "bg-amber-400 text-slate-950 shadow-[0_0_12px_#f59e0b]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                3. Orbit Table
              </button>
              <button
                onClick={() => jumpToStage(1.0)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 ${
                  cameraProgress >= 0.88 ? "bg-amber-400 text-slate-950 shadow-[0_0_15px_#f59e0b]" : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>4. Cake</span>
                <Cake className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Swipe / Scroll Progress Slider */}
            <div className="w-full flex items-center gap-3">
              <span className="text-[10px] text-zinc-400 font-mono">Top</span>
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
              <span className="text-[10px] text-amber-300 font-mono font-bold">Cake</span>
            </div>

            <p className="text-[11px] text-zinc-300 drop-shadow flex items-center gap-1.5 font-light">
              <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Swipe, drag slider, or scroll mouse to fly inside and explore realistic objects</span>
            </p>
          </div>

          {/* 6. Royal Hogwarts Birthday Cake Celebration Modal */}
          {showCakeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-lg glass-luxury-gold rounded-3xl p-6 sm:p-10 border border-amber-400/60 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
                <button
                  onClick={() => setShowCakeModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] mb-6">
                  <Cake className="w-8 h-8 text-slate-950" />
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold font-serif-luxury text-amber-200 mb-3">
                  Happy Birthday, {siteContent.recipient.name}! 🎂✨
                </h3>

                <p className="text-zinc-200 text-sm sm:text-base leading-relaxed font-light mb-6">
                  You have arrived in front of the Hogwarts Birthday Cake and your special Birthday Acceptance Letter! The floating candles are glowing and the feast is prepared in your honor.
                </p>

                <div className="p-4 rounded-2xl bg-white/5 border border-amber-400/30 text-xs sm:text-sm text-amber-200 font-medium mb-6">
                  ⚡ <strong>Hogwarts Portal:</strong> Your official celebration is unlocked! Ready to unveil your personal memories and surprise gifts.
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      sound.playPop();
                      confetti({
                        particleCount: 120,
                        spread: 85,
                        origin: { y: 0.5 },
                      });
                    }}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Fireworks!</span>
                  </button>

                  <button
                    onClick={() => setShowCakeModal(false)}
                    className="px-5 py-2.5 rounded-full glass-card hover:bg-white/10 text-zinc-300 text-xs sm:text-sm font-semibold transition-all border-white/20 cursor-pointer"
                  >
                    Keep Exploring
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
