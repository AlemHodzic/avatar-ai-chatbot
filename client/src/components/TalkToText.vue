<template>
    
    <div v-if="speechRecognitionAvailable" class="speechRecognitionWrapper">

        <div>
            <span v-if="!audioCaptureActive"  ><button @click="startListening" class="btn-speech" >Talk</button></span>
            <span v-if="audioCaptureActive" ><button @click="stopListening" class="btn-speech" >Stop</button></span>
        </div>    
        
        <!--
        <div class="speechResult">{{ textResult }}</div>
        <div >
            <span v-if="audioCaptureActive"  class="microphone-status">MIC</span>
        </div>        
        -->

        <!--
        <i class="fa fa-microphone mic-start" aria-hidden="true"></i> 
        <i class="fa fa-microphone mic-stop" aria-hidden="true"></i>
         -->
        
    </div>

    <div v-if="!speechRecognitionAvailable" class="speechNotAvailable">
    </div>       

</template>

<style scoped>
.speechRecognitionWrapper{
    
    display:flex;   
    color:#fff;
}

.speechRecognitionWrapper div:first-child{
    width:100%;
}

.speechResult{
    background-color:#ffcc00;
    display:none;
}

.speechNotAvailable{
    height:100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

button.btn-speech{
    background-color: var(--sara-green);
}

.microphone-status{
    color:#fff;
    display:block;
    background-color: red;
}

i.fa{
    font-size:24px;
}

i.fa.mic-disabled{
    color:#ddd;
}

i.fa.mic-stop{
    color:blue;
    cursor:pointer;
 
}

i.fa.mic-start{
    color: white;
    cursor:pointer;

}

</style>

<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'

const speechRecognitionAvailable = ref(true)
const speechRecognitionActive = ref(false)
const audioCaptureActive = ref(false)
const textResult = ref('...')

const emit = defineEmits(['customEvent'])

onMounted(() => {
  console.log(`the talktotext component is now mounted.`)
  webspeechCheck()
})

const webspeechCheck = () => {

    if (!('webkitSpeechRecognition' in window)) {
        throw new Error();
        speechRecognitionAvailable.value = 0;
        return;
    }

    if(!browserAvailablity()){
        speechRecognitionAvailable.value = 0;
    }
    
}

const recognition = new webkitSpeechRecognition() || new SpeechRecognition();

recognition.continuous = false;
recognition.lang = 'nl-NL';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

recognition.onaudiostart = (event) =>{

    audioCaptureActive.value = true;
}

recognition.onaudioend = (event) =>{

    audioCaptureActive.value = false;
}

recognition.onresult = (event) => {

        const transcript = event.results[0][0].transcript;
        textResult.value = transcript;
        console.log('result of speech')
        console.log(transcript)
        emit('customEvent', transcript);
    }

recognition.onnomatch = () => {

    textResult.value = "Speech not recognized"
}
    
recognition.onerror = function(event) {
    textResult.value = 'Error occurred in recognition: ' + event.error;
}   

const startListening = () => {

    console.log('start listening');
    console.log(audioCaptureActive);
    if(audioCaptureActive.value){

        stopListening()
        audioCaptureActive.value = false

    }
    else{

        textResult.value = '...';   
        audioCaptureActive.value = true
        recognition.start();

    }

}

const stopListening = () =>{

    console.log('stop listening');
    audioCaptureActive.value = false;
    recognition.stop();
    textResult.value = '...';  
}

const browserAvailablity = () => {

    //alert(navigator.userAgent); 
    //if(navigator.userAgent.includes("FireFox")) { return false; }
    if(navigator.userAgent.includes("Chrome")) { return true; }
    if(navigator.userAgent.includes("Safari")) { return true; }

    //always
    return false
}



</script>