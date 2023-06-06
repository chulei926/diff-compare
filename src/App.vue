<template>
	<el-menu
	:default-active="'1'"
		mode="horizontal"
		background-color="#545c64"
		text-color="#fff"
		active-text-color="#ffd04b"
	>
		<el-menu-item index="1">文件对比</el-menu-item>
	</el-menu>
	<router-view></router-view>
</template>

<script lang="ts" setup>
import {ComponentInternalInstance, getCurrentInstance, ref} from 'vue'
const activeIndex = ref('1')
const {proxy} = (getCurrentInstance() as ComponentInternalInstance)
// proxy.$router.push('/diff-com')
</script>
