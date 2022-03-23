import * as React from 'react';
import SlotCardAvailable from './SlotCardAvailable';
import SlotCardLoading from './SlotCardLoading';
import SlotCardUser, { ISlotCardProps } from './SlotCardUser';

interface ISlotCardWrapperProps extends Partial<Omit<ISlotCardProps, 'variant'>> {
  variant: 'loading' | 'available';
  width: number;
}

export default function SlotCard(props: ISlotCardWrapperProps | ISlotCardProps) {
  const { variant, width } = props;

  if (variant === 'available') {
    return <SlotCardAvailable {...{ width }} />;
  }
  if (variant === 'loading') {
    return <SlotCardLoading {...props} {...{ width }} />;
  }

  if (variant === 'user' || variant === undefined) {
    return <SlotCardUser {...props} {...{ width }} />;
  }
  return null;
}
