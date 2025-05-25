/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark_blue: "rgb(11, 48, 66)", // thêm màu tuỳ chỉnh ở đây
        camel: "rgb(167, 129, 92)",
        logo_color: "rgb(229, 156, 54)",
        green_starbuck: "#006241"
      },
    },
  },
  plugins: [],
}

