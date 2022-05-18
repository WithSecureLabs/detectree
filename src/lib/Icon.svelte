<script lang="ts">
	import Application from '@mdi/svg/svg/application.svg';
	import Atom from '@mdi/svg/svg/atom.svg';
	import Blur from '@mdi/svg/svg/blur.svg';
	import File from '@mdi/svg/svg/file.svg';
	import LanConnect from '@mdi/svg/svg/lan-connect.svg';
	import LanDisconnect from '@mdi/svg/svg/lan-disconnect.svg';
	import Magnify from '@mdi/svg/svg/magnify.svg';
	import Registry from '@mdi/svg/svg/bookmark-box-multiple.svg';
	import Server from '@mdi/svg/svg/server.svg';
	import Undefined from '@mdi/svg/svg/cancel.svg';

	import { colorToHex } from './utils';

	export let color = 'white';
	export let name;

	let comp = Undefined;
	let rgb = undefined;

	const icons = [
		{ name: 'application', component: Application },
		{ name: 'atom', component: Atom },
		{ name: 'blur', component: Blur },
		{ name: 'file', component: File },
		{ name: 'lan-connect', component: LanConnect },
		{ name: 'lan-disconnect', component: LanDisconnect },
		{ name: 'magnify', component: Magnify },
		{ name: 'registry', component: Registry },
		{ name: 'server', component: Server }
	];

	for (let icon in icons) {
		if (icons[icon].name === name) {
			comp = icons[icon].component;
		}
	}

	$: rgb = colorToHex(color);
</script>

<svelte:component this={comp} bind:fill={rgb} />
