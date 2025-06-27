import {
	Home,
	LayoutDashboard,
	Warehouse,
	Package,
	Mail,
	Users,
	Settings,
	ArrowRightLeft,
	FileText,
	UserRound,
	Building,
	Clipboard,
	Network,
	FileSpreadsheet,
	Truck,
	Gauge,
	FilePenLine,
	FileDown,
	UsersRound,
	CalendarCheck,
	LaptopMinimal,
	Server,
	GitFork,
	BookUser,
	ShoppingCart
} from 'lucide-svelte';

export interface Traduction {
	text: string;
	icon: any;
}

export const traductions: Record<string, Traduction> = {
	hr: { text: 'RRHH', icon: UserRound },
	dashboard: { text: 'Dashboard', icon: LayoutDashboard },
	inventory: { text: 'Inventario', icon: Warehouse },
	materials: { text: 'Materiales', icon: Package },
	devices: { text: 'Dispositivos', icon: Server },
	emails: { text: 'Correos', icon: Mail },
	computers: { text: 'Computadoras', icon: LaptopMinimal },
	resources: { text: 'Recursos', icon: Clipboard },
	structure: { text: 'Estructura', icon: GitFork },
	users: { text: 'Usuarios', icon: Users },
	admin: { text: 'Administración', icon: Settings },
	movements: { text: 'Movimientos', icon: ArrowRightLeft },
	login: { text: 'Iniciar sesión', icon: Home },
	directory: { text: 'Directorio', icon: BookUser },
	formats: { text: 'Formatos', icon: FileSpreadsheet },
	assistance: { text: 'Asistencia', icon: CalendarCheck },
	productivity: { text: 'Productividad', icon: Gauge },
	employees: { text: 'Empleados', icon: UsersRound },
	warehouse: { text: 'Inventario', icon: Warehouse },
	requisitions: { text: 'Requisiciones', icon: FilePenLine },
	it: { text: 'Sistemas', icon: Network },
	positions: { text: 'Posiciones', icon: Network },
	areas: { text: 'Areas', icon: Building },
	records: { text: 'Historial', icon: FileText },
	'po-imp': { text: 'Po-Imp', icon: Truck },
	imports: { text: 'Importaciones', icon: Truck },
	petitions: { text: 'Peticiones', icon: FileDown },
	clients: { text: 'Clients', icon: Users },
	docs: { text: 'Documentación', icon: FileText },
	purchases: { text: 'Compras', icon: ShoppingCart },
	categories: { text: 'Categorías', icon: Package },
	products: { text: 'Productos', icon: Package },
	suppliers: { text: 'Proveedores', icon: Users },
	orders: { text: 'Órdenes', icon: FileText },
	corte: { text: 'Corte', icon: FileText },
	'cortes-varios': { text: 'Cortes Varios', icon: FileText },
	produccion: { text: 'Producción', icon: FileText },
	calidad: { text: 'Calidad', icon: FileText },
	serigrafia: { text: 'Serigrafía', icon: FileText },
	production: { text: 'Producción', icon: FileText }
};

export function capitalize(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getTraduction(href: string) {
	let key: string;

	if (href.split('/')[1] === 'clients') {
		key = href.split('/')[2] || href.split('/')[1];
		return {
			text: capitalize(key) || 'Home',
			icon: traductions[key]?.icon || Home
		};
	} else {
		key = href.split('/')[2] || href.split('/')[1];
		return traductions[key] || { text: 'Inicio', icon: Home };
	}
}
