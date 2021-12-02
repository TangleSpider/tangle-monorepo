import "../components/Container.js";

let app = new Vue({
    el: "#app",
    template:
        `<div style="display:flex;align-items:center">
            <img style="filter: blur(3px);position:absolute;z-index:-2;opacity:0.05;width:200%;left:-50%" src="../images/tangleLogo_7_5.png">
            <container />
        </div>`
});
