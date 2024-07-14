<script setup>
import { Handle, Position } from '@vue-flow/core'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps(['id'])
const data = defineModel('data')
const emit = defineEmits(['inputChange','requirePush'])

const isDirty = computed(()=> {
  return data.value.outConnections.nextDefault !== data.value.lastNext
})

watch(()=>isDirty.value, (newVal, oldVal)=>{
  emit('inputChange',props.id, newVal)
})

onMounted(()=>{
  emit('inputChange',props.id, isDirty.value)
})
</script>

<template>
  <n-flex vertical align="center" style="gap: 7px">
    <n-button :tertiary="!isDirty" type="primary" style="width: 50px" size="tiny"
              @click="emit('requirePush', data, true)">
      <template #icon>
        <n-icon>
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">
            <path d="M11 18l1.41 1.41L15 16.83V29h2V16.83l2.59 2.58L21 18l-5-5l-5 5z" fill="currentColor"></path>
            <path
              d="M23.5 22H23v-2h.5a4.5 4.5 0 0 0 .36-9H23l-.1-.82a7 7 0 0 0-13.88 0L9 11h-.86a4.5 4.5 0 0 0 .36 9H9v2h-.5A6.5 6.5 0 0 1 7.2 9.14a9 9 0 0 1 17.6 0A6.5 6.5 0 0 1 23.5 22z"
              fill="currentColor"></path>
          </svg>
        </n-icon>
      </template>
    </n-button>
    <n-card
      size="large"
      hoverable>
      <n-text strong style="font-size: 24px;text-align: center">Start</n-text>
    </n-card>
    <Handle id="nextDefault" :position="Position.Right" type="source"
            style="background-color: cornflowerblue;right: 1px;top: 74px"></Handle>
  </n-flex>
</template>

<style scoped>

.vue-flow__handle {
  height: 36px;
  width: 10px;
  border-radius: 5px;
  border-width: 1px;
  border-color: #484848;
  background-color: deeppink;
}

.n-card {
  display: flex;
  border-radius: 8px;
  border-width: 3px;
  border-color: #63e2b7;
}
</style>