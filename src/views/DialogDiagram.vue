<script setup>
import { nextTick, ref } from 'vue'
import DialogNode from '@/components/DialogNode.vue'
import { ConnectionMode, useVueFlow, VueFlow} from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import StartNode from '@/components/StartNode.vue'
import { useNotification } from 'naive-ui'
const {onConnect, onNodeDragStop, onConnectEnd, onEdgeDoubleClick, onConnectStart} = useVueFlow()

const vueFlowInstance = ref(null)

const nodes = ref([
  {
    id: '0',
    type: 'start',
    position: { x: 50, y: 50 },
    connectable: true,
    draggable: false,
    data:{}
  },
  {
    id: '000001',
    type: 'dialog',
    position: { x: 300, y: 50 },
    connectable: true,
    data:{}
  },
  {
    id: '000002',
    type: 'dialog',
    position: { x: 850, y: 50 },
    connectable: true,
    data:{}
  },
  {
    id: '000003',
    type: 'dialog',
    position: { x: 850, y: 450 },
    connectable: true,
    data:{}
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

  if(canAddEdge(connection))
    addEdge(connection)
})

onConnectEnd((event)=>{
  if(!isConnectedThisFrame.value) {
    const newDialogId = 'New dialog'
    let lastNewNode = nodes.value.find(x=>x.id === newDialogId)
    if(lastNewNode) {
      vueFlowInstance.value.fitView({nodes:[newDialogId], maxZoom: 1})
    }
    else{
      let pos = vueFlowInstance.value.project({x: event.x, y: event.y })
      let connection = {
        source:lastConnectStartInfo.value.source,
        target:newDialogId,
        sourceHandle:lastConnectStartInfo.value.sourceHandle,
        targetHandle:'left'
      }
      if(canAddEdge(connection))
      {
        pos.y -= 125;
        let node = {
          id: newDialogId,
          type: 'dialog',
          position: pos,
          connectable: true,
          data:{}
        }
        nodes.value.push(node)
        addEdge(connection)
      }
    }
  }
})

onEdgeDoubleClick((event)=>{
  if(event.edge != null) {
    removeEdge(event.edge)
  }
})

function canAddEdge(connection) {
  let canAdd = true
  edges.value.forEach((i)=>{
    if(i.source === connection.source && i.sourceHandle === connection.sourceHandle) canAdd = false
  })
  if(connection.targetHandle!=="left") canAdd = false
  if(!connection.sourceHandle.startsWith("next")) canAdd = false
  if(connection.source === connection.target) canAdd = false
  return canAdd
}

function addEdge(connection) {
  let edge = {
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    id: connection.source+connection.sourceHandle+'-'+connection.target+connection.targetHandle,
  }
  if(!edges.value.find((e)=>e.id ===edge.id))
  {
    edges.value.push(edge)
    let sourceNode = nodes.value.find(n=>n.id === connection.source)
    if(sourceNode!=null) {
      sourceNode.data[connection.sourceHandle] = connection.target
    }
  }
}

function swapSelectionEdges(id, index1, index2) {
  let edge1 = edges.value.find((e)=>e.source === id && e.sourceHandle === ("next" + index1))
  let edge2 = edges.value.find((e)=>e.source === id && e.sourceHandle === ("next" + index2))
  let sourceNode = nodes.value.find(n=>n.id === id)
  if(edge1 != null ) {
    edge1.sourceHandle = ("next" + index2)
    sourceNode.data["next" + index2] = edge1.target
  }
  if(edge2 != null ) {
    edge2.sourceHandle = ("next" + index1)
    sourceNode.data["next" + index1] = edge2.target
  }
  triggerEdgeUpdate()
}

function removeSelection(id, start, end) {
  let outEdges = edges.value.filter(edge => edge.source === id)
  let oldEdge = outEdges.find((e)=>e.sourceHandle === ("next" + start))
  if(oldEdge != null) {
    removeEdge(oldEdge)
  }
  else
    triggerEdgeUpdate()
  for(let i = start; i < end; i++) {
    let edge = outEdges.find((e)=>e.sourceHandle === ("next" + (i+1)))
    let sourceNode = nodes.value.find(n=>n.id === id)
    sourceNode.data[("next" + (i+1))] = null
    if(edge != null) {
      edge.sourceHandle = "next" + i;
      sourceNode.data["next" + i] = edge.target
    }
  }
}

function removeEdge(edge) {
  edges.value.splice(edges.value.indexOf(edge), 1)
  let sourceNode = nodes.value.find(n=>n.id === edge.source)
  if(sourceNode!=null) {
    sourceNode.data[edge.sourceHandle] = null
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
  outEdges.forEach((i)=>removeEdge(i))
  let inEdges = edges.value.filter(edge => edge.target === id)
  inEdges.forEach((i)=>removeEdge(i))
  let node = nodes.value.find(n=>n.id === id)
  if(node != null)
    nodes.value.splice(nodes.value.indexOf(node), 1)
}
</script>

<template>
  <div id="out-vueflow" style="height: 100%; width: 100%"
       @contextmenu="handleContextMenu">
    <div style="height: 100%; width: 100%">
      <n-notification-provider>
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
              <StartNode v-bind="props"/>
            </template>
        </VueFlow>
      </n-notification-provider>
    </div>
  </div>
</template>

<style scoped>
</style>