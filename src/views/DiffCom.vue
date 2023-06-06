<template>
	<div class="box">
		<div class="pre">
			<div class="title">Previous:
				<el-upload style="margin-top: 10px" drag action="" :http-request="customUpload4Left" :limit="1"
					:on-exceed="handleExceed4Left" :before-upload="beforeUpload4Left" :show-file-list="false">
					<el-icon class="el-icon--upload">
						<upload-filled />
					</el-icon>
					<div class="el-upload__text">
						Drop resource file here or <em>click to upload</em>.
					</div>
				</el-upload>
			</div>
			<textarea class="content" :style="{ width: contentBoxWidth + 'px' }" id="left" @input="handleContentChange4Left"
				v-model="leftContent"></textarea>
		</div>
		<div class="cur">
			<div class="title">Current:
				<el-upload style="margin-top: 10px" drag action="" :http-request="customUpload4Right" :limit="1"
					:on-exceed="handleExceed4Right" :before-upload="beforeUpload4Right" :show-file-list="false">
					<el-icon class="el-icon--upload">
						<upload-filled />
					</el-icon>
					<div class="el-upload__text">
						Drop target file here or <em>click to upload</em>.
					</div>
				</el-upload>
			</div>
			<textarea class="content" :style="{ width: contentBoxWidth + 'px' }" id="right"
				@input="handleContentChange4Right" v-model="rightContent"></textarea>
		</div>
	</div>
	<div ref="displayBox" style="padding: 10px;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { createTwoFilesPatch } from 'diff';
import * as Diff2Html from 'diff2html';
import { Diff2HtmlUI } from "diff2html/lib/ui/js/diff2html-ui";
import { UploadFilled } from '@element-plus/icons-vue';
import { ElLoading, UploadProps } from 'element-plus';

const configuration: any = {
	drawFileList: false,
	matching: 'lines',
	outputFormat: 'side-by-side',
	fileListToggle: false,
	fileListStartVisible: false,
	fileContentToggle: false,
	highlight: true,
	renderNothingWhenEmpty: false,
	// diffStyle:'line'
};

let contentBoxWidth = ref(window.innerWidth / 2 - 40)
let leftContent = ref("123456\n234")
let rightContent = ref("12345678\n234566")

const leftFileList: File[] = [];
const rightFileList: File[] = [];


const handleExceed4Left: UploadProps['onExceed'] = (files) => {
	leftFileList[0] = files[0];
	console.log('handleExceed4Left');
	customUpload4Left()
	
}

const beforeUpload4Left = (rawFile: File) => {
	leftFileList[0] = rawFile;
	console.log('beforeUpload4Left');
}

const customUpload4Left = () => {
	console.log('customUpload4Left');
	const reader = new FileReader();
	reader.onload = () => {
		let fileContent: any = reader.result;
		leftContent.value = fileContent
		differences = createTwoFilesPatch('old_file.txt', 'new_file.txt', leftContent.value, rightContent.value);
		draw();
	};
	reader.readAsText(leftFileList[0], 'UTF-8');
	// reader.readAsArrayBuffer(leftFileList[0]);
}


const handleExceed4Right: UploadProps['onExceed'] = (files) => {
	rightFileList[0] = files[0];
	console.log('handleExceed4Right');
	customUpload4Right()
}

const beforeUpload4Right = (rawFile: File) => {
	rightFileList[0] = rawFile;
	console.log('beforeUpload4Right');
}

const customUpload4Right = () => {
	console.log('customUpload4Right');
	const reader = new FileReader();
	reader.onload = () => {
		let fileContent: any = reader.result;
		rightContent.value = fileContent
		differences = createTwoFilesPatch('old_file.txt', 'new_file.txt', leftContent.value, rightContent.value);
		draw();
	};
	reader.readAsText(rightFileList[0], 'UTF-8');
}

var differences: any = createTwoFilesPatch('old_file.txt', 'new_file.txt', leftContent.value, rightContent.value);

const displayBox: any = ref<HTMLElement | null>(null);

const draw = () => {
	const diff2htmlUi = new Diff2HtmlUI(displayBox.value, differences, configuration);
	diff2htmlUi.draw()
	diff2htmlUi.highlightCode();
}

const handleContentChange4Left = (event: any) => {
	leftContent.value = event.target.value;
	console.log('left', leftContent.value);
	differences = createTwoFilesPatch('old_file.txt', 'new_file.txt', leftContent.value, rightContent.value);
	draw();

}
const handleContentChange4Right = (event: any) => {
	rightContent.value = event.target.value;
	console.log('right', rightContent.value);
	differences = createTwoFilesPatch('old_file.txt', 'new_file.txt', leftContent.value, rightContent.value);
	draw();
}

const handleResize = () => {
	contentBoxWidth.value = window.innerWidth / 2 - 40;
};

onMounted(() => {
	window.addEventListener('resize', handleResize);
	draw()

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