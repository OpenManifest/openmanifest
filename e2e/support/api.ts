import { API_URL, PASSWORD } from './roles';

async function call(query: string, headers: Record<string, string> = {}, variables?: object) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ query, variables }),
  });
  return { json: (await response.json()) as any, headers: response.headers };
}

/** Creates a load through the API as the seed's owner, the way a second device would. Returns its id. */
export async function createLoadViaApi(): Promise<string | undefined> {
  const login = await call(
    `mutation { userLogin(email: "owner@example.com", password: "${PASSWORD}") { authenticatable { id } } }`
  );
  const auth = {
    'access-token': login.headers.get('access-token') ?? '',
    client: login.headers.get('client') ?? '',
    uid: login.headers.get('uid') ?? '',
  };
  const { json: operators } = await call(
    '{ operators { edges { node { id currentUser { id } } } } }',
    auth
  );
  const operator = operators.data.operators.edges[0].node;
  const { json: vehicles } = await call(`{ vehicles(operator: ${operator.id}) { id } }`, auth);
  const member = operator.currentUser.id;
  const { json: created } = await call(
    `mutation { createLoad(input: { attributes: { name: "Live ${Date.now()}", vehicle: ${vehicles.data.vehicles[0].id}, maxSlots: 10, pilot: ${member}, gca: ${member} } }) { load { id } errors } }`,
    auth
  );
  return created?.data?.createLoad?.load?.id;
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
