<script setup>

import { computed, ref } from 'vue'
import axios from 'axios'
import router from '@/router/index.js'
import { useThemeVars } from 'naive-ui'

const themeVars = useThemeVars()

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
  currentFamiliarLevel: -1,
  currentNpcInfo: {
    id: '00008',
    npcID: 'TestNPC_8',
    name: 'V_sion8',
    familiarList: []
  }
})

loadNpcList()

function loadNpcList() {
  npcListContext.value.loading = true
  axios.post('/npc/getList').then((res) => {
    npcListContext.value.loading = false
    npcListContext.value.npcList = res.data.npcList
  }).catch((e) => {
    console.log(e)
  })
}

function tryAddNpc() {
}

function changeCurrentNpc(index) {
  npcListContext.value.currentNpcIndex = index
  npcInfoContext.value.loading = true
  npcInfoContext.value.currentFamiliarLevel = -1
  axios.post('/npc/getInfo', { id: npcListContext.value.npcList[index].id }).then((res) => {
    npcInfoContext.value.loading = false
    npcInfoContext.value.currentNpcInfo = res.data
    for (let i = 0; i < npcInfoContext.value.currentNpcInfo.familiarList.length; i++) {
      npcInfoContext.value.currentNpcInfo.familiarList[i].familiarLevel = i
    }
  }).catch((e) => {
    console.log(e)
  })
}

function changeCurrentFamiliar(level) {
  npcInfoContext.value.currentFamiliarLevel = level
}

const familiarLevelInfo = computed(() => {
  return npcInfoContext.value.currentNpcInfo.familiarList[npcInfoContext.value.currentFamiliarLevel]
})

</script>

<template>
  <div style="width: 100%;height: 100%">
    <n-spin v-if="npcListContext.loading"
            style="width: 100%; height: 100%"
            size="large" />
    <n-flex v-else justify="left" style="height: 100%;max-height:100%;column-gap: 0">
      <n-flex vertical style="max-height: 100%;width: 30%;gap:0;">
        <n-flex style="padding: 20px 20px">
          <n-h2 type="success" style="margin-bottom: 0;" prefix="bar">
            NPC List
          </n-h2>
          <n-flex justify="right" style="flex:1">
            <n-button circle tertiary type="info" style="" @click="tryAddNpc()">
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
            <n-button circle tertiary type="primary" style="" @click="router.push('/')">
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
          v-if="npcListContext.currentNpcIndex<0 || npcListContext.currentNpcIndex>=npcListContext.npcList.length"
          description="Select a NPC to check information."
          style="margin: auto;align-items: center"
          size="huge"
        >
        </n-empty>
        <n-spin v-else-if="npcInfoContext.loading"
                style="width: 100%; height: 100%"
                size="large" />
        <n-flex v-else vertical style="height: 100%;gap: 0">
          <n-h2 type="default" style="margin: 20px 40px" prefix="bar" align-text>
            NPC Information
          </n-h2>
          <n-flex justify="left" align="top" style="margin: 10px 40px 30px 40px">
            <n-statistic label="Name" style="margin: 0 auto; width: 30%">
              {{ npcInfoContext.currentNpcInfo.name }}
            </n-statistic>
            <n-statistic label="NPC ID" style="margin: 0 auto; width: 30%">
              {{ npcInfoContext.currentNpcInfo.npcID }}
            </n-statistic>
            <n-statistic label="Database ID" style="margin: 0 auto; width: 30%">
              {{ npcInfoContext.currentNpcInfo.id }}
            </n-statistic>
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
                  <n-card v-for="item in npcInfoContext.currentNpcInfo.familiarList"
                          :class="item.familiarLevel===npcInfoContext.currentFamiliarLevel?'selected-n-card':'hovered-n-card'"
                          hoverable @click="changeCurrentFamiliar(item.familiarLevel)"
                  >
                    <template #header>
                      <n-h3 :type="item.familiarLevel===npcInfoContext.currentFamiliarLevel?'success':'info'"
                            style="margin-bottom: 0;width: 100%" align-text prefix="bar">
                        <n-text>
                          Level. {{ item.familiarLevel }}
                        </n-text>
                      </n-h3>
                    </template>
                    <template #header-extra>
                      <n-text depth="3" style="font-size: small">
                        {{ item.id }}
                      </n-text>
                    </template>
                  </n-card>
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
              <n-h3 type="default" prefix="bar" style="margin: 20px 35px;" align-text>
                Familiar Level {{ npcInfoContext.currentFamiliarLevel }}
              </n-h3>
              <n-flex justify="left" align="top" style="margin: 8px 40px 20px 40px">
                <n-statistic label="Max Sub-Familiar-Level" style="margin: 0 auto; width: 40%">
                  {{ familiarLevelInfo.maxSubFamiliarLevel }}
                </n-statistic>
                <n-statistic label="Database ID" style="margin: 0 auto; width: 40%">
                  {{ familiarLevelInfo.id }}
                </n-statistic>
              </n-flex>
              <n-card hoverable
                      size="medium"
                      style="margin: 0 auto; border-width: 1px; width: 85%"
              >
                <template #header>
                  <n-flex>
                    <n-icon size="30">
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
                <n-divider style="margin-top:-2px;margin-bottom: 12px"/>
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
</style>