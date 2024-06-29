<script setup>
import { nextTick, ref } from 'vue'
import DialogNode from '@/components/DialogNode.vue'
import { ConnectionMode, useVueFlow, VueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import StartNode from '@/components/StartNode.vue'
import NpcViewer from '@/components/NpcViewer.vue'
import FunctionManager from '@/components/FunctionManager.vue'

const { onConnect, onNodeDragStop, onConnectEnd, onEdgeDoubleClick, onConnectStart } = useVueFlow()

const vueFlowInstance = ref(null)

const nodes = ref([
  {
    id: '0',
    type: 'start',
    position: { x: 50, y: 50 },
    connectable: true,
    draggable: false,
    data: {}
  },
  {
    id: '000001',
    type: 'dialog',
    position: { x: 300, y: 50 },
    connectable: true,
    data: {}
  },
  {
    id: '000002',
    type: 'dialog',
    position: { x: 850, y: 50 },
    connectable: true,
    data: {}
  },
  {
    id: '000003',
    type: 'dialog',
    position: { x: 850, y: 450 },
    connectable: true,
    data: {}
  }
])
const edges = ref([])
const isConnectedThisFrame = ref(false)
const lastConnectStartInfo = ref({ source: '', sourceHandle: '' })

function onPaneReady(instance) {
  vueFlowInstance.value = instance
}

onConnectStart((x) => {
  lastConnectStartInfo.value.sourceHandle = x.handleId
  lastConnectStartInfo.value.source = x.nodeId
})

onConnect((connection) => {
  isConnectedThisFrame.value = true
  nextTick(() => isConnectedThisFrame.value = false)

  if (canAddEdge(connection))
    addEdge(connection)
})

onConnectEnd((event) => {
  if (!isConnectedThisFrame.value) {
    const newDialogId = 'New dialog'
    let lastNewNode = nodes.value.find(x => x.id === newDialogId)
    if (lastNewNode) {
      vueFlowInstance.value.fitView({ nodes: [newDialogId], maxZoom: 1 })
    } else {
      let pos = vueFlowInstance.value.project({ x: event.x, y: event.y })
      let connection = {
        source: lastConnectStartInfo.value.source,
        target: newDialogId,
        sourceHandle: lastConnectStartInfo.value.sourceHandle,
        targetHandle: 'left'
      }
      if (canAddEdge(connection)) {
        pos.y -= 125
        let node = {
          id: newDialogId,
          type: 'dialog',
          position: pos,
          connectable: true,
          data: {}
        }
        nodes.value.push(node)
        addEdge(connection)
      }
    }
  }
})

onEdgeDoubleClick((event) => {
  if (event.edge != null) {
    removeEdge(event.edge)
  }
})

function canAddEdge(connection) {
  let canAdd = true
  edges.value.forEach((i) => {
    if (i.source === connection.source && i.sourceHandle === connection.sourceHandle) canAdd = false
  })
  if (connection.targetHandle !== 'left') canAdd = false
  if (!connection.sourceHandle.startsWith('next')) canAdd = false
  if (connection.source === connection.target) canAdd = false
  return canAdd
}

function addEdge(connection) {
  let edge = {
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    id: connection.source + connection.sourceHandle + '-' + connection.target + connection.targetHandle
  }
  if (!edges.value.find((e) => e.id === edge.id)) {
    edges.value.push(edge)
    let sourceNode = nodes.value.find(n => n.id === connection.source)
    if (sourceNode != null) {
      sourceNode.data[connection.sourceHandle] = connection.target
    }
  }
}

function swapSelectionEdges(id, index1, index2) {
  let edge1 = edges.value.find((e) => e.source === id && e.sourceHandle === ('next' + index1))
  let edge2 = edges.value.find((e) => e.source === id && e.sourceHandle === ('next' + index2))
  let sourceNode = nodes.value.find(n => n.id === id)
  if (edge1 != null) {
    edge1.sourceHandle = ('next' + index2)
    sourceNode.data['next' + index2] = edge1.target
  }
  if (edge2 != null) {
    edge2.sourceHandle = ('next' + index1)
    sourceNode.data['next' + index1] = edge2.target
  }
  triggerEdgeUpdate()
}

function removeSelection(id, start, end) {
  let outEdges = edges.value.filter(edge => edge.source === id)
  let oldEdge = outEdges.find((e) => e.sourceHandle === ('next' + start))
  if (oldEdge != null) {
    removeEdge(oldEdge)
  } else
    triggerEdgeUpdate()
  for (let i = start; i < end; i++) {
    let edge = outEdges.find((e) => e.sourceHandle === ('next' + (i + 1)))
    let sourceNode = nodes.value.find(n => n.id === id)
    sourceNode.data[('next' + (i + 1))] = null
    if (edge != null) {
      edge.sourceHandle = 'next' + i
      sourceNode.data['next' + i] = edge.target
    }
  }
}

function removeEdge(edge) {
  edges.value.splice(edges.value.indexOf(edge), 1)
  let sourceNode = nodes.value.find(n => n.id === edge.source)
  if (sourceNode != null) {
    sourceNode.data[edge.sourceHandle] = null
  }
}

function triggerEdgeUpdate() {
  let fakeEdge = edges.value.find(e => e.id === 'forUpdate')
  if (fakeEdge === undefined) {
    fakeEdge = {
      id: 'forUpdate',
      source: 'forUpdate',
      target: 'forUpdate'
    }
    edges.value.push(fakeEdge)
  } else {
    edges.value.splice(edges.value.indexOf(fakeEdge), 1)
  }
}

function removeNode(id) {
  let outEdges = edges.value.filter(edge => edge.source === id)
  outEdges.forEach((i) => removeEdge(i))
  let inEdges = edges.value.filter(edge => edge.target === id)
  inEdges.forEach((i) => removeEdge(i))
  let node = nodes.value.find(n => n.id === id)
  if (node != null)
    nodes.value.splice(nodes.value.indexOf(node), 1)
}

const showNpcSelector = ref(false)

const conditionDrawerContext = ref({
  show: false,
  loading: true
})

function loadConditionDrawerContent() {
  conditionDrawerContext.value.loading = false
}

function onCloseConditionDrawer() {
  conditionDrawerContext.value.loading = true
}

const triggerDrawerContext = ref({
  show: false,
  loading: true
})

function loadTriggerDrawerContent() {
  triggerDrawerContext.value.loading = false
}

function onCloseTriggerDrawer() {
  triggerDrawerContext.value.loading = true
}
</script>

<template>
  <div id="out-vueflow" style="height: 100%; width: 100%">
    <div style="height: 100%; width: 100%">
      <VueFlow :nodes="nodes" :edges="edges" :connection-mode="ConnectionMode.Strict"
               @pane-ready="onPaneReady">
        <template #node-dialog="props">
          <DialogNode :id="props.id"
                      :connections="props.data"
                      @selectionMoveUp="swapSelectionEdges"
                      @selectionMoveDown="swapSelectionEdges"
                      @selectionRemoved="removeSelection"
                      @nodeRemoved="removeNode"
          />
        </template>
        <template #node-start="props">
          <StartNode v-bind="props" />
        </template>
      </VueFlow>
    </div>
    <n-float-button :left="20" :bottom="120" shape="circle" @click="showNpcSelector= true">
      <n-icon>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 28 28">
          <g fill="none">
            <path
              d="M4 16l11 .001a2 2 0 0 1 1.994 1.85l.006.15V20.5c-.001 4.2-4.287 5.5-7.5 5.5c-3.149 0-7.329-1.248-7.495-5.252L2 20.5V18c0-1.054.816-1.918 1.85-1.994L4 16zm20 0l.15.006a2.001 2.001 0 0 1 1.844 1.837L26 18v2c-.001 3.759-3.43 5-6 5c-1.058 0-2.259-.215-3.309-.725c.318-.378.587-.798.797-1.268c.958.42 1.991.485 2.428.492l.288-.003c1.036-.035 4.13-.384 4.29-3.263L24.5 20v-2a.501.501 0 0 0-.41-.492L24 17.5l-6.051.001a2.956 2.956 0 0 0-.595-1.34L17.22 16L24 16zM4 17.5l-.1.01a.51.51 0 0 0-.254.136a.506.506 0 0 0-.136.253L3.5 18v2.5c0 1.339.587 2.329 1.795 3.025c.996.576 2.39.923 3.864.97l.341.005l.435-.01c1.52-.068 5.379-.557 5.558-3.758l.007-.233v-2.498a.502.502 0 0 0-.41-.492l-.09-.008L4 17.5zM9.5 3a5.5 5.5 0 1 1 0 11a5.5 5.5 0 0 1 0-11zm11 2a4.5 4.5 0 1 1 0 9a4.5 4.5 0 0 1 0-9zm-11-.5c-2.206 0-4 1.794-4 4s1.794 4 4 4s4-1.794 4-4s-1.794-4-4-4zm11 2c-1.654 0-3 1.346-3 3s1.346 3 3 3s3-1.346 3-3s-1.346-3-3-3z"
              fill="currentColor"></path>
          </g>
        </svg>
      </n-icon>
    </n-float-button>
    <n-float-button :left="20" :bottom="70" shape="circle" @click="conditionDrawerContext.show = true">
      <n-icon>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">
          <path
            d="M26 18a3.995 3.995 0 0 0-3.858 3H18a3.003 3.003 0 0 1-3-3v-4a4.951 4.951 0 0 0-1.026-3h8.168a4 4 0 1 0 0-2H9.858a4 4 0 1 0 0 2H10a3.003 3.003 0 0 1 3 3v4a5.006 5.006 0 0 0 5 5h4.142A3.994 3.994 0 1 0 26 18zm0-10a2 2 0 1 1-2 2a2.002 2.002 0 0 1 2-2zM6 12a2 2 0 1 1 2-2a2.002 2.002 0 0 1-2 2zm20 12a2 2 0 1 1 2-2a2.003 2.003 0 0 1-2 2z"
            fill="currentColor"></path>
        </svg>
      </n-icon>
    </n-float-button>
    <n-float-button :left="20" :bottom="20" shape="circle" @click="triggerDrawerContext.show = true">
      <n-icon>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">
          <path
            d="M7 28a1 1 0 0 1-1-1V5a1 1 0 0 1 1.482-.876l20 11a1 1 0 0 1 0 1.752l-20 11A1 1 0 0 1 7 28zM8 6.69V25.31L24.925 16z"
            fill="currentColor"></path>
        </svg>
      </n-icon>
    </n-float-button>
    <NpcViewer v-model:show="showNpcSelector" @select-familiar-level="(familiarLevelID)=>console.log(familiarLevelID)"/>
    <FunctionManager v-model:show="conditionDrawerContext.show" function-type="condition"/>
    <FunctionManager v-model:show="triggerDrawerContext.show" function-type="trigger"/>
  </div>
</template>

<style scoped>
</style>