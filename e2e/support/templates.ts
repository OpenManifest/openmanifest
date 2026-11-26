import { API_URL, PASSWORD } from './roles';

/**
 * The demo operators of the industry templates (backend `config/industries/<slug>/demo.yml`, created by the dev seed):
 * each has an owner `<slug>-owner@example.com` and people `<slug>-<first>.<last>@example.com`, all with the seed's
 * password, so the specs act as them without touching the skydiving seed.
 */
export const templateEmail = (slug: string, name: string) =>
  `${slug}-${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;

export type Auth = Record<string, string>;

/** Signs in through the API; the headers to send with each call */
export async function signIn(email: string): Promise<Auth> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: `mutation { userLogin(email: "${email}", password: "${PASSWORD}") { authenticatable { id } } }`,
    }),
  });
  return {
    'access-token': response.headers.get('access-token') ?? '',
    client: response.headers.get('client') ?? '',
    uid: response.headers.get('uid') ?? '',
  };
}

/** One GraphQL call as a signed-in user */
export async function apiAs(auth: Auth, query: string, variables?: object): Promise<any> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...auth },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

type Named = { id: string; name: string };

/** What a demo operator has: its id, members by name, ticket types, extras, destinations, crew roles and vehicles */
export async function demoOperator(auth: Auth, name: string) {
  const operators = await apiAs(auth, '{ operators { edges { node { id name } } } }');
  const operator = operators.data.operators.edges
    .map((edge: { node: Named }) => edge.node)
    .find((node: Named) => node.name === name);
  if (!operator) throw new Error(`the seed has no operator ${name}: reseed (db:seed:dev_baseline)`);
  const id = Number(operator.id);
  const found = await apiAs(
    auth,
    `{
      memberships(operator: ${id}, first: 50, licensed: false) { edges { node { id user { name } } } }
      ticketTypes(operator: ${id}) { id name }
      extras(operator: "${id}") { id name }
      operator(id: "${id}") { destinations { id name } crewRoles { id key } }
      vehicles(operator: ${id}) { id name }
      activityTypes(operator: "${id}") { id name }
    }`
  );
  if (found.errors) throw new Error(JSON.stringify(found.errors).slice(0, 300));
  const byName = <T extends { name: string }>(items: T[]) =>
    Object.fromEntries(items.map((item) => [item.name, item]));
  const data = found.data;
  return {
    id,
    members: Object.fromEntries(
      data.memberships.edges.map((edge: { node: { id: string; user: { name: string } } }) => [
        edge.node.user.name,
        edge.node.id,
      ])
    ) as Record<string, string>,
    tickets: byName<Named>(data.ticketTypes),
    extras: byName<Named>(data.extras),
    destinations: byName<Named>(data.operator.destinations),
    activities: byName<Named>(data.activityTypes),
    crew: Object.fromEntries(
      data.operator.crewRoles.map((role: { id: string; key: string }) => [role.key, role.id])
    ) as Record<string, string>,
    vehicle: data.vehicles[0] as Named,
  };
}

/** Deletes the loads of an operator that have not completed, with their slots (a run that failed half way) */
export async function clearOpenLoads(auth: Auth, operatorId: number) {
  const loads = await apiAs(
    auth,
    `{ loads(operator: ${operatorId}, first: 50) { edges { node { id state slots { id } } } } }`
  );
  for (const edge of loads.data?.loads?.edges ?? []) {
    const load = edge.node as { id: string; state: string; slots: { id: string }[] };
    if (load.state === 'completed') continue;
    for (const slot of load.slots) {
      await apiAs(auth, `mutation { deleteSlot(input: { id: ${Number(slot.id)} }) { errors } }`);
    }
    await apiAs(auth, `mutation { deleteLoad(input: { id: ${Number(load.id)} }) { errors } }`);
  }
}

/** Creates a load of a demo operator for its vehicle, crew and places; returns its id */
export async function createTripViaApi(
  auth: Auth,
  vehicleId: string,
  name: string,
  crew: { crewRoleId: string; membershipId: string }[],
  destinationIds: string[]
): Promise<string> {
  const crewInput = crew
    .map((entry) => `{ crewRoleId: "${entry.crewRoleId}", membershipId: "${entry.membershipId}" }`)
    .join(', ');
  const created = await apiAs(
    auth,
    `mutation($name: String!) { createLoad(input: { attributes: { name: $name, vehicles: [{ vehicleId: "${vehicleId}", role: carrying }], crew: [${crewInput}], destinationIds: [${destinationIds.map(Number).join(', ')}] } }) { load { id } errors fieldErrors { message } } }`,
    { name }
  );
  const id = created.data?.createLoad?.load?.id;
  if (!id) throw new Error(`could not create the load: ${JSON.stringify(created).slice(0, 300)}`);
  return id;
}

/** Manifests a member; returns the slot's id, or the API's errors */
export async function manifestViaApi(
  auth: Auth,
  attributes: {
    load: string;
    membership: string;
    ticketType: string;
    activityType?: string;
    extras?: string[];
    guests?: { name: string; dateOfBirth: string; bodyMassKg: number }[];
  }
): Promise<{ id?: string; errors: string[] }> {
  const result = await apiAs(
    auth,
    `mutation($attributes: SlotInput!) { createSlot(input: { attributes: $attributes }) { slot { id } errors fieldErrors { message } } }`,
    { attributes: { bodyMassKg: 75, ...attributes } }
  );
  const payload = result.data?.createSlot;
  return {
    id: payload?.slot?.id,
    errors: [
      ...(payload?.errors ?? []),
      ...(payload?.fieldErrors ?? []).map((error: { message: string }) => error.message),
      ...(result.errors ?? []).map((error: { message: string }) => error.message),
    ],
  };
}
