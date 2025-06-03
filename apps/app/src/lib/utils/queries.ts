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
		result[area.value] = area.name;
	});

	return result;
};
