import { Client } from '@elastic/elasticsearch';

export async function query(config: any, id: string, start: string, end: string): Promise<any> {
	const result = await getData(config.backend, id, start, end, config.mappings);

	return result;
}

// extract the value specified in str using dot notation from the object in obj
function getValue(str, obj) {
	return str.split('.').reduce((o, d) => o[d], obj);
}

async function getData(backend, id, startDate, endDate, mappings) {
	const url = backend.url;
	const authentication = backend.authentication;
	const index = backend.index;
	const idField = backend.primaryId;
	const timeField = backend.timeField;
	const source = backend.source;
	const tls = backend.tls;

	const data = [];

	// This is where the query can be customized
	const par = {
		bool: {
			filter: {
				range: {}
			},
			must: {
				match: {}
			}
		}
	};

	par['bool']['must']['match'][idField] = id;
	par['bool']['filter']['range'][timeField] = {
		gte: startDate,
		lte: endDate
	};

	try {
		// connection setup
		const client = new Client({
			node: url,
			auth: authentication,
			tls: tls
		});

		const result = await client.search({
			index: index,
			query: par,
			size: 1000
		});

		// now for each hit we want to create our custom mapping
		// for each result loop over the mapping and do the translation
		for (let i = 0; i < result.hits.hits.length; i++) {
			const translatedObject = {};
			let selectedMapping = undefined;
			console.log(result.hits.hits[i]);

			// find the right mapping for the type of data we are looking at
			for (let j = 0; j < mappings.length; j++) {
				if (mappings[j]['type'] === getValue(source, result.hits.hits[i]['_source'])) {
					selectedMapping = mappings[j];
					break;
				}
			}

			if (selectedMapping) {
				for (const mapping in selectedMapping) {
					translatedObject[mapping] = getValue(
						selectedMapping[mapping],
						result.hits.hits[i]['_source']
					);
				}
				translatedObject['type'] = selectedMapping['kind'];
				console.log(translatedObject);
				data.push(translatedObject);
			}
		}
	} catch (error) {
		return 500;
	}

	return data;
}
