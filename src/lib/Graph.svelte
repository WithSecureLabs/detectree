<script lang="ts">
	import { browser } from '$app/env';
	import { onMount } from 'svelte';
	import {
		showSingleNodes,
		showNetworkNodes,
		showFileNodes,
		showRegistryNodes
	} from '../stores/detectree';
	import applicationIcon from '@mdi/svg/svg/application.svg?url';
	import registryIcon from '@mdi/svg/svg/bookmark-box-multiple.svg?url';
	import serverIcon from '@mdi/svg/svg/server.svg?url';
	import fileIcon from '@mdi/svg/svg/file.svg?url';
	import { colorToHex, escapeHtml } from '$lib/utils';
	import Loading from '$lib/Loading.svelte';

	let ForceGraph;
	let graphElement;
	let myGraph = undefined;
	let visible = true;

	export let data;

	// map icons to node type
	const icons = {
		application: applicationIcon,
		registry: registryIcon,
		file: fileIcon,
		network: serverIcon
	};

	// we need a way to decide the weight of the severities

	const severity = {
		default: 0,
		info: 1,
		low: 2,
		medium: 3,
		high: 4,
		critical: 5
	};

	let hiddenNodes = new Set();
	let hiddenLinks = new Set();

	async function initialLoad() {
		ForceGraph = (await import('force-graph')).default;

		// preload the icons in with a default color (white)
		for (let i = 0; i < Object.keys(icons).length; i++) {
			const XMLrequest = await fetch(icons[Object.keys(icons)[i]], { method: 'GET' });
			const responseStr = await XMLrequest.text();
			let _mySVG = new window.DOMParser().parseFromString(responseStr, 'text/xml');
			let mySVG = _mySVG.getElementsByTagName('svg')[0]; // extract the svg
			mySVG.setAttribute('fill', colorToHex('white'));
			let xml = new XMLSerializer().serializeToString(mySVG); // reserialize the svg
			icons[Object.keys(icons)[i]] = xml;
		}
		load(undefined);
	}

	onMount(() => {
		if (browser) {
			const subNet = showNetworkNodes.subscribe((v) => {
				hideNodes(v, 'network');
			});

			const subFile = showFileNodes.subscribe((v) => {
				hideNodes(v, 'file');
			});
			const subReg = showRegistryNodes.subscribe((v) => {
				hideNodes(v, 'registry');
			});
			const subNodes = showSingleNodes.subscribe((v) => {
				hideSingleNode(v);
			});

			initialLoad();

			return () => {
				subNet();
				subFile();
				subReg();
				subNodes();
			};
		}
	});

	$: data, processData();

	function hideNodes(value: boolean, nodeType: string): boolean {
		if (!myGraph) {
			return;
		}

		myGraph.nodeVisibility((e) => {
			if (e['group'] === nodeType) {
				// we need to hide the link as well
				if (e.links && e.links.length > 0) {
					for (var i = 0; i < e.links.length; i++) {
						const link = e.links[i];
						if (value) {
							hiddenLinks.delete(link);
						} else {
							hiddenLinks.add(link);
						}
					}
				}
				if (value) {
					hiddenNodes.delete(e);
				} else {
					hiddenNodes.add(e);
				}
				return value;
			}
			if (hiddenNodes.has(e)) {
				return false;
			}
			return true;
		});
		myGraph.linkVisibility((link) => {
			if (hiddenLinks.has(link)) {
				return false;
			}
			return true;
		});
	}

	function hideSingleNode(value: boolean): boolean {
		if (!myGraph) {
			return;
		}
		myGraph.nodeVisibility((e) => {
			if (!e.links) {
				if (value) {
					hiddenNodes.delete(e);
				} else {
					hiddenNodes.add(e);
				}
				return value;
			}
			// we need to keep the currently hidden nodes hidden
			if (hiddenNodes.has(e)) {
				return false;
			} else {
				return true;
			}
		});
	}

	function nodePresent(id: string, data: any): number {
		return data.findIndex((e) => e['id'] === id);
	}

	function addNode(id, nodes, entry, updateSeverity) {
		let index = nodePresent(id, nodes);
		if (index != -1 && updateSeverity) {
			// a. The node exists, update the severity of the current node
			// TODO: need to have a customizable severity
			if (severity[nodes[index]['severity']] < severity[entry['severity'].toLowerCase()]) {
				nodes[index]['severity'] = entry['severity'].toLowerCase();
			}
		} else if (index == -1) {
			// b. The node doesn't exists so we need to create it first
			let newNode = {};
			newNode['id'] = id;
			newNode['name'] = id;
			newNode['group'] = 'application';
			newNode['severity'] = entry['severity'].toLowerCase();
			nodes.push(newNode);
		}
	}

	function updateTags(node, entry) {
		if (!node.tags) {
			node.tags = {};
		}
		// now that we have the object create the sub-objects
		if (!node.tags[entry['severity'].toLowerCase()]) {
			node.tags[entry['severity'].toLowerCase()] = {};
		}
		// if the tag does not exists then add it
		if (!node.tags[entry['severity'].toLowerCase()][entry['detectionName']]) {
			node.tags[entry['severity'].toLowerCase()][entry['detectionName']] = 1;
		} else {
			node.tags[entry['severity'].toLowerCase()][entry['detectionName']] += 1;
		}

		// add the user if available
		if (!node.users && entry['user']) {
			node.users = new Set();
			node.users.add(entry['user']);
		} else if (entry['user']) {
			node.users.add(entry['user']);
		}

		// add the command line args if available, command line should be unique
		if (!node.cmdl && entry['commandLine']) {
			node.cmdl = escapeHtml(entry['commandLine']);
		}
	}

	function processData() {
		if (data == undefined) {
			return;
		}
		let _links = {};
		let gData = { nodes: [], links: [] };

		// we process nodes and edges here
		for (var i = 0; i < data.length; i++) {
			let entry = data[i];
			let drawable = false;

			//let's perform a basic check on the data that we have to make sure we have the basic info depending on the data type
			if (entry.type === 'application' && entry.pid && entry.process) {
				drawable = true;
			} else if (entry.type === 'registry' && entry.pid && entry.process && entry.registryKey) {
				drawable = true;
			} else if (entry.type === 'file' && entry.pid && entry.process && entry.filePath) {
				drawable = true;
			} else if (entry.type === 'network' && entry.pid && entry.process && entry.networkAddress) {
				drawable = true;
			} else if (
				entry.type === 'injection' &&
				entry.pid &&
				entry.process &&
				entry.targetPid &&
				entry.targetProcess
			) {
				drawable = true;
			}

			if (drawable) {
				// let's build a "unique" ID for the nodes
				let id = `${entry['process']}:${entry['pid']}`;
				// 1. Check if we already have a node with this id
				addNode(id, gData['nodes'], entry, 1);
				// 2 update the tag list for the node
				// node.tags will have the following structure {info: {tag1: 1, tag2: 5}, low: {} ...}
				let currentNode = gData['nodes'][nodePresent(id, gData['nodes'])];
				updateTags(currentNode, entry);

				// 3. Check if the parent node can be created
				if (entry.parentProcess && entry.ppid) {
					// c. we have enough info to create or check the parent node
					let parentId = `${entry['parentProcess']}:${entry['ppid']}`;

					// Since we are only using severity from the entry when adding a node we do something slightly different here
					// TODO: might be worth checking if this can be improved
					addNode(parentId, gData['nodes'], { severity: 'default' }, 0);

					// d. connect parent and child
					let link = { source: parentId, target: id, type: 'spawn' };
					let linkId = parentId + id + link.type;

					_links[linkId] = link;
				}
				// 4. We are now sure that the current node and the parent node exist
				// 5. Check the type of detection and create special nodes
				if (entry['type'] == 'registry' || entry['type'] == 'network' || entry['type'] == 'file') {
					// a. select the right ID based on their existence
					let entityID =
						entry['networkAddress'] || entry['filePath'] || entry['registryKey'] || false;

					// b. check if the destination node exists
					let entityPresent = nodePresent(entityID, gData['nodes']);
					if (entityID && entityPresent == -1) {
						// c. the destination does not exists, we need to create the node
						let newEntityNode = {};
						newEntityNode['id'] = entityID;
						newEntityNode['name'] = entityID;
						newEntityNode['group'] = entry['type'];
						newEntityNode['severity'] = entry['type'];
						gData['nodes'].push(newEntityNode);
					}
					if (entityID) {
						// d. now we know the destination exists for sure, let's connect the nodes

						let link = { source: id, target: entityID, type: 'entity' };
						let linkId = id + entityID + link.type;

						_links[linkId] = link;
					}
				} else if (entry['type'] == 'injection') {
					// e. we need to do something slightly different for injection nodes
					let targetId = `${entry['targetProcess']}:${entry['targetPid']}`;
					addNode(targetId, gData['nodes'], { severity: 'default' }, 0);
					// g. now we can connect the nodes
					let link = { source: id, target: targetId, type: 'injection' };
					let linkId = id + targetId + link.type;

					_links[linkId] = link;
				}
			}
		}
		gData['links'] = Object.values(_links);

		load(gData);
	}

	function load(gData) {
		if (!browser) {
			return;
		}
		if (gData == undefined) {
			return;
		}
		visible = false;

		// build lists of neigbours and links for each node
		gData.links.forEach((link) => {
			const a = gData.nodes.filter((obj) => {
				return obj.id === link.source;
			})[0];
			const b = gData.nodes.filter((obj) => {
				return obj.id === link.target;
			})[0];

			!a.neighbors && (a.neighbors = []);
			!b.neighbors && (b.neighbors = []);
			a.neighbors.push(b);
			b.neighbors.push(a);

			!a.links && (a.links = []);
			!b.links && (b.links = []);
			a.links.push(link);
			b.links.push(link);
		});

		myGraph = ForceGraph()
			.nodeLabel('name')
			.nodeCanvasObjectMode(() => 'replace')
			.nodeCanvasObject((node, ctx, globalScale) => {
				const label = node.name;
				const fontSize = 12 / globalScale;
				const iconSize = 10;
				let image = new Image();

				const icon = icons[node.group].replace(
					'fill="#ffffff"',
					`fill="${colorToHex(node.severity == '' ? node.group : node.severity)}"`
				);

				var svg64 = btoa(icon);
				var b64Start = `data:image/svg+xml;base64,${svg64}`;

				image.src = b64Start;

				ctx.drawImage(image, node.x - iconSize / 2, node.y - iconSize / 2, iconSize, iconSize);
				ctx.font = `${fontSize}px Sans-Serif`;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillStyle = 'white';
				ctx.fillText(label, node.x, node.y + iconSize * 0.8);
			})
			.linkDirectionalArrowLength(5)
			.linkDirectionalArrowRelPos(6)
			.linkLineDash((link) => {
				if (link.type == 'spawn') {
					return [0];
				} else {
					return [1];
				}
			})
			.linkColor((link) => {
				return colorToHex(link.type);
			})
			.linkCurvature((link) => {
				if (link.type == 'injection') {
					return 0.3;
				} else {
					return 0.1;
				}
			});

		myGraph(graphElement);
		myGraph.graphData(gData);
		myGraph.backgroundColor(colorToHex('background'));

		myGraph.nodeLabel((node) => {
			const res = [];
			if (node.tags) {
				res.push('TAGS<br>');
				const severities = Object.keys(node.tags).sort(function (a, b) {
					if (severity[a] > severity[b]) {
						return -1;
					} else {
						return 1;
					}
				});

				for (var s in severities) {
					const value = node.tags[severities[s]];
					const tags = [];
					for (const [name, count] of Object.entries(value)) {
						tags.push(`${count.toString().padStart(3, '0')} ${name}`);
					}
					res.push(
						`<p style="margin-left:1em">${severities[s]
							.toUpperCase()
							.padEnd(10, ' ')} <br> ${tags.join('<br>')}</p>`
					);
				}

				// if (nodes[i].title.args != undefined) {
				// 	res.push(`\n\nARGS\n`);
				// 	for (var k = 0; k < nodes[i].title.args.length; k++) {
				// 		res.push(nodes[i].title.args[k]);
				// 	}
				// }
			}
			if (node.users) {
				res.push('USERS');
				var usersArray = Array.from(node.users);
				for (var i in usersArray) {
					res.push(`<p style="margin-left:1em">${usersArray[i]}</p>`);
				}
			}
			if (node.cmdl) {
				res.push('Command Line');
				res.push(`<p style="margin-left:1em">${node.cmdl}</p>`);
			}
			return res.join('<br>');
		});
	}
</script>

<div class="flex-grow">
	<div bind:this={graphElement} />
</div>

<div class="flex flex-grow justify-center place-items-center h-screen w-full">
	<Loading {visible} />
</div>
