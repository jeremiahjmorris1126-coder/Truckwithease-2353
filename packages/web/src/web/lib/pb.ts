/**
 * Shared PocketBase client instance.
 *
 * The recovered launch build imports this from several paths ("@/lib/pb",
 * "../lib/pb", "./lib/pb"). It is backed by the compatibility shim in
 * ./pb-shim.ts — localStorage for demo collections, the live Hono/Turso API
 * for collections that have been migrated.
 */
import PocketBase, { pbInstance } from "./pb-shim";

export const pb = pbInstance;
export default PocketBase;
export { PocketBase };
