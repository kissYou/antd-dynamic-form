let spacing = Array.from({ length: 21 })
  .map((i, index) => index * 5)
  .reduce((pre, value) => {
    pre[String(value)] = value === 0 ? "0" : value + "px";
    return pre;
  }, {});

module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  important: true,
  darkMode: false, // or 'media' or 'class'
  theme: {
    spacing,
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
