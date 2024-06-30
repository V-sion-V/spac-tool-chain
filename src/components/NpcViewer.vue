<script setup>
import { ref, watch } from 'vue'
import router from '@/router/index.js'
import axios from 'axios'

const show = defineModel('show', { required: true })
const emit = defineEmits(['selectFamiliarLevel'])

const npcDrawerContext = ref({
  loading: true,
  currentNpcIndex: -1,
  npcList: [
    {
      id: '00001',
      npcID: 'TestNPC_111111111111111111111111111111',
      name: 'VVVVVVVVVVVVVVVVVVVVVVVVV_sion'
    }, {
      id: '00002',
      npcID: 'TestNPC_2',
      name: 'Focol'
    }, {
      id: '00003',
      npcID: 'TestNPC_3',
      name: 'Vanadis'
    }, {
      id: '00004',
      npcID: 'TestNPC_4',
      name: 'Artemis'
    }
  ],
  npcInfoLoading:false,
  currentNpcInfoValue: {
    id: '00001',
    npcID: 'TestNPC_1',
    name: 'V_sion',
    familiarList: [
      {
        id: '00001',
        familiarLevel: 0,
        maxSubFamiliarLevel: 5,
        dialogCount: 1
      },
      {
        id: '00002',
        familiarLevel: 1,
        maxSubFamiliarLevel: 7,
        dialogCount: 1
      },
      {
        id: '00003',
        familiarLevel: 2,
        maxSubFamiliarLevel: 7,
        dialogCount: 0
      }
    ]
  }
})

watch(show,(val)=>{
  if(val)loadNpcDrawerContent()
})

function loadNpcDrawerContent() {
  npcDrawerContext.value.currentNpcIndex = -1
  npcDrawerContext.value.loading = true
  axios.post('/npc/getList').then((res)=>{
    npcDrawerContext.value.loading = false
    npcDrawerContext.value.npcList = res.data.npcList
    npcDrawerContext.value.npcList.sort((a,b) => a.npcID.localeCompare(b.npcID))
  }).catch((e)=>{
    console.log(e)
  })
}

function changeCurrentNpc(index) {
  npcDrawerContext.value.currentNpcIndex = index
  npcDrawerContext.value.npcInfoLoading = true
  axios.post('/npc/getInfo', {id:npcDrawerContext.value.npcList[index].id}).then((res)=>{
    npcDrawerContext.value.npcInfoLoading = false
    npcDrawerContext.value.currentNpcInfoValue = res.data
    for (let i = 0; i < npcDrawerContext.value.currentNpcInfoValue.familiarList.length; i++) {
      npcDrawerContext.value.currentNpcInfoValue.familiarList[i].familiarLevel = i
    }
  }).catch((e)=>{
    console.log(e)
  })
}

function openNpcManager() {
  router.push('/npc')
}
</script>

<template>
  <n-drawer v-model:show="show" :width="1000" placement="right">
    <n-drawer-content body-content-style="padding:0;">
      <n-spin v-if="npcDrawerContext.loading"
              style="width: 100%; height: 100%"
              size="large" />
      <n-flex v-else justify="left" style="height: 100%;column-gap: 0">
        <n-flex vertical style="max-height: 100%;width: 40%;gap:0">
          <n-flex style="padding: 20px 20px">
            <n-h2 type="success" style="margin-bottom: 0" prefix="bar">
              NPC List
            </n-h2>
            <n-button circle quaternary type="success" style="margin-left: 210px" @click="openNpcManager">
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
          </n-flex>
          <n-divider style="margin: 0;" />
          <n-scrollbar style="max-height: 100%">
            <n-flex style="width: 100%;padding:20px;" vertical>
              <n-card v-for="(npc, index) in npcDrawerContext.npcList" hoverable
                      v-bind:key="index"
                      :style="'cursor:pointer;'+(index===npcDrawerContext.currentNpcIndex?'background-color: rgba(255, 255, 255, .08);':'')"
                      @click="changeCurrentNpc(index)"
              >
                <template #header>
                  <n-space>
                    <n-h3 type="info" style="margin-bottom: 0;" prefix="bar" align-text>
                      <n-text>
                        <n-ellipsis style="max-width: 200px">
                          {{ npc.name }}
                        </n-ellipsis>
                      </n-text>
                    </n-h3>
                  </n-space>
                </template>
                <template #header-extra>
                  <n-text depth="3" style="font-size: small">
                    <n-ellipsis style="max-width: 80px">
                      {{ npc.npcID }}
                    </n-ellipsis>
                  </n-text>
                </template>
              </n-card>
            </n-flex>
          </n-scrollbar>
        </n-flex>
        <n-divider vertical style="height: 100%;margin-right: 0;margin-left: -1px" />
        <n-flex vertical style="width: 60%">
          <n-empty
            v-if="npcDrawerContext.currentNpcIndex<0 || npcDrawerContext.currentNpcIndex>=npcDrawerContext.npcList.length"
            description="Select a NPC to check information."
            style="margin: auto;align-items: center"
            size="huge"
          >
          </n-empty>
          <n-spin v-else-if="npcDrawerContext.npcInfoLoading"
                  style="width: 100%; height: 100%"
                  size="large" />
          <n-scrollbar v-else style="max-height: 100%;width: 100%">
            <n-flex vertical style="margin:20px 40px">
              <n-h2 type="default" prefix="bar" align-text>
                NPC Information
              </n-h2>
              <n-flex justify="left" align="top">
                <n-statistic label="Name" style="margin: 0 auto; width: 30%">
                  {{ npcDrawerContext.currentNpcInfoValue.name }}
                </n-statistic>
                <n-statistic label="NPC ID" style="margin: 0 auto; width: 30%">
                  {{ npcDrawerContext.currentNpcInfoValue.npcID }}
                </n-statistic>
                <n-statistic label="Database ID" style="margin: 0 auto; width: 30%">
                  {{ npcDrawerContext.currentNpcInfoValue.id }}
                </n-statistic>
              </n-flex>
              <n-h3 type="default" prefix="bar" style="margin-bottom: 10px" align-text>
                Familiar Levels
              </n-h3>
              <n-list hoverable bordered>
                <template #header>
                  <n-flex style="font-size: 15px;vertical-align: middle;">
                    <n-text style="width: 10%" strong type="info">Level</n-text>
                    <n-text style="width: 20%" type="info">Dialog Count</n-text>
                    <n-text style="width: 20%">Max SubLevel</n-text>
                    <n-text style="width: 25%">Database ID</n-text>
                    <n-text style="margin-left: 5%;" type="success" strong>Link</n-text>
                  </n-flex>
                </template>
                <n-list-item v-for="(item, index) in npcDrawerContext.currentNpcInfoValue.familiarList"
                             v-bind:key="index"
                >
                  <n-flex style="font-size: 15px;">
                    <n-text style="width: 10%" type="info">{{ item.familiarLevel }}</n-text>
                    <n-text style="width: 20%" type="info"> {{item.dialogCount}} </n-text>
                    <n-text style="width: 20%" depth="2">{{ item.maxSubFamiliarLevel }}</n-text>
                    <n-text style="width: 25%" depth="3">{{ item.id }}</n-text>
                    <n-button style="margin-left: 5%" size="small"
                              circle quaternary type="success" @click="emit('selectFamiliarLevel', item.id)">
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
                  </n-flex>
                </n-list-item>
              </n-list>
            </n-flex>
          </n-scrollbar>
        </n-flex>
      </n-flex>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>

</style>