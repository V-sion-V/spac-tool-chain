<script setup>
import { VueFlow } from '@vue-flow/core'
import { ref } from 'vue'

</script>

<template>
  <n-flex vertical style="height: 100%; width: 100%">
    <n-card style="margin: auto; width: 500px;padding: 20px">
      <n-flex vertical>
        <n-h1 prefix="bar"> Spac Toolchain </n-h1>
        <n-form>
          <n-form-item label="Username">
            <n-input></n-input>
          </n-form-item>
          <n-form-item label="Password">
            <n-input></n-input>
          </n-form-item>
        </n-form>
        <n-button tertiary type="success">
          Login
        </n-button>
      </n-flex>
    </n-card>
  </n-flex>
</template>


<style scoped>

</style>