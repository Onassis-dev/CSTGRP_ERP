import api from './server';

export function formatDate(strDate?: string) {
	if (!strDate) return '';
	const partes = strDate.split('T');
	const fecha = partes[0].split('-');
	const fechaFormateada = fecha[2] + '/' + fecha[1] + '/' + fecha[0];
	return fechaFormateada;
}

export function getWeekDays(dateString: any) {
	if (dateString instanceof Date) {
		dateString = dateString.toISOString().split('T')[0];
	} else if (dateString.includes('T')) {
		dateString = dateString.split('T')[0];
	}

	const date = new Date(dateString);
	const dayOfWeek = date.getDay();

	const monday = new Date(date);
	monday.setDate(date.getDate() - dayOfWeek);

	const friday = new Date(date);
	friday.setDate(date.getDate() - (dayOfWeek - 4));

	return [monday.toISOString().split('T')[0], friday.toISOString().split('T')[0]];
}

export function getDayNumber(date: string | Date) {
	const dateObject = new Date(date);
	return dateObject.getDay();
}

export function getImage(image: string) {
	return import.meta.env.VITE_BASEURL + '/static/' + image;
}

export function getPreview(file: any): Promise<string | null> {
	return new Promise((resolve, reject) => {
		if (!file) return resolve(null);

		const reader = new FileReader();
		reader.onload = (e) => {
			resolve(e?.target?.result as string);
		};
		reader.onerror = (err) => {
			reject(err);
		};

		reader.readAsDataURL(file);
	});
}

export async function openFilePreview(url: string, name: string) {
	if (!name) name = new Date().toISOString();
	try {
		const response = await api.get('/static/' + url, { responseType: 'blob' });
		let blob = response.data;
		const extension: string = url.split('.').pop()?.toLowerCase() || '';

		const mimeTypes: Record<string, string> = {
			pdf: 'application/pdf',
			jpg: 'image/jpeg',
			jpeg: 'image/jpeg',
			png: 'image/png',
			gif: 'image/gif',
			webp: 'image/webp',
			svg: 'image/svg+xml',
			mp4: 'video/mp4',
			webm: 'video/webm',
			ogg: 'video/ogg',
			mp3: 'audio/mpeg',
			wav: 'audio/wav',
			txt: 'text/plain',
			json: 'application/json',
			csv: 'text/csv'
		};

		const fileType = mimeTypes[extension] || blob.type;

		blob = new Blob([blob], { type: fileType });

		const fileURL = URL.createObjectURL(blob);

		if (fileType && Object.values(mimeTypes).includes(fileType)) {
			window.open(fileURL, '_blank');
			setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
		} else {
			const a = document.createElement('a');
			a.href = fileURL;
			a.download = `${name}.${extension}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(fileURL);
		}
	} catch (error) {
		console.error('Error descargando el archivo:', error);
	}
}

export async function downloadFile(url: string, name: string) {
	if (!name) name = new Date().toISOString();
	try {
		const response = await api.get('/static/' + url, { responseType: 'blob' });
		const blob = response.data;
		const extension: string = url.split('.').pop()?.toLowerCase() || '';

		const fileURL = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = fileURL;
		a.download = `${name}.${extension}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(fileURL);
	} catch (error) {
		console.error('Error descargando el archivo:', error);
	}
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
	let timeout: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), delay);
	};
}
