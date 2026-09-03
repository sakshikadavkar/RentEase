import { useContext } from 'react';
import { RentalContext } from './RentalContext';

export function useRental() {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
}
