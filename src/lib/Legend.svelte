<script lang="ts">
	import Icon from '$lib/Icon.svelte';

	let icons = [
		{
			icon: 'application',
			severity: 'critical',
			description: 'Critical'
		},
		{
			icon: 'application',
			severity: 'high',
			description: 'High'
		},
		{
			icon: 'application',
			severity: 'medium',
			description: 'Medium'
		},
		{
			icon: 'application',
			severity: 'low',
			description: 'Low'
		},
		{
			icon: 'application',
			severity: 'info',
			description: 'Info'
		},
		{
			icon: 'application',
			severity: 'default',
			description: 'No Detections'
		},
		{
			icon: 'server',
			severity: 'entity',
			description: 'Network'
		},
		{
			icon: 'file',
			severity: 'entity',
			description: 'File'
		},
		{
			icon: 'registry',
			severity: 'entity',
			description: 'Registry'
		}
	];
</script>

<div class="absolute flex flex-col gap-4 z-10 ml-2 mt-20 text-xs bg-none">
	{#each icons as element}
		<div class="flex items-center flex-col">
			<Icon name={element.icon} color={element.severity} />
			<p class="text-white">{element.description}</p>
		</div>
	{/each}
</div>
