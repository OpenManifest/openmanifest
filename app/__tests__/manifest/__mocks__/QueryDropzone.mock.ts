import startOfDay from "date-fns/startOfDay";
import addDays from "date-fns/addDays";
import { TicketType, Plane, Dropzone, DropzoneUser } from "../../../api/schema";
import { QUERY_DROPZONE } from "../../../screens/authenticated/manifest/ManifestScreen";


interface IOverride {
  currentUser?: Partial<DropzoneUser>;
  dropzone?: Partial<Dropzone>;
}
export const MOCK_QUERY_DROPZONE = (overrides?: IOverride) => ({
    request: {
      query: QUERY_DROPZONE,
      variables: {
        dropzoneId: 1,
        earliestTimestamp: startOfDay(new Date()).getTime() / 1000,
      },
      fetchPolicy: "no-cache"
    },
    result: {
      data: {
        dropzone: {
          id: "1",
          name: "Skydive Jest",
          primaryColor: "#000000",
          secondaryColor: "#FFFFFF",
          planes: [
            { id: "1", name: "C182", registration: "ABC-123" } as Plane,
            { id: "2", name: "Caravan", registration: "CDE-456" } as Plane,
          ],
          ticketTypes: [
            { id: "1", name: "Height" } as TicketType,
            { id: "2", name: "Tandem" } as TicketType,
            { id: "3", name: "Hop n Pop" } as TicketType,
          ],
          currentUser: {
            id: "123",
            hasCredits: true,
            hasExitWeight: true,
            hasMembership: true,
            hasReserveInDate: true,
            hasRigInspection: true,
            hasLicense: true,

            transactions: {},

            user: {
              id: "234",
              name: "Court Jester",
              exitWeight: "100",
              email: "jest@test.com",
              phone: "123456789",

              rigs: [
                { id: "1", make: "Vector", model: "V310", serial: "12345", canopySize: 150, repackExpiresAt: addDays(new Date(), 20).getTime() / 1000 },
                { id: "2", make: "Mirage", model: "G4.1", serial: "34567", canopySize: 170, repackExpiresAt: startOfDay(new Date()).getTime() / 1000 },
              ],

              jumpTypes: [
                { id: "1", name: "Freefly" },
                { id: "2", name: "Angle/Tracking" },
              ],
              license: { id: "1", name: "Certificate C" },
            },
            ...overrides?.currentUser

          },
          loads: {
            edges: [
              {
                node: { id: "1", name: null, loadNumber: 1, isOpen: false, maxSlots: 4, isFull: true },
              },
              {
                node: { id: "2", name: "Sunset load", loadNumber: 2, isOpen: true, maxSlots: 16, isFull: false },
              }
            ]
          },
          ...overrides?.dropzone
        } as Dropzone
      },
    },
  });