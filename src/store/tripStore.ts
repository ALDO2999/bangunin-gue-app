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
  /** True while the arrival alarm is ringing (drives the full-screen alarm). */
  alarmRinging: boolean;
  startTrip: (trip: Trip) => void;
  clearTrip: () => void;
  triggerAlarm: () => void;
  dismissAlarm: () => void;
};

export const useTripStore = create<TripState>(set => ({
  trip: null,
  alarmRinging: false,
  startTrip: trip => set({ trip, alarmRinging: false }),
  clearTrip: () => set({ trip: null, alarmRinging: false }),
  triggerAlarm: () => set({ alarmRinging: true }),
  dismissAlarm: () => set({ alarmRinging: false }),
}));
