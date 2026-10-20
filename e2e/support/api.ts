import { API_URL, PASSWORD } from './roles';

async function call(query: string, headers: Record<string, string> = {}, variables?: object) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ query, variables }),
  });
  return { json: (await response.json()) as any, headers: response.headers };
}

async function loginAsOwner() {
  const login = await call(
    `mutation { userLogin(email: "owner@example.com", password: "${PASSWORD}") { authenticatable { id } } }`
  );
  return {
    'access-token': login.headers.get('access-token') ?? '',
    client: login.headers.get('client') ?? '',
    uid: login.headers.get('uid') ?? '',
  };
}

/** Two workers signing in as the owner at the same moment can invalidate each other's token: ask again after a pause */
async function ownerCall(query: string, variables?: object) {
  for (let attempt = 0; ; attempt++) {
    const auth = await loginAsOwner();
    const result = await call(query, auth, variables);
    if ((result.json?.data && !result.json?.errors) || attempt >= 3) return { ...result, auth };
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));
  }
}

const createdLoads: string[] = [];

/**
 * Deletes the loads this worker created through `createLoadViaApi`: the board lists every load of the day and the
 * specs look for the seeded "Load #1", which scrolls out of the rendered list once dozens of loads pile up.
 */
export async function deleteCreatedLoads() {
  const ids = createdLoads.splice(0);
  if (!ids.length) return;
  const auth = await loginAsOwner();
  for (const id of ids) {
    // Taking everyone off first gives back what their places cost: deleting the load does not
    const places = await call(`{ load(id: ${Number(id)}) { slots { id } } }`, auth);
    for (const slot of places.json?.data?.load?.slots ?? []) {
      await call(`mutation { deleteSlot(input: { id: ${Number(slot.id)} }) { errors } }`, auth);
    }
    await call(`mutation { deleteLoad(input: { id: ${Number(id)} }) { errors } }`, auth);
  }
}

/** Creates a load through the API as the seed's owner, the way a second device would. Returns its id. */
export async function createLoadViaApi(name = `Live ${Date.now()}`): Promise<string | undefined> {
  const operators = await ownerCall('{ operators { edges { node { id currentUser { id } } } } }');
  const operator = operators.json.data.operators.edges[0].node;
  const vehicles = await ownerCall(`{ vehicles(operator: ${operator.id}) { id } }`);
  const member = operator.currentUser.id;
  const created = await ownerCall(
    `mutation { createLoad(input: { attributes: { name: "${name}", vehicle: ${vehicles.json.data.vehicles[0].id}, maxSlots: 10, pilot: ${member}, gca: ${member} } }) { load { id } errors } }`
  );
  const id = created.json?.data?.createLoad?.load?.id;
  if (id) createdLoads.push(id);
  return id;
}

/**
 * Creates a load that carries in two vehicles, which only an operator with the multi-vehicle module has: a new user
 * creates a generic operator (named "Dropzone", the one the operator selection screen shows) with two vehicles, and a
 * load for them. A user of their own keeps the seeded owner's operators as they are. Returns who to log in as and the load.
 */
export async function createTwoVehicleLoadViaApi(name = `Two vehicles ${Date.now()}`) {
  const email = await registerNewUser();
  const login = await call(
    `mutation { userLogin(email: "${email}", password: "${PASSWORD}") { authenticatable { id } } }`
  );
  const auth = {
    'access-token': login.headers.get('access-token') ?? '',
    client: login.headers.get('client') ?? '',
    uid: login.headers.get('uid') ?? '',
  };
  const operator = await call(
    `mutation { createOperator(input: { industry: GENERIC, attributes: { name: "Dropzone", timeZone: "Australia/Brisbane" } }) { operator { id } errors } }`,
    auth
  );
  const operatorId = Number(operator.json?.data?.createOperator?.operator?.id);
  if (!operatorId) return undefined;
  const vehicles = await call(
    `mutation { a: createVehicle(input: { attributes: { operatorId: ${operatorId}, name: "Raft 1", registration: "R1", capacity: 6 } }) { vehicle { id } } b: createVehicle(input: { attributes: { operatorId: ${operatorId}, name: "Raft 2", registration: "R2", capacity: 8 } }) { vehicle { id } } }`,
    auth
  );
  const { a, b } = vehicles.json?.data ?? {};
  if (!a?.vehicle?.id || !b?.vehicle?.id) return undefined;
  const created = await call(
    `mutation { createLoad(input: { attributes: { name: "${name}", vehicles: [{ vehicleId: "${a.vehicle.id}", role: carrying }, { vehicleId: "${b.vehicle.id}", role: carrying }] } }) { load { id } errors } }`,
    auth
  );
  const id = created.json?.data?.createLoad?.load?.id;
  return id ? { email, id: id as string } : undefined;
}

/** Puts a load on call, `minutes` from now, the way the boarding call does. Returns whether the API accepted it. */
export async function callLoadViaApi(id: string, minutes = 10): Promise<boolean> {
  const at = new Date(Date.now() + minutes * 60_000).toISOString();
  for (let attempt = 0; attempt < 4; attempt++) {
    const { json } = await ownerCall(
      `mutation { updateLoad(input: { id: ${Number(id)}, attributes: { dispatchAt: "${at}", state: boarding } }) { load { id state } errors } }`
    );
    if (json?.data?.updateLoad?.load?.state === 'boarding') return true;
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));
  }
  return false;
}

/** Registers a brand new user who has not joined the operator. Returns the email. */
export async function registerNewUser(name = 'New Jumper'): Promise<string> {
  const email = `newjumper+${Date.now()}@example.com`;
  const { json } = await call(
    `mutation($email: String!, $name: String!) { userRegister(email: $email, password: "${PASSWORD}", passwordConfirmation: "${PASSWORD}", name: $name, phone: "0400111222", bodyMassKg: 80, confirmUrl: "https://openmanifest.org/confirm/") { authenticatable { id } errors } }`,
    {},
    { email, name }
  );
  if (!json?.data?.userRegister?.authenticatable?.id) {
    throw new Error(`could not register a new user: ${JSON.stringify(json).slice(0, 200)}`);
  }
  return email;
}

/**
 * Makes sure a member of the seed has flown before, so the member picker has a last slot to fill in: a load on which they
 * had a place, landed. Does nothing when they already have one. Returns whether they have a last slot.
 */
export async function giveLastSlotViaApi(name: string): Promise<boolean> {
  const found = await ownerCall('{ operators { edges { node { id } } } }');
  const operatorId = Number(found.json.data.operators.edges[0].node.id);
  const members = await ownerCall(
    `{ memberships(operator: ${operatorId}, first: 5, search: "${name}") { edges { node { id lastSlot { id } } } } }`
  );
  const member = members.json.data.memberships.edges[0]?.node;
  if (!member) return false;
  if (member.lastSlot) return true;

  const options = await ownerCall(
    `{ ticketTypes(operator: ${operatorId}) { id } activityTypes(memberships: [${member.id}]) { id } vehicles(operator: ${operatorId}) { id } }`
  );
  const { ticketTypes, activityTypes, vehicles } = options.json.data;
  const owner = await ownerCall('{ operators { edges { node { currentUser { id } } } } }');
  const crew = owner.json.data.operators.edges[0].node.currentUser.id;
  const load = await ownerCall(
    `mutation { createLoad(input: { attributes: { name: "Earlier", vehicle: ${vehicles[0].id}, maxSlots: 10, pilot: ${crew}, gca: ${crew} } }) { load { id } } }`
  );
  const loadId = load.json?.data?.createLoad?.load?.id;
  if (!loadId) return false;
  const slot = await ownerCall(
    `mutation { createSlot(input: { attributes: { load: ${loadId}, membership: ${member.id}, ticketType: ${ticketTypes[0].id}, activityType: ${activityTypes[0].id}, bodyMassKg: 80 } }) { slot { id } } }`
  );
  if (!slot.json?.data?.createSlot?.slot?.id) return false;
  const landed = await ownerCall(
    `mutation { finalizeLoad(input: { id: ${Number(loadId)}, state: completed }) { load { id } } }`
  );
  return !!landed.json?.data?.finalizeLoad?.load?.id;
}

/**
 * Puts a member of the seed on a load, the way the manifest desk would (their first ticket, an activity they may do).
 * Returns the id of the slot.
 */
export async function manifestMemberViaApi(
  loadId: string,
  name: string
): Promise<string | undefined> {
  const found = await ownerCall('{ operators { edges { node { id } } } }');
  const operatorId = Number(found.json.data.operators.edges[0].node.id);
  const members = await ownerCall(
    `{ memberships(operator: ${operatorId}, first: 5, search: "${name}") { edges { node { id } } } }`
  );
  const member = members.json.data.memberships.edges[0]?.node;
  if (!member) return undefined;
  const options = await ownerCall(
    `{ ticketTypes(operator: ${operatorId}) { id } activityTypes(memberships: [${member.id}]) { id } }`
  );
  const { ticketTypes, activityTypes } = options.json.data;
  const slot = await ownerCall(
    `mutation { createSlot(input: { attributes: { load: ${Number(loadId)}, membership: ${member.id}, ticketType: ${ticketTypes[0].id}, activityType: ${activityTypes[0].id}, bodyMassKg: 80 } }) { slot { id } errors } }`
  );
  return slot.json?.data?.createSlot?.slot?.id;
}

/** Max Manifest, the seed member the returning-member specs use */
export const giveMaxALastSlotViaApi = () => giveLastSlotViaApi('Max Manifest');

/**
 * A ticket that takes guests along (a try dive: up to `capacity` guests for each escort), by name. Creates it when the
 * operator has none of that name; returns its name.
 */
export async function escortTicketViaApi(name: string, capacity: number): Promise<string> {
  const found = await ownerCall('{ operators { edges { node { id } } } }');
  const operatorId = Number(found.json.data.operators.edges[0].node.id);
  const existing = await ownerCall(`{ ticketTypes(operator: ${operatorId}) { name } }`);
  if (existing.json.data.ticketTypes.some((ticket: { name: string }) => ticket.name === name))
    return name;
  const created = await ownerCall(
    `mutation { createTicketType(input: { attributes: { operatorId: ${operatorId}, name: "${name}", costCents: 6000, currency: "AUD", requiresEscort: true, escortCapacity: ${capacity}, allowManifestingSelf: false } }) { ticketType { id } errors } }`
  );
  if (!created.json?.data?.createTicketType?.ticketType?.id) {
    throw new Error(
      `could not create the ticket ${name}: ${JSON.stringify(created.json).slice(0, 200)}`
    );
  }
  return name;
}

/** A member of the seeded operator who is not ready to fly (no credit, no certification). Returns the name they go by. */
export async function joinBlockedMemberViaApi(name = `Blocked ${Date.now()}`) {
  const email = await registerNewUser(name);
  const login = await call(
    `mutation { userLogin(email: "${email}", password: "${PASSWORD}") { authenticatable { id } } }`
  );
  const auth = {
    'access-token': login.headers.get('access-token') ?? '',
    client: login.headers.get('client') ?? '',
    uid: login.headers.get('uid') ?? '',
  };
  const operators = await ownerCall('{ operators { edges { node { id } } } }');
  const operatorId = operators.json.data.operators.edges[0].node.id;
  const joined = await call(
    `mutation { joinOperator(input: { operator: ${operatorId} }) { membership { id } errors } }`,
    auth
  );
  return joined.json?.data?.joinOperator?.membership?.id ? name : undefined;
}
