
<template>
    <div class="startup">
        <div class="startupWrapper">
            <button id="startupButton" class="smallbutton" @click="startAvatar" >{{ startButtonText }}</button>
        </div>
    </div>
</template>

<script setup>

const emit = defineEmits(['expandAvatar', 'submit'])

const props = defineProps({
  startButtonText: { type: String, default: 'Start' }
})


async function startAvatar(){
    emit('expandAvatar');
}
</script>