import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    base:'./',

    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')    // 配置别名；将 @ 指向'src'目录
        }
    },

    server: {
        port: 3000,       // 设置服务启动的端口号；如果端口已经被使用，Vite 会自动尝试下一个可用的端口
        open: true,       // 服务启动后自动打开浏览器
        host:'0.0.0.0',
        proxy: {          // 代理
            '/api': {
                target: 'https://localhost:20000',
                // changeOrigin: true,
                // rewrite: (path) => path.replace(/^\/api/, '')     // 注意代理地址的重写
            },
            // 可配置多个...
        }
    },
    // 打包配置
    build: {
        target: 'modules',
        outDir: 'diff-com', //指定输出路径
        assetsDir: 'static', // 指定生成静态资源的存放路径
    },
})
