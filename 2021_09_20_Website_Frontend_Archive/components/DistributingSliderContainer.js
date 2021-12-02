import './DistributingSliderTrack.js';
import './DistributingSliderRange.js';
import './DistributingSliderHandle.js';
import './DistributingSliderTooltip.js';
import './DistributingSliderLabel.js';

Vue.component("distributing-slider-container", {
  data() {
    return {
      styleObject: {
        width: 315,
        height: 100,
        backgroundColor: "#0000",
        userSelect: "none",
        position: "relative"
      },
      stateObject: {
        mouseDown: false,
        widthPercentage: 0
      }
    }
  },
  template:
  `<div style="display:flex;justify-content:center;width:100%;max-height:70">
    <div
      :style=styleObject
      @mousedown=handleMouseDown
      @mouseup=handleMouseUp
      @mouseleave=handleMouseLeave
      @mousemove=handleMouseMove
      @touchstart=handleTouchStart
      @touchend=handleTouchEnd
      @touchcancel=handleTouchCancel
      @touchmove=handleTouchMove
    >
      <distributing-slider-track />
      <slider-range
        :widthPercentage=stateObject.widthPercentage
      />
      <distributing-slider-handle
        :widthPercentage=stateObject.widthPercentage
      />
      <distributing-slider-tooltip
        :widthPercentage=stateObject.widthPercentage
      />
    </div>
  </div>`,
  methods: {
    handleMouseDown: function(e) {
      this.mouseDown = true;
      this.handleMouseMove(e);
    },
    handleTouchStart: function(e) {
      this.mouseDown = true;
      this.handleMouseMove(e);
    },
    handleMouseUp: function() {
      this.mouseDown = false;
    },
    handleTouchEnd: function() {
      this.mouseDown = false;
    },
    handleMouseLeave: function() {
      this.mouseDown = false;
    },
    handleTouchCancel: function() {
      this.mouseDown = false;
    },
    handleMouseMove: function(e) {
      if (this.mouseDown) {
        let widthPercentage;
        if (e.target == this.$el.firstChild) {
          if (e.offsetX)
            widthPercentage = Math.round(e.offsetX * 100 / this.styleObject.width);
          if (!e.offsetX && e.targetTouches)
            widthPercentage = Math.round((e.targetTouches[0].clientX - e.target.offsetLeft) * 100 / this.styleObject.width);
        }
        if (e.target != this.$el.firstChild) {
          if (e.offsetX)
            widthPercentage = Math.round((e.offsetX + e.target.offsetLeft) * 100 / this.styleObject.width);
          if (!e.offsetX && e.targetTouches && e.target.parentNode == this.$el)
            widthPercentage = Math.round((e.targetTouches[0].clientX - e.target.parentNode.offsetLeft - e.target.parentNode.offsetLeft) * 100 / this.styleObject.width);
          if (!e.offsetX && e.targetTouches && e.target.parentNode != this.$el && e.targetTouches)
            widthPercentage = Math.round((e.targetTouches[0].clientX - e.target.parentNode.offsetLeft) * 100 / this.styleObject.width);
        }
        widthPercentage = isNaN(widthPercentage) ? 0 : Math.max(0, Math.min(100, widthPercentage));
        this.stateObject.widthPercentage = widthPercentage;
        if (!this.$root.TNGL)
          this.$root.TNGL = { state: {} };
        this.$root.TNGL.state.distributingSliderPosition = widthPercentage;
        this.$root.$emit("distributingSliderChange");
      }
    },
    handleTouchMove: function(e) {
      this.handleMouseMove(e);
    }
  }
});

export default {}
