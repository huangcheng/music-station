import dynamic from 'next/dynamic';

export { default as Sidebar } from './sidebar';

export const Controls = dynamic(() => import('./controls'), {
  ssr: false,
});

export * from './main';

export type { ControlsProps } from './controls';
