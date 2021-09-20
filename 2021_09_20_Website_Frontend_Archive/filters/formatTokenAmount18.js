Vue.filter("formatTokenAmount18", value => {
  return String(value)
    .padStart(19, '0')
    .replace(/\d{18}$/, ".$&")
    .replace(/(?=(\d{3})+(?!\d))(?=.*\.)(?!^)/g, ',');
});

export default {};
