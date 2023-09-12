/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff666f",
        "primary-dark": "#6b2e32",
      },
      backgroundImage: {
        "primary-circle":
          "radial-gradient(closest-side, #ff666f 50%, #000000 50%)",
      },
    },
    animation: {
      bubble: "bubble var(--animation-duration) linear",
      "bubble-fade-in": "bubble-fade-in 500ms linear",
      "bubble-fade-out": "bubble-fade-out 500ms linear",
    },
    keyframes: {
      bubble: {
        "0%": {
          left: "50%",
          top: "50%",
          width: "50px",
          height: "50px",
        },
        "80%": {
          width: "50px",
          height: "50px",
        },
        "100%": {
          left: "var(--target-left)",
          top: "var(--target-top)",
          width: "0px",
          height: "0px",
        },
      },
      "bubble-fade-in": {
        "0%": {
          opacity: 1,
          transform: "scale(0) transform(-50%, -50%)",
          "transform-origin": "center center",
          filter: "blur(25px)",
        },
        "100%": {
          opacity: 1,
          transform: "scale(1) transform(-50%, -50%)",
          "transform-origin": "center center",
          filter: "blur(1px)",
        },
      },
      "bubble-fade-out": {
        "0%": {
          opacity: 1,
          transform: "scale(1) transform(-50%, -50%)",
          "transform-origin": "center center",
          filter: "blur(1px)",
        },
        "100%": {
          opacity: 1,
          transform: "scale(0) transform(-50%, -50%)",
          "transform-origin": "center center",
          filter: "blur(25px)",
        },
      },
    },
  },
  plugins: [],
};
