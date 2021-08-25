const contexts = require.context("./", true, /index.js$/);
const globalCompoents = contexts.keys().reduce((prev, key) => {
    const component = contexts(key).default
    if (component)
        prev[component.name] = component
    return prev
}, {});
export default {
    install: (Vue) => {
        Object.keys(globalCompoents).forEach(key => {
            Vue.component(key, globalCompoents[key])
        })
    }
}