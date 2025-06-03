import api from './server';
import { showError } from './showToast';

export async function downloadFile(params: { url: string; name: string; params?: any }) {
	const response = await api.get(params.url, {
		responseType: 'arraybuffer',
		params: params.params
	});

	const extension = params.name.split('.').pop()?.toLowerCase() || '';
	let type = '';

	if (extension === 'xlsx')
		type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
	else if (extension === 'pdf') type = 'application/pdf';
	else if (extension === 'docx')
		type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
	else if (extension === 'doc') type = 'application/msword';
	else if (extension === 'txt') type = 'text/plain';
	else if (extension === 'csv') type = 'text/csv';
	else showError(null, 'No se puede descargar el archivo');

	const blob = new Blob([response.data], {
		type
	});

	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	if (extension === 'pdf') link.target = '_blank';
	else link.download = params.name;

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
