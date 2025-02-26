<template>
  <div class="chat-window chat-window__right">
    <div class="chat-window__title" @click="addNewText">{{ chatTitle }}
      <ul class="chat-window__position">
          <li><span @click="changeWindowPosition">{{ chatPostitionText }}</span></li>
      </ul>
    </div>
    <div class="chat-window__chats" >
      <ul class="chat-list" >
          <li v-for="item in chat.messages" 
          :class="item.type"
          >
            <div class="chat-list__item" >
              <span class="chat-list__user-label" >{{ (item.type == 'user') ? chatUserLabel : chatBotLabel }}</span>
              <div class="chat-list__item-text" v-html="linkText(item.text)" ></div>
            </div>
          </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import {  ref, reactive, onMounted, defineExpose } from 'vue';
import linkifyHtml from 'linkify-html';

//props of the component
const props = defineProps({
  chatVisible: Boolean,
  chatTitle: String,
  chatMessages: Array,
  addMessage: Function,
  welcomeText: { type: String, default: 'Hallo, waarmee kan ik je van dienst zijn?' },
  chatUserLabel: { type: String, default: 'You' },
  chatBotLabel: { type: String, default: 'Avatar' },
  chatPostitionText : { type: String, default: 'Left / Right'},
  settings: { Object, default: () => ({}) }
})



const chat = reactive({
  messages: []
});



let linkifyHtmlOptions = { 
  defaultProtocol: "https",
  target: "_blank",
  nl2br: true,
  className: "chat-item-hyperlink"
};

function linkText(text){
  if(text){
    return linkifyHtml(text,linkifyHtmlOptions);
  }
}

function changeWindowPosition(e){

  let chatWindow = document.querySelector('.chat-window');

  if(chatWindow.classList.contains('chat-window__left')){
    chatWindow.classList.remove('chat-window__left');
    chatWindow.classList.add('chat-window__right');
  }
  else{
    chatWindow.classList.remove('chat-window__right');
    chatWindow.classList.add('chat-window__left');
  }

}

function addNewMessage(userType,message){

  chat.messages.push({
    text: message,
    type: userType
  });

  scrollToLatestChat();
}

function scrollToLatestChat(){

  //console.log('scroll to latest');
  setTimeout(() => {
    let chatsElement = document.querySelectorAll('.chat-list li:last-child')[0];  
    chatsElement.scrollIntoView({ behavior: 'smooth' });
  }, 200);

}

//on mounted vue
onMounted(() => {

 // alert('chat mount');
 //addNewMessage('user','hallo.....');
 // console.log('asdfasdfasd');

  //console.log(props.welcomeText); 

  //console.log('asdfasd');
  //console.log(props.welcomeText);

  setTimeout(function(){
    addNewMessage('bot',props.welcomeText);  
  },1000);
  
})

//expose these functions for parent components
defineExpose({
  addNewMessage
})


</script>



<style scoped>


.chat-window {
  background-color: #f7f7f7;
  height: 100%;
  padding: 5px;  
  border: 1px solid #ccc;
  color: #222;
  position:absolute;
  z-index:100;
  width:30vw;
  height: 80vh;
  background-color: #fff;
  border-radius: 10px;
  top:20px;
  display:grid;
  grid-template-rows: 5% 95%;
}



.chat-window__chats{
  padding:10px 0;
  margin:0;
 
}


.chat-window__position{
  position:absolute;
  right:25px;
  font-size:12px;
  color:#ccc;
  list-style-type: none;
  margin:0;
  padding:0;
}

.chat-window__left{
  left:20px;
}

.chat-window__right{
  right:20px;
}

.chat-window__title{
  background-color:#666;
  color:#fff;
  display:block;
  border-radius: 8px 8px 0 0;
  display:flex;
  align-items: center;
  justify-content: center;
  padding:5px;
}

.chat-list{
  list-style-type: none;
  display:flex;
  flex-direction: column;
  gap:12px;
  overflow-y: scroll;     
  padding:0;
  margin: 0;
  height:100%;
  box-sizing: border-box;
  padding:0;
}

.chat-list li{
  margin:0;
  padding:0;
  display:flex;
}

.chat-list li.user{
  justify-content: left;
}

.chat-list li.user div.chat-list__item{
  background-color: rgb(211, 255, 211);
}

.chat-list li.bot{
  justify-content: right;
}

.chat-list li.bot .chat-list__item{
  display: block;
  text-align: right;
  padding-right:20px;
}

.chat-list li.bot div.chat-list__item{
  background-color:rgb(207, 242, 253);
}

.chat-list__item{
  width:80%;
  background-color: #f7f7f7;
  border-radius: 5px;
  border: none;
  text-align: left;
  padding:15px;
}


.chat-list__user-label{
  background-color: #fff;
  padding: 3px 9px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
}

.chat-list__item-text{
  word-break: break-word;
}

:deep(.chat-list__item-text a:link),
:deep(.chat-list__item-text a:visited){
  color: #0000ff;
  text-decoration:underline;
}

:deep(.chat-list__item-text a:hover){
  color: #0000ff;
  text-decoration:none;
}

@media screen and (max-width: 540px) {

.chat-window{
  width: calc(100% - 40px);
  margin: 20px;
}

.chat-window__right,
.chat-window__left{
  right: auto;
}
}


</style>