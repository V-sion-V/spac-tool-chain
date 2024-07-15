<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <n-config-provider :theme="darkTheme" style="padding:0; width: 100%;height: 100%">
    <n-message-provider style="padding:0; width: 100%;height: 100%">
      <div style="padding:0; width: 100%;height: 100%">
        <RouterView style="padding: 0"/>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script>
import { defineComponent } from 'vue'
import { darkTheme } from 'naive-ui'

export default defineComponent({
  setup() {
    return {
      darkTheme
    }
  }
})
</script>

<style scoped>
html,body{
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>