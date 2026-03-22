<template>
  <div class="chat-box">
    <div class="chat-header" v-if="title">
      <h4>{{ title }}</h4>
    </div>
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', msg.type]"
      >
        <span class="message-content">{{ msg.content }}</span>
      </div>
    </div>
    <div class="chat-input">
      <input
        v-model="inputText"
        :placeholder="placeholder"
        @keyup.enter="handleSend"
      />
      <button @click="handleSend">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '输入消息...'
  }
})

const emit = defineEmits(['send'])

const inputText = ref('')
const messagesContainer = ref(null)

const handleSend = () => {
  if (inputText.value.trim()) {
    emit('send', inputText.value.trim())
    inputText.value = ''
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(() => props.messages.length, scrollToBottom)
</script>

<style scoped>
.chat-box {
  background: rgba(20, 30, 55, 0.6);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.chat-header {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.chat-header h4 {
  margin: 0;
  color: #f0b344;
  font-size: 0.95rem;
  font-weight: 600;
}

.chat-messages {
  height: 200px;
  overflow-y: auto;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.2);
}

.message {
  margin-bottom: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  max-width: 80%;
  animation: messageSlide 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

@keyframes messageSlide {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  background: linear-gradient(145deg, #4a9eff 0%, #2d7cd6 100%);
  color: #fff;
  margin-left: auto;
  border-bottom-right-radius: 4px;
  box-shadow:
    0 2px 6px rgba(45, 124, 214, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.message.character {
  background: linear-gradient(145deg, #f0b344 0%, #d4962e 100%);
  color: #fff;
  margin-right: auto;
  border-bottom-left-radius: 4px;
  box-shadow:
    0 2px 6px rgba(240, 179, 68, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.message-content {
  word-break: break-word;
}

.chat-input {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.chat-input input {
  flex: 1;
  height: 40px;
  padding: 0 14px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.chat-input input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.chat-input input:focus {
  border-color: #f0b344;
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.2),
    0 0 0 2px rgba(240, 179, 68, 0.15);
}

.chat-input button {
  height: 40px;
  padding: 0 20px;
  background: linear-gradient(145deg, #f0b344 0%, #d4962e 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow:
    0 2px 6px rgba(240, 179, 68, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.chat-input button:hover {
  transform: translateY(-1px);
  box-shadow:
    0 4px 10px rgba(240, 179, 68, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.chat-input button:active {
  transform: translateY(0);
  box-shadow:
    0 1px 3px rgba(240, 179, 68, 0.25),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}
</style>
