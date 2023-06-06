<template>
	<div class="box">
		<div class="pre">
			<div class="title">Previous:</div>
			<div class="content" id="left" contenteditable="true" v-html="leftContent"></div>
		</div>
		<div class="cur">
			<div class="title">Current:</div>
			<div class="content" id="right" contenteditable="true" v-html="rightContent"></div>
		</div>
	</div>
	<div id="display_box" :style="{ width: browserWidth+'px' }" ref="displayBox"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createTwoFilesPatch } from 'diff';
import * as Diff2Html from 'diff2html';
import { Diff2HtmlUI } from "diff2html/lib/ui/js/diff2html-ui";

let leftContent = ref("123456")
let rightContent = ref("12345678")


var differences: any = createTwoFilesPatch('old_file.txt', 'new_file.txt', leftContent.value, rightContent.value);
// console.log('differences', differences);

const displayBox: any = ref<HTMLElement | null>(null);

const browserWidth = ref(window.innerWidth);
console.log('browserWidth', browserWidth.value);

const handleResize = () => {
	browserWidth.value = window.innerWidth;
};

onMounted(() => {
	window.addEventListener('resize', handleResize);
	const configuration: any = {
		drawFileList: false,
		matching: 'lines',
		outputFormat: 'side-by-side',
		fileListToggle: false,
		fileListStartVisible: false,
		fileContentToggle: false,
		highlight: true,
		renderNothingWhenEmpty: false,
	};
	const diff2htmlUi = new Diff2HtmlUI(displayBox.value, differences, configuration);
	diff2htmlUi.draw()
	diff2htmlUi.highlightCode();
});
onUnmounted(() => {
	window.removeEventListener('resize', handleResize);
});



</script>

<style lang="scss">
@import 'highlight.js/styles/default.css';
@import 'diff2html/bundles/css/diff2html.min.css';

/* 隐藏文件名称信息 */
.d2h-file-header,
.d2h-sticky-header {
	display: none;
}

.box {
	padding-top: 10px;
	display: flex;
	flex-flow: row;
	justify-content: space-around;
	width: 100%;

	.pre,
	.cur {
		width: 49%;
		min-height: 100px;
	}

	.title {
		font-size: 18px;
		font-weight: bold;
	}

	.content {
		border: 1px solid grey;
		min-height: 100px;
		border-radius: 5px;
		margin-top: 10px;
	}
}

.display_box {
	width: 100% !important;
}
</style>