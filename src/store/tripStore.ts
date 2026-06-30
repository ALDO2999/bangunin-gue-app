import { create } from 'zustand';

export type Destination = {
  latitude: number;
  longitude: number;
  name: string;
};

export type Trip = {
  destination: Destination;
  /** Wake-up radius in meters. */
  radius: number;
};

type TripState = {
  /** The currently active trip, or null when there's no active trip. */
  trip: Trip | null;
  startTrip: (trip: Trip) => void;
  clearTrip: () => void;
};

export const useTripStore = create<TripState>(set => ({
  trip: null,
  startTrip: trip => set({ trip }),
  clearTrip: () => set({ trip: null }),
}));
