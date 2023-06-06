<template>
	<div class="upload-box" v-if="!showTable">
		<el-progress
			:text-inside="true"
			:stroke-width="20"
			:percentage="progressPercent"
			:status="progressStatus"
		>
			<span>{{ progressLabel }}</span>
		</el-progress>
		<el-upload style="margin-top: 10px"
		           drag
		           action=""
		           :http-request="customUpload"
		           :limit="1"
		           :on-exceed="handleExceed"
		           :before-upload="beforeUpload"
		           :show-file-list="false">
			<el-icon class="el-icon--upload">
				<upload-filled/>
			</el-icon>
			<div class="el-upload__text">
				Drop pcap file here or <em>click to upload</em> to parse.
			</div>
			<template #tip>
				<div class="el-upload__tip">
					pcap file with a size less than 100M
				</div>
			</template>
		</el-upload>
	</div>

	<div v-if="showTable">
		<el-table :data="tableData" border style="width: 100%" max-height="300px" :cell-style="{padding: '3px'}"
		          highlight-current-row @current-change="handleCurrentRowChange">
			<el-table-column prop="num" label="No." align="center" width="100"/>
			<el-table-column prop="time" label="Time" align="center" width="150"/>
			<el-table-column prop="source" label="Source" align="center" width="250"/>
			<el-table-column prop="destination" label="Destination" align="center" width="250"/>
			<el-table-column prop="protocol" label="Protocol" align="center" width="200"/>
			<el-table-column prop="length" label="Length" align="center" width="100"/>
			<el-table-column prop="info" label="Info"/>
		</el-table>
		<div class="packet-box">
			<div class="protocol-box inner-box" :style="{height: bottomDataBoxHeight}">
<!--				node-key="label" :default-expanded-keys="curExpandedNode"-->
				<el-tree :data="curTreeData" :props="defaultTreeProps" highlight-current @node-click="handleTreeNodeClick" />
			</div>
			<div class="hex-box inner-box" :style="{height: bottomDataBoxHeight}">
				<span class="str-node" v-for="(hex, index) in curHexData" :key="hex"
				      :class="{'active-str-node':hex?.active}"
				      @mousemove="strNodeMouseover(hex)"
				      @click="strNodeClick(hex)"
				>{{ hex?.hexString }}</span>
			</div>
			<div class="decoder-box inner-box" :style="{height: bottomDataBoxHeight}">
				<span class="str-node " v-for="(decoder, index) in curDecoderData" :key="decoder"
				      :class="{'active-str-node':decoder?.active}"
				      @mousemove="strNodeMouseover(decoder)"
				      @click="strNodeClick(decoder)"
				>{{ decoder?.decoderString }}</span>
			</div>
		</div>
	</div>

</template>

<script setup lang="ts">
import {ref} from 'vue';
import {UploadFilled} from '@element-plus/icons-vue';
import {ElLoading, UploadProps} from 'element-plus';
import {showError} from "../utils/message";
import {uploadFiles} from "../api/pcap";

const fileList: File[] = [];

const progressLabel = ref('等待上传...')
const progressPercent = ref(0);
const progressStatus = ref('');

const showTable = ref(false);
const tableData = ref([]);
const currentRow = ref()

const protoDataMap = ref()
const hexDataMap = ref()
const decoderDataMap = ref()

const curTreeData = ref([]);
const curHexData = ref([]);
const curDecoderData = ref([]);
const curExpandedNode = ref([]);

const h = document.documentElement.clientHeight || document.body.clientHeight
const bottomDataBoxHeight = ref(`${h - 200 - 60 - 10}px`);
const resizeEvent = () => {
	const h = document.documentElement.clientHeight || document.body.clientHeight
	bottomDataBoxHeight.value = h - 200 - 60 - 10 + 'px'
}
window.addEventListener('resize', resizeEvent)


const handleExceed: UploadProps['onExceed'] = (files) => {
	progressPercent.value = 0;
	progressStatus.value = '';
	fileList[0] = files[0];
	customUpload();
}

const beforeUpload = (rawFile: File) => {
	progressPercent.value = 0;
	fileList[0] = rawFile;
}

const customUpload = () => {
	let formData = new FormData();
	formData.append('file', fileList[0]);
	let loading: any = ElLoading.service({
		lock: true,
		text: '上传中......',
		background: 'rgba(0, 0, 0, 0.7)',
	})

	uploadFiles(formData, (percent: number) => {
		progressPercent.value = percent;
		progressLabel.value = `${progressPercent.value}%`
		if (progressPercent.value === 100) {
			progressStatus.value = 'success'
		}
	}).then((res: any) => {
		console.log(res)
		let summary: any = [];          // 列表数据
		let protoMap = new Map();       // 协议树
		let hexMap = new Map();         // 16进制字符串
		let decoderMap = new Map();     // 解码字符串
		for (const val of res) {
			summary.push(val.summary);
			protoMap.set(val.summary.num, val.protocolTreeNodes)

			let hexList: any[] = [];
			let decoderList: any[] = [];
			let len = Math.min(val.hexNodes.length, val.decoderStringNodes.length);
			for (let i = 0; i < len; i++) {
				let hexNode: any = val.hexNodes[i];
				hexNode.active = false;
				hexList.push(hexNode);
				let decoderNode: any = val.decoderStringNodes[i];
				decoderNode.active = false;
				decoderList.push(decoderNode);
			}
			hexMap.set(val.summary.num, hexList);
			decoderMap.set(val.summary.num, decoderList);
		}
		tableData.value = summary;
		protoDataMap.value = protoMap;
		hexDataMap.value = hexMap;
		decoderDataMap.value = decoderMap;
		showTable.value = true;
	}).catch(err => {
		showError(err);
		progressStatus.value = 'exception'
	}).finally(() => {
		loading.close();
	})

}

const handleCurrentRowChange = (val: any | undefined) => {
	currentRow.value = val
	let num = val.num;
	curTreeData.value = protoDataMap.value.get(num);
	curHexData.value = hexDataMap.value.get(num);
	curDecoderData.value = decoderDataMap.value.get(num);
}


const defaultTreeProps = {
	children: 'children',
	id: 'id',
	label: 'label',
	hexStartIndex: 'hexStartIndex',
	hexLength: 'hexLength',
	decoderStartIndex: 'decoderStartIndex',
	decoderLength: 'decoderLength',
}

interface Tree {
	id: string
	label: string
	hexStartIndex: number,
	hexLength: number,
	decoderStartIndex: number,
	decoderLength: number,
	children?: Tree[]
}

const handleTreeNodeClick = (data: Tree) => {
	// console.log(data) // hexStartIndex: 0, hexLength: 329, decoderStartIndex: 0, decoderLength: 329
	// 更新 16进制区域
	let hexStartIndex = data.hexStartIndex, hexEndIndex = data.hexStartIndex + data.hexLength;
	let hexData: any = curHexData.value;
	hexData.forEach((value: any) => value.active = value.hexStringIndex >= hexStartIndex && value.hexStringIndex < hexEndIndex);
	curHexData.value = hexData;
	// 更新 解码区域
	let decoderStartIndex = data.decoderStartIndex, decoderEndIndex = data.decoderStartIndex + data.decoderLength;
	let decoderData: any = curDecoderData.value;
	decoderData.forEach((value: any) => value.active = value.decoderStringIndex >= decoderStartIndex && value.decoderStringIndex < decoderEndIndex);
	curDecoderData.value = decoderData;
}

const strNodeMouseover = (node: any) => {
	// 更新 16进制区域
	let hexData: any = curHexData.value;
	hexData.forEach((value: any) => value.active = value.groupId === node.groupId);
	curHexData.value = hexData;
	// 更新 解码区域
	let decoderData: any = curDecoderData.value;
	decoderData.forEach((value: any) => value.active = value.groupId === node.groupId);
	curDecoderData.value = decoderData;
}

const strNodeClick = (node: any) => {
	console.log(node)
	let exp: any = [node.rootLabel];
	curExpandedNode.value = exp
}


</script>

<style lang="scss" scoped>
.upload-box {
	width: 500px;
	text-align: center;
	margin: 100px auto;
}

.packet-box {
	display: flex;
	width: 100%;
	height: 100%;

	.inner-box {
		height: 100px;
		border: 1px solid gainsboro;
		overflow-y: auto;
		padding: 10px;
	}

	.protocol-box {
		width: 50%;
	}

	.str-node {
		display: inline-flex;
		width: 33px;
		height: 33px;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.str-node:hover {
		background-color: #409eff;
	}

	.active-str-node {
		background-color: #409eff;
	}

	.hex-box {
		width: 30%;
	}

	.decoder-box {
		width: 20%;
	}

}
</style>
