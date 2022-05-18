<script lang="ts">
	import Sidebar from '$lib/Sidebar.svelte';
	import Graph from '$lib/Graph.svelte';
	import Search from '$lib/Search.svelte';
	import Legend from '$lib/Legend.svelte';
	import Toast from '$lib/Toast.svelte';

	let data;
	let toastVisible = false;
	let errorMessage;
	let errorType;

	function hideError() {
		toastVisible = false;
	}

	async function queryData(id: string, start: string, end: string) {
		const res = await fetch('/draw_tree', {
			method: 'POST',
			body: JSON.stringify({
				endpointID: id,
				startDate: start,
				endDate: end
			})
		});

		const result = await res.json();

		if (Object.keys(result).length === 0) {
			errorType = 'error';
			toastVisible = true;
			errorMessage = 'the query returned empty data!';
		} else {
			data = result;
		}
	}
</script>

<Search
	on:search={(e) => {
		queryData(e.detail.data.id, e.detail.data.startDate, e.detail.data.endDate);
	}}
/>

<div class="flex h-full w-full">
	<div class="flex">
		<Sidebar />
	</div>
	<div class="flex float-left">
		<Legend />
	</div>

	<div class="flex flex-grow">
		<Graph {data} />
	</div>

	<div class="flex float-right" on:click={hideError}>
		<Toast type={errorType} visible={toastVisible} message={errorMessage} />
	</div>
</div>
