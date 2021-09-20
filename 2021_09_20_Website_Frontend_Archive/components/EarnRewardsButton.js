Vue.component("earn-rewards-button", {
  data() {
    return {
      styleObject: {
        marginBottom: 15,
        fontSize: 45
      }
    }
  },
  props: ["earnRewardsContainerVisible"],
  template:
  `<div
    class="textButton earnRewardsButton"
    :style=styleObject
  >
    {{ (earnRewardsContainerVisible ? "Hide" : "Show") + " Earning Options"}}
  </div>`
});

export default {}
