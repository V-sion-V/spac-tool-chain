<script setup>
import sha256 from 'crypto-js/sha256.js'
import { computed, inject, ref } from 'vue'
import { createRouter as $router } from 'vue-router/dist/vue-router.esm-browser.js'
import axios from 'axios'
import { useMessage } from 'naive-ui'

const $cookies = inject('$cookies')

const loginContext = ref({
  userName: '',
  password: '',
  isLoginLoading: false
})

const registerContext = ref({
  userName: '',
  password: '',
  repeatPassword: '',
  isRegisterLoading: false
})

const message = useMessage()

function tryLogin() {
  if (!isLoginValid.value) return
  loginContext.value.isLoginLoading = true
  let passwordHash = sha256(loginContext.value.password).toString()
  axios.post('/login', {
    userName: loginContext.value.userName,
    password: passwordHash
  }).then((res) => {
    $cookies.set('token', res.data.token)
    loginContext.value.isLoginLoading = false
    $router.push('/')
  }).catch(e => {
    loginContext.value.isLoginLoading = false
    $cookies.set('token', 12312312312312)
    message.error('Login failed, please check your username and password', { duration: 0, closable: true })
  })
}

function tryRegister() {
  if (!isRegisterValid.value) return
  registerContext.value.isRegisterLoading = true
  let passwordHash = sha256(registerContext.value.password).toString()
  axios.post('/register', {
    userName: registerContext.value.userName,
    password: passwordHash
  }).then((res) => {
    $cookies.set('token', res.data.token)
    loginContext.value.isLoginLoading = false
    $router.push('/')
  }).catch(e => {
    registerContext.value.isRegisterLoading = false
    message.error('Register failed, please check your username and password', { duration: 0, closable: true })
  })
}

const isLoginValid = computed(() => {
  return loginContext.value.userName.length >= 6 && loginContext.value.password.length >= 6
})

const isRegisterValid = computed(() => {
  return registerContext.value.userName.length >= 6 && registerContext.value.password.length >= 6 && registerContext.value.password === registerContext.value.repeatPassword
})
</script>

<template>
  <n-flex vertical style="height: 100%; width: 100%">
    <n-card style="margin: auto; width: 500px;padding: 20px">
      <n-spin :show="loginContext.isLoginLoading || registerContext.isRegisterLoading">
        <n-flex vertical>
          <n-h1 prefix="bar" style="margin-bottom: 5px"> Spac Toolchain</n-h1>
          <n-tabs
            class="card-tabs" type="line" animated size="medium"
            default-value="signin"
            pane-wrapper-style="margin: 0 -4px"
            pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
          >
            <n-tab-pane name="signin" tab="Login">
              <n-flex vertical style="gap: 0">
                <n-form-item label="Username">
                  <n-input v-model:value="loginContext.userName"
                           placeholder="Please enter your username"
                  />
                </n-form-item>
                <n-form-item label="Password">
                  <n-input type="password"
                           show-password-on="mousedown"
                           v-model:value="loginContext.password"
                           placeholder="Please enter your password"
                  />
                </n-form-item>
              </n-flex>
              <n-button type="primary" block strong :disabled="!isLoginValid" @click="tryLogin">
                Login
              </n-button>
            </n-tab-pane>
            <n-tab-pane name="signup" tab="Register">
              <n-flex vertical style="gap: 0">
                <n-form-item label="Username">
                  <n-input v-model:value="registerContext.userName"
                           placeholder="Username must be at least 6 characters long"
                  />
                </n-form-item>
                <n-form-item label="Password">
                  <n-input type="password"
                           show-password-on="mousedown"
                           v-model:value="registerContext.password"
                           placeholder="Password must be at least 6 characters long"
                  />
                </n-form-item>
                <n-form-item label="Repeat Password">
                  <n-input type="password"
                           show-password-on="mousedown"
                           v-model:value="registerContext.repeatPassword"
                           placeholder="Please repeat your password"
                  />
                </n-form-item>
              </n-flex>
              <n-button type="primary" block strong :disabled="!isRegisterValid" @click="tryRegister">
                Register
              </n-button>
            </n-tab-pane>
          </n-tabs>
        </n-flex>
      </n-spin>
    </n-card>
  </n-flex>
</template>


<style scoped>

.n-card {
  display: flex;
  width: 400px;
  border-radius: 8px;
  margin-top: 5px;
  border-width: 3px;
}

.n-card:hover {
  border-color: #63e2b7;
}
</style>