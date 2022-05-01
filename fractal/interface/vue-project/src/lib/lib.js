import { defineAsyncComponent } from "vue";
window.coms = function(
    coms,
    path = Error().stack.match(/(http.*?).vue/)[1]
) {
    return coms.reduce((p, c) =>
        (p[c] = defineAsyncComponent(() => import(`${path}/${c}.vue`)), p),
        {}
    );
};
window.foo = function(coms) {
    console.log(import.meta);
};
