<template>
    <div class="main" >

        <!-- Add loading overlay -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-content">
                <div class="spinner"></div>
                <div class="loading-text">Even geduld...</div>
            </div>
        </div>

        <p id="status"></p>

        <div id="introRow" v-if="showIntroRow" class="introRow avatarWrapper fullscreen animate__animated animate__fadeIn">
            <div class="avatarStillWrapper">
                <span class="brandName" v-if="showlogo"><img :src="logoSrc" class="logo"></span>
                <button id="closeBtnPreview" class="closeBtn" @click="closeAvatar" >X</button>
                <!-- <button v-else id="startAvtBtn" @click="initAvatar">{{defaultButton}}</button> -->
            </div>
        </div>
            <div id="avatarArea" v-if="showAvatarArea" class="videoSectionWrap avatarWrapper fullscreen animate__animated animate__fadeIn">
              
            <div class="videoWrap">
                <span class="brandName" v-if="showlogo"><img :src="logoSrc" class="logo"></span>
                <button id="closeBtn" class="closeBtn" @click="closeAvatar" >X</button>
                <video id="mediaElement" v-show="showMediaElement" :srcObject="stream" @loadedmetadata="metaDataLoaded" ref="mediaElement" class="videoEle videoEleCustom" autoplay></video>
                <canvas id="canvasElement" v-show="showCanvasElement" ref="canvasElement" class="canvasEle canvasEleCustom"></canvas>
            </div>

            <div style="position:absolute">
              <button @click="interruptAvatar" v-show="avatarIsTalking" >Interrupt</button>
            </div>

            <div id="talkRow" ref="talkElement" class="actionRow talkRow animate__animated animate__fadeInDown">
                <div class="talkRowItems" >
                    <div class="promptArea">
                      <div>
                        <input id="taskInput" ref="taskInput"  type="text" class="textInput" :placeholder="promptPlaceholderText" 
                        @keydown.enter="talkHandler" 
                        @focus="textInputActive = true" 
                        @focusout="textInputActive = false"/>
                      </div>
                    </div>
                    <div><TalkToText ref="talkToText" @custom-event="speechResult" ></TalkToText></div>                    
                    <div class="promptButtonArea" >
                      <button id="talkBtn" ref="talkButton" class="talkBtn" @click="talkHandler" >Send</button>
                    </div>
                    <div>
                      <button id="chatBtn" class="buttonChat" @click="showChatWindow" >Log</button>
                    </div>
                    <!--
                    <button id="repeatBtn" ref="repeatBtn" class="hide" >Repeat</button>
                    -->
                </div>
            </div>        
        </div>
    </div>
  </template>

<script setup>

import { ref, onMounted, onBeforeUnmount } from 'vue'
import TalkToText from './TalkToText.vue'
import { API_CONFIG } from '../config/config'

const props = defineProps({
  defaultButton: { type: String, default: 'Ik wil wat weten' },
  promptPlaceholderText: { type: String, default: 'Stel je vraag.....'},
  emptyPromptText: { type: String, default: 'Minimaal 4 tekens'},
  avatarId: { type: String, default: '' },
  voiceId: { type: String, default: '' },  
  logoSrc: { type: String, default: '/assets/images/iamSARA.io_logo_2024.png'}
})

const emit = defineEmits(['closeAvatarTwo', 'chatterWindow' , 'addChatMessage','submit'])

//console.log(props.defaultButton);
const showlogo = ref(false);

//log of info and error messages
const statusMessages = ref([]); 
const avatarIsTalking = ref(false);

//array with questions and answer from user and avatar
const chatMessages = ref([]); 

//api info heygen
let heygenAvatarId = ref(import.meta.env.VITE_HEYGEN_API_AVATARID);
let heygenVoiceId = ref(import.meta.env.VITE_HEYGEN_API_VOICEID);
const quality = ref('low');
const videoEncoding = ref('H264');

//console.log('load config');

if(props.avatarId){ heygenAvatarId.value = props.avatarId; }
if(props.voiceId){ heygenVoiceId.value = props.voiceId; }

//console.log('config loaded');

quality.value = 'high';

//the video stream of the avatar
const stream = ref(null)

//two main areas in the page 
const showIntroRow = ref(true);
const showAvatarArea = ref(false);

//let vars
let sessionInfo = null;
let peerConnection = null;
let mediaCanPlay = false;

let textInputActive = ref(false)

// Add this with other refs at the top of the script
const isLoading = ref(false);

//close the avatar
async function closeAvatar(){
  console.log('close avatar');
  if(sessionInfo != null){
    // Call backend to handle session end
    await fetch(`${API_CONFIG.baseUrl}/api/openai/end-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        sessionId: sessionInfo.session_id,
        reason: 'user_ended'
      })
    });
    
    stopSession(sessionInfo.session_id)
  }

  emit('closeAvatarTwo');
}

async function showChatWindow(){
    emit('chatterWindow');
}


//media and canvas element
const mediaElement = ref(null) //document.querySelector('#mediaElement');
const canvasElement= ref(null) //document.querySelector('#canvasElement');
const showMediaElement = ref(false);
const showCanvasElement = ref(false);
const removeBGCheckbox = ref(null);

//taskbar elements
const talkElement = ref(null);
const taskInput = ref(null);
const talkButton = ref(null);
const repeatBtn = ref(null);


//onmetadataloaded media element
function metaDataLoaded(){

  mediaCanPlay = true;
  //mediaElement.value.play();
  initMedia();
}

//on mounted vue
// onMounted(() => {

  
// })

//on before unmount 
//stops the stream
onBeforeUnmount(() => stop());


const stop = () => {

  if(stream.value != null){
    stream.value.getTracks().forEach(track => {
      //console.log('stopping', track)
      track.stop()
    })
  }
  stream.value = null
}

//removeBGCheckbox.checked = true;

async function initMedia() {

  showMediaElement.value = false;
  showCanvasElement.value = true;
  await renderCanvas();

}
//speech to text
async function speechResult(resultText){

  //alert(resultText);
  //console.log(resultText);
  taskInput.value.value = resultText;

  await talkHandler();
  //talkButton.value.click();
  
}

//init avatar
async function initAvatar() {
    console.log('init avatar');
    isLoading.value = true;

    const timeout = 700;
    try {
        await createNewSession().then(result => {
            startAndDisplaySession().then(result => {
                setTimeout(() => {
                    showIntroRow.value = false;
                    showAvatarArea.value = true;
                    isLoading.value = false; // Turn off loading when complete
                }, timeout);
            }).catch(error => {
                console.error('Error in startAndDisplaySession:', error);
                isLoading.value = false; // Turn off loading on error
            });
        });
    } catch (error) {
        console.error('Error initializing avatar:', error);
        isLoading.value = false; // Turn off loading on error
    }
}

function updateStatus(message) {

  if(message){
    statusMessages.value.push(message + '<br>');
  //statusElement.innerHTML += message + '<br>';
  //statusElement.scrollTop = statusElement.scrollHeight;
    console.log(message);
  }
}

//updateStatus('Please click the new button to create the stream first.');

function onMessage(event) {
  const message = event.data;
  //console.log('Received message:', message);
}

// Create a new WebRTC session when clicking the "New" button
async function createNewSession() {

  updateStatus('Creating new session... please wait');

  // call the new interface to get the server's offer SDP and ICE server to create a new RTCPeerConnection
  //sessionInfo = await newSession('low', avatar, voice);
  sessionInfo = await getNewSession('high', heygenAvatarId.value, heygenVoiceId.value, videoEncoding.value);

  const { sdp: serverSdp, ice_servers2: iceServers } = sessionInfo;

  // Create a new RTCPeerConnection
  peerConnection = new RTCPeerConnection({ iceServers: iceServers });

  // When audio and video streams are received, display them in the video element
  peerConnection.ontrack = (event) => {
    //console.log('Received the track');
    //console.log(event.track.kind );
    if (event.track.kind === 'audio' || event.track.kind === 'video') {
      //console.log(event.streams[0]);
      stream.value = event.streams[0];
      mediaElement.srcObject = event.streams[0];
    }
  };

  // When receiving a message, display it in the status element
  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;
    dataChannel.onmessage = onMessage;
  };

  // Set server's SDP as remote description
  const remoteDescription = new RTCSessionDescription(serverSdp);
  await peerConnection.setRemoteDescription(remoteDescription);

  updateStatus('Session creation completed');
  updateStatus('Now you can click the start button to start the stream');
}

//Display audio and video by setting op peerConnections
async function startAndDisplaySession() {

    if (!sessionInfo) {
    updateStatus('Please create a connection first');
    return;
    }

    updateStatus('Starting session... please wait');

    // Create and set local SDP description
    const localDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(localDescription);

    // When ICE candidate is available, send to the server
    peerConnection.onicecandidate = ({ candidate }) => {
    //console.log('Received ICE candidate:', candidate);
    if (candidate) {
        handleICE(sessionInfo.session_id, candidate.toJSON());
    }
    };

  // When ICE connection state changes, display the new state
    peerConnection.oniceconnectionstatechange = (event) => {
        updateStatus(`ICE connection state changed to: ${peerConnection.iceConnectionState}`);
    };

    // Start session
    await startSession(sessionInfo.session_id, localDescription);

    //var receivers = peerConnection.getReceivers();

    //receivers.forEach((receiver) => {
    //receiver.jitterBufferTarget = 500

    //if (receiver.setCodecPreferences != undefined) {
    //console.log('receivers prop setCodecPreferences supported');
    //tcvr.setCodecPreferences(vp9_codecs);
    //}
    
    //});

    updateStatus('Session started successfully');
}

//get and create a session for using heygen
async function getNewSession(quality, avatar_name, voice_id,video_encoding) {
  console.log('getNewSession', quality, avatar_name, voice_id, video_encoding);

    const params = {
        quality,
        avatar_name,
        voice: {
            voice_id: voice_id
        },
        'video_encoding': video_encoding
    };

    //console.log('params');
    //console.log(JSON.stringify(params));

    const response = await fetch(`${API_CONFIG.baseUrl}/api/session/create`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    });
    if (response.status === 500) {
    console.error('Server error');
    updateStatus(
        'Server Error. Please ask the staff if the service has been turned on',
    );

    throw new Error('Server error');
    } else {
    const data = await response.json();

    //console.log('create');
    //console.log(data);
    return data;
    //return data.data;
    }
}

// start the session with heygen
async function startSession(session_id, sdp) {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/session/start`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ session_id, sdp }),
    });
    if (response.status === 500) {
    console.error('Server error');
    updateStatus(
        'Server Error. Please ask the staff if the service has been turned on',
    );
    throw new Error('Server error');
    } else {
    const data = await response.json();

    //console.log( 'data')
    //console.log(data);
    return data;
    //return data.data;
    }
}

// stop session heygen
async function interruptAvatar() {

  const session_id = sessionInfo.session_id;

  //console.log('interrupt start..' + session_id)
  const response = await fetch(`${API_CONFIG.baseUrl}/api/session/interrupt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ session_id }),
  });
  if (response.status === 500) {

    avatarIsTalking.value = false;

    //console.error('Server error');
    updateStatus('Server Error. Please ask the staff for help');
    throw new Error('Server error');
  } else {

    avatarIsTalking.value = false;
    const data = await response.json();

    return data;
    //return data.data;
  }
}

// stop session heygen
async function stopSession(session_id) {
  const response = await fetch(`${API_CONFIG.baseUrl}/api/session/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ session_id }),
  });
  if (response.status === 500) {
    //console.error('Server error');
    updateStatus('Server Error. Please ask the staff for help');
    throw new Error('Server error');
  } else {
    const data = await response.json();
    return data;
    //return data.data;
  }
}

// submit the ICE candidate
async function handleICE(session_id, candidate) {

    const response = await fetch(`${API_CONFIG.baseUrl}/api/session/handleice`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ session_id, candidate }),
    });
    if (response.status === 500) {
    console.error('Server error');
    updateStatus(
        'Server Error. Please ask the staff if the service has been turned on',
    );
    throw new Error('Server error');
    } else {
    const data = await response.json();
    //console.log('ice result');
    //console.log(data);
    return data;
    }
}

// submit text of the use to openAI
async function talkHandler() {

  //set avatar is not talking
  await interruptAvatar();
  avatarIsTalking.value = false;
  

  if (!sessionInfo) {
    updateStatus('Please create a connection first');
    return;
  }
  const prompt = taskInput.value.value; // Using the same input for simplicity
  if (prompt.trim() === '') {
    alert(props.emptyPromptText);
    return;
  }

  //add message to chat window
  emit('addChatMessage','user',prompt);  

  //
  updateStatus('Talking to LLM... please wait');

  disableTalkRow();



  try {

    const text = await talkToOpenAI(prompt)    

    if (text) {


      //add message to chat window
      emit('addChatMessage','bot',text);

      // Send the AI's response to Heygen's streaming.task API
      const resp = await repeat(sessionInfo.session_id, text);
      updateStatus('LLM response sent successfully');
      enableTalkRow();

    } else {

      updateStatus('Failed to get a response from AI');
      enableTalkRow();

    }
  } catch (error) {

    console.error('Error talking to AI:', error);
    enableTalkRow();
    updateStatus('Error talking to AI');
  }

}

//disable the talking row element
function disableTalkRow() {
  talkElement.value.classList.add('talkRowInActive');
  talkElement.value.setAttribute('disabled', '');
  taskInput.value.setAttribute('disabled', '');
  talkButton.value.setAttribute('disabled', '');
}

//enable the talking row element
function enableTalkRow() {
  talkElement.value.removeAttribute('disabled');
  taskInput.value.removeAttribute('disabled');
  talkButton.value.removeAttribute('disabled');
  talkElement.value.classList.remove('talkRowInActive');

  taskInput.value.value = '';
}

//approach open AI with a prompt/text
async function talkToOpenAI(prompt) {

    //let openaiHost = currentDomain;
    const response = await fetch(`${API_CONFIG.baseUrl}/api/openai/message`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
    });
    if (response.status === 500) {
      console.error('Server error');
      updateStatus('Server Error. Please make sure to set the openai api key');
    throw new Error('Server error');
    } else {
    const data = await response.json();
    return data.text;
    }
}

// let the avatar repeat (say) the text
async function repeat(session_id, text) {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/session/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ session_id, text }),
    });

    if (response.status === 500) {
      console.error('Server error');
      updateStatus('Server Error. Please ask the staff if the service has been turned on');
      avatarIsTalking.value = false; // Reset if error
      throw new Error('Server error');
    }

    // Set avatar to talking state
    avatarIsTalking.value = true;

    // Start monitoring the avatar's speech status
    monitorAvatarSpeech();

    const data = await response.json();
    return data;
  } catch (error) {
    avatarIsTalking.value = false; // Reset if error
    throw error;
  }
}

// Add this new function to monitor speech status
function monitorAvatarSpeech() {
  // Check audio activity every 500ms
  const checkInterval = setInterval(() => {
    if (mediaElement.value && mediaElement.value.srcObject) {
      // Get audio tracks
      const audioTracks = mediaElement.value.srcObject.getAudioTracks();
      
      if (audioTracks.length > 0) {
        const audioTrack = audioTracks[0];
        
        // If track is not active or ended, avatar has finished talking
        if (!audioTrack.enabled || audioTrack.readyState === 'ended') {
          avatarIsTalking.value = false;
          clearInterval(checkInterval);
        }
      } else {
        // No audio tracks means no talking
        avatarIsTalking.value = false;
        clearInterval(checkInterval);
      }
    }
  }, 500);

  // Failsafe: Clear the talking state after maximum expected duration (e.g., 30 seconds)
  setTimeout(() => {
    avatarIsTalking.value = false;
    clearInterval(checkInterval);
  }, 5000);
}

let renderID = 0;

//render canvas
async function renderCanvas() {

  //console.log('render canvas');
  //if (!removeBGCheckbox.checked) return;
  
  showMediaElement.value = false;
  showCanvasElement.value = true;

  const curRenderID = Math.trunc(Math.random() * 1000000000);
  renderID = curRenderID;

  const ctx = canvasElement.value.getContext('2d', { willReadFrequently: true });


  function processFrame() {
    //if (!removeBGCheckbox.checked) return;
    if (curRenderID !== renderID) return;

    if(canvasElement.value === null || mediaElement.value === null){ return ;}
    

    //disabled lines but do not remove
    canvasElement.value.width = mediaElement.value.videoWidth;
    canvasElement.value.height = mediaElement.value.videoHeight;
    //canvasElement.value.width = 1080;
    //canvasElement.value.height = 1080;

    ctx.drawImage(mediaElement.value, 0, 0, canvasElement.value.width, canvasElement.value.height);
    ctx.getContextAttributes().willReadFrequently = true;
    const imageData = ctx.getImageData(0, 0, canvasElement.value.width, canvasElement.value.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];

      // You can implement your own logic here
      if (isCloseToGreen([red, green, blue])) {
        // if (isCloseToGray([red, green, blue])) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    requestAnimationFrame(processFrame);
  }

  processFrame();
}

function isCloseToGreen(color) {
  const [red, green, blue] = color;
  return green > 90 && red < 90 && blue < 90;
}

// Make initAvatar accessible to parent
defineExpose({
    initAvatar
});

</script>  

<style scoped>
.canvasEle {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.talkRow{
  display:flex;
}

.promptArea{
  display:flex;
}

.promptArea div:first-child{
  display: flex;
  align-items: center;
  justify-content: center;  
  width:100%
}

/* .promptArea div:nth-child(2){
  flex-grow: 1;
} */

.loading-text {
    padding: 10px;
    text-align: center;
    font-style: italic;
    color: #666;
}

/* Add these new styles */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.loading-content {
    text-align: center;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

.loading-text {
    color: white;
    font-size: 18px;
    font-weight: 500;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>