Vue.filter("format5DigitToPercentage", value => {
  return String(value)
    .padStart(3, '0')
    .replace(/(?=\d\d$)/, ".")
});

export default {};
