<template>
  <canvas id="canvas"></canvas>
</template>

<style scoped>
#canvas {
  position: absolute;
  left: 100px;
  border: 1px solid white;
}
</style>

<script>
import { init, animate, changeCanvasOptions } from '@/js/drawTextFragments.js'

export default {
  name: 'Name',

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
        return 1000
      } else if (this.$vuetify.breakpoint.mdOnly) {
        return 800
      } else {
        return 500
      }
    }
  },
}
</script>