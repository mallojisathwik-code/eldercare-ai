/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        companion: {
          bg: "#FBF7F1",
          ink: "#2B2620",
          accent: "#C9683D",
          calm: "#4F6E5C",
          alert: "#B3432F",
        },
        dusk: {
          sky: "#161B33",
          plum: "#2B2154",
          amber: "#F2A65A",
          rose: "#E8927C",
          mist: "#FAF6ED",
        },
      },
      fontSize: {
        base: ["1.125rem", "1.75rem"],
        lg: ["1.375rem", "2rem"],
        xl: ["1.75rem", "2.25rem"],
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        body: ['"Plus Jakarta Sans"', "sans-serif"],
      },
      keyframes: {
        "ring-pulse": {
          "0%": { transform: "scale(0.8)", opacity: "0.5" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(2deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        "star-twinkle": {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        "wave-flow": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "depth-drift": {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "25%": { transform: "translate3d(10px, -15px, 20px)" },
          "50%": { transform: "translate3d(-5px, -25px, 40px)" },
          "75%": { transform: "translate3d(-15px, -10px, 20px)" },
          "100%": { transform: "translate3d(0, 0, 0)" },
        },
        "card-enter": {
          "0%": { opacity: "0", transform: "translateY(40px) rotateX(8deg)" },
          "100%": { opacity: "1", transform: "translateY(0) rotateX(0deg)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(120px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(120px) rotate(-360deg)" },
        },
      },
      animation: {
        "ring-pulse-1": "ring-pulse 4s ease-out infinite",
        "ring-pulse-2": "ring-pulse 4s ease-out infinite 1.3s",
        "ring-pulse-3": "ring-pulse 4s ease-out infinite 2.6s",
        drift: "drift 6s ease-in-out infinite",
        "fade-up": "fade-up 0.7s ease-out both",
        float: "float 8s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "star-twinkle": "star-twinkle 3s ease-in-out infinite",
        "wave-flow": "wave-flow 2.5s ease-in-out infinite",
        "depth-drift": "depth-drift 20s ease-in-out infinite",
        "card-enter": "card-enter 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        orbit: "orbit 6s linear infinite",
      },
    },
  },
  plugins: [],
};
