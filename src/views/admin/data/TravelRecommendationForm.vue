<template>
    <div class="rec-form-page">
        <div class="page-header">
            <div class="header-left">
                <button class="back-btn" type="button" @click="handleBack">
                    <svg fill="none" height="18" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18">
                        <line x1="19" x2="5" y1="12" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                </button>
                <div class="header-text">
                    <h1>{{ isEdit ? '编辑推荐' : '新增推荐' }}</h1>
                    <p class="subtitle">{{ isEdit ? `ID: ${route.params.id}` : '创建一个新的城市推荐' }}</p>
                </div>
            </div>
        </div>

        <div v-loading="loading" class="form-content">
            <el-form
                ref="formRef"
                :model="formData"
                :rules="rules"
                class="rec-form"
                label-width="120px"
                @submit.prevent
            >
                <!-- 基本信息 -->
                <div class="form-card">
                    <h2 class="card-title">
                        <span class="title-index">1</span>
                        基本信息
                    </h2>
                    <div class="card-body">
                        <el-form-item label="名称" prop="name">
                            <el-input v-model="formData.name" maxlength="80" placeholder="请输入完整名称（如：西安 · 长安荣耀之旅）"/>
                        </el-form-item>
                        <el-form-item label="显示名" prop="display_name">
                            <el-input v-model="formData.display_name" maxlength="120" placeholder="请输入显示名（如：西安）"/>
                        </el-form-item>
                        <el-form-item label="中心经度" prop="center_lon">
                            <div class="coord-row">
                                <el-input-number
                                    v-model="formData.center_lon"
                                    :max="180"
                                    :min="-180"
                                    :precision="6"
                                    :step="0.01"
                                    class="coord-input"
                                    placeholder="-180 ~ 180"
                                />
                            </div>
                        </el-form-item>
                        <el-form-item label="中心纬度" prop="center_lat">
                            <div class="coord-row">
                                <el-input-number
                                    v-model="formData.center_lat"
                                    :max="90"
                                    :min="-90"
                                    :precision="6"
                                    :step="0.01"
                                    class="coord-input"
                                    placeholder="-90 ~ 90"
                                />
                            </div>
                        </el-form-item>
                        <el-form-item label=" ">
                            <el-button class="picker-btn" @click="pickerVisible = true">
                                <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                    <circle cx="12" cy="10" r="3"/>
                                </svg>
                                从地图取点
                            </el-button>
                            <el-button v-if="isEdit" class="picker-reset-btn" @click="resetCoords">
                                <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                    <polyline points="1 4 1 10 7 10"/>
                                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                                </svg>
                                还原
                            </el-button>
                        </el-form-item>
                        <el-form-item label="启用状态" prop="is_active">
                            <el-switch
                                v-model="formData.is_active"
                                active-text="启用"
                                inactive-text="停用"
                            />
                        </el-form-item>
                    </div>
                </div>

                <!-- 推荐选手 -->
                <div class="form-card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <span class="title-index">2</span>
                            推荐选手
                        </h2>
                        <el-button class="add-item-btn" size="small" @click="addPlayers">
                            <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                <line x1="12" x2="12" y1="5" y2="19"/>
                                <line x1="5" x2="19" y1="12" y2="12"/>
                            </svg>
                            添加选手
                        </el-button>
                    </div>
                    <div class="card-body">
                        <div
                            v-for="(p, idx) in formData.players"
                            :key="idx"
                            :class="['draggable-item', 'complex-row', 'players-row', {dragging: draggingKey === 'players' && draggingIdx === idx, 'drop-target': dropTargetKey === 'players' && dropTargetIdx === idx}]"
                            draggable="true"
                            @dragstart="onDragStart('players', idx, $event)"
                            @dragover.prevent="onDragOver('players', idx, $event)"
                            @dragend="onDragEnd"
                            @drop.prevent="onDrop('players', idx, $event)"
                        >
                            <div class="drag-handle" title="拖动调整顺序">
                                <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                    <circle cx="9" cy="6" r="1"/>
                                    <circle cx="9" cy="12" r="1"/>
                                    <circle cx="9" cy="18" r="1"/>
                                    <circle cx="15" cy="6" r="1"/>
                                    <circle cx="15" cy="12" r="1"/>
                                    <circle cx="15" cy="18" r="1"/>
                                </svg>
                            </div>
                            <el-input v-model="p.name" maxlength="80" placeholder="选手名（如：一诺）"/>
                            <el-input v-model="p.hero" maxlength="80" placeholder="代表英雄"/>
                            <el-input v-model="p.team" maxlength="120" placeholder="战队"/>
                            <el-input v-model="p.description" maxlength="500" placeholder="简介"/>
                            <button class="row-remove" type="button" @click="removeItem('players', idx)">×</button>
                        </div>
                        <div v-if="formData.players.length === 0" class="empty-tip">暂无选手，点击"添加选手"开始</div>
                    </div>
                </div>

                <!-- 推荐英雄 -->
                <div class="form-card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <span class="title-index">3</span>
                            推荐英雄
                        </h2>
                        <el-button class="add-item-btn" size="small" @click="addHeroes">
                            <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                <line x1="12" x2="12" y1="5" y2="19"/>
                                <line x1="5" x2="19" y1="12" y2="12"/>
                            </svg>
                            添加英雄
                        </el-button>
                    </div>
                    <div class="card-body">
                        <div
                            v-for="(h, idx) in formData.heroes"
                            :key="idx"
                            :class="['draggable-item', 'complex-row', 'heroes-row', {dragging: draggingKey === 'heroes' && draggingIdx === idx, 'drop-target': dropTargetKey === 'heroes' && dropTargetIdx === idx}]"
                            draggable="true"
                            @dragstart="onDragStart('heroes', idx, $event)"
                            @dragover.prevent="onDragOver('heroes', idx, $event)"
                            @dragend="onDragEnd"
                            @drop.prevent="onDrop('heroes', idx, $event)"
                        >
                            <div class="drag-handle" title="拖动调整顺序">
                                <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                    <circle cx="9" cy="6" r="1"/>
                                    <circle cx="9" cy="12" r="1"/>
                                    <circle cx="9" cy="18" r="1"/>
                                    <circle cx="15" cy="6" r="1"/>
                                    <circle cx="15" cy="12" r="1"/>
                                    <circle cx="15" cy="18" r="1"/>
                                </svg>
                            </div>
                            <el-input v-model="h.name" maxlength="80" placeholder="英雄名"/>
                            <el-input v-model="h.role" maxlength="80" placeholder="定位（如：刺客）"/>
                            <el-input v-model="h.style" maxlength="80" placeholder="风格"/>
                            <el-input v-model="h.description" maxlength="500" placeholder="简介"/>
                            <button class="row-remove" type="button" @click="removeItem('heroes', idx)">×</button>
                        </div>
                        <div v-if="formData.heroes.length === 0" class="empty-tip">暂无英雄，点击"添加英雄"开始</div>
                    </div>
                </div>

                <!-- 电竞资讯 -->
                <div class="form-card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <span class="title-index">4</span>
                            电竞资讯
                        </h2>
                        <el-button class="add-item-btn" size="small" @click="addContent('esports_info')">
                            <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                <line x1="12" x2="12" y1="5" y2="19"/>
                                <line x1="5" x2="19" y1="12" y2="12"/>
                            </svg>
                            添加资讯
                        </el-button>
                    </div>
                    <div class="card-body">
                        <div
                            v-for="(item, idx) in formData.esports_info"
                            :key="idx"
                            :class="['draggable-item', 'simple-row', {dragging: draggingKey === 'esports_info' && draggingIdx === idx, 'drop-target': dropTargetKey === 'esports_info' && dropTargetIdx === idx}]"
                            draggable="true"
                            @dragstart="onDragStart('esports_info', idx, $event)"
                            @dragover.prevent="onDragOver('esports_info', idx, $event)"
                            @dragend="onDragEnd"
                            @drop.prevent="onDrop('esports_info', idx, $event)"
                        >
                            <div class="drag-handle" title="拖动调整顺序">
                                <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                    <circle cx="9" cy="6" r="1"/>
                                    <circle cx="9" cy="12" r="1"/>
                                    <circle cx="9" cy="18" r="1"/>
                                    <circle cx="15" cy="6" r="1"/>
                                    <circle cx="15" cy="12" r="1"/>
                                    <circle cx="15" cy="18" r="1"/>
                                </svg>
                            </div>
                            <el-input v-model="item.content" maxlength="500" placeholder="电竞资讯内容"/>
                            <button class="row-remove" type="button" @click="removeItem('esports_info', idx)">×</button>
                        </div>
                        <div v-if="formData.esports_info.length === 0" class="empty-tip">暂无资讯，点击"添加资讯"开始</div>
                    </div>
                </div>

                <!-- 美食 -->
                <div class="form-card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <span class="title-index">5</span>
                            美食
                        </h2>
                        <el-button class="add-item-btn" size="small" @click="addContent('foods')">
                            <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                <line x1="12" x2="12" y1="5" y2="19"/>
                                <line x1="5" x2="19" y1="12" y2="12"/>
                            </svg>
                            添加美食
                        </el-button>
                    </div>
                    <div class="card-body">
                        <div
                            v-for="(item, idx) in formData.foods"
                            :key="idx"
                            :class="['draggable-item', 'simple-row', {dragging: draggingKey === 'foods' && draggingIdx === idx, 'drop-target': dropTargetKey === 'foods' && dropTargetIdx === idx}]"
                            draggable="true"
                            @dragstart="onDragStart('foods', idx, $event)"
                            @dragover.prevent="onDragOver('foods', idx, $event)"
                            @dragend="onDragEnd"
                            @drop.prevent="onDrop('foods', idx, $event)"
                        >
                            <div class="drag-handle" title="拖动调整顺序">
                                <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                    <circle cx="9" cy="6" r="1"/>
                                    <circle cx="9" cy="12" r="1"/>
                                    <circle cx="9" cy="18" r="1"/>
                                    <circle cx="15" cy="6" r="1"/>
                                    <circle cx="15" cy="12" r="1"/>
                                    <circle cx="15" cy="18" r="1"/>
                                </svg>
                            </div>
                            <el-input v-model="item.content" maxlength="500" placeholder="美食条目"/>
                            <button class="row-remove" type="button" @click="removeItem('foods', idx)">×</button>
                        </div>
                        <div v-if="formData.foods.length === 0" class="empty-tip">暂无美食，点击"添加美食"开始</div>
                    </div>
                </div>

                <!-- 旅行贴士 -->
                <div class="form-card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <span class="title-index">6</span>
                            旅行贴士
                        </h2>
                        <el-button class="add-item-btn" size="small" @click="addContent('travel_tips')">
                            <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                <line x1="12" x2="12" y1="5" y2="19"/>
                                <line x1="5" x2="19" y1="12" y2="12"/>
                            </svg>
                            添加贴士
                        </el-button>
                    </div>
                    <div class="card-body">
                        <div
                            v-for="(item, idx) in formData.travel_tips"
                            :key="idx"
                            :class="['draggable-item', 'simple-row', {dragging: draggingKey === 'travel_tips' && draggingIdx === idx, 'drop-target': dropTargetKey === 'travel_tips' && dropTargetIdx === idx}]"
                            draggable="true"
                            @dragstart="onDragStart('travel_tips', idx, $event)"
                            @dragover.prevent="onDragOver('travel_tips', idx, $event)"
                            @dragend="onDragEnd"
                            @drop.prevent="onDrop('travel_tips', idx, $event)"
                        >
                            <div class="drag-handle" title="拖动调整顺序">
                                <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                    <circle cx="9" cy="6" r="1"/>
                                    <circle cx="9" cy="12" r="1"/>
                                    <circle cx="9" cy="18" r="1"/>
                                    <circle cx="15" cy="6" r="1"/>
                                    <circle cx="15" cy="12" r="1"/>
                                    <circle cx="15" cy="18" r="1"/>
                                </svg>
                            </div>
                            <el-input v-model="item.content" maxlength="500" placeholder="旅行贴士"/>
                            <button class="row-remove" type="button" @click="removeItem('travel_tips', idx)">×</button>
                        </div>
                        <div v-if="formData.travel_tips.length === 0" class="empty-tip">暂无贴士，点击"添加贴士"开始</div>
                    </div>
                </div>

                <!-- 打卡任务 -->
                <div class="form-card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <span class="title-index">7</span>
                            打卡任务
                        </h2>
                        <el-button class="add-item-btn" size="small" @click="addTasks">
                            <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                <line x1="12" x2="12" y1="5" y2="19"/>
                                <line x1="5" x2="19" y1="12" y2="12"/>
                            </svg>
                            添加任务
                        </el-button>
                    </div>
                    <div class="card-body">
                        <div
                            v-for="(t, idx) in formData.tasks"
                            :key="idx"
                            :class="['draggable-item', 'complex-row', 'tasks-row', {dragging: draggingKey === 'tasks' && draggingIdx === idx, 'drop-target': dropTargetKey === 'tasks' && dropTargetIdx === idx}]"
                            draggable="true"
                            @dragstart="onDragStart('tasks', idx, $event)"
                            @dragover.prevent="onDragOver('tasks', idx, $event)"
                            @dragend="onDragEnd"
                            @drop.prevent="onDrop('tasks', idx, $event)"
                        >
                            <div class="drag-handle" title="拖动调整顺序">
                                <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                    <circle cx="9" cy="6" r="1"/>
                                    <circle cx="9" cy="12" r="1"/>
                                    <circle cx="9" cy="18" r="1"/>
                                    <circle cx="15" cy="6" r="1"/>
                                    <circle cx="15" cy="12" r="1"/>
                                    <circle cx="15" cy="18" r="1"/>
                                </svg>
                            </div>
                            <el-input v-model="t.title" maxlength="120" placeholder="任务标题"/>
                            <el-input v-model="t.description" maxlength="500" placeholder="任务描述"/>
                            <el-input v-model="t.reward" maxlength="200" placeholder="奖励"/>
                            <button class="row-remove" type="button" @click="removeItem('tasks', idx)">×</button>
                        </div>
                        <div v-if="formData.tasks.length === 0" class="empty-tip">暂无任务，点击"添加任务"开始</div>
                    </div>
                </div>

                <!-- 推荐路线 -->
                <div class="form-card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <span class="title-index">8</span>
                            推荐路线
                        </h2>
                        <el-button class="add-item-btn" size="small" @click="addContent('routes')">
                            <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                <line x1="12" x2="12" y1="5" y2="19"/>
                                <line x1="5" x2="19" y1="12" y2="12"/>
                            </svg>
                            添加路线
                        </el-button>
                    </div>
                    <div class="card-body">
                        <div
                            v-for="(item, idx) in formData.routes"
                            :key="idx"
                            :class="['draggable-item', 'simple-row', {dragging: draggingKey === 'routes' && draggingIdx === idx, 'drop-target': dropTargetKey === 'routes' && dropTargetIdx === idx}]"
                            draggable="true"
                            @dragstart="onDragStart('routes', idx, $event)"
                            @dragover.prevent="onDragOver('routes', idx, $event)"
                            @dragend="onDragEnd"
                            @drop.prevent="onDrop('routes', idx, $event)"
                        >
                            <div class="drag-handle" title="拖动调整顺序">
                                <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
                                    <circle cx="9" cy="6" r="1"/>
                                    <circle cx="9" cy="12" r="1"/>
                                    <circle cx="9" cy="18" r="1"/>
                                    <circle cx="15" cy="6" r="1"/>
                                    <circle cx="15" cy="12" r="1"/>
                                    <circle cx="15" cy="18" r="1"/>
                                </svg>
                            </div>
                            <el-input v-model="item.content" maxlength="500" placeholder="推荐路线"/>
                            <button class="row-remove" type="button" @click="removeItem('routes', idx)">×</button>
                        </div>
                        <div v-if="formData.routes.length === 0" class="empty-tip">暂无路线，点击"添加路线"开始</div>
                    </div>
                </div>
            </el-form>

            <div class="form-footer">
                <el-button :loading="submitting" class="cancel-btn" @click="handleBack">取消</el-button>
                <el-button :loading="submitting" class="submit-btn" type="primary" @click="handleSubmit">
                    {{ isEdit ? '保存修改' : '创建推荐' }}
                </el-button>
            </div>
        </div>

        <!-- 地图取点弹窗 -->
        <el-dialog
            v-model="pickerVisible"
            class="picker-dialog"
            title="点击地图选取中心坐标"
            width="760px"
            destroy-on-close
        >
            <svg
                ref="pickerSvgRef"
                class="picker-svg-large"
                preserveAspectRatio="xMidYMid meet"
                :viewBox="pickerViewBox"
                @click="onPickerClick"
                @mousedown="onPickerMouseDown"
                @mousemove="onPickerMouseMove"
                @mouseup="onPickerMouseUp"
                @mouseleave="onPickerPanEnd"
                @wheel.prevent="onPickerWheel"
            >
                <g class="picker-provinces">
                    <path
                        v-for="(d, i) in pickerPaths"
                        :key="i"
                        :d="d"
                        class="picker-province-path"
                    />
                </g>
                <g v-if="hasCoord" class="picker-marker">
                    <circle :cx="markerX" :cy="markerY" class="marker-dot" r="8"/>
                    <circle :cx="markerX" :cy="markerY" class="marker-ring" r="20"/>
                    <line :x1="markerX - 24" :x2="markerX + 24" :y1="markerY" :y2="markerY" class="marker-cross"/>
                    <line :x1="markerX" :x2="markerX" :y1="markerY - 24" :y2="markerY + 24" class="marker-cross"/>
                </g>
            </svg>
            <template #footer>
                <div class="picker-footer-row">
                    <span class="picker-footer-hint">点击地图自动填入经纬度，然后关闭弹窗</span>
                    <el-button type="primary" @click="pickerVisible = false">完成</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {adminCreateTravelRec, adminGetTravelRec, adminUpdateTravelRec} from '../../../api'

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)

const isEdit = computed(() => !!route.params.id)

const makeBlankFormData = () => ({
    name: '',
    display_name: '',
    center_lon: 0,
    center_lat: 0,
    is_active: true,
    players: [],
    heroes: [],
    esports_info: [],
    foods: [],
    travel_tips: [],
    tasks: [],
    routes: []
})

const formData = ref(makeBlankFormData())

const rules = {
    name: [
        {required: true, message: '请输入名称', trigger: 'blur'},
        {min: 3, max: 80, message: '长度 3-80 字符', trigger: 'blur'}
    ],
    display_name: [
        {required: true, message: '请输入显示名', trigger: 'blur'},
        {min: 1, max: 120, message: '长度 1-120 字符', trigger: 'blur'}
    ],
    center_lon: [
        {required: true, message: '请输入中心经度', trigger: 'blur'},
        {type: 'number', min: -180, max: 180, message: '经度范围 -180 ~ 180', trigger: 'blur'}
    ],
    center_lat: [
        {required: true, message: '请输入中心纬度', trigger: 'blur'},
        {type: 'number', min: -90, max: 90, message: '纬度范围 -90 ~ 90', trigger: 'blur'}
    ]
}

const addPlayers = () => {
    formData.value.players.push({
        name: '',
        hero: '',
        team: '',
        description: '',
        display_order: 0
    })
}

const addHeroes = () => {
    formData.value.heroes.push({
        name: '',
        role: '',
        style: '',
        description: '',
        display_order: 0
    })
}

const addTasks = () => {
    formData.value.tasks.push({
        title: '',
        description: '',
        reward: '',
        display_order: 0
    })
}

const addContent = (key) => {
    formData.value[key].push({
        content: '',
        display_order: 0
    })
}

const removeItem = (key, idx) => {
    formData.value[key].splice(idx, 1)
}

// 拖拽排序（HTML5 native drag-and-drop）
const draggingKey = ref(null)
const draggingIdx = ref(-1)
const dropTargetKey = ref(null)
const dropTargetIdx = ref(-1)

const onDragStart = (key, idx, event) => {
    draggingKey.value = key
    draggingIdx.value = idx
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', `${key}:${idx}`)
    }
}

const onDragOver = (key, idx) => {
    if (draggingKey.value !== key) return
    dropTargetKey.value = key
    dropTargetIdx.value = idx
}

const onDrop = (key, idx) => {
    if (draggingKey.value !== key) return
    if (draggingIdx.value === idx) {
        onDragEnd()
        return
    }
    const arr = formData.value[key]
    if (!arr) {
        onDragEnd()
        return
    }
    const [moved] = arr.splice(draggingIdx.value, 1)
    arr.splice(idx, 0, moved)
    onDragEnd()
}

const onDragEnd = () => {
    draggingKey.value = null
    draggingIdx.value = -1
    dropTargetKey.value = null
    dropTargetIdx.value = -1
}

// 提交前根据数组顺序重新分配 display_order
const renumberDisplayOrders = () => {
    const arrays = ['players', 'heroes', 'esports_info', 'foods', 'travel_tips', 'tasks', 'routes']
    for (const key of arrays) {
        const arr = formData.value[key]
        if (!Array.isArray(arr)) continue
        arr.forEach((item, index) => {
            item.display_order = index + 1
        })
    }
}

const handleBack = () => {
    router.push('/manage/data/travel-recommendations')
}

const loadDetail = async (id) => {
    loading.value = true
    try {
        const result = await adminGetTravelRec(id)
        if (result?.success && result.recommendation) {
            const r = result.recommendation
            formData.value = {
                name: r.name ?? '',
                display_name: r.display_name ?? '',
                center_lon: Number(r.center_lon) || 0,
                center_lat: Number(r.center_lat) || 0,
                is_active: r.is_active !== false,
                players: Array.isArray(r.players) ? r.players.map(x => ({...x})) : [],
                heroes: Array.isArray(r.heroes) ? r.heroes.map(x => ({...x})) : [],
                esports_info: Array.isArray(r.esports_info) ? r.esports_info.map(x => ({...x})) : [],
                foods: Array.isArray(r.foods) ? r.foods.map(x => ({...x})) : [],
                travel_tips: Array.isArray(r.travel_tips) ? r.travel_tips.map(x => ({...x})) : [],
                tasks: Array.isArray(r.tasks) ? r.tasks.map(x => ({...x})) : [],
                routes: Array.isArray(r.routes) ? r.routes.map(x => ({...x})) : []
            }
            saveInitialCoords()
        } else {
            ElMessage.error(result?.message || '获取推荐详情失败')
            router.replace('/manage/data/travel-recommendations')
        }
    } catch (error) {
        ElMessage.error('获取推荐详情失败: ' + (error?.message || ''))
        router.replace('/manage/data/travel-recommendations')
    } finally {
        loading.value = false
    }
}

const validateSubItems = () => {
    // 简单条目：content 不能为空
    const simpleKeys = ['esports_info', 'foods', 'travel_tips', 'routes']
    for (const key of simpleKeys) {
        for (let i = 0; i < formData.value[key].length; i++) {
            if (!formData.value[key][i].content || !formData.value[key][i].content.trim()) {
                ElMessage.warning(`第 ${i + 1} 个"${labelOf(key)}"内容不能为空`)
                return false
            }
        }
    }
    // players
    for (let i = 0; i < formData.value.players.length; i++) {
        const p = formData.value.players[i]
        if (!p.name || !p.name.trim()) {
            ElMessage.warning(`第 ${i + 1} 个"推荐选手"的选手名不能为空`)
            return false
        }
    }
    // heroes
    for (let i = 0; i < formData.value.heroes.length; i++) {
        const h = formData.value.heroes[i]
        if (!h.name || !h.name.trim()) {
            ElMessage.warning(`第 ${i + 1} 个"推荐英雄"的英雄名不能为空`)
            return false
        }
    }
    // tasks
    for (let i = 0; i < formData.value.tasks.length; i++) {
        const t = formData.value.tasks[i]
        if (!t.title || !t.title.trim()) {
            ElMessage.warning(`第 ${i + 1} 个"打卡任务"的标题不能为空`)
            return false
        }
    }
    return true
}

const labelOf = (key) => ({
    esports_info: '电竞资讯',
    foods: '美食',
    travel_tips: '旅行贴士',
    routes: '推荐路线'
}[key] || key)

const handleSubmit = async () => {
    if (!formRef.value) return
    try {
        await formRef.value.validate()
    } catch {
        ElMessage.warning('请检查必填字段')
        return
    }
    if (!validateSubItems()) return

    // 根据当前数组顺序重新分配 display_order（拖拽后的真实顺序）
    renumberDisplayOrders()

    submitting.value = true
    try {
        const payload = {
            name: formData.value.name,
            display_name: formData.value.display_name,
            center_lon: formData.value.center_lon,
            center_lat: formData.value.center_lat,
            is_active: formData.value.is_active,
            players: formData.value.players,
            heroes: formData.value.heroes,
            esports_info: formData.value.esports_info,
            foods: formData.value.foods,
            travel_tips: formData.value.travel_tips,
            tasks: formData.value.tasks,
            routes: formData.value.routes
        }
        if (isEdit.value) {
            const result = await adminUpdateTravelRec(route.params.id, payload)
            if (result?.success) {
                ElMessage.success('保存成功')
                router.push('/manage/data/travel-recommendations')
            } else {
                ElMessage.error(result?.message || '保存失败')
            }
        } else {
            const result = await adminCreateTravelRec(payload)
            if (result?.success) {
                ElMessage.success('创建成功')
                router.push('/manage/data/travel-recommendations')
            } else {
                ElMessage.error(result?.message || '创建失败')
            }
        }
    } catch (error) {
        ElMessage.error('提交失败: ' + (error?.message || ''))
    } finally {
        submitting.value = false
    }
}

// 初始经纬度（编辑模式下用于还原）
const initialLon = ref(0)
const initialLat = ref(0)

const saveInitialCoords = () => {
    initialLon.value = formData.value.center_lon
    initialLat.value = formData.value.center_lat
}

const resetCoords = () => {
    formData.value.center_lon = initialLon.value
    formData.value.center_lat = initialLat.value
}

// 坐标取点地图
const pickerVisible = ref(false)
const pickerPaths = ref([])
const pickerSvgRef = ref(null)

const geoToSvg = (lon, lat) => ({
    x: 7.242 * lon - 366.12,
    y: -10.06 * lat + 540.06
})

const svgToGeo = (x, y) => ({
    lon: (x + 366.12) / 7.242,
    lat: (540.06 - y) / 10.06
})

const markerPos = computed(() => {
    const lon = Number(formData.value.center_lon)
    const lat = Number(formData.value.center_lat)
    if (isNaN(lon) || isNaN(lat)) return null
    return geoToSvg(lon, lat)
})

const markerX = computed(() => markerPos.value?.x ?? 0)
const markerY = computed(() => markerPos.value?.y ?? 0)
const hasCoord = computed(() => !!markerPos.value)

// 地图取点器：缩放与拖拽
const SVG_W = 795
const SVG_H = 500
const pvbX = ref(0)
const pvbY = ref(0)
const pvbW = ref(SVG_W)
const pvbH = ref(SVG_H)
const isPanning = ref(false)
const panStartX = ref(0)
const panStartY = ref(0)
const panStartVbX = ref(0)
const panStartVbY = ref(0)
const MIN_VB_W = 200
const MAX_VB_W = SVG_W * 2.5

const pickerViewBox = computed(() => `${pvbX.value} ${pvbY.value} ${pvbW.value} ${pvbH.value}`)

const onPickerWheel = (e) => {
    const svg = pickerSvgRef.value
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const scaleX = pvbW.value / rect.width
    const scaleY = pvbH.value / rect.height
    const svgX = pvbX.value + (e.clientX - rect.left) * scaleX
    const svgY = pvbY.value + (e.clientY - rect.top) * scaleY
    const factor = e.deltaY > 0 ? 1.15 : 0.87
    const newW = Math.min(MAX_VB_W, Math.max(MIN_VB_W, pvbW.value * factor))
    const newH = newW * (SVG_H / SVG_W)
    const newScaleX = rect.width / newW
    const newScaleY = rect.height / newH
    pvbX.value = svgX - (e.clientX - rect.left) / newScaleX
    pvbY.value = svgY - (e.clientY - rect.top) / newScaleY
    pvbW.value = newW
    pvbH.value = newH
}

const onPickerMouseDown = (e) => {
    if (e.button !== 0) return
    isPanning.value = true
    panStartX.value = e.clientX
    panStartY.value = e.clientY
    panStartVbX.value = pvbX.value
    panStartVbY.value = pvbY.value
}

const onPickerMouseMove = (e) => {
    if (!isPanning.value) return
    const svg = pickerSvgRef.value
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const dx = (e.clientX - panStartX.value) * (pvbW.value / rect.width)
    const dy = (e.clientY - panStartY.value) * (pvbH.value / rect.height)
    pvbX.value = panStartVbX.value - dx
    pvbY.value = panStartVbY.value - dy
}

const onPickerMouseUp = () => { isPanning.value = false }
const onPickerPanEnd = () => { isPanning.value = false }

const resetPickerView = () => {
    pvbX.value = 0
    pvbY.value = 0
    pvbW.value = SVG_W
    pvbH.value = SVG_H
}

const onPickerClick = (e) => {
    // 拖拽中不触发点击
    if (Math.abs(e.clientX - panStartX.value) > 3 || Math.abs(e.clientY - panStartY.value) > 3) return
    const svg = pickerSvgRef.value
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const svgX = pvbX.value + (e.clientX - rect.left) * (pvbW.value / rect.width)
    const svgY = pvbY.value + (e.clientY - rect.top) * (pvbH.value / rect.height)
    const geo = svgToGeo(svgX, svgY)
    if (geo.lon >= -180 && geo.lon <= 180 && geo.lat >= -90 && geo.lat <= 90) {
        formData.value.center_lon = Math.round(geo.lon * 1e6) / 1e6
        formData.value.center_lat = Math.round(geo.lat * 1e6) / 1e6
    }
}

const loadPickerPaths = async () => {
    try {
        const resp = await fetch('/China_map.svg')
        const text = await resp.text()
        const paths = []
        const regex = /<path[^>]*d="([^"]+)"[^>]*>/g
        let m
        while ((m = regex.exec(text)) !== null) {
            paths.push(m[1])
        }
        pickerPaths.value = paths
    } catch {
        // 地图加载失败不阻塞表单
    }
}

// 打开地图取点弹窗时重置视图
watch(pickerVisible, (v) => {
    if (v) resetPickerView()
})

onMounted(() => {
    loadPickerPaths()
    if (isEdit.value) {
        loadDetail(route.params.id)
    }
})
</script>

<style scoped>
.rec-form-page {
    height: 100%;
    padding: 32px 40px 80px;
    background: var(--color-bg-admin);
    position: relative;
    overflow-y: auto;
}

.rec-form-page::before {
    content: '';
    position: fixed;
    top: -10%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, var(--color-admin-soft-bg) 0%, transparent 70%);
    filter: blur(80px);
    z-index: 0;
    pointer-events: none;
}

.page-header {
    margin-bottom: 24px;
    position: relative;
    z-index: 1;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.back-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--color-bg-admin-mid);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.back-btn:hover {
    background: var(--color-admin-soft-bg);
    color: var(--color-admin);
    border-color: var(--color-admin-soft-border);
}

.header-text h1 {
    color: var(--color-text-primary);
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 4px;
}

.subtitle {
    color: var(--color-text-disabled);
    font-size: 0.9rem;
}

.form-content {
    max-width: 960px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
}

.rec-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-card {
    background: var(--color-bg-admin-mid);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 20px 24px;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.card-title {
    color: var(--color-text-primary);
    font-size: 1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.title-index {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--color-admin);
    color: #fff;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.card-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.add-item-btn {
    display: inline-flex;
    align-items: center;
    background: var(--color-admin-soft-bg) !important;
    border: 1px solid var(--color-admin-soft-border) !important;
    color: var(--color-admin) !important;
}

.add-item-btn:hover {
    background: var(--color-admin-soft-bg-hover) !important;
    border-color: var(--color-admin-soft-border-hover) !important;
}

.coord-input {
    width: 240px;
}

/* 坐标取点 */
.coord-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.picker-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--color-bg-admin-deep) !important;
    border: 1px dashed var(--color-admin-soft-border) !important;
    color: var(--color-admin) !important;
}

.picker-btn:hover {
    border-color: var(--color-admin) !important;
    background: var(--color-admin-soft-bg) !important;
}

.picker-reset-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--color-bg-hover) !important;
    border: 1px solid var(--color-border) !important;
    color: var(--color-text-secondary) !important;
}

.picker-reset-btn:hover {
    background: var(--color-admin-soft-bg) !important;
    border-color: var(--color-admin-soft-border) !important;
    color: var(--color-admin) !important;
}

/* 拖拽条目卡片 */
.draggable-item {
    display: grid;
    gap: 8px;
    align-items: center;
    background: var(--color-bg-admin-deep);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 8px 8px 8px 4px;
    margin-bottom: 8px;
    transition: border-color 0.15s, opacity 0.15s, background 0.15s;
}

.draggable-item:hover {
    border-color: var(--color-admin-soft-border);
}

.draggable-item.dragging {
    opacity: 0.4;
    border-style: dashed;
}

.draggable-item.drop-target {
    border-color: var(--color-admin);
    background: var(--color-admin-soft-bg);
}

.drag-handle {
    width: 24px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-disabled);
    cursor: grab;
    user-select: none;
    flex-shrink: 0;
    transition: color 0.15s;
}

.drag-handle:hover {
    color: var(--color-admin);
}

.drag-handle:active {
    cursor: grabbing;
}

/* 简单行：handle + input + remove */
.simple-row {
    grid-template-columns: 24px 1fr 32px;
}

/* 复杂行：handle + 4 inputs + remove */
.complex-row {
    /* 在 .draggable-item 上已设 margin-bottom: 8px */
}

.players-row,
.heroes-row {
    grid-template-columns: 24px 1fr 1fr 1fr 2fr 32px;
}

.tasks-row {
    grid-template-columns: 24px 1fr 3fr 1fr 32px;
}

.row-remove {
    width: 32px;
    height: 32px;
    background: var(--color-bg-hover);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-text-placeholder);
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
}

.row-remove:hover {
    background: var(--color-brand-secondary);
    border-color: var(--color-brand-secondary);
    color: #fff;
}

.empty-tip {
    text-align: center;
    color: var(--color-text-disabled);
    font-size: 0.85rem;
    padding: 16px 0;
    background: var(--color-bg-admin-deep);
    border: 1px dashed var(--color-border);
    border-radius: 8px;
}

.form-footer {
    position: sticky;
    bottom: 0;
    max-width: 960px;
    margin: 24px auto 0;
    padding: 16px 24px;
    background: var(--color-bg-admin-mid);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    z-index: 2;
}

.cancel-btn {
    background: var(--color-bg-hover) !important;
    border-color: var(--color-border) !important;
    color: var(--color-text-secondary) !important;
}

.cancel-btn:hover {
    background: var(--color-admin-soft-bg) !important;
    border-color: var(--color-admin-soft-border-hover) !important;
    color: var(--color-admin) !important;
}

.submit-btn {
    min-width: 120px;
}

@media (max-width: 768px) {
    .rec-form-page {
        padding: 16px 12px 80px;
    }

    .players-row,
    .heroes-row,
    .tasks-row {
        grid-template-columns: 24px 1fr 32px;
        grid-auto-rows: auto;
    }

    .players-row > :nth-child(2),
    .players-row > :nth-child(3),
    .players-row > :nth-child(4),
    .players-row > :nth-child(5),
    .heroes-row > :nth-child(2),
    .heroes-row > :nth-child(3),
    .heroes-row > :nth-child(4),
    .heroes-row > :nth-child(5),
    .tasks-row > :nth-child(2),
    .tasks-row > :nth-child(3),
    .tasks-row > :nth-child(4) {
        grid-column: 2 / 3;
    }

    .row-remove {
        justify-self: end;
        grid-row: 1;
        grid-column: 3;
    }

    .drag-handle {
        grid-row: 1;
        grid-column: 1;
    }
}
</style>

<!-- 地图取点弹窗样式（el-dialog 通过 Teleport 渲染到 <body>，需非 scoped） -->
<style>
.picker-dialog .el-dialog__body {
    padding: 16px 24px;
}

.picker-dialog .picker-svg-large {
    width: 100%;
    height: auto;
    background: var(--color-bg-admin-deep);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    cursor: crosshair;
    user-select: none;
}

.picker-provinces {
    pointer-events: none;
}

.picker-province-path {
    fill: var(--color-map-province-fill);
    stroke: var(--color-map-province-stroke);
    stroke-width: 0.5;
}

.picker-marker {
    pointer-events: none;
}

.marker-dot {
    fill: var(--color-brand-secondary);
}

.marker-ring {
    fill: none;
    stroke: var(--color-brand-secondary);
    stroke-width: 1.5;
    opacity: 0.5;
}

.marker-cross {
    stroke: var(--color-brand-secondary);
    stroke-width: 1.5;
    opacity: 0.7;
}

.picker-footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.picker-footer-hint {
    color: var(--color-text-disabled);
    font-size: 0.8rem;
}
</style>
