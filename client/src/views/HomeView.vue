
<template>
 
    <HeygenStartup ref="heygenStartup" v-if="startupActive" 
    :start-button-text="startButtonText" 
    @expand-avatar="expandAvatar"></HeygenStartup>   

    <HeygenMain ref="heygenMain" v-if="mainActive" 
    @close-avatar-two="closeAvatar" 
    @chatter-window="chatter" 
    @add-chat-message="addMessageToChat" 
    :default-button="mainDefaultButtonText" 
    :empty-prompt-text="mainEmptyPromptText"
    :prompt-placeholder-text="mainButtonSendQuestionText"    
    :avatar-id="configAvatarId"
    :voice-id="configVoiceId"
    ></HeygenMain>

    <ChatWindow ref="chatWindow" 
    :chat-title="chatTitle" 
    :chat-user-label="chatUserLabel"
    :chat-bot-label="chatBotLabel"  
    :chat-postition-text="chatPostitionText"
    :welcome-text="welcomeText"   
    :settings="chatSettings" 
    v-show="chatWindowVisible"  />    
    

</template>

<script setup>

import { ref, inject, reactive, onMounted, onBeforeMount, onBeforeUnmount } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

import HeygenStartup from '../components/HeygenStartup.vue'
import HeygenMain from '../components/HeygenMain.vue'
import ChatWindow from '../components/ChatWindow.vue'

let themeId = "115000dc-d7e0-8502-e651-73b0352a65d8";
let chatWindowShowHideText = 'Toon Chat';
//let question = ref('');
let titleElement = document.getElementsByTagName('title');


const chatWindowVisible = ref(false);
const startupActive = ref(true);
const mainActive = ref(false);
const userquestion = ref(null);
const chatWindow = ref(null);
const theme = ref({});

const configAvatarId = ref('');
const configVoiceId = ref('');
const startButtonText = ref('');
const mainDefaultButtonText = ref('');
const mainEmptyPromptText = ref('');
const mainButtonSendQuestionText = ref('');
const chatTitle = ref('');
const chatUserLabel = ref('');
const chatBotLabel = ref('');
const welcomeText = ref('');
const chatPostitionText = ref('');
const chatSettings = ref({});

const searchParams = new URLSearchParams(window.location.search);

setTimeout(function(){
    checkThemeId();
    loadConfig()
  }
  ,700);

function checkThemeId(){

  if(searchParams.has('themeId')){
    themeId = searchParams.get('themeId');
  }
  else{
    console.log('using default theme');
  }

}

function loadConfig(){


  fetch(`/api/cms/loadtheme`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ themeId : themeId }),
    })
    .then((response) => response.json())
    .then((json) => {

      theme.value = json;

      //console.log(theme.value.app.avatarId);

      configAvatarId.value = theme.value.app.avatarId;
      configVoiceId.value = theme.value.app.voiceId;

      //console.log('avatarId ' + configAvatarId.value);

      chatSettings.value = theme.value.content.chat;

      startButtonText.value = theme.value.content.startup.startButtonText;
      mainDefaultButtonText.value = theme.value.content.main.defaultButtonText;
      mainEmptyPromptText.value = theme.value.content.main.emptyPromptText;
      mainButtonSendQuestionText.value = theme.value.content.main.buttonSendQuestionText;
      
      chatTitle.value = theme.value.content.chat.chatTitle;
      chatUserLabel.value = theme.value.content.chat.chatUserLabel;
      chatBotLabel.value = theme.value.content.chat.chatBotLabel;
      chatPostitionText.value = theme.value.content.chat.chatPostitionText;
      welcomeText.value = theme.value.content.chat.welcomeText; 
      
      if (titleElement) { titleElement[0].innerHTML = theme.value.content.general.windowTitle; }

      if(theme.value.stylesheet.file.length){
        addStylesheet(theme.value.stylesheet.file);
      }
});

function addStylesheet(){

      (function(){
      var styles = document.createElement('link');
      styles.rel = 'stylesheet';
      styles.type = 'text/css';
      styles.media = 'screen';
      styles.href = `./themes/${themeId}/custom.css`;
      document.getElementsByTagName('head')[0].appendChild(styles);
    })();  
  }

}

function loadDefaultSettings() {

  let result = {
    content: {
      windowTitle: 'SARA.io - your streaming avatar',
      welcomeText: 'Hallo, wat kan ik voor je doen?',
      buttonStartText: 'Starten',
      buttonSendQuestionText: 'Stel je vraag..',
      emptyPromptText: 'Je hebt nog geen vraag gesteld. Vul minimaal 4 tekens in.',
      chatWindowTitle: 'Stel je vraag aan SARA.io',
      chatUserLabel: 'Gebruiker',
      chatBotLabel: 'SARA.io'
    },
    assets: {
      mainBackgroundImage: ''
    },
    stylesheet: {
      link: ''
    }
  };

  return result;
}



// function askQuestion() {

//   if (question.value.length > 4) {

//     chats.chatItems.push({
//       text: new String(question.value),
//       type: 'user'
//     });

//     question.value = '';
//     userquestion.value.value = '';
//     userquestion.value.focus();
//   }
//   else {
//     alert('Voer minimaal 4 tekens in.');
//     userquestion.value.focus();
//   }
// }

async function addMessageToChat(user,msg){

  chatWindow.value.addNewMessage(user,msg);
  
}

async function chatWindowStatus() {

  chatWindowVisible.value = !chatWindowVisible.value;
  chatWindowShowHideText = (chatWindowVisible.value) ? 'Verberg chat' : 'Toon chat';

}

async function showChat(){
  chatWindowVisible.value = false;
  chatWindowStatus()
}

async function speechResult(textResult){
  question.value = textResult;
  askQuestion()
  showChat()
}

function chatter(){
  chatWindowStatus();
}

function expandAvatar(){

  //console.log('expand');
  expandIframe();
  startFullscreen();  
}

function closeAvatar(){

  //console.log('close avatar');
  mainActive.value = false;
  startupActive.value = true;
  shrinkIframe();
  endFullscreen();
}

// init iframe actions
const debugMode = (document.location.hostname.indexOf('localhost') >= 0) ? true : false;
const currentDomain = (debugMode) ? 'http://localhost:5173' : 'https://heygendemoappv3.azurewebsites.net'
//const statusElement = document.querySelector('#status');

let targetOrigin = currentDomain;

targetOrigin = document.location.protocol + '//' + document.location.hostname;

if (document.location.port != '') {
  targetOrigin += ':' + document.location.port;
}

const targetFrame = window.parent;
//const frameExists = (typeof targetFrame != 'undefined') ? true : false;
const frameExists = (window.location != window.parent.location);

//alert(iframeExists);
//alert('iframe exists homeview ' + frameExists);

//console.log('iframe exists homeview ' + frameExists);
//console.log(window);
//console.log(window.parent);
//console.log(window.parent.location);
//console.log('referer');
//console.log(document.referrer);

//const parentOrigin = frameExists ? window.parent.location.href : document.referrer;
const parentOrigin = document.referrer;

//const parentOrigin = 'https://promoplaza.nl/embed/embed.html';

// const validOrigin = isValidTargetOrigin();
const validOrigin = true;

function isValidTargetOrigin() {

  if (
    parentOrigin.indexOf('localhost') > -1 ||
    parentOrigin.indexOf('promoplaza.nl') > -1 ||
    parentOrigin.indexOf('heygendemoappv3.azurewebsites.net') > -1 ||
    parentOrigin.indexOf('iamsara.io') > -1

  ) {
    return true;
  }

  return false;

}

//alert(frameExists + ' ' +  validOrigin);

if (frameExists && validOrigin) {
  //console.log('start init script');
  setTimeout(showIframe, 500);
}
else {
  //throw new Error("Origin not allowed");
}

function showIframe() {

  //alert(parentOrigin)
  //alert('asdfasdf from iframe');
  targetFrame.postMessage({
    event_id: 'msg3',
    type: 'streaming-embed',
    action: 'init'
  }, parentOrigin);
}

//iframe show/expand 
// const startupElem = document.querySelector('.startup');
// const mainElem = document.querySelector('.main');
// const startButton = document.querySelector('#startupButton');
// startButton.addEventListener("click", () => {
//   expandIframe();
//   startFullscreen()
// });

function startButtonActions(){
  expandIframe();
  startFullscreen()
}

function startFullscreen() {

  //alert('start fullscreennn');

  mainActive.value = true;
  startupActive.value = false;  

  targetFrame.postMessage({
    event_id: 'expandIframe',
    type: 'streaming-embed',
    action: 'start-fullscreen'
  }, parentOrigin);
}

function endFullscreen() {
  targetFrame.postMessage({
    event_id: 'expandIframe',
    type: 'streaming-embed',
    action: 'end-fullscreen'
  }, parentOrigin);
}


function expandIframe() {

  targetFrame.postMessage({
    event_id: 'expandIframe',
    type: 'streaming-embed',
    action: 'show'
  }, parentOrigin);

}

function shrinkIframe() {

  targetFrame.postMessage({
    event_id: 'shrinkIframe',
    type: 'streaming-embed',
    action: 'hide'
  }, parentOrigin);

  //endFullscreen();
}
</script>

<style scoped>

/*
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}

*/
</style>
