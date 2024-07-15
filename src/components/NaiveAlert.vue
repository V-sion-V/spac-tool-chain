<script setup>
import { useMessage } from 'naive-ui'
import { watch } from 'vue'
const message = useMessage()
const show = defineModel('show')
const props = defineProps(['type','message'])

watch(show, (newVal, oldVal)=>{
  if(newVal === true) {
    show.value = false
    if(props.type === 'info') {
      message.info(props.message)
    }
  }
})
</script>

<template>

</template>

<style scoped>

</style>