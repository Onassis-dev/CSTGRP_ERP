import api from './server';

export const getClients = async () => {
	const clientList = (await api.get('/inventoryvarious/clients')).data;
	const result: Record<string, any> = {};
	clientList.forEach((client: any) => {
		result[client.value] = client;
	});

	return result;
};

export const getAreas = async () => {
	const areasList = (await api.get('/hrvarious/areas')).data;
	const result: Record<string, any> = {};
	areasList.forEach((area: any) => {
		result[area.value] = area;
	});

	return result;
};

export const getPositions = async () => {
	const positionsList = (await api.get('/hrvarious/positions')).data;
	const result: Record<string, any> = {};
	positionsList.forEach((position: any) => {
		result[position.value] = position;
	});

	return result;
};

export function getOptions(object: Record<string, any> | undefined) {
	const result: any[] = [];
	if (!object) return [];

	Object.keys(object).forEach((key) => {
		result.push({
			name: object[key].name,
			value: object[key].value
		});
	});

	return result;
}
