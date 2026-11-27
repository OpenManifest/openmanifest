import * as React from 'react';
import { Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { useTranslation } from 'react-i18next';
import i18n, { applyTerms } from '../index';
import useTerms from '../useTerms';
import generic from '../fixtures/generic.json';
import skydiving from '../fixtures/skydiving.json';

afterEach(() => act(() => applyTerms(null)));

describe('terms', () => {
  it('start as the generic words', () => {
    expect(i18n.t('terms:load', { count: 1 })).toBe('Load');
    expect(i18n.t('terms:operator', { count: 1 })).toBe('Operator');
    expect(i18n.t('terms:member', { count: 2 })).toBe('Customers');
  });

  it('pluralise', () => {
    applyTerms(skydiving);

    expect(i18n.t('terms:member', { count: 1 })).toBe('Jumper');
    expect(i18n.t('terms:member', { count: 0 })).toBe('Jumpers');
    expect(i18n.t('terms:member', { count: 2 })).toBe('Jumpers');
    expect(i18n.t('terms:vehicle', { count: 2 })).toBe('Aircraft');
  });

  it('can be read without a count', () => {
    applyTerms(skydiving);

    expect(i18n.t('terms:operator')).toBe('Dropzone');
  });

  it('reach into groups', () => {
    applyTerms(skydiving);

    expect(i18n.t('terms:crew.pilot', { count: 1 })).toBe('Pilot');
    expect(i18n.t('terms:crew.load_master', { count: 2 })).toBe('Load masters');
    expect(i18n.t('terms:state.completed', { count: 1 })).toBe('Landed');
  });

  it('switch between a skydiving and a generic operator without leaving words behind', () => {
    applyTerms(skydiving);
    expect(i18n.t('terms:crew.pilot')).toBe('Pilot');
    expect(i18n.t('terms:destination', { count: 1 })).toBe('Altitude');

    applyTerms(generic);

    expect(i18n.t('terms:destination', { count: 1 })).toBe('Destination');
    expect(i18n.exists('terms:crew.pilot')).toBe(false);
    expect(i18n.t('terms:state.completed', { count: 1 })).toBe('Completed');
  });

  it('let an operator change single words', () => {
    applyTerms({ load: { one: 'Departure', other: 'Departures' } });

    expect(i18n.t('terms:load', { count: 2 })).toBe('Departures');
    expect(i18n.t('terms:slot', { count: 2 })).toBe('Slots');
  });

  it('go into sentences', () => {
    applyTerms(skydiving);

    expect(i18n.t('common:call.minutes', { minutes: 10, call: 'boarding call' })).toBe(
      '10 minute boarding call'
    );
  });
});

function Probe() {
  const term = useTerms();
  const { t } = useTranslation('common');

  return (
    <>
      <Text testID="load">{term('load', 2)}</Text>
      <Text testID="tab">{t('tabs.manifest')}</Text>
    </>
  );
}

describe('components', () => {
  it('re-render when the terms change', async () => {
    const screen = await render(<Probe />);
    expect(screen.getByTestId('load').props.children).toBe('Loads');

    await act(() => applyTerms({ load: { one: 'Trip', other: 'Trips' } }));

    expect(screen.getByTestId('load').props.children).toBe('Trips');
    expect(screen.getByTestId('tab').props.children).toBe('Manifest');
  });
});
