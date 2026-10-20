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
export async function registerNewUser(): Promise<string> {
  const email = `newjumper+${Date.now()}@example.com`;
  const { json } = await call(
    `mutation($email: String!) { userRegister(email: $email, password: "${PASSWORD}", passwordConfirmation: "${PASSWORD}", name: "New Jumper", phone: "0400111222", bodyMassKg: 80, confirmUrl: "https://openmanifest.org/confirm/") { authenticatable { id } errors } }`,
    {},
    { email }
  );
  if (!json?.data?.userRegister?.authenticatable?.id) {
    throw new Error(`could not register a new user: ${JSON.stringify(json).slice(0, 200)}`);
  }
  return email;
}
