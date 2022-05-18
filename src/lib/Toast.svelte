<script lang="ts">
	export let message = undefined;
	export let visible = false;
	export let type;

	let classes;
	let titleContent;

	$: visible, update();

	function update() {
		if (type === 'error') {
			titleContent = 'Error:';
			classes = 'text-red-500';
		} else if (type === 'warning') {
			titleContent = 'Warning:';
			classes = 'text-yellow-500';
		}
	}
</script>

{#if visible}
	<div class="absolute bottom-1 inset-x-0 flex z-10 ml-12 text-m text-white bg-none">
		<p><span class={classes}>{titleContent}</span> {message}</p>
	</div>
{/if}
