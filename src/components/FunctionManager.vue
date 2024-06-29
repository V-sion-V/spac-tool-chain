<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import router from '@/router/index.js'
import axios from 'axios'

const show = defineModel('show', { required: true })
const props = defineProps(['functionType'])
const functionDrawerContext = ref({
  loading: true,
  currentIndex: -1,
  functionList: [
    {
      id: '00001',
      functionName: 'SubFamiliar0',
      description: 'VVVVVVVVVVVVVVVVVVVVVVVVV_sion'
    }, {
      id: '00002',
      functionName: 'SubFamiliar1',
      description: 'VVVVVVVVVVVVVVVVVVVVVVVVV_sion'
    }
  ]
})

watch(show, (val)=>{
  if(val) loadDrawerContent()
})

function loadDrawerContent() {
  functionDrawerContext.value.currentIndex = -1
  functionDrawerContext.value.loading = true
  axios.post('/function/getList', { isCondition: props.functionType === 'condition' }).then((res) => {
    functionDrawerContext.value.loading = false
    functionDrawerContext.value.functionList = res.data.list
    functionDrawerContext.value.functionList.sort((a, b) => a.functionName.localeCompare(b.functionName))
  }).catch((e) => {
    console.log(e)
  })
}

function changeCurrentFunction(index) {
  functionDrawerContext.value.currentIndex = index
}

const editDrawerContext = ref({
  show: false,
  addMode: false,
  editIndex: -1,
  confirmLoading: false,
  formValue: {
    id: '',
    functionName: '',
    description: ''
  }
})

function addFunction() {
  editDrawerContext.value.show = true
  editDrawerContext.value.confirmLoading = false
  editDrawerContext.value.addMode = true
  editDrawerContext.value.editIndex = -1
  editDrawerContext.value.formValue = {
    id:'',
    functionName: '',
    description: ''
  }
}

function editFunction(index) {
  editDrawerContext.value.show = true
  editDrawerContext.value.confirmLoading = false
  editDrawerContext.value.addMode = false
  editDrawerContext.value.editIndex = index
  editDrawerContext.value.formValue = {
    id: functionDrawerContext.value.functionList[index].id,
    functionName: functionDrawerContext.value.functionList[index].functionName,
    description: functionDrawerContext.value.functionList[index].description
  }
}

const validateEditForm = computed(()=>{
  let funcName = editDrawerContext.value.formValue.functionName
  if(!funcName || funcName==='') return 'Please input function name'
  if(functionDrawerContext.value.functionList.find(p=>p.functionName === funcName && p.id !== editDrawerContext.value.formValue.id))
    return 'Function name exits'
  return null
})

function applyDeleteFunction(index) {
  axios.post('/function/delete', {
    isCondition: props.functionType === 'condition',
    id: functionDrawerContext.value.functionList[index].id
  }).then((res)=>{
    loadDrawerContent()
  })
}

function applyEditFunction() {
  if(!validateEditForm.value) {
    editDrawerContext.value.confirmLoading = true
    axios.post('/function/update', {
      isCondition: props.functionType === 'condition',
      id: editDrawerContext.value.formValue.id,
      functionName: editDrawerContext.value.formValue.functionName,
      description: editDrawerContext.value.formValue.description
    }).then((res)=>{
      editDrawerContext.value.confirmLoading = false
      editDrawerContext.value.show = false
      loadDrawerContent()
    }).catch((e)=>{
      editDrawerContext.value.confirmLoading = false
    })
  }
}

function applyAddFunction() {
  if(!validateEditForm.value) {
    editDrawerContext.value.confirmLoading = true
    axios.post('/function/add', {
      isCondition: props.functionType === 'condition',
      functionName: editDrawerContext.value.formValue.functionName,
      description: editDrawerContext.value.formValue.description
    }).then((res)=>{
      editDrawerContext.value.confirmLoading = false
      editDrawerContext.value.show = false
      loadDrawerContent()
    }).catch((e)=>{
      editDrawerContext.value.confirmLoading = false
    })
  }
}
</script>

<template>
  <n-drawer v-model:show="show" :width="400" placement="right">
    <n-drawer-content body-content-style="padding:0;">
      <n-spin v-if="functionDrawerContext.loading"
              style="width: 100%; height: 400px"
              size="large" />
      <n-flex v-else vertical style="height: 100%;width: 400px;gap:0">
        <n-flex style="padding: 20px 20px">
          <n-h2 type="success" style="margin-bottom: 0" prefix="bar">
            {{ functionType === 'condition' ? 'Condition' : 'Trigger' }} Function List
          </n-h2>
          <n-button circle quaternary type="success" style="position: absolute; right: 20px" @click="addFunction">
            <template #icon>
              <n-icon>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 28 28">
                  <g fill="none">
                    <path d="M24 13h-9V4a1 1 0 1 0-2 0v9H4a1 1 0 1 0 0 2h9v9a1 1 0 1 0 2 0v-9h9a1 1 0 1 0 0-2z"
                          fill="currentColor"></path>
                  </g>
                </svg>
              </n-icon>
            </template>
          </n-button>
        </n-flex>
        <n-divider style="margin: 0;" />
        <n-scrollbar style="max-height: 100%">
          <n-flex style="width: 100%;padding:20px;" vertical>
            <n-card v-for="(item, index) in functionDrawerContext.functionList" hoverable
                    @click="changeCurrentFunction(index)"
            >
              <template #header>
                <n-space>
                  <n-h3 type="info" style="margin-bottom: 0;" prefix="bar" align-text>
                    <n-text>
                      <n-ellipsis style="max-width: 200px">
                        {{ item.functionName }}
                      </n-ellipsis>
                    </n-text>
                  </n-h3>
                </n-space>
              </template>
              <template #header-extra>
                <n-button circle quaternary @click="editFunction(index)" style="margin-right: 5px">
                  <template #icon>
                    <n-icon>
                      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                           viewBox="0 0 32 32">
                        <path d="M2 26h28v2H2z" fill="currentColor"></path>
                        <path
                          d="M25.4 9c.8-.8.8-2 0-2.8l-3.6-3.6c-.8-.8-2-.8-2.8 0l-15 15V24h6.4l15-15zm-5-5L24 7.6l-3 3L17.4 7l3-3zM6 22v-3.6l10-10l3.6 3.6l-10 10H6z"
                          fill="currentColor"></path>
                      </svg>
                    </n-icon>
                  </template>
                </n-button>
                <n-popconfirm
                  @positive-click="applyDeleteFunction(index)"
                  placement="left"
                  :positive-button-props="{type:'error'}"
                  :show-icon="false"
                >
                  <template #trigger>
                    <n-button circle quaternary type="error">
                      <template #icon>
                        <n-icon>
                          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                               viewBox="0 0 32 32">
                            <path d="M12 12h2v12h-2z" fill="currentColor"></path>
                            <path d="M18 12h2v12h-2z" fill="currentColor"></path>
                            <path d="M4 6v2h2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8h2V6zm4 22V8h16v20z"
                                  fill="currentColor"></path>
                            <path d="M12 2h8v2h-8z" fill="currentColor"></path>
                          </svg>
                        </n-icon>
                      </template>
                    </n-button>
                  </template>
                  <n-text style="margin:auto;text-align: center">
                    Delete function
                  </n-text>
                </n-popconfirm>

              </template>
              <n-text depth="3" style="font-size: small">
                {{ item.description }}
              </n-text>
            </n-card>
          </n-flex>
        </n-scrollbar>
      </n-flex>
    </n-drawer-content>
  </n-drawer>
  <n-drawer v-model:show="editDrawerContext.show" :width="400">
    <n-drawer-content body-content-style="padding:0;">
      <n-flex vertical style="height: 100%;width: 400px;gap:0">
        <n-flex style="padding: 20px 20px">
          <n-h2 type="info" style="margin-bottom: 0" prefix="bar">
            {{ editDrawerContext.addMode ? 'Add' : 'Edit' }}
            {{ functionType === 'condition' ? 'Condition' : 'Trigger' }} Function
          </n-h2>
        </n-flex>
        <n-divider style="margin: 0;" />
        <n-scrollbar style="max-height: 100%">
          <n-spin :show="editDrawerContext.confirmLoading"
                  style="height: 100%;width: 100%">
            <n-flex style="width: 100%;padding:20px;" vertical>
              <n-form-item label="Function name" show-require-mark
                           :validation-status="validateEditForm?'error':undefined"
                           :feedback="validateEditForm"
              >
                <n-input v-model:value="editDrawerContext.formValue.functionName" placeholder="">
                </n-input>
              </n-form-item>
              <n-form-item label="Description" >
                <n-input v-model:value="editDrawerContext.formValue.description" placeholder=""
                         type="textarea" :autosize="{minRows: 1,maxRows: 10}"
                >
                </n-input>
              </n-form-item>
              <n-button :disabled="!!validateEditForm || editDrawerContext.confirmLoading"
                        @click="editDrawerContext.addMode?applyAddFunction():applyEditFunction()">
                <template #icon>
                  <n-icon>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                         viewBox="0 0 32 32">
                      <path d="M13 24l-9-9l1.414-1.414L13 21.171L26.586 7.586L28 9L13 24z" fill="currentColor"></path>
                    </svg>
                  </n-icon>
                </template>
                Confirm
              </n-button>
            </n-flex>
          </n-spin>
        </n-scrollbar>
      </n-flex>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>

</style>