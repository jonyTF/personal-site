<template>
  <span>
    <div class="banner-wat"></div>
    <v-container>
      <v-row justify="center">
        <IntroSection/>
      </v-row>
    </v-container>
  </span>
</template>

<style scoped>
.banner-wat {
  width: 100%;
  height: 300px;
  background-color: lightslategray;
  margin-bottom: -200px;
}
</style>

<script>
import IntroSection from '@/components/IntroSection'

export default {
  name: 'Home',

  components: {
    IntroSection
  },
}
</script>
