'use client';

import { useCallback } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  MoreHorizontal,
  Share,
  Download,
  Mic2,
  Repeat1,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { ReactElement } from 'react';

import { cn, convertToMS, formatSampleRate } from '@/lib';
import { Button, Slider, Badge } from '@/components';

import type { LoopMode, Track } from '@/types';

export interface ControlsProps {
  volume?: number;
  isPlaying?: boolean;
  loop?: LoopMode;
  time?: number;
  track?: Track;
  onNext?: () => void;
  onPrev?: () => void;
  onVolumeChange?: (value: number) => void;
  onTimeChange?: (value: number) => void;
  onMuteToggle?: () => void;
  onLikeToggle?: () => void;
  onPlayToggle?: () => void;
  onLoopToggle?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onMoreOptions?: () => void;
  onMicToggle?: () => void;
}

export default function Controls({
  volume,
  track,
  time,
  isPlaying,
  loop,
  onNext,
  onPrev,
  onLikeToggle,
  onLoopToggle,
  onPlayToggle,
  onMuteToggle,
  onVolumeChange,
  onTimeChange,
}: ControlsProps): ReactElement {
  const { cover, duration, name, artist, favorite, sampleRate, codec } =
    track || {};

  const t = useTranslations();

  const _progress =
    (duration ?? 0) > 0 ? ((time ?? 0) / (duration ?? 0)) * 100 : 0;

  const Loop = useCallback(
    ({ className }: { className: string }): ReactElement => {
      switch (loop) {
        case 'one': {
          return <Repeat1 className={className} />;
        }
        case 'all': {
          return <Repeat className={className} />;
        }
        case 'shuffle': {
          return <Shuffle className={className} />;
        }
        default: {
          return <Repeat1 className={cn('text-gray-300', className)} />;
        }
      }
    },
    [loop],
  );

  return (
    <div className="bg-card/95 backdrop-blur-md border-t border-border/50 p-4 shadow-2xl">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative group">
            <Image
              src={cover ?? '/images/abstract-geometric-shapes.png'}
              alt={name ?? t('No Track')}
              width={64}
              height={64}
              className="rounded-lg object-cover shadow-lg transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4
              suppressHydrationWarning
              className="font-semibold text-base truncate"
            >
              {name}
            </h4>
            <p className="text-sm text-muted-foreground truncate">{artist}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {/*HD*/}
                {codec?.toUpperCase() ?? t('N/A')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {formatSampleRate(sampleRate ?? 0)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 flex-1 max-w-lg">
          <div className="flex items-center gap-3">
            {/*<Button*/}
            {/*  size="sm"*/}
            {/*  variant="ghost"*/}
            {/*  onClick={toggleShuffle}*/}
            {/*  className={`transition-all duration-200 ${isShuffled ? 'text-accent scale-110' : 'text-muted-foreground'}`}*/}
            {/*>*/}
            {/*  <Shuffle className="h-4 w-4" />*/}
            {/*</Button>*/}
            <Button
              size="sm"
              variant="ghost"
              onClick={onLikeToggle}
              className={`transition-all duration-200 ${
                favorite
                  ? 'text-red-500 scale-110'
                  : 'text-muted-foreground' + ' hover:text-red-500'
              } !hover:text-accent `}
            >
              <Heart
                className={`h-5 w-5 ${favorite ? 'fill-current music-bounce' : ''}`}
              />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="text-foreground !hover:text-accent transition-colors hover:scale-110"
              onClick={onPrev}
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              size="lg"
              onClick={onPlayToggle}
              className="bg-accent hover:bg-accent/90 text-accent-foreground w-12 h-12 rounded-full shadow-lg music-glow transition-all duration-200 hover:scale-110"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="text-foreground !hover:text-accent transition-colors hover:scale-110"
              onClick={onNext}
            >
              <SkipForward className="h-5 w-5" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={onLoopToggle}
              className={`transition-all duration-200 relative ${loop === 'none' ? 'text-muted-foreground' : 'text-accent scale-110'}`}
            >
              <Loop className="h-4 w-4" />
              {loop !== 'none' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full music-pulse" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-3 w-full">
            <span className="text-xs text-muted-foreground w-12 text-right font-mono">
              {convertToMS(time ?? 0)}
            </span>
            <div className="flex-1 relative">
              <Slider
                value={[_progress]}
                onValueChange={(value) => {
                  onTimeChange?.(
                    value?.[0]
                      ? ((value?.[0] ?? 0) / 100) * (duration ?? 0)
                      : 0,
                  );
                }}
                max={100}
                step={0.1}
                className="flex-1 cursor-pointer"
              />
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground px-2 py-1 rounded text-xs opacity-0 hover:opacity-100 transition-opacity">
                {convertToMS(_progress)}
              </div>
            </div>
            <span className="text-xs text-muted-foreground w-12 font-mono">
              {convertToMS(duration ?? 0)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <Mic2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onMuteToggle}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {(volume ?? 0) === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : volume! <= 50 ? (
              <Volume1 className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <div className="flex items-center gap-2">
            <Slider
              value={[volume ?? 0]}
              onValueChange={(value) => {
                onVolumeChange?.(value?.[0] ?? 100);
              }}
              max={100}
              step={1}
              className="w-28 cursor-pointer"
            />
            <span className="text-xs text-muted-foreground w-8 font-mono">
              {volume}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
