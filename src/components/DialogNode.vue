<script setup>
import { Handle, Position } from '@vue-flow/core'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps(['id', 'connections', 'position','screenRect'])
const emit = defineEmits(['selectionMoveUp','selectionMoveDown','selectionRemoved','nodeRemoved', 'inputChange','inScreenChange'])
const requirePush = defineModel('requirePush', {default:false})

watch(requirePush, (newVal, oldVal)=>{
  if(newVal&&isDirty) {
    handlePush()
    requirePush.value = false
  }
})

const selectionIdCount = ref(0)
const nodeInput = ref(
  {
    speakerName: '',
    text: '',
    nextMode: 'condition',
    nextDefault: undefined,
    selections: []
  }
)
const lastNodeInput = ref({
  speakerName: '',
  text: '',
  nextMode: 'condition',
  nextDefault: undefined,
  selections: []
})

const nextModes = [
  {
    value: 'condition',
    label: 'Condition'
  },
  {
    value: 'select',
    label: 'Select'
  }
]

const conditionOptions = ref([
  {
    label: 'Familiar0',
    value: 'Familiar0'
  },
  {
    label: 'Familiar1',
    value: 'Familiar1'
  },
  {
    label: 'Familiar2',
    value: 'Familiar2'
  },
  {
    label: 'Familiar3',
    value: 'Familiar3'
  },
  {
    label: 'HasFamiliarReward',
    value: 'HasFamiliarReward'
  }
])

const triggerOptions = ref([
  {
    label: 'SubmitMission',
    value: 'SubmitMission'
  },
  {
    label: 'TestFunction',
    value: 'TestFunction'
  }
])

function handleRemoveSelection(index) {
  nodeInput.value.selections.splice(index, 1)
  emit('selectionRemoved', props.id, index, nodeInput.value.selections.length)
}

function handleMoveUp(index) {
  if (index <= 0) return
  let temp = nodeInput.value.selections[index]
  nodeInput.value.selections[index] = nodeInput.value.selections[index - 1]
  nodeInput.value.selections[index - 1] = temp
  emit('selectionMoveUp', props.id, index - 1, index)
}

function handleMoveDown(index) {
  if (index >= nodeInput.value.selections.length - 1) return
  let temp = nodeInput.value.selections[index]
  nodeInput.value.selections[index] = nodeInput.value.selections[index + 1]
  nodeInput.value.selections[index + 1] = temp
  emit('selectionMoveDown', props.id, index + 1, index)
}

function addSelection() {
  nodeInput.value.selections.push(
    {
      id: selectionIdCount.value,
      text: '',
      condition: null,
      trigger: null,
      next: undefined
    }
  )
  selectionIdCount.value++
}

function handlePush() {
  //to server
  copyNodeInputData()
}

const isDirty = computed(()=> {
  if (props.id === 'New dialog') {
    return true
  } else if (nodeInput.value.text !== lastNodeInput.value.text) {
    return true
  } else if (nodeInput.value.speakerName !== lastNodeInput.value.speakerName) {
    return true
  } else if (nodeInput.value.nextMode !== lastNodeInput.value.nextMode) {
    return true
  } else if (nodeInput.value.selections.length !== lastNodeInput.value.selections.length) {
    return true
  } else {
    for (let i = 0; i < nodeInput.value.selections.length; i++) {
      if (nodeInput.value.selections[i].id !== lastNodeInput.value.selections[i].id) {
        return true
      } else if (nodeInput.value.selections[i].text !== lastNodeInput.value.selections[i].text) {
        return true
      } else if (nodeInput.value.selections[i].condition !== lastNodeInput.value.selections[i].condition) {
        return true
      } else if (nodeInput.value.selections[i].trigger !== lastNodeInput.value.selections[i].trigger) {
        return true
      }
    }
  }

  if(props.connections['nextDefault'] !== lastNodeInput.value.nextDefault) {
    return true
  }

  for(let i = 0; i < lastNodeInput.value.selections.length; i++) {
    if(props.connections['next'+i] !== lastNodeInput.value.selections[i].next) {
      return true;
    }
  }
  return false
})

function hasUpdate(){
  return false
}

function copyNodeInputData(){
  lastNodeInput.value = JSON.parse(JSON.stringify(nodeInput.value))
  lastNodeInput.value.nextDefault = props.connections['nextDefault']
  for(let i = 0; i < lastNodeInput.value.selections.length; i++) {
    lastNodeInput.value.selections[i].next = props.connections['next'+i]
  }
}

watch(isDirty, (newVal, oldVal)=>{
  emit('inputChange', props.id, newVal)
})

const nodeHeight = computed(()=>{
  return nodeInput.value.selections.length * 130 + 275
})

const inScreen = ref(true)
const inScreenTimer = ref()

function recalculateInScreen() {
  if(!props.screenRect) return true
  let newVal = props.position.x+400 > props.screenRect.x1&&props.screenRect.x2 > props.position.x&&
    props.position.y+nodeHeight.value > props.screenRect.y1&&props.screenRect.y2 > props.position.y
  if(newVal !== inScreen.value) {
    inScreen.value = newVal
    emit('inScreenChange', props.id, newVal)
  }
}

onMounted(()=>{
  copyNodeInputData()
  inScreenTimer.value = setInterval(recalculateInScreen, 200)
})

onUnmounted(()=>{
  clearTimeout(inScreenTimer.value)
})
</script>

<template>
  <div>
    <n-flex vertical style="gap: 0" v-if="inScreen">
      <n-h6 prefix="bar" style="margin: 0">
        <n-text type="primary">
          Dialog &ensp;
        </n-text>
        <n-text depth="3">
          {{ props.id }}
        </n-text>
        <n-button :tertiary="!isDirty" type="primary" style="position: absolute; right: 67px; top:2px; width: 50px" size="tiny"
                  @click="handlePush">
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
        <n-popconfirm
          :show-icon="false"
          @positive-click="$emit('nodeRemoved', props.id)"
          :positive-button-props="{type:'error', ghost:true}"
        >
          <template #trigger>
            <n-button tertiary type="error" size="tiny" style="position: absolute; right: 10px; top: 2px; width: 50px"
                      @click="()=>{if(id==='New dialog')$emit('nodeRemoved', props.id)}">
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
          <span style="width:100%;text-align: center">Remove dialog node</span>
        </n-popconfirm>
      </n-h6>
      <n-card
        style="height: 200px;padding-top: 8px"
        hoverable>
        <n-input
          class="nodrag"
          v-model:value="nodeInput.speakerName"
          type="text"
          placeholder="Speaker Name"
          style="margin-bottom: 20px;"
        >
        </n-input>
        <n-input
          class="nodrag"
          v-model:value="nodeInput.text"
          type="textarea"
          placeholder="Dialog Content"
          style="margin-bottom: 20px"
          :autosize="{
              minRows: 2,
              maxRows: 2,
            }"
        >
        </n-input>
        <n-space style="vertical-align: center">
          <span style="margin-right: 20px;font-weight: bold;font-size: 14px">Mode</span>
          <n-radio-group v-model:value="nodeInput.nextMode" size="large" style="height: 100%; vertical-align: center">
            <n-radio
              style="margin:auto"
              v-for="mode in nextModes"
              :key="mode.value"
              :value="mode.value"
              :label="mode.label"
            />
          </n-radio-group>
        </n-space>
      </n-card>
      <n-card
        v-for="(selection, index) in nodeInput.selections"
        hoverable
        header-style="height:20px;font-size: 14px"
        :title="'Selection '+(index+1)"
        style="height: 130px"
      >
        <template #header-extra>
          <n-button-group style="padding-top: 3px; position: absolute; right: 25px" size="tiny">
            <n-button text type="info" @click="handleMoveUp(index)" style="padding-left: 8px">
              <template #icon>
                <n-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">
                    <path d="M16 4L6 14l1.41 1.41L15 7.83V28h2V7.83l7.59 7.58L26 14L16 4z" fill="currentColor"></path>
                  </svg>
                </n-icon>
              </template>
            </n-button>
            <n-button text type="info" @click="handleMoveDown(index)" style="padding-left: 8px">
              <template #icon>
                <n-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">
                    <path d="M24.59 16.59L17 24.17V4h-2v20.17l-7.59-7.58L6 18l10 10l10-10l-1.41-1.41z"
                          fill="currentColor"></path>
                  </svg>
                </n-icon>
              </template>
            </n-button>
            <n-popconfirm
              :show-icon="false"
              @positive-click="handleRemoveSelection(index)"
              :positive-button-props="{type:'error', ghost:true}"
              style="margin-left: 8px"
            >
              <template #trigger>
                <n-button text type="warning" style="padding-left: 8px">
                  <template #icon>
                    <n-icon>
                      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                           viewBox="0 0 512 512">
                        <path
                          d="M289.94 256l95-95A24 24 0 0 0 351 127l-95 95l-95-95a24 24 0 0 0-34 34l95 95l-95 95a24 24 0 1 0 34 34l95-95l95 95a24 24 0 0 0 34-34z"
                          fill="currentColor"></path>
                      </svg>
                    </n-icon>
                  </template>
                </n-button>
              </template>
              <span style="width:100%;text-align: center">Remove selection {{ index + 1 }}</span>
            </n-popconfirm>
          </n-button-group>
        </template>
        <n-flex vertical>
          <n-input
            class="nodrag"
            v-model:value="selection.text"
            type="text"
            placeholder="Selection Text"
          />
          <n-flex align="center" style="flex-wrap: nowrap;gap:8px">
            <n-select style="" size="small" v-model:value="selection.condition" :options="conditionOptions"
                      placeholder="Condition" />
            <n-select style="" size="small" v-model:value="selection.trigger" :options="triggerOptions"
                      placeholder="Trigger" />
          </n-flex>
        </n-flex>
      </n-card>
      <n-button type="info" tertiary style="width: 400px; margin-top: 6px" @click="addSelection">
        Add selection
      </n-button>
    </n-flex>

    <Handle id="left" :position="Position.Left" type="target" style="top:130px"></Handle>
    <Handle id="nextDefault" :position="Position.Right" type="source"
            style="background-color: cornflowerblue;top:130px"></Handle>
    <Handle
      v-for="(selection, index) in nodeInput.selections"
      :id="'next'+index"
      :position="Position.Right"
      type="source"
      :style="'background-color: grey; top:'+ (300 + 135 * (index)) +'px'">
    </Handle>
  </div>
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
  width: 400px;
  border-radius: 8px;
  margin-top: 5px;
  border-width: 3px;
}

.n-card:hover{
  border-color: #63e2b7;
}
</style>