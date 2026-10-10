// Phosphor icons, inlined at build time so no icon font or runtime is shipped.
import arrowRight from '@phosphor-icons/core/assets/regular/arrow-right.svg?raw';
import arrowUpRight from '@phosphor-icons/core/assets/regular/arrow-up-right.svg?raw';
import arrowLeft from '@phosphor-icons/core/assets/regular/arrow-left.svg?raw';
import list from '@phosphor-icons/core/assets/regular/list.svg?raw';
import x from '@phosphor-icons/core/assets/regular/x.svg?raw';
import play from '@phosphor-icons/core/assets/fill/play-fill.svg?raw';
import stop from '@phosphor-icons/core/assets/fill/stop-fill.svg?raw';
import speakerHigh from '@phosphor-icons/core/assets/regular/speaker-high.svg?raw';
import speakerSlash from '@phosphor-icons/core/assets/regular/speaker-slash.svg?raw';
import broadcast from '@phosphor-icons/core/assets/regular/broadcast.svg?raw';
import sun from '@phosphor-icons/core/assets/regular/sun.svg?raw';
import moon from '@phosphor-icons/core/assets/regular/moon.svg?raw';
import envelope from '@phosphor-icons/core/assets/regular/envelope-simple.svg?raw';

export const icons = {
  'arrow-right': arrowRight,
  'arrow-up-right': arrowUpRight,
  'arrow-left': arrowLeft,
  list,
  x,
  play,
  stop,
  'speaker-high': speakerHigh,
  'speaker-slash': speakerSlash,
  broadcast,
  sun,
  moon,
  envelope,
} as const;

export type IconName = keyof typeof icons;
