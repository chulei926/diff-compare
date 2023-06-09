import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/diff-com',
        name: '文件对比',
        component: () => import('@/views/DiffCom.vue') // 建议进行路由懒加载，优化访问性能
    }
]

const router = createRouter({
    // history: createWebHistory(),    // 使用history模式
    history: createWebHashHistory(),	 // 使用hash模式
    routes
})

export default router
