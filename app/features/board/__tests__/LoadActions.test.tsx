import * as React from 'react';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import mockQueryOperator from 'app/__tests__/manifest/__mocks__/QueryOperator.mock';
import { LoadState, Permission } from 'app/api/schema.d';
import { todayInZone } from 'app/utils/operatorTime';
import { operatorExtensive } from 'app/__fixtures__/operator.fixture';
import {
  guideRole,
  loadVehicle,
  makeLoad,
  membership,
  pilotRole,
} from 'app/__fixtures__/board.fixture';
import { fireEvent, render, waitFor } from '../../../__mocks__/render';
import LoadActions from '../LoadActions';

jest.setTimeout(30000);

const mockUpdate = jest.fn();
const mockFinalize = jest.fn();
const mockError = jest.fn();
jest.mock('app/api/reflection', () => ({
  ...jest.requireActual('app/api/reflection'),
  useUpdateLoadMutation: () => [mockUpdate],
  useFinalizeLoadMutation: () => [mockFinalize],
}));
jest.mock('app/providers/notifications', () => ({
  ...jest.requireActual('app/providers/notifications'),
  useNotifications: () => ({ error: mockError, success: jest.fn() }),
}));

const today = `${todayInZone(operatorExtensive.timeZone)}T02:00:00Z`;
const piloted = {
  crew: [
    { id: 'c', crewRole: pilotRole, membership: membership('Pat'), loadVehicle: { id: 'lv1' } },
  ],
};

async function renderActions(
  load: Record<string, unknown>,
  {
    permissions = [Permission.UpdateLoad],
    schedule,
  }: { permissions?: Permission[]; schedule?: number[] } = {}
) {
  mockUpdate.mockResolvedValue({ data: { updateLoad: { load: { id: '10' }, errors: null } } });
  mockFinalize.mockResolvedValue({ data: { finalizeLoad: { load: { id: '10' }, errors: null } } });
  return render(
    <LoadActions
      load={makeLoad({ createdAt: today, ...piloted, ...load })}
      crewRoles={[pilotRole, guideRole]}
    />,
    {
      session: authenticatedSession,
      permissions,
      graphql: schedule
        ? [mockQueryOperator({}, { operator: { callScheduleMinutes: schedule } })]
        : [],
    }
  );
}

describe('<LoadActions />', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls from the schedule in two taps: the button, then the minutes', async () => {
    const board = await renderActions({ state: LoadState.Open });
    await waitFor(() => expect(board.getByTestId('load-actions-primary')).toBeTruthy());

    await fireEvent.press(board.getByTestId('load-actions-primary'));
    await fireEvent.press(await board.findByText('10 minute call'));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    const { variables } = mockUpdate.mock.calls[0][0];
    expect(variables.id).toBe('10');
    expect(variables.attributes.state).toBe('boarding');
    const minutes = (new Date(variables.attributes.dispatchAt).getTime() - Date.now()) / 60_000;
    expect(minutes).toBeGreaterThan(9);
    expect(minutes).toBeLessThanOrEqual(10);
  });

  it('calls at a time of your own', async () => {
    const board = await renderActions({ state: LoadState.Open });
    await waitFor(() => expect(board.getByTestId('load-actions-primary')).toBeTruthy());

    await fireEvent.press(board.getByTestId('load-actions-primary'));
    await fireEvent.press(await board.findByText('Custom…'));
    await fireEvent.press(await board.findByTestId('load-actions-call-custom'));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    const minutes =
      (new Date(mockUpdate.mock.calls[0][0].variables.attributes.dispatchAt).getTime() -
        Date.now()) /
      60_000;
    expect(minutes).toBeGreaterThan(14);
  });

  it('departs directly when the operator has no call schedule', async () => {
    const board = await renderActions({ state: LoadState.Open }, { schedule: [] });
    await waitFor(() => expect(board.getByText('Depart')).toBeTruthy());

    await fireEvent.press(board.getByTestId('load-actions-primary'));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    expect(mockUpdate.mock.calls[0][0].variables.attributes).toMatchObject({
      state: 'departed',
      dispatchAt: null,
    });
  });

  it('departs a load on call with one tap, and lands a departed one', async () => {
    const onCall = await renderActions({
      state: LoadState.Boarding,
      dispatchAt: Math.floor(Date.now() / 1000) + 300,
    });
    await waitFor(() => expect(onCall.getByText('Depart')).toBeTruthy());
    await fireEvent.press(onCall.getByTestId('load-actions-primary'));
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    expect(mockUpdate.mock.calls[0][0].variables.attributes.state).toBe('departed');
    await onCall.unmount();

    const flying = await renderActions({ state: LoadState.Departed });
    await waitFor(() => expect(flying.getByText('Land')).toBeTruthy());
    await fireEvent.press(flying.getByTestId('load-actions-primary'));
    await waitFor(() => expect(mockFinalize).toHaveBeenCalledTimes(1));
    expect(mockFinalize.mock.calls[0][0].variables).toEqual({ id: 10, state: 'completed' });
  });

  it('re-opens a load that is over', async () => {
    const board = await renderActions({ state: LoadState.Completed });
    await waitFor(() => expect(board.getByTestId('load-actions-primary')).toBeTruthy());

    await fireEvent.press(board.getByTestId('load-actions-primary'));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    expect(mockUpdate.mock.calls[0][0].variables.attributes).toMatchObject({
      state: 'open',
      dispatchAt: null,
    });
  });

  it('cancels the call of a load on call', async () => {
    const board = await renderActions({
      state: LoadState.Boarding,
      dispatchAt: Math.floor(Date.now() / 1000) + 300,
    });
    await waitFor(() => expect(board.getByTestId('load-actions-menu')).toBeTruthy());

    await fireEvent.press(board.getByTestId('load-actions-menu'));
    await fireEvent.press(await board.findByTestId('load-actions-cancelCall'));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    expect(mockUpdate.mock.calls[0][0].variables.attributes).toMatchObject({
      state: 'open',
      dispatchAt: null,
    });
  });

  it('asks before cancelling a load, and cancels only when told to', async () => {
    const board = await renderActions({ state: LoadState.Open });
    await waitFor(() => expect(board.getByTestId('load-actions-menu')).toBeTruthy());

    await fireEvent.press(board.getByTestId('load-actions-menu'));
    await fireEvent.press(await board.findByTestId('load-actions-cancelLoad'));
    expect(await board.findByText(/Its places are released/)).toBeTruthy();
    expect(mockFinalize).not.toHaveBeenCalled();

    await fireEvent.press(board.getByTestId('load-actions-confirm-yes'));

    await waitFor(() => expect(mockFinalize).toHaveBeenCalledTimes(1));
    expect(mockFinalize.mock.calls[0][0].variables.state).toBe('cancelled');
  });

  it('blocks departure while a required crew role is empty, and says which', async () => {
    const board = await renderActions({
      state: LoadState.Boarding,
      dispatchAt: Math.floor(Date.now() / 1000) + 300,
      crew: [],
      vehicles: [loadVehicle('lv1')],
    });
    await waitFor(() => expect(board.getByTestId('load-actions-blocked')).toBeTruthy());

    expect(board.getByTestId('load-actions-blocked').props.children).toMatch(/Pilot/);
    await fireEvent.press(board.getByTestId('load-actions-primary'));
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('shows what the server refused as an error', async () => {
    const board = await renderActions({ state: LoadState.Departed });
    mockFinalize.mockResolvedValue({
      data: { finalizeLoad: { load: null, errors: ['Load is not in the air'] } },
    });
    await waitFor(() => expect(board.getByTestId('load-actions-primary')).toBeTruthy());

    await fireEvent.press(board.getByTestId('load-actions-primary'));

    await waitFor(() => expect(mockError).toHaveBeenCalledWith('Load is not in the air'));
  });

  it('offers nothing to someone who may not change loads', async () => {
    const board = await renderActions({ state: LoadState.Open }, { permissions: [] });
    await waitFor(() => expect(board.queryByTestId('load-actions-primary')).toBeNull());
    expect(board.queryByTestId('load-actions-menu')).toBeNull();
  });
});
