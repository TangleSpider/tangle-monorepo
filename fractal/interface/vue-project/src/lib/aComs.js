import { defineAsyncComponent } from "vue";
window.aComs = (coms, root=null) => Object.fromEntries(
    coms.map(com =>
        [
            com,
            defineAsyncComponent(() =>
                import(`../components${root ?? ""}/${com}.vue`)
            )
        ]
    )
);
