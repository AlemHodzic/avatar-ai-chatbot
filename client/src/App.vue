

<template>
  <main>
    <RouterView />
  </main>
 
    
</template>

<script setup>

import { ref, inject, reactive, onMounted, onBeforeMount, onBeforeUnmount } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

// function expandAvatar(){

// //console.log('expand');
// //alert('expand');
// mainActive.value = true;
// startupActive.value = false;
// //startFullscreen();
// }

// function closeAvatar(){

// //console.log('close avatar');
// mainActive.value = false;
// startupActive.value = true;
// endFullscreen();
// }
</script>


