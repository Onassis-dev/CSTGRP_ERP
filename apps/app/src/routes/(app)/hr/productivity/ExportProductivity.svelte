<!-- <script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { FileExportOutline } from 'flowbite-svelte-icons';
	import ExcelJS from 'exceljs';
	import { saveAs } from 'file-saver';

	import type { productivity } from '../../schemas/hr.models';
	export let productivity: {
		[key: string]: productivity[];
	};
	export let positions: any;
	export let areas: any;
	export let weekDays: any;

	async function exportFile() {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Sheet1');

		worksheet.columns = [
			{ width: 12 },
			{ width: 14 },
			{ width: 40 },
			{ width: 25 },
			{ width: 12 },
			{ width: 12 },
			{ width: 12 },
			{ width: 12 },
			{ width: 12 }
		];

		Object.keys(productivity).forEach((key) => {
			worksheet.addRow([]);
			worksheet.addRow([]);
			worksheet.addRow([areas[key]]);
			worksheet.addRow([
				'Promedio',
				'No. Empleado',
				'Nombre',
				'Posicion',
				weekDays[0],
				weekDays[1],
				weekDays[2],
				weekDays[3],
				weekDays[4]
			]);

			productivity[key].forEach((row) => {
				const average =
					(parseInt(row['0average']) +
						parseInt(row['1average']) +
						parseInt(row['2average']) +
						parseInt(row['3average']) +
						parseInt(row['4average'])) /
					5;
				worksheet.addRow([
					average,
					row.noEmpleado,
					row.name,
					positions[row.positionId],
					row['0average'],
					row['1average'],
					row['2average'],
					row['3average'],
					row['4average']
				]);
			});
		});

		worksheet.eachRow((row) => {
			if (row.cellCount === 1) {
				const cell = row.getCell(1);
				worksheet.mergeCells(
					parseInt(cell.row),
					parseInt(cell.col),
					parseInt(cell.row),
					parseInt(cell.col) + 8
				);
				cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF404040' } };
				cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 16, name: 'Calibri' };
				cell.alignment = { horizontal: 'center', vertical: 'middle' };
				return;
			}
			if (row.getCell(1).text === 'Promedio') {
				row.eachCell((cell) => {
					cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBBBBBB' } };
					cell.font = { bold: true, name: 'Calibri' };
				});
				return;
			}

			row.eachCell((cell) => {
				if (parseInt(cell.col) >= 5 || parseInt(cell.col) === 1) {
					cell.alignment = { horizontal: 'center' };
					if (parseInt(cell.text) >= 0) {
						cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fffde8e8' } };
						cell.font = { color: { argb: 'ff9b1c1c' }, name: 'Calibri' };
						cell.border = {};
					}
					if (parseInt(cell.text) >= 50) {
						cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fffdf6b2' } };
						cell.font = { color: { argb: 'ff723b13' }, name: 'Calibri' };
					}
					if (parseInt(cell.text) >= 100) {
						cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffdef7ec' } };
						cell.font = { color: { argb: 'ff03543f' }, name: 'Calibri' };
					}
				}

				if (parseInt(cell.col) > 1 && parseInt(cell.col) < 5) {
					cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffeeeeee' } };
					cell.font = { name: 'Calibri' };
				}
			});
		});

		// Write to a buffer
		const buffer = await workbook.xlsx.writeBuffer();

		// Save the file
		saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'export.xlsx');
	}
</script>

<Button onclick={exportFile}><FileExportOutline class="size-3.5" /></Button> -->
