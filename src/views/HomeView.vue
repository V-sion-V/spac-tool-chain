<script setup>
import { VueFlow } from '@vue-flow/core'
import { ref } from 'vue'
import router from '@/router/index.js'

</script>

<template>
  <n-layout style="height: 100%; width: 100%;padding: 40px">
    <n-flex vertical style="width: 100%;height: 100%;" justify="center">
      <n-flex style="margin: 0 auto;padding-bottom: 70px">
        <n-h1 prefix="bar" style="font-size: 100px"> Spac Toolchain </n-h1>
      </n-flex>
      <n-flex justify="center" style="width: 100%;height: 30%;gap: 50px">
        <n-card style="width: 20%;cursor: pointer;" hoverable
                @click="router.push('/dialog')"
        >
          <n-h1 prefix="bar" type="success">
            Dialog Editor
          </n-h1>
          Edit dialogs with a flow diagram.
        </n-card>
        <n-card style="width: 20%" hoverable>
        </n-card>
        <n-card style="width: 20%" hoverable>
        </n-card>
        <n-card style="width: 20%" hoverable>
        </n-card>
      </n-flex>
    </n-flex>
  </n-layout>
</template>


<style scoped>
.n-card{
  border-radius: 10px;
}
.n-card:hover{
  background-color: rgba(42, 148, 125, 0.25);
}
</style>