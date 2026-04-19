<template>
    <div
        :class="['character-card', { active: isActive }]"
        :style="{ '--accent-color': accentColor }"
        @click="$emit('select')"
    >
        <div class="card-left">
            <div class="avatar-wrapper">
                <img v-if="character.avatar" :alt="character.name" :src="character.avatar" class="avatar"/>
                <div v-else class="avatar-placeholder">{{ character.name.charAt(0) }}</div>
            </div>
            <div class="info">
                <h4 class="name">{{ character.name }}</h4>
                <p class="desc">{{ character.desc }}</p>
            </div>
        </div>
        <div class="card-right">
            <button class="action-btn story-btn" @click.stop="$emit('show-story')">
                故事
            </button>
            <button class="action-btn photo-btn" @click.stop="$emit('show-photos')">
                照片
            </button>
        </div>
    </div>
</template>

<script setup>
import {computed} from 'vue'

const categoryInfo = {
    hero: {
        name: '游戏英雄',
        icon: '🗡️',
        color: '#f0b344'
    },
    player: {
        name: '电竞选手',
        icon: '🏆',
        color: '#e63946'
    },
    celebrity: {
        name: '电竞明星',
        icon: '🎮',
        color: '#2a9d8f'
    }
}

const props = defineProps({
    character: {
        type: Object,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    }
})

defineEmits(['select', 'show-story', 'show-photos'])

const accentColor = computed(() => categoryInfo[props.category]?.color || '#f0b344')
</script>

<!--suppress CssUnresolvedCustomProperty -->
<style scoped>
.character-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(30, 45, 80, 0.6);
    border-radius: 8px;
    padding: 16px 20px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 320px;
    scroll-snap-align: start;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.character-card:hover {
    background: rgba(40, 58, 100, 0.7);
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(240, 179, 68, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.character-card:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

/*noinspection CssUnusedSymbol*/
.character-card.active {
    background: linear-gradient(135deg, rgba(240, 179, 68, 0.15) 0%, rgba(230, 57, 70, 0.15) 100%);
    border-color: var(--accent-color);
    box-shadow: 0 0 0 1px var(--accent-color),
    0 4px 20px rgba(240, 179, 68, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.card-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    margin-right: 20px;
}

.avatar-wrapper {
    flex-shrink: 0;
}

.avatar, .avatar-placeholder {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 2px solid var(--accent-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.avatar-placeholder {
    background: linear-gradient(145deg, var(--accent-color) 0%, #e63946 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    font-weight: bold;
    color: #fff;
}

.info {
    flex: 1;
}

.info .name {
    color: var(--accent-color);
    margin: 0 0 6px 0;
    font-size: 1rem;
    font-weight: 600;
}

.info .desc {
    color: rgba(255, 255, 255, 0.75);
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.4;
}

.card-right {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
}

.action-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.action-btn:active {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.story-btn {
    background: linear-gradient(180deg, #4a9eff 0%, #2d7cd6 100%);
    color: #fff;
}

.story-btn:hover {
    background: linear-gradient(180deg, #5aadff 0%, #3d8ce6 100%);
}

.photo-btn {
    background: linear-gradient(180deg, #f0b344 0%, #d4962e 100%);
    color: #fff;
}

.photo-btn:hover {
    background: linear-gradient(180deg, #ffbe4a 0%, #e4a630 100%);
}
</style>
