<template>
    <div class="startup">
        <div class="startupWrapper">
            <button id="startupButton" class="smallbutton" @click="startDirectAvatar" >{{ startButtonText }}</button>
        </div>
    </div>
</template>

<script setup>
const emit = defineEmits(['expandAvatar', 'submit', 'startDirectAvatar'])

const props = defineProps({
  startButtonText: { type: String, default: 'Start' }
})

async function startDirectAvatar() {
    emit('startDirectAvatar');
}
</script>