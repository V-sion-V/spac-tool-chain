<script setup>
import { Handle, Position } from '@vue-flow/core'

const props = defineProps(['id', 'label'])
</script>

<template>
  <div>
    <n-card
      title="Start"
      hoverable>
    </n-card>
    <Handle id="nextDefault" :position="Position.Right" type="source"
            style="background-color: cornflowerblue;"></Handle>
  </div>
</template>

<style scoped>

.vue-flow__handle {
  height: 24px;
  width: 10px;
  border-radius: 4px;
  background-color: deeppink;
}

.n-card {
  display: flex;
  border-radius: 8px;
  background-color: teal;
}
</style>