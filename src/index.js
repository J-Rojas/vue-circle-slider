import CircleSlider from './components/CircleSlider.vue'
import LinearSlider from './components/LinearSlider.vue'

// Install the components
export function install (Vue) {
  Vue.component('circle-slider', CircleSlider)
  Vue.component('linear-slider', LinearSlider)
  /* -- Add more components here -- */
}

// Expose the components
export {
  CircleSlider,
  LinearSlider
  /* -- Add more components here -- */
}

/* -- Plugin definition & Auto-install -- */
/* You shouldn't have to modify the code below */

// Plugin
const plugin = {
  /* eslint-disable no-undef */
  version: 'v1.0',
  install
}

export default plugin

// Auto-install
let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(plugin)
}
