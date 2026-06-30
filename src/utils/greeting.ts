export type Greeting = {
  /** Short headline, e.g. "Selamat malam". */
  title: string;
  /** Warm, reassuring subtitle. */
  subtitle: string;
  /** Material icon name reflecting the time of day. */
  icon: string;
};

/**
 * Returns a time-of-day aware greeting for the active-trip header.
 * @param hour  Hour of day (0–23). Defaults to the current local hour.
 */
export function getGreeting(hour: number = new Date().getHours()): Greeting {
  if (hour >= 5 && hour < 11) {
    return {
      title: 'Selamat pagi',
      subtitle: 'Semangat ya! Aku temani perjalananmu, nanti kubangunin pas hampir sampai.',
      icon: 'wb-sunny',
    };
  }
  if (hour >= 11 && hour < 15) {
    return {
      title: 'Selamat siang',
      subtitle: 'Santai aja di jalan, aku yang jagain biar kamu nggak kelewatan.',
      icon: 'light-mode',
    };
  }
  if (hour >= 15 && hour < 18) {
    return {
      title: 'Selamat sore',
      subtitle: 'Capek seharian? Rebahan dulu, nanti kubangunin kalau sudah mau sampai.',
      icon: 'wb-twilight',
    };
  }
  return {
    title: 'Selamat malam',
    subtitle: 'Istirahat yang cukup ya, aku bangunin kamu pas hampir sampai tujuan.',
    icon: 'bedtime',
  };
}
