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
	ShoppingCart,
	Bolt,
	Star,
	PaintRoller,
	Scissors,
	Slice,
	History,
	Hammer
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
	records: { text: 'Historial', icon: History },
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
	corte: { text: 'Corte', icon: Slice },
	'cortes-varios': { text: 'Cortes Varios', icon: Scissors },
	produccion: { text: 'Producción', icon: Bolt },
	calidad: { text: 'Calidad', icon: Star },
	serigrafia: { text: 'Serigrafía', icon: PaintRoller },
	production: { text: 'Producción', icon: FileText },
	history: { text: 'Historial', icon: History },
	tools: { text: 'Herramientas', icon: Hammer },
	jobs: { text: 'Jobs', icon: FileText },
	labels: { text: 'Etiquetas', icon: FileText },
	exports: { text: 'Exportaciones', icon: FileText },
	ie_options: { text: 'Opciones', icon: FileText },
	carriers: { text: 'Metodo de envio', icon: FileText },
	'destination-directions': { text: 'Destinos', icon: FileText },
	shippers: { text: 'Transporte', icon: FileText },
	'ship-to': { text: 'Ship to', icon: FileText }
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
