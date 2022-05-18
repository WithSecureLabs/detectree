<script lang="ts">
	import { onMount } from 'svelte';
	import { searchVisibility } from '../stores/detectree';
	import { createEventDispatcher } from 'svelte';
	import Icon from '$lib/Icon.svelte';

	let endDate;
	let id;
	let startDate;
	let visible = false;

	const dispatch = createEventDispatcher();

	onMount(() => {
		searchVisibility.subscribe((v) => {
			visible = v;
			// setup the default dates
			const today = new Date();
			startDate = today.toLocaleDateString('en-CA', {
				// selecting this locale to have the date in the dd/mm/yyyy format
				year: 'numeric',
				month: '2-digit',
				day: '2-digit'
			});
			let tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);
			endDate = tomorrow.toLocaleDateString('en-CA', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit'
			});
		});
	});

	async function postData() {
		dispatch('search', {
			data: {
				id: id,
				startDate: startDate,
				endDate: endDate
			}
		});
	}
</script>

{#if visible}
	<div class="absolute z-40 h-10 flex mt-4 ml-12">
		<input
			class="rounded-sm bg-slate-700 text-white pl-2"
			type="search"
			placeholder="Unique endpoint ID"
			bind:value={id}
		/>
		<input class="bg-slate-700 text-white" type="date" bind:value={startDate} />
		<input class="rounded-sm bg-slate-700 text-white" type="date" bind:value={endDate} />
		<button class="rounded-sm bg-lime-200 w-10 pl-2 text-white" type="submit" on:click={postData}>
			<Icon name="magnify" color="black" />
		</button>
	</div>
{/if}
