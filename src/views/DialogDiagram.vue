<script setup>
import { nextTick, ref } from 'vue'
import DialogNode from '@/components/DialogNode.vue'
import { ConnectionMode, useVueFlow, VueFlow} from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import StartNode from '@/components/StartNode.vue'
const {onConnect, onNodeDragStop, onConnectEnd, onEdgeDoubleClick, onConnectStart} = useVueFlow()

const vueFlowInstance = ref(null)

const nodes = ref([
  {
    id: '0',
    type: 'start',
    position: { x: 50, y: 50 },
    connectable: true,
    draggable: false
  },
  {
    id: '000001',
    type: 'dialog',
    position: { x: 300, y: 50 },
    connectable: true
  },
  {
    id: '000002',
    type: 'dialog',
    position: { x: 850, y: 50 },
    connectable: true
  },
  {
    id: '000003',
    type: 'dialog',
    position: { x: 850, y: 450 },
    connectable: true
  }
])

const edges = ref([])

const isConnectedThisFrame = ref(false)
const lastConnectStartInfo = ref({source: '', sourceHandle: ''})

function onPaneReady(instance){
  vueFlowInstance.value = instance
}

onConnectStart((x)=> {
  lastConnectStartInfo.value.sourceHandle = x.handleId
  lastConnectStartInfo.value.source = x.nodeId
})

onConnect((connection) => {
  isConnectedThisFrame.value = true
  nextTick(()=>isConnectedThisFrame.value = false)
  let canAdd = true
  for(let i in edges.value) {
    if(i.source === connection.source) canAdd = true
  }
  if(connection.targetHandle!=="left") canAdd = false
  if(!connection.sourceHandle.startsWith("next")) canAdd = false
  if(connection.source === connection.target) canAdd = false

  if(canAdd) addEdge(connection.source, connection.target, connection.sourceHandle, connection.targetHandle)
})

onConnectEnd((event)=>{
  if(!isConnectedThisFrame.value) {
    const newDialogId = 'New dialog'
    let lastNewNode = nodes.value.find(x=>x.id === newDialogId)
    if(lastNewNode) {
      vueFlowInstance.value.fitView({nodes:[newDialogId], maxZoom: 1})
    }
    else {
      let pos = vueFlowInstance.value.project({x: event.x, y: event.y })
      pos.y -= 125;
      let node = {
        id: newDialogId,
        type: 'dialog',
        position: pos,
        connectable: true
      }
      nodes.value.push(node)
      addEdge(lastConnectStartInfo.value.source, newDialogId, lastConnectStartInfo.value.sourceHandle, 'left')
    }
  }
})

onNodeDragStop((event) => {
  let node = nodes.value.find(x=>x.id === event.node.id)
  if(node != null) {
    node.position.x = event.node.position.x
    node.position.y = event.node.position.y
  }
})

onEdgeDoubleClick((event)=>{
  if(event.edge != null)
    edges.value.splice(edges.value.indexOf(event.edge), 1)
})

function addEdge(source, target, sourceHandle, targetHandle) {
  let edge = {
    source: source,
    target: target,
    sourceHandle: sourceHandle,
    targetHandle: targetHandle,
    id: source+sourceHandle+'-'+target+targetHandle,
  }
  if(!edges.value.find((e)=>e.id ===edge.id))
    edges.value.push(edge)
}

function swapSelectionEdges(id, index1, index2) {
  let edge1 = edges.value.find((e)=>e.source === id && e.sourceHandle === ("next" + index1))
  let edge2 = edges.value.find((e)=>e.source === id && e.sourceHandle === ("next" + index2))
  if(edge1 != null ) {
    edge1.sourceHandle = ("next" + index2)
  }
  if(edge2 != null ) {
    edge2.sourceHandle = ("next" + index1)
  }
  triggerEdgeUpdate()
}

function removeSelection(id, start, end) {
  let outEdges = edges.value.filter(edge => edge.source === id)
  let oldEdge = outEdges.find((e)=>e.sourceHandle === ("next" + start))
  if(oldEdge != null)
    edges.value.splice(edges.value.indexOf(oldEdge), 1)
  else
    triggerEdgeUpdate()
  for(let i = start; i < end; i++) {
    let edge = outEdges.find((e)=>e.sourceHandle === ("next" + (i+1)))
    if(edge != null)
      edge.sourceHandle = "next" + i;
  }
}

function triggerEdgeUpdate() {
  let fakeEdge = edges.value.find(e=>e.id ==='forUpdate')
  if (fakeEdge === undefined) {
    fakeEdge = {
      id: 'forUpdate',
      source: 'forUpdate',
      target: 'forUpdate'
    }
    edges.value.push(fakeEdge)
  }
  else
  {
    edges.value.splice(edges.value.indexOf(fakeEdge), 1)
  }
}

function removeNode(id) {
  let outEdges = edges.value.filter(edge => edge.source === id)
  outEdges.forEach((i)=>edges.value.splice(edges.value.indexOf(i), 1))
  let inEdges = edges.value.filter(edge => edge.target === id)
  inEdges.forEach((i)=>edges.value.splice(edges.value.indexOf(i), 1))
  let node = nodes.value.find(n=>n.id === id)
  if(node != null)
    nodes.value.splice(nodes.value.indexOf(node), 1)
}
</script>

<template>
  <div id="out-vueflow" style="height: 100%; width: 100%"
       @contextmenu="handleContextMenu">
    <div style="height: 100%; width: 100%">
      <VueFlow :nodes="nodes" :edges="edges" :connection-mode="ConnectionMode.Strict"
               @pane-ready="onPaneReady">
        <template #node-dialog="props">
          <DialogNode v-bind="props"
                      @selectionMoveUp="swapSelectionEdges"
                      @selectionMoveDown="swapSelectionEdges"
                      @selectionRemoved="removeSelection"
                      @nodeRemoved="removeNode"
          />
        </template>
        <template #node-start="props">
          <StartNode v-bind="props"/>
        </template>
      </VueFlow>
    </div>
  </div>
</template>

<style scoped>
</style>