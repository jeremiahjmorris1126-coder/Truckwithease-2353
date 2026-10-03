import { RegisteredApplet, UserAppletsRegistry } from '../types';
import registryJson from './userAppletsRegistry.json';

/**
 * Registry of user applets in the Truckwithease / Google AI Studio ecosystem.
 * Stored persistently in code for cross-applet linking, telemetry correlation,
 * and multi-tier fleet platform integration.
 */
export const USER_APPLETS_REGISTRY: UserAppletsRegistry = registryJson as UserAppletsRegistry;

export const ALL_REGISTERED_APPLETS: RegisteredApplet[] = USER_APPLETS_REGISTRY.applets;

/**
 * Current applet ID running this instance.
 */
export const CURRENT_APPLET_ID = '2371eb55-d5a9-4283-9f6b-2d0e530c0bff';

/**
 * Filtered list of Truckwithease-specific enterprise, driver, and HUD applets.
 */
export const TRUCKWITHEASE_ECOSYSTEM_APPLETS: RegisteredApplet[] = ALL_REGISTERED_APPLETS.filter(app => {
  const name = (app.name || '').toLowerCase();
  const desc = (app.description || '').toLowerCase();
  return name.includes('truck') || desc.includes('truck') || desc.includes('fmcsa') || desc.includes('in-cab');
});

/**
 * Helper to get an applet by its Spanner or Bundled ID.
 */
export function getAppletById(id: string): RegisteredApplet | undefined {
  return ALL_REGISTERED_APPLETS.find(app => app.source.spanner?.id === id || app.source.bundled?.id === id);
}

/**
 * Helper to get the current applet's registered metadata.
 */
export function getCurrentAppletMetadata(): RegisteredApplet | undefined {
  return getAppletById(CURRENT_APPLET_ID);
}
