export interface SlidePhoto {
  id: string;
  url: string;
  title: string;
  caption: string;
  date?: string;
}

export const siteContent = {
  recipient: {
    name: "My Best Friend",
    nickname: "Partner in Crime ✨",
    birthdayDate: "Special Day",
    age: "Another Fabulous Year",
    tagline: "Celebrating the most extraordinary person in the world today."
  },
  hero: {
    badge: "🎁 A Special Birthday Gift Just For You",
    headline: "Happy Birthday,",
    subheadline: "May your day sparkle with joy, laughter, and endless magical moments.",
    giftBoxHint: "Tap the luxury gift box below to unwrap your surprise",
    giftLetter: {
      title: "To Someone Truly Irreplaceable 💖",
      message: "On this special day, I want you to know how grateful I am to have you in my life. You bring so much light, comfort, and unconditional joy wherever you go. Life's greatest adventures are the ones we share together.",
      signature: "With all my love and warmest wishes ✨"
    }
  },
  slideshow: {
    title: "Cinematic Memory Reel",
    subtitle: "A journey through our favorite smiles, laughs, and unforgettable adventures",
    defaultSlides: [
      {
        id: "slide-1",
        url: "/images/photo1.jpg",
        title: "Golden Smiles & Endless Laughter",
        caption: "Where every little conversation turned into hours of joy.",
        date: "Cherished Moments"
      },
      {
        id: "slide-2",
        url: "/images/photo2.jpg",
        title: "Adventures & Spontaneous Trips",
        caption: "The crazy paths we walked, making memories at every step.",
        date: "Unforgettable Times"
      },
      {
        id: "slide-3",
        url: "/images/photo3.jpg",
        title: "Through Thick and Thin",
        caption: "Always having each other's back no matter what comes our way.",
        date: "Always Together"
      },
      {
        id: "slide-4",
        url: "/images/photo4.jpg",
        title: "Quiet Moments & Deep Talks",
        caption: "The conversations that made us realize what true friendship is.",
        date: "Heartfelt Bonds"
      },
      {
        id: "slide-5",
        url: "/images/photo5.jpg",
        title: "Pure Joy & Unfiltered Happiness",
        caption: "Nothing compares to the light you bring into every room.",
        date: "Pure Magic"
      },
      {
        id: "slide-6",
        url: "/images/photo6.jpg",
        title: "Celebrating Every Milestone",
        caption: "Cheering for you today, tomorrow, and in every chapter ahead.",
        date: "Milestones"
      },
      {
        id: "slide-7",
        url: "/images/photo7.jpg",
        title: "To Many More Chapters Together",
        caption: "Here is to another year of health, wealth, love, and wild dreams!",
        date: "Forever & Always"
      }
    ] as SlidePhoto[]
  },
  cake: {
    title: "Make a Birthday Wish",
    subtitle: "Blow out the candles and send your biggest dreams out into the universe",
    instruction: "Tap on the candles or click the button below to blow them out!",
    candlesCount: 5,
    wishMessage: "✨ Wish Granted! May every star align to make all your dreams and aspirations come true this year!"
  },
  wishes: [
    {
      id: 1,
      tag: "Health & Joy",
      title: "Boundless Happiness",
      content: "May your days be packed with positive energy, glowing health, peaceful thoughts, and reasons to smile every morning.",
      icon: "Sparkles"
    },
    {
      id: 2,
      tag: "Dreams & Ambition",
      title: "Unstoppable Success",
      content: "May every goal you set this year turn into your greatest triumph. Never doubt how capable and inspiring you are.",
      icon: "Trophy"
    },
    {
      id: 3,
      tag: "Love & Bonds",
      title: "Deep & Lasting Love",
      content: "May you always be surrounded by genuine souls who cherish you, support you, and celebrate who you truly are.",
      icon: "Heart"
    },
    {
      id: 4,
      tag: "Adventure",
      title: "Wild Adventures",
      content: "To new horizons, scenic getaways, spontaneous laughter, and stories we will still be laughing about decades from now.",
      icon: "Compass"
    }
  ]
};
