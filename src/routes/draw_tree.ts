/** @type {import('@sveltejs/kit').RequestHandler} */
// this file will handle the communication between the chosen backend and the detectree frontend
// first let's read the config file and load the connector accordingly. We could move this in the function if we want to reaload the file everytime

import fs from 'fs';
import YAML from 'yaml';

const configFile = fs.readFileSync('./schema.yml', 'utf8');
const config = YAML.parse(configFile);

const backendTypes = {
	elastic: '../backend_adapters/elastic'
};

export async function post(request: any): Promise<any> {
	const data = JSON.parse(await request.body);
	if (!data) {
		return {
			status: 400
		};
	}

	if (data['endpointID']) {
		if (backendTypes[config.backend.type]) {
			const backend = await import(backendTypes[config.backend.type]);
			const graphData = await backend.query(
				config,
				data['endpointID'],
				data['startDate'],
				data['endDate']
			);

			return {
				body: graphData
			};
		} else {
			console.log(`[x] Unknown backend selected: ${config.backend.type}`);
			return {
				status: 400
			};
		}
	}
	return {
		status: 500
	};
}
