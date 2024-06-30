<script setup>
import { VueFlow } from '@vue-flow/core'
import { ref } from 'vue'
import router from '@/router/index.js'
import NpcViewer from '@/components/NpcViewer.vue'

const showNpcViewer = ref(false)
</script>

<template>
  <n-layout style="height: 100%; width: 100%;padding: 40px">
    <n-flex vertical style="width: 100%;height: 100%;" justify="center">
      <n-flex style="margin: 0 auto;padding-bottom: 70px">
        <n-h1 prefix="bar" style="font-size: 100px"> Spac Toolchain </n-h1>
      </n-flex>
      <n-flex justify="center" style="width: 100%;height: 30%;gap: 50px">
        <n-card style="width: 20%;cursor: pointer" hoverable
                @click="router.push('/npc')"
        >
          <n-h1 prefix="bar" type="success">
            NPC
          </n-h1>
          <n-text>
            Add and remove NPCs, edit NPC familiar level and other information.
          </n-text>
          <br/>
          <n-text depth="3">
            Find your target familiar level for other editing issues.
          </n-text>
        </n-card>
        <n-card style="width: 20%;cursor: pointer;" hoverable
                @click="router.push('/dialog/0')"
        >
          <n-h1 prefix="bar" type="success">
            Dialog
          </n-h1>
          <n-text>
            Edit dialog texts and connections with a flow diagram to tell story.
          </n-text>
          <br/>
          <n-text depth="3">
            Manage condition and trigger functions also.
          </n-text>
        </n-card>
        <n-card style="width: 20%;cursor: pointer" hoverable
                @click=""
        >
          <n-h1 prefix="bar" type="success">
            Relic
          </n-h1>
          <n-text depth="3">
            Coming soon.
          </n-text>
        </n-card>
        <n-card style="width: 20%;cursor: pointer" hoverable
                @click=""
        >
          <n-h1 prefix="bar" type="success">
            Mission
          </n-h1>
          <n-text depth="3">
            Coming soon.
          </n-text>
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