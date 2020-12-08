<template>
  <canvas 
    v-if="enable"
    id="canvas"
    class="ml-n8 my-n5 my-sm-n7 my-md-n9 my-lg-n10"
  ></canvas>
  <div 
    v-else
    class="ml-5 text-h1 font-weight-black"
  >
    Jonathan Liu
  </div>
</template>

<script>
import { init, animate, changeCanvasOptions } from '@/js/drawTextFragments.js'

export default {
  name: 'Name',

  props: {
    enable: {type: Boolean, default: false}
  },

  mounted() {
    const canvas = document.getElementById('canvas')
    init(canvas, {width: this.getCanvasWidth()})
    animate()
  },

  watch: {
    '$vuetify.breakpoint.width': {
      handler() {
       changeCanvasOptions({width: this.getCanvasWidth()})
      },
    }
  },

  methods: {
    getCanvasWidth() {
      // Gets canvas width relative to screen breakpoints
      if (this.$vuetify.breakpoint.lgAndUp) {
        return 700
      } else if (this.$vuetify.breakpoint.mdOnly) {
        return 600
      } else if (this.$vuetify.breakpoint.smOnly) {
        return 500
      } else {
        return 250
      }
    }
  },
}
</script>