export interface PrototypeSystem {
  battery_capacity: number;
  minimum_state_of_charge: number;
  installation_year: number;
  panel_rating: number;
  number_of_panels: number;
}

export interface PrototypeAppliance {
  id: string;
  appliance_name: string;
  wattage: number;
  usage_hours: number;
  room: string;
}

const DEFAULT_SYSTEM: PrototypeSystem = {
  battery_capacity: 5000,
  minimum_state_of_charge: 20,
  installation_year: 2025,
  panel_rating: 400,
  number_of_panels: 10,
};

const DEFAULT_APPLIANCES: PrototypeAppliance[] = [
  { id: '1', appliance_name: 'Ceiling Fan', wattage: 75, usage_hours: 8, room: 'parlour' },
  { id: '2', appliance_name: 'LED TV', wattage: 100, usage_hours: 6, room: 'parlour' },
  { id: '3', appliance_name: 'LED Bulb', wattage: 10, usage_hours: 10, room: 'parlour' },
  { id: '4', appliance_name: 'Refrigerator', wattage: 150, usage_hours: 24, room: 'kitchen' },
  { id: '5', appliance_name: 'Microwave', wattage: 1000, usage_hours: 1, room: 'kitchen' },
  { id: '6', appliance_name: 'Electric Kettle', wattage: 1500, usage_hours: 0.5, room: 'kitchen' },
  { id: '7', appliance_name: 'Air Conditioner', wattage: 1200, usage_hours: 6, room: 'bedroom' },
  { id: '8', appliance_name: 'Ceiling Fan', wattage: 75, usage_hours: 8, room: 'bedroom' },
  { id: '9', appliance_name: 'Phone Charger', wattage: 20, usage_hours: 4, room: 'bedroom' },
];

let system: PrototypeSystem = { ...DEFAULT_SYSTEM };
let appliances: PrototypeAppliance[] = DEFAULT_APPLIANCES.map((appliance) => ({ ...appliance }));

export function getPrototypeSystem(): PrototypeSystem {
  return { ...system };
}

export function getPrototypeAppliances(): PrototypeAppliance[] {
  return appliances.map((appliance) => ({ ...appliance }));
}

export function savePrototypeSystem(nextSystem: PrototypeSystem): PrototypeSystem {
  system = { ...nextSystem };
  return getPrototypeSystem();
}

export function savePrototypeAppliances(nextAppliances: PrototypeAppliance[]): PrototypeAppliance[] {
  appliances = nextAppliances.map((appliance) => ({ ...appliance }));
  return getPrototypeAppliances();
}

export function addPrototypeAppliance(appliance: Omit<PrototypeAppliance, 'id'>): PrototypeAppliance[] {
  appliances = [...appliances, { ...appliance, id: crypto.randomUUID() }];
  return getPrototypeAppliances();
}

export function deletePrototypeAppliance(applianceId: string): PrototypeAppliance[] {
  appliances = appliances.filter((appliance) => appliance.id !== applianceId);
  return getPrototypeAppliances();
}

export function resetPrototypeConfiguration(): void {
  system = { ...DEFAULT_SYSTEM };
  appliances = DEFAULT_APPLIANCES.map((appliance) => ({ ...appliance }));
}

export async function getUserSolarSystem(): Promise<PrototypeSystem> {
  return getPrototypeSystem();
}

export async function getUserInitialAppliances(): Promise<PrototypeAppliance[]> {
  return getPrototypeAppliances();
}

export async function saveSolarSystem(nextSystem: PrototypeSystem): Promise<PrototypeSystem> {
  return savePrototypeSystem(nextSystem);
}

export async function saveInitialAppliances(nextAppliances: Array<Omit<PrototypeAppliance, 'id'>>): Promise<PrototypeAppliance[]> {
  return savePrototypeAppliances(nextAppliances.map((appliance, index) => ({
    ...appliance,
    id: String(index + 1),
  })));
}

export async function getUserConfigAppliances(): Promise<PrototypeAppliance[]> {
  return getPrototypeAppliances();
}

export async function saveConfigAppliance(appliance: Omit<PrototypeAppliance, 'id'>): Promise<PrototypeAppliance[]> {
  return addPrototypeAppliance(appliance);
}

export async function deleteConfigAppliance(applianceId: string): Promise<PrototypeAppliance[]> {
  return deletePrototypeAppliance(applianceId);
}
