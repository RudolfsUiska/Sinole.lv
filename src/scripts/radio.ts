// Sinole FM live stream player.
// The Audio object lives in JS (not in the DOM), so it keeps playing while
// Astro's view transitions swap pages. All UI reads html[data-radio].

const STREAM_URL = 'https://fm.sinole.lv:8100/radio.mp3';
const VOLUME_KEY = 'sinole-radio-volume';
const CONNECT_TIMEOUT_MS = 15000;
const ERROR_DISMISS_MS = 8000;

type RadioState = 'idle' | 'loading' | 'playing' | 'error';

const root = document.documentElement;
const audio = new Audio();
audio.preload = 'none';

let state: RadioState = 'idle';
let wanted = false;
let connectTimer: number | undefined;
let errorTimer: number | undefined;
let heroObserver: IntersectionObserver | undefined;
let heroVisible = false;

function readVolume(): number {
  try {
    const stored = Number(localStorage.getItem(VOLUME_KEY));
    if (localStorage.getItem(VOLUME_KEY) !== null && stored >= 0 && stored <= 1) return stored;
  } catch {
    // storage blocked: fall through to the default
  }
  return 0.8;
}

function saveVolume(value: number) {
  try {
    localStorage.setItem(VOLUME_KEY, String(value));
  } catch {
    // storage blocked: volume just won't persist
  }
}

audio.volume = readVolume();

function render() {
  root.dataset.radio = state;
  root.dataset.radioHero = heroVisible ? 'visible' : 'hidden';
  root.dataset.radioMuted = String(audio.muted || audio.volume === 0);

  const active = state === 'playing' || state === 'loading';
  document.querySelectorAll<HTMLElement>('[data-radio-toggle]').forEach((el) => {
    el.setAttribute('aria-pressed', String(active));
    if (el.hasAttribute('aria-label')) {
      el.setAttribute('aria-label', active ? 'Apturēt radio' : 'Atskaņot radio');
    }
  });
  document.querySelectorAll<HTMLInputElement>('[data-radio-volume]').forEach((el) => {
    el.value = String(Math.round(audio.volume * 100));
  });
  document.querySelectorAll<HTMLElement>('[data-radio-mute]').forEach((el) => {
    el.setAttribute('aria-pressed', String(audio.muted));
  });
}

function setState(next: RadioState) {
  state = next;
  window.clearTimeout(connectTimer);
  window.clearTimeout(errorTimer);
  if (next === 'loading') {
    connectTimer = window.setTimeout(() => {
      if (state === 'loading') fail();
    }, CONNECT_TIMEOUT_MS);
  }
  if (next === 'error') {
    // The error message clears itself so the dock doesn't linger forever.
    errorTimer = window.setTimeout(() => {
      if (state === 'error') setState('idle');
    }, ERROR_DISMISS_MS);
  }
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = next === 'playing' ? 'playing' : 'paused';
  }
  render();
}

function release() {
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
}

function fail() {
  wanted = false;
  release();
  setState('error');
}

function play() {
  wanted = true;
  setState('loading');
  // Always reconnect so playback starts at the live edge, not a stale buffer.
  audio.src = STREAM_URL;
  audio.play().catch((err: DOMException) => {
    if (wanted && err.name !== 'AbortError') fail();
  });
}

function stop() {
  wanted = false;
  release();
  setState('idle');
}

function toggle() {
  if (state === 'playing' || state === 'loading') stop();
  else play();
}

audio.addEventListener('playing', () => wanted && setState('playing'));
audio.addEventListener('waiting', () => wanted && setState('loading'));
audio.addEventListener('error', () => wanted && fail());
audio.addEventListener('ended', () => wanted && play());
audio.addEventListener('volumechange', render);

document.addEventListener('click', (event) => {
  const target = event.target as Element | null;
  if (target?.closest('[data-radio-toggle]')) {
    toggle();
  } else if (target?.closest('[data-radio-mute]')) {
    audio.muted = !audio.muted;
  }
});

document.addEventListener('input', (event) => {
  const target = event.target as HTMLInputElement | null;
  if (!target?.matches('[data-radio-volume]')) return;
  const value = Math.min(1, Math.max(0, Number(target.value) / 100));
  audio.muted = false;
  audio.volume = value;
  saveVolume(value);
});

if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: 'Sinole FM',
    artist: 'sinole.lv',
  });
  navigator.mediaSession.setActionHandler('play', play);
  navigator.mediaSession.setActionHandler('pause', stop);
  navigator.mediaSession.setActionHandler('stop', stop);
}

// The floating dock hides while the big hero player is on screen.
function watchHero() {
  heroObserver?.disconnect();
  const hero = document.querySelector('[data-radio-hero-player]');
  heroVisible = false;
  if (hero) {
    heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      render();
    });
    heroObserver.observe(hero);
  }
  render();
}

// View transitions replace <html> attributes on every navigation.
document.addEventListener('astro:after-swap', render);
document.addEventListener('astro:page-load', watchHero);
