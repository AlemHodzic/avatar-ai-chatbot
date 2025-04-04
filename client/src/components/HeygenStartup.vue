<template>
    <div class="startup">
        <div class="startupWrapper">
            <div class="loading-spinner" v-if="loading"></div>
            <button id="startupButton" class="smallbutton" @click="startDirectAvatar" v-if="!loading">{{ startButtonText }}</button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['expandAvatar', 'submit', 'startDirectAvatar'])

const props = defineProps({
  startButtonText: { type: String, default: 'Start' },
  loading: { type: Boolean, default: true }
})

async function startDirectAvatar() {
    emit('startDirectAvatar');
}
</script>