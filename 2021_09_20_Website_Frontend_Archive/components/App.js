import "/components/AppContainer.js";

Vue.filter("format5DigitToPercentage", value => {
  return String(value)
    .padStart(3, '0')
    .replace(/(?=\d\d$)/, ".")
});

Vue.filter("formatTokenAmount", value => {
  return String(value)
    .padStart(10, '0')
    .replace(/\d{9}$/, ".$&")
    .replace(/(?=(\d{3})+(?!\d))(?=.*\.)(?!^)/g, ',');
});

/*Vue.filter("formatTokenAmount", value => {
  if (typeof value !== "number")
    return "NaN";
  return value
    .toString()
    .padStart(10, '0')
    .replace(/\d{9}$/, ".$&")
    .replace(/(?=(\d{3})+(?!\d))(?=.*\.)(?!^)/g, ',');;
});*/

let app = new Vue({
  el: "#app",
  template:
    `<div>
      <app-container />
    </div>`
});
