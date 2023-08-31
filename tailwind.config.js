/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff666f",
      },
    },
    animation: {
      bubble: "bubble var(--animation-duration) linear",
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
    },
  },
  plugins: [],
};
