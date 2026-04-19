<template>
    <div class="manage-index">
        <div class="index-content">
            <h1>后台管理</h1>
            <p>选择左侧菜单开始管理</p>
        </div>
    </div>
</template>

<style scoped>
.manage-index {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #09090b;
    position: relative;
    overflow: hidden;
}

/* 右上角绿色光效 */
.manage-index::before {
    content: '';
    position: absolute;
    top: -10%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.05) 40%, transparent 70%);
    filter: blur(80px);
    z-index: 0;
}

/* 左下角橙色光效 */
.manage-index::after {
    content: '';
    position: absolute;
    bottom: -20%;
    left: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%);
    filter: blur(100px);
    z-index: 0;
}

.index-content {
    position: relative;
    z-index: 1;
    text-align: center;
}

.index-content h1 {
    color: #fafafa;
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 12px;
}

.index-content p {
    color: rgba(255, 255, 255, 0.4);
    font-size: 1rem;
}
</style>
