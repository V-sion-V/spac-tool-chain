<script setup>
import { RouterView, useRoute } from 'vue-router'
import { inject, onMounted, watch } from 'vue'
import router from '@/router/index.js'
const $cookies = inject('$cookies')
const route = useRoute()

watch(()=>route.fullPath, (newVal, oldVal)=>{
  if (newVal!==oldVal) {
    //checkToken()
  }
})

onMounted(()=>{
  //checkToken()
})

function checkToken() {
  let token = $cookies.get('token')
  if (token) {
    //todo: check token by backend
    if (route.path === '/login') router.push('/')
  } else {
    if (route.path !== '/login') router.push('/login')
  }
}
</script>

<template>
  <n-config-provider :theme="darkTheme" style="padding:0; width: 100%;height: 100%">
    <n-message-provider>
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