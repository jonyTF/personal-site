<template>
  <v-card max-width="1000" :elevation="5">
    <v-container fluid>
      <v-row>
        <v-col cols="auto" class="ml-6 my-3 pa-0">
          <v-img
            max-height="200"
            max-width="200"
            transition="slide-x-transition"
            src="@/assets/jonathan_headshot_square.jpg"
            class="rounded-lg"
          ></v-img>
        </v-col>
        <v-col cols="auto" class="pt-6">
          <Name :enable="true"/>
          <div 
            id="subtitle"
            class="pl-2 mt-n2 ml-4 mb-4 text-h5 font-weight-light"
          >Passionate developer and entrepreneur</div>
          <div class="ml-4">
            <v-btn icon class="rounded-lg social-btn mr-2" color="white" :elevation="1">
              <v-icon>mdi-linkedin</v-icon>
            </v-btn>
            <v-btn icon class="rounded-lg social-btn mr-2" color="white" :elevation="1">
              <v-icon>mdi-github</v-icon>
            </v-btn>
            <v-btn icon class="rounded-lg social-btn mr-2" color="white" :elevation="1">
              <v-icon>mdi-pdf-box</v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<style scoped>
.social-btn {
  background-color: lightgray;
}

#subtitle {
  border-left: 1px solid black;
  z-index: 5;
}
</style>

<script>
import Name from '@/components/Name'

export default {  
  components: {
    Name
  },
}
</script>