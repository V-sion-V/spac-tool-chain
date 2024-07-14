<script setup>

import { computed, ref } from 'vue'
import axios from 'axios'
import router from '@/router/index.js'
import { useThemeVars } from 'naive-ui'
import draggable from 'vuedraggable'

function animate(duration, timing, update, complete) {
  let start = performance.now()
  requestAnimationFrame(function animate(time) {
    let timeFraction = (time - start) / duration
    if (timeFraction > 1) timeFraction = 1

    update(timing(timeFraction))

    if (timeFraction < 1) {
      requestAnimationFrame(animate)
    } else {
      complete()
    }
  })
}

const npcListContext = ref({
  loading: true,
  currentNpcIndex: -1,
  npcList: [
    { id: '00001', npcID: 'TestNPC_1', name: 'V_sion1' },
    { id: '00002', npcID: 'TestNPC_2', name: 'V_sion2' },
    { id: '00003', npcID: 'TestNPC_3', name: 'V_sion3' },
    { id: '00004', npcID: 'TestNPC_4', name: 'V_sion4' },
    { id: '00005', npcID: 'TestNPC_5', name: 'V_sion5' },
    { id: '00006', npcID: 'TestNPC_6', name: 'V_sion6' },
    { id: '00007', npcID: 'TestNPC_7', name: 'V_sion7' },
    { id: '00008', npcID: 'TestNPC_8', name: 'V_sion8' }
  ]
})

const npcInfoContext = ref({
  loading: false,
  isEditMode: false,
  currentFamiliarLevel: -1,
  leftPanelHidePercentage: 0,
  lastDraggedIndex: -1,
  savedCurrentNpcInfo: {
    id: '',
    npcID: '',
    name: '',
    familiarList: []
  },
  currentNpcInfo: {
    id: '',
    npcID: '',
    name: '',
    familiarList: []
  }
})

loadNpcList()

function loadNpcList() {
  npcListContext.value.loading = true
  npcListContext.value.currentNpcIndex = -1
  if(npcInfoContext.value.isEditMode) exitEditMode()
  axios.post('/npc/getList').then((res) => {
    npcListContext.value.loading = false
    npcListContext.value.npcList = res.data.npcList
    npcListContext.value.npcList.sort((a, b) => a.npcID.localeCompare(b.npcID))
  }).catch((e) => {
    console.log(e) //todo:show error message
  })
}

function changeCurrentNpc(index) {
  npcListContext.value.currentNpcIndex = index
  npcInfoContext.value.loading = true
  npcInfoContext.value.currentFamiliarLevel = -1
  npcInfoContext.value.isEditMode = false
  axios.post('/npc/getInfo', { id: npcListContext.value.npcList[index].id }).then((res) => {
    npcInfoContext.value.loading = false
    npcInfoContext.value.currentNpcInfo = res.data
    npcInfoContext.value.savedCurrentNpcInfo = JSON.parse(JSON.stringify(npcInfoContext.value.currentNpcInfo))
  }).catch((e) => {
    console.log(e) //todo:show error message
  })
}

function changeCurrentFamiliar(level) {
  npcInfoContext.value.currentFamiliarLevel = level
}

const familiarLevelInfo = computed(() => {
  return npcInfoContext.value.currentNpcInfo.familiarList[npcInfoContext.value.currentFamiliarLevel]
})

function enterEditMode() {
  npcInfoContext.value.isEditMode = true
  animate(
    250,
    (x)=>1-Math.pow(1-x, 3),
    (x)=>npcInfoContext.value.leftPanelHidePercentage = x,
    ()=>{}
  )
}

function enterAddMode() {
  npcListContext.value.currentNpcIndex = -1
  npcInfoContext.value.currentFamiliarLevel = -1
  npcInfoContext.value.currentNpcInfo = {id:'',name:'',npcID:'', familiarList:[]}
  npcInfoContext.value.savedCurrentNpcInfo = JSON.parse(JSON.stringify(npcInfoContext.value.currentNpcInfo))
  enterEditMode()
}

function addLocalFamiliarLevel() {
  npcInfoContext.value.currentNpcInfo.familiarList.push({
    id:'',
    maxSubFamiliarLevel:1,
    dialogCount:0
  })
}

function deleteLocalFamiliarLevel(level) {
  npcInfoContext.value.currentNpcInfo.familiarList.splice(level, 1)
  if(level >= npcInfoContext.value.currentNpcInfo.familiarList.length)
    npcInfoContext.value.currentFamiliarLevel = level - 1
}

function exitEditMode() {
  npcInfoContext.value.isEditMode = false
  npcInfoContext.value.currentNpcInfo = JSON.parse(JSON.stringify(npcInfoContext.value.savedCurrentNpcInfo))
  animate(
    250,
    (x)=>1-Math.pow(1-x, 3),
    (x)=>npcInfoContext.value.leftPanelHidePercentage = 1-x,
    ()=>{}
  )
}

const isDirty = computed(()=>{
  let current = npcInfoContext.value.currentNpcInfo
  let origin = npcInfoContext.value.savedCurrentNpcInfo

  if(origin.npcID !== current.npcID) return true;
  if(origin.name !== current.name) return true;
  if(origin.id !== current.id) return true;
  if(origin.familiarList.length !== current.familiarList.length) return true;
  for(let i = 0; i < origin.familiarList.length; i++) {
    if(origin.familiarList[i].maxSubFamiliarLevel !== current.familiarList[i].maxSubFamiliarLevel) return true;
    if(origin.familiarList[i].id !== current.familiarList[i].id) return true;
  }
  return false
})

const isValid = computed(()=>{
  let current = npcInfoContext.value.currentNpcInfo
  let origin = npcInfoContext.value.savedCurrentNpcInfo
  if(!current.npcID || current.npcID ==='') return false
  if(current.npcID !== origin.npcID && npcListContext.value.npcList.find(p=>p.npcID === current.npcID)) return false;
  if(!current.name || current.name === '') return false;
  return true
})

function applyCurrentChanges() {
  let current = npcInfoContext.value.currentNpcInfo
  if(!current.id || current.id ==='') {
    let data = {npcID:current.npcID, name: current.name, familiarList: []}
    current.familiarList.forEach(i=>data.familiarList.push({maxSubFamiliarLevel: i.maxSubFamiliarLevel}))
    axios.post('/npc/add', data).then((res)=>{
      loadNpcList()
    }).catch((e)=>{
      console.log(e)//todo:show error message
    })
  } else {
    let data = {id:current.id, npcID:current.npcID, name: current.name, familiarList: []}
    current.familiarList.forEach(i=>data.familiarList.push({maxSubFamiliarLevel: i.maxSubFamiliarLevel, id: i.id}))
    axios.post('/npc/update', data).then((res)=>{
      loadNpcList()
    }).catch((e)=>{
      console.log(e)//todo:show error message
    })
  }
}

function applyDeleteCurrentNpc() {
  let currentID = npcInfoContext.value.currentNpcInfo.id
  axios.post('/npc/delete', { id: currentID }).then((res) => {
    loadNpcList()
  }).catch((e) => {
    console.log(e)//todo:show error message
  })
}

function getDraggableCardClass(index) {
  if(index === npcInfoContext.value.lastDraggedIndex) {
    return 'force-selected-hovered-n-card'
  } else if(npcInfoContext.value.lastDraggedIndex !== -1) {
    return 'n-card'
  } else if(index === npcInfoContext.value.currentFamiliarLevel) {
    return 'selected-n-card'
  } else return 'hovered-n-card'
}

</script>

<template>
  <div style="width: 100%;height: 100%">
    <n-spin v-if="npcListContext.loading"
            style="width: 100%; height: 100%"
            size="large" />
    <n-flex v-else justify="left"
            :style="'height: 100%;column-gap: 0;margin-left:'+(-npcInfoContext.leftPanelHidePercentage*30/0.7)+'%'">
      <n-flex vertical style="max-height: 100%;width: 30% ;gap:0">
        <n-flex style="padding: 20px 20px">
          <n-h2 type="success" style="margin-bottom: 0;" prefix="bar">
            NPC List
          </n-h2>
          <n-flex justify="right" style="gap:0;flex:1">
            <n-button circle tertiary type="info" style="margin: auto 5px" @click="enterAddMode()">
              <template #icon>
                <n-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                       viewBox="0 0 28 28">
                    <g fill="none">
                      <path d="M24 13h-9V4a1 1 0 1 0-2 0v9H4a1 1 0 1 0 0 2h9v9a1 1 0 1 0 2 0v-9h9a1 1 0 1 0 0-2z"
                            fill="currentColor"></path>
                    </g>
                  </svg>
                </n-icon>
              </template>
            </n-button>
            <n-button circle tertiary type="primary" style="margin: auto 5px" @click="router.push('/')">
              <template #icon>
                <n-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                       viewBox="0 0 32 32">
                    <path
                      d="M16.612 2.214a1.01 1.01 0 0 0-1.242 0L1 13.419l1.243 1.572L4 13.621V26a2.004 2.004 0 0 0 2 2h20a2.004 2.004 0 0 0 2-2V13.63L29.757 15L31 13.428zM18 26h-4v-8h4zm2 0v-8a2.002 2.002 0 0 0-2-2h-4a2.002 2.002 0 0 0-2 2v8H6V12.062l10-7.79l10 7.8V26z"
                      fill="currentColor"></path>
                  </svg>
                </n-icon>
              </template>
            </n-button>
          </n-flex>
        </n-flex>
        <n-divider style="margin: 0;" />
        <n-scrollbar style="max-height: 100%">
          <n-flex style="width: 100%;padding:20px;" vertical>
            <n-card v-for="(npc, index) in npcListContext.npcList" hoverable
                    v-bind:key="index"
                    :class="index===npcListContext.currentNpcIndex?'selected-n-card':'hovered-n-card'"
                    @click="changeCurrentNpc(index)"
            >
              <template #header>
                <n-h3 :type="index===npcListContext.currentNpcIndex?'success':'info'"
                      style="margin-bottom: 0;width: 100%" prefix="bar" align-text>
                  <n-text>
                    <n-ellipsis style="max-width: 90%">
                      {{ npc.name }}
                    </n-ellipsis>
                  </n-text>
                </n-h3>
              </template>
              <template #header-extra>
                <n-text depth="3" style="font-size: small">
                  <n-ellipsis style="max-width: 100%">
                    {{ npc.npcID }}
                  </n-ellipsis>
                </n-text>
              </template>
            </n-card>
          </n-flex>
        </n-scrollbar>
      </n-flex>
      <n-divider vertical style="height: 100%;margin-right: 0;margin-left: -1px" />
      <n-flex vertical style="flex:1;height: 100%">
        <n-empty
          v-if="!npcInfoContext.isEditMode && (npcListContext.currentNpcIndex < 0 || npcListContext.currentNpcIndex>=npcListContext.npcList.length)"
          description="Select a NPC to check information."
          style="margin: auto;align-items: center"
          size="huge"
        >
        </n-empty>
        <n-spin v-else-if="npcInfoContext.loading"
                style="width: 100%; height: 100%"
                size="large" />
        <n-flex v-else vertical style="height: 100%;gap: 0">
          <n-flex style="margin: 0; gap: 0">
            <n-h2 type="default" style="margin: 20px 0 20px 40px" prefix="bar" align-text>
              NPC Information
            </n-h2>
            <n-button v-if="!npcInfoContext.isEditMode"
                      circle tertiary
                      type="info" style="margin:auto 5px auto 15px"
                      @click="enterEditMode()">
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
              v-if="!npcInfoContext.isEditMode"
              @positive-click="applyDeleteCurrentNpc()"
              placement="bottom"
              :positive-button-props="{type:'error'}"
              :show-icon="false"
            >
              <template #trigger>
                <n-button circle type="error" tertiary style="margin: auto 5px">
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
              <n-text style="text-align: center;margin:auto">
                Delete NPC {{npcInfoContext.currentNpcInfo.name}}
              </n-text>
            </n-popconfirm>
            <n-button v-if="npcInfoContext.isEditMode"
                      circle tertiary
                      :type="isDirty?'error':'info'" style="margin:auto 5px auto 15px"
                      @click="exitEditMode()">
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
            <n-button v-if="npcInfoContext.isEditMode"
                      circle :disabled="!isDirty||!isValid" :type="isDirty?'success':'default'"
                      style="margin: auto 5px"
                      @click="applyCurrentChanges()">
              <template #icon>
                <n-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                       viewBox="0 0 32 32">
                    <path d="M13 24l-9-9l1.414-1.414L13 21.171L26.586 7.586L28 9L13 24z" fill="currentColor"></path>
                  </svg>
                </n-icon>
              </template>
            </n-button>
          </n-flex>
          <n-flex justify="left" align="top" style="margin: 10px 40px 30px 40px; height: 90px">
            <n-form-item label="Name" style="margin: 0 auto; width: 30%;"
                         label-style="color:rgba(255, 255, 255, 0.52);">
              <n-input v-if="npcInfoContext.isEditMode"
                       v-model:value="npcInfoContext.currentNpcInfo.name"
                       placeholder="" size="large"
              />
              <n-text v-else style="font-size: 24px">
                {{ npcInfoContext.currentNpcInfo.name }}
              </n-text>
            </n-form-item>
            <n-form-item label="NPC ID" style="margin: 0 auto; width: 30%;"
                         label-style="color:rgba(255, 255, 255, 0.52);">
              <n-input v-if="npcInfoContext.isEditMode"
                       v-model:value="npcInfoContext.currentNpcInfo.npcID"
                       placeholder="" size="large"
              />
              <n-text v-else style="font-size: 24px">
                {{ npcInfoContext.currentNpcInfo.npcID }}
              </n-text>
            </n-form-item>
            <n-form-item label="Database ID" style="margin: 0 auto; width: 30%;"
                         label-style="color:rgba(255, 255, 255, 0.52);">
              <n-text style="font-size: 24px">
                {{ npcInfoContext.currentNpcInfo.id ? npcInfoContext.currentNpcInfo.id : 'NO INFO' }}
              </n-text>
            </n-form-item>
          </n-flex>
          <n-divider style="margin:0" />
          <n-flex style="flex: 1;gap: 0;overflow: auto">
            <n-flex vertical style="max-height:100%;width: 36%;gap: 0;">
              <n-h3 type="default" prefix="bar" style="margin: 20px 35px;" align-text>
                Familiar Levels
              </n-h3>
              <n-divider style="margin: 0;" />
              <n-scrollbar style="flex:1;width: 100%;">
                <n-flex style="width: 100%;padding:20px;" vertical>
                  <draggable v-model="npcInfoContext.currentNpcInfo.familiarList"
                             tag="n-flex" class="list-group"
                             :item-key="(x)=>npcInfoContext.currentNpcInfo.familiarList.indexOf(x)"
                             :disabled="!npcInfoContext.isEditMode"
                             @start="e=>{
                               npcInfoContext.currentFamiliarLevel = e.oldIndex
                               npcInfoContext.lastDraggedIndex = e.oldIndex;
                             }"
                             @end="e=>{
                               npcInfoContext.currentFamiliarLevel = e.newIndex;
                               npcInfoContext.lastDraggedIndex = e.newIndex;
                             }"
                  >
                    <template #item="{ element, index }">
                      <n-card :class="getDraggableCardClass(index)"
                              hoverable @click="changeCurrentFamiliar(index)"
                              @mousemove="npcInfoContext.lastDraggedIndex = -1"
                      >
                        <template #header>
                          <n-h3 :type="index===npcInfoContext.currentFamiliarLevel?'success':'info'"
                                style="margin-bottom: 0;width: 100%" align-text prefix="bar"
                          >
                            <n-text>
                              Level. {{ index }}
                            </n-text>
                          </n-h3>
                        </template>
                        <template #header-extra>
                          <n-text depth="3" style="font-size: small">
                            {{ element.id }}
                          </n-text>
                        </template>
                      </n-card>
                    </template>
                  </draggable>

                  <n-button v-if="npcInfoContext.isEditMode"
                            style="border-radius: 7px;" dashed
                            @click="addLocalFamiliarLevel">
                    <template #icon>
                      <n-icon style="margin:auto 0;" type="info">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                             viewBox="0 0 28 28">
                          <g fill="none">
                            <path d="M24 13h-9V4a1 1 0 1 0-2 0v9H4a1 1 0 1 0 0 2h9v9a1 1 0 1 0 2 0v-9h9a1 1 0 1 0 0-2z"
                                  fill="currentColor"></path>
                          </g>
                        </svg>
                      </n-icon>
                    </template>
                    Add Familiar Level
                  </n-button>
                </n-flex>
              </n-scrollbar>
            </n-flex>
            <n-divider vertical style="height: 100%;margin-right: 0;margin-left: -1px" />
            <n-empty
              v-if="npcInfoContext.currentFamiliarLevel<0 || npcInfoContext.currentFamiliarLevel>=npcInfoContext.currentNpcInfo.familiarList.length"
              description="Select a Familiar-Level to check information."
              style="margin: auto;align-items: center"
              size="huge"
            >
            </n-empty>
            <n-flex v-else vertical style="flex: 1;gap:0;">
              <n-flex style="gap: 0;">
                <n-h3 type="default" prefix="bar" style="margin:20px 0 20px 35px; width: 140px" align-text>
                  Familiar Level {{ npcInfoContext.currentFamiliarLevel }}
                </n-h3>
                <n-button v-if="npcInfoContext.isEditMode"
                          circle type="error" tertiary style="margin: auto 5px"
                          @click="deleteLocalFamiliarLevel(npcInfoContext.currentFamiliarLevel)">
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
              </n-flex>
              <n-flex justify="left" align="top" style="margin: 8px 40px 20px 40px">
                <n-form-item label="Max SubLevel" style="margin: 0 auto; width: 40%;"
                             label-style="color:rgba(255, 255, 255, 0.52);">
                  <n-input-number v-if="npcInfoContext.isEditMode"
                                  v-model:value="familiarLevelInfo.maxSubFamiliarLevel"
                                  size="large" placeholder="最小值" :min="1" />
                  <n-text v-else style="font-size: 24px">
                    {{ familiarLevelInfo.maxSubFamiliarLevel }}
                  </n-text>
                </n-form-item>
                <n-form-item label="Database ID" style="margin: 0 auto; width: 40%;"
                             label-style="color:rgba(255, 255, 255, 0.52);">
                  <n-text style="font-size: 24px">
                    {{ familiarLevelInfo.id ? familiarLevelInfo.id : 'NO INFO' }}
                  </n-text>
                </n-form-item>
              </n-flex>
              <n-card hoverable
                      size="medium"
                      style="margin: 0 auto; border-width: 1px; width: 85%"
              >
                <template #header>
                  <n-flex>
                    <n-icon size="30" color="#63e2b7">
                      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                           viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                           stroke-linejoin="round">
                          <path d="M3 20l1.3-3.9A9 8 0 1 1 7.7 19L3 20"></path>
                          <path d="M12 12v.01"></path>
                          <path d="M8 12v.01"></path>
                          <path d="M16 12v.01"></path>
                        </g>
                      </svg>
                    </n-icon>
                    <n-text style="margin: auto 0">
                      Dialog Info
                    </n-text>
                  </n-flex>
                </template>
                <template #header-extra>
                  <n-button round tertiary icon-placement="right"
                            :disabled="npcInfoContext.isEditMode"
                            @click="router.push(`dialog/${familiarLevelInfo.id}`)"
                  >
                    Open dialog editor
                    <template #icon>
                      <n-icon>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                             viewBox="0 0 28 28">
                          <g fill="none">
                            <path
                              d="M7 5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4.5a1 1 0 1 1 2 0V21a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h4.5a1 1 0 1 1 0 2H7zm8.5-1a1 1 0 0 1 1-1H24a1 1 0 0 1 1 1v7.5a1 1 0 1 1-2 0V6.414l-5.793 5.793a1 1 0 1 1-1.414-1.414L21.586 5H16.5a1 1 0 0 1-1-1z"
                              fill="currentColor"></path>
                          </g>
                        </svg>
                      </n-icon>
                    </template>
                  </n-button>
                </template>
                <n-divider style="margin-top:-2px;margin-bottom: 12px" />
                <n-flex>
                  <n-statistic label="Dialog Count" style="margin: 0; width: 40%">
                    {{ familiarLevelInfo.dialogCount }}
                  </n-statistic>
                  <n-statistic label="Last modify time" style="margin: 0; width: 40%">
                    11:45:14
                  </n-statistic>
                </n-flex>
              </n-card>
            </n-flex>
          </n-flex>
        </n-flex>
      </n-flex>
    </n-flex>
  </div>
</template>
<style scoped>
.n-card {
  border-radius: 7px;
  border-width: 2px;
}

.hovered-n-card:hover {
  background-color: rgba(42, 148, 125, 0.25);
  cursor: pointer;
}

.selected-n-card {
  border-color: #63e2b7;
}

.selected-n-card:hover {
  background-color: rgba(42, 148, 125, 0.25);
  cursor: pointer;
}

.force-selected-hovered-n-card {
  border-radius: 7px;
  border-width: 2px;
  background-color: rgba(42, 148, 125, 0.25);
  border-color: #63e2b7;
  cursor: pointer;
}
</style>