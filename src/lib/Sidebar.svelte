<script lang="ts">
	import {
		searchVisibility,
		showSingleNodes,
		showNetworkNodes,
		showFileNodes,
		showRegistryNodes
	} from '../stores/detectree';

	import Icon from '$lib/Icon.svelte';

	let menu = [
		{ action: 'Hide Single Nodes', icon: 'blur', state: showSingleNodes, color: 'green' },
		{
			action: 'Hide Network Elements',
			icon: 'lan-connect',
			state: showNetworkNodes,
			color: 'green'
		},
		{ action: 'Hide File Nodes', icon: 'file', state: showFileNodes, color: 'green' },
		{
			action: 'Hide Registry Nodes',
			icon: 'registry',
			state: showRegistryNodes,
			color: 'green'
		}
	];

	function toggleSearch() {
		searchVisibility.update((v) => (v === true ? (v = false) : (v = true)));
	}

	function toggle(item) {
		item.state.update((v) => {
			if (v === false) {
				item.color = 'green';
				return true;
			} else {
				item.color = 'red';
				return false;
			}
		});
		menu = menu;
	}
</script>

<nav class="bg-stone-900 sidebar-navigation w-11">
	<ul>
		<li class="pl-1" on:click={toggleSearch}>
			<img class="mt-6 mb-10 w-9 h-9" src="detectree_icon2.svg" alt="Detectree Icon" />
		</li>
		{#each menu as menu_item}
			<li
				class="pl-2 mb-7 ml-1"
				id={menu_item['icon']}
				on:click={() => {
					toggle(menu_item);
				}}
			>
				<Icon name={menu_item['icon']} color={menu_item['color']} />
			</li>
		{/each}
	</ul>
</nav>
