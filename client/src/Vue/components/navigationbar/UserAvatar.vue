<template>
	<div class="user-avatar">
		<img @click="$emit('click')" class="image" src="../../assets/avatar-placeholder.jpg" alt="User avatar" />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'

export default Vue.extend({
	data: () => ({

	}),

	computed: {

	},

	methods: {

	}
})
</script>

<style scoped lang="scss">
	.user-avatar {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;

		.image {
			cursor: pointer;
			margin: 4px;
			height: calc(100% - 8px);
			border-radius: 100%;
		}
	}
</style>
