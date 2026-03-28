<template>
  <div
    class="route-plan-view"
    :class="{ compact: isCompact }"
    :style="desktopViewportStyle"
  >
    <aside
      :class="['sidebar-shell', { open: mobileSidebarOpen || !isCompact }]"
      :style="desktopSidebarStyle"
    >
      <ConversationSidebar
        :sessions="conversationStore.groupedSessions"
        :current-sid="conversationStore.currentSessionId"
        @select="handleSelectSession"
        @new-chat="handleNewChat"
        @delete="handleDeleteSession"
        @title-update="handleTitleUpdate"
      />
    </aside>

    <div
      v-if="isCompact && mobileSidebarOpen"
      class="sidebar-mask"
      @click="mobileSidebarOpen = false"
    ></div>

    <main class="chat-main">
      <header class="chat-topbar">
        <button
          v-if="isCompact"
          class="history-btn"
          @click="mobileSidebarOpen = true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          会话
        </button>
        <div class="topbar-title">
          <h2>文旅路线规划</h2>
          <p>AI 结合偏好和目的地，实时生成专属路线</p>
        </div>
      </header>

      <section class="chat-surface">
        <RouteChatBox
          ref="chatBoxRef"
          :messages="conversationStore.currentMessages"
          :send-disabled="isProcessing"
          placeholder="描述您的旅行需求..."
          @send="handleSendMessage"
          @copy="handleCopy"
          @favorite="handleFavorite"
        >
          <div
            v-if="conversationStore.currentMessages.length === 0"
            class="chat-welcome"
          >
            <div class="welcome-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="10" r="3"/>
                <path d="M12 2a8 8 0 0 1 8 8c0 5.4-7 11-8 12-1-1-8-6.6-8-12a8 8 0 0 1 8-8z"/>
              </svg>
            </div>
            <h2 class="welcome-title">文旅路线助手</h2>
            <p class="welcome-text">
              我是你的专属旅行规划师。告诉我目的地、天数和偏好，我会给出更贴合实际的路线建议。
            </p>
          </div>
        </RouteChatBox>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useConversationStore } from "../stores/conversation";
import { useStreamTimers } from "../composables/useStreamTimers";
import { sendChatMessage, favoriteRoute } from "../api";
import { ElMessage } from "element-plus";
import ConversationSidebar from "../components/ConversationSidebar.vue";
import RouteChatBox from "../components/RouteChatBox.vue";

const route = useRoute();
const router = useRouter();
const conversationStore = useConversationStore();
const chatBoxRef = ref(null);
const { streamingCancelRef, cancelStreaming } = useStreamTimers();

const isProcessing = ref(false);
const activeStreamToken = ref(0);
const isCompact = ref(
  typeof window !== "undefined" ? window.innerWidth <= 900 : false,
);
const mobileSidebarOpen = ref(false);
const desktopViewportStyle = ref({});
const desktopSidebarStyle = ref({});
const sessionsReady = ref(false);
let headerResizeObserver = null;

const parseSidFromQuery = (sidQuery) => {
  const rawValue = Array.isArray(sidQuery) ? sidQuery[0] : sidQuery;
  const sid = Number(rawValue);
  if (!Number.isInteger(sid) || sid <= 0) return null;
  return sid;
};

const hasSessionBySid = (sid) =>
  conversationStore.sessions.some((s) => Number(s.sid) === sid);

const clearSidQuery = async () => {
  const { sid, ...restQuery } = route.query;
  await router.replace({ query: restQuery });
};

const scrollChatToBottom = async () => {
  await nextTick();
  if (typeof window !== "undefined") {
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }
  chatBoxRef.value?.scrollToBottom();
};

const syncSessionWithRoute = async (sidQuery) => {
  const sid = parseSidFromQuery(sidQuery);

  if (sid === null) {
    if (route.query.sid !== undefined) {
      await clearSidQuery();
    }
    conversationStore.createNewSession();
    return;
  }

  if (!hasSessionBySid(sid)) {
    await clearSidQuery();
    conversationStore.createNewSession();
    return;
  }

  if (
    sid === conversationStore.currentSessionId &&
    conversationStore.currentMessages.length > 0
  ) {
    await scrollChatToBottom();
    return;
  }

  await conversationStore.fetchSessionDetail(sid);
  await scrollChatToBottom();
};

const updateViewportMode = () => {
  if (typeof window === "undefined") return;
  isCompact.value = window.innerWidth <= 900;
  if (!isCompact.value) {
    mobileSidebarOpen.value = false;
  }
  updateDesktopViewportHeight();
};

const updateDesktopViewportHeight = () => {
  if (typeof window === "undefined") return;
  if (isCompact.value) {
    desktopViewportStyle.value = {};
    desktopSidebarStyle.value = {};
    return;
  }

  const header = document.querySelector(".app-header");
  const headerHeight = header?.getBoundingClientRect().height || 0;
  const viewportHeight = window.innerHeight;
  const availableHeight = Math.max(360, Math.round(viewportHeight - headerHeight));

  desktopViewportStyle.value = {
    height: `${availableHeight}px`,
    maxHeight: `${availableHeight}px`,
  };

  desktopSidebarStyle.value = {
    height: `${availableHeight}px`,
    maxHeight: `${availableHeight}px`,
  };
};

const observeHeaderHeight = () => {
  if (typeof window === "undefined" || typeof ResizeObserver === "undefined") {
    return;
  }

  const header = document.querySelector(".app-header");
  if (!header) return;

  headerResizeObserver?.disconnect();
  headerResizeObserver = new ResizeObserver(() => {
    updateDesktopViewportHeight();
  });
  headerResizeObserver.observe(header);
};

const handleSelectSession = (sid) => {
  // 只更新 URL，由 watch 处理会话加载，避免重复请求
  router.replace({ query: sid ? { sid } : {} });
  if (isCompact.value) {
    mobileSidebarOpen.value = false;
  }
};

const handleNewChat = () => {
  conversationStore.createNewSession();
  router.replace({ query: {} });
  if (isCompact.value) {
    mobileSidebarOpen.value = false;
  }
};

const handleDeleteSession = async () => {
  ElMessage.info("删除功能开发中");
};

const handleTitleUpdate = ({ sid, title }) => {
  conversationStore.updateSessionTitle(sid, title);
};

const handleSendMessage = (text) => {
  const streamToken = Date.now();
  activeStreamToken.value = streamToken;

  let streamStarted = false;
  let streamFinished = false;
  let hasAssistantOutput = false;
  let hasEnteredStreaming = false;

  cancelStreaming();

  conversationStore.currentMessages.push({ type: "user", content: text });

  isProcessing.value = true;
  chatBoxRef.value?.setStatus("thinking");

  const { eventSource, cancel } = sendChatMessage(
    text,
    conversationStore.currentSessionId || null,
  );
  streamingCancelRef.value = cancel;

  let streamingMsgIndex = -1;
  let streamingMid = null;

  eventSource.onmessage = (e) => {
    if (streamToken !== activeStreamToken.value) return;

    const data = e.data;

    if (data.type === "start") {
      streamStarted = true;
      if (!conversationStore.currentSessionId) {
        conversationStore.currentSessionId = data.sid;
      }
      streamingMid = data.mid;
    } else if (data.type === "content") {
      if (!hasEnteredStreaming) {
        chatBoxRef.value?.setStatus("streaming");
        hasEnteredStreaming = true;
      }

      const chunk = typeof data.content === "string" ? data.content : "";
      if (!chunk) return;

      if (streamingMsgIndex < 0) {
        streamingMsgIndex = conversationStore.currentMessages.length;
        conversationStore.currentMessages.push({
          type: "character",
          content: chunk,
          mid: streamingMid || data.mid,
        });
      } else {
        conversationStore.appendToMessage(streamingMsgIndex, chunk);
      }

      hasAssistantOutput = true;
    } else if (data.type === "done") {
      streamFinished = true;

      if (streamingMsgIndex >= 0) {
        const finalContent =
          conversationStore.currentMessages[streamingMsgIndex]?.content || "";
        if (!finalContent.trim()) {
          conversationStore.currentMessages.splice(streamingMsgIndex, 1);
        } else {
          conversationStore.currentMessages[streamingMsgIndex].completed = true;
        }
      }

      chatBoxRef.value?.setStatus("idle");
      cancelStreaming(false);
      isProcessing.value = false;
      conversationStore.finalizeMessage();
    }
  };

  eventSource.onerror = (error) => {
    if (streamToken !== activeStreamToken.value) return;

    const isAbortLike =
      error?.name === "AbortError" ||
      /abort|aborted|load failed|failed to fetch/i.test(error?.message || "");

    if (
      !streamFinished &&
      !isAbortLike &&
      (!streamStarted || !hasAssistantOutput)
    ) {
      if (streamingMsgIndex >= 0) {
        conversationStore.currentMessages[streamingMsgIndex].content =
          "抱歉，发生错误，请重试。";
      } else {
        conversationStore.currentMessages.push({
          type: "character",
          content: "抱歉，发生错误，请重试。",
        });
      }
    }

    chatBoxRef.value?.setStatus("idle");
    cancelStreaming();
    isProcessing.value = false;
  };
};

const handleCopy = async (content) => {
  try {
    await navigator.clipboard.writeText(content);
    ElMessage.success("已复制到剪贴板");
  } catch {
    ElMessage.error("复制失败");
  }
};

const handleFavorite = async (mid) => {
  if (!mid) {
    ElMessage.warning("无法收藏此消息");
    return;
  }
  try {
    await favoriteRoute(mid);
    ElMessage.success("已收藏到路线");
  } catch (error) {
    ElMessage.error(error.message || "收藏失败");
  }
};

onMounted(async () => {
  // 无 sid 时先清理历史会话态，避免首屏闪烁旧消息
  if (parseSidFromQuery(route.query.sid) === null) {
    conversationStore.createNewSession();
  }

  await conversationStore.fetchSessions();
  sessionsReady.value = true;

  updateViewportMode();
  observeHeaderHeight();
  window.addEventListener("resize", updateViewportMode);

  await syncSessionWithRoute(route.query.sid);
});

// 监听路由变化（用户通过浏览器前进/后退时处理）
watch(
  () => route.query.sid,
  async (newSid) => {
    if (!sessionsReady.value) return;
    await syncSessionWithRoute(newSid);
  }
);

onUnmounted(() => {
  cancelStreaming();
  conversationStore.createNewSession();
  headerResizeObserver?.disconnect();
  headerResizeObserver = null;
  window.removeEventListener("resize", updateViewportMode);
});
</script>

<style scoped>
.route-plan-view {
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  flex: 1;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(180deg, #141e37 0%, #0f1a2a 100%);
}

.sidebar-shell {
  flex: 0 0 296px;
  width: 296px;
  min-width: 296px;
  max-width: 296px;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 30;
}

.sidebar-shell :deep(.conversation-sidebar) {
  flex: 1;
  min-height: 0;
}

.chat-main {
  flex: 1;
  width: 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 10px;
}

.chat-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(20, 30, 55, 0.72);
  border: 1px solid rgba(240, 179, 68, 0.16);
  border-radius: 12px;
}

.topbar-title h2 {
  margin: 0;
  font-size: 0.98rem;
  color: #f0b344;
  font-weight: 600;
}

.topbar-title p {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.48);
}

.history-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(15, 26, 42, 0.88);
  color: rgba(255, 255, 255, 0.86);
  cursor: pointer;
}

.chat-surface {
  flex: 1;
  min-height: 0;
  border-radius: 12px;
  overflow: hidden;
}

.chat-welcome {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
}

.welcome-icon {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #f0b344, #e63946);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 18px;
  box-shadow: 0 8px 32px rgba(240, 179, 68, 0.25);
}

.welcome-title {
  margin: 0 0 10px;
  font-size: 1.32rem;
  color: rgba(255, 255, 255, 0.95);
}

.welcome-text {
  margin: 0;
  max-width: 460px;
  font-size: 0.9rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.55);
}

.sidebar-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 25;
}

@media (max-width: 900px) {
  .route-plan-view.compact .sidebar-shell {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.35);
  }

  .route-plan-view.compact .sidebar-shell.open {
    transform: translateX(0);
  }

  .chat-main {
    padding: 10px;
  }

  .chat-topbar {
    padding: 9px 10px;
  }

  .topbar-title h2 {
    font-size: 0.93rem;
  }

  .topbar-title p {
    font-size: 0.74rem;
  }

  .welcome-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    font-size: 1.5rem;
  }

  .welcome-title {
    font-size: 1.14rem;
  }

  .welcome-text {
    font-size: 0.84rem;
    padding: 0 8px;
  }
}
</style>


