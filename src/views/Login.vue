<script setup>
import sha256 from 'crypto-js/sha256.js'
import { computed, inject, ref } from 'vue'
const $cookies = inject('$cookies');

const userName = ref('')
const password = ref('')
function tryLogin() {
  let passwordHash = sha256(password.value).toString()

}

const isLoginValid = computed(()=>{
  return userName.value.length >= 6 && password.value.length >= 6
})
</script>

<template>
  <n-flex vertical style="height: 100%; width: 100%">
    <n-card style="margin: auto; width: 500px;padding: 20px">
      <n-flex vertical>
        <n-h1 prefix="bar"> Login Spac Toolchain </n-h1>
        <n-form>
          <n-form-item label="Username">
            <n-input v-model:value="userName"></n-input>
          </n-form-item>
          <n-form-item label="Password">
            <n-input v-model:value="password"></n-input>
          </n-form-item>
        </n-form>
        <n-button :type="isLoginValid?'success':'default'" :disabled="!isLoginValid" @click="tryLogin">
          Login
        </n-button>
      </n-flex>
    </n-card>
  </n-flex>
</template>


<style scoped>

</style>