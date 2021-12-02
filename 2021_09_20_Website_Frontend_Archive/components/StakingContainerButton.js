Vue.component("staking-container-button", {
  props: ["containerVisible"],
  template: '<div class="textButton">{{ (containerVisible ? "Hide" : "Show") + " Staking Options"}}</div>'
});

export default {}
