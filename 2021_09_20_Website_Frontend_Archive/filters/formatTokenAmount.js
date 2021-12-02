Vue.filter("formatTokenAmount", value => {
  return String(value)
    .padStart(10, '0')
    .replace(/\d{9}$/, ".$&")
    .replace(/(?=(\d{3})+(?!\d))(?=.*\.)(?!^)/g, ',');
});

export default {};
