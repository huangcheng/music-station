import { useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useShallow } from 'zustand/react/shallow';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCookie, useLocalStorage } from 'react-use';
import {
  Bell,
  Download,
  Globe,
  HardDrive,
  Music,
  Play,
  Shield,
  Volume2,
  HelpCircle,
} from 'lucide-react';

import type { ReactElement } from 'react';

import { useSettingsStore } from '@/stores';
import { settingsSchema } from '@/schemas';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Slider,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components';
import { formatBytes } from '@/lib';

export default function Settings(): ReactElement {
  const t = useTranslations();

  const { settings, setSettings } = useSettingsStore(
    useShallow(({ settings, setSettings }) => ({ settings, setSettings })),
  );

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      ...settings,
    },
  });

  const [locale] = useWatch({
    control,
    name: ['locale'],
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setLocale] = useCookie('locale');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mediaStore, _1, clearMediaStore] = useLocalStorage<string>(
    'media-storage',
    '',
    { raw: true },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [settingsStore, _2, clearSettingsStore] = useLocalStorage<string>(
    'settings-storage',
    '',
    { raw: true },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [playerStateStore, _3, clearPlayerState] = useLocalStorage<string>(
    'states/player',
    '',
    { raw: true },
  );

  const storeSize = useMemo(
    () => (mediaStore?.length ?? 0) + (settingsStore?.length ?? 0),
    [mediaStore, settingsStore],
  );
  const stateSize = useMemo(
    () => playerStateStore?.length ?? 0,
    [playerStateStore],
  );
  const totalSize = useMemo(
    () => storeSize + stateSize,
    [storeSize, stateSize],
  );

  const handleClearCache = useCallback(() => {
    clearMediaStore();
    clearSettingsStore();
    clearPlayerState();
  }, [clearMediaStore, clearSettingsStore, clearPlayerState]);

  const submit = useCallback(
    async () =>
      await handleSubmit((value) => {
        setSettings(value);
      })(),
    [handleSubmit, setSettings],
  );

  useEffect(() => {
    if (locale) {
      setLocale(locale);
    }
  }, [locale, setLocale]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center music-shadow-soft">
          <Play className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{t('Settings')}</h2>
          <p className="text-gray-600">
            {t('Customize your music experience')}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Language & Region */}
        <Card className="bg-white music-shadow-soft border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <Globe className="h-5 w-5 text-orange-500" />
              {t('Language & Region')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">
                  {t('Display Language')}
                </label>
                <p className="text-sm text-gray-500">
                  {t('Choose your preferred language')}
                </p>
              </div>
              <Controller
                name="locale"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    value={value}
                    onValueChange={(value) => {
                      onChange(value);

                      void submit();
                    }}
                  >
                    <SelectTrigger className="w-48 bg-white border-gray-200 focus:border-orange-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English</SelectItem>
                      <SelectItem value="zh-CN">中文 (Chinese)</SelectItem>
                      {/*<SelectItem value="es">Español (Spanish)</SelectItem>*/}
                      {/*<SelectItem value="fr">Français (French)</SelectItem>*/}
                      {/*<SelectItem value="de">Deutsch (German)</SelectItem>*/}
                      {/*<SelectItem value="ja">日本語 (Japanese)</SelectItem>*/}
                      {/*<SelectItem value="ko">한국어 (Korean)</SelectItem>*/}
                      {/*<SelectItem value="pt">Português (Portuguese)</SelectItem>*/}
                      {/*<SelectItem value="ru">Русский (Russian)</SelectItem>*/}
                      {/*<SelectItem value="ar">العربية (Arabic)</SelectItem>*/}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {/*<div className="flex items-center justify-between">*/}
            {/*  <div>*/}
            {/*    <label className="font-medium text-gray-700">*/}
            {/*      {t('Country/Region')}*/}
            {/*    </label>*/}
            {/*    <p className="text-sm text-gray-500">*/}
            {/*      {t('Affects content availability')}*/}
            {/*    </p>*/}
            {/*  </div>*/}
            {/*  <Select defaultValue="us">*/}
            {/*    <SelectTrigger className="w-48 bg-white border-gray-200 focus:border-orange-300">*/}
            {/*      <SelectValue />*/}
            {/*    </SelectTrigger>*/}
            {/*    <SelectContent>*/}
            {/*      <SelectItem value="us">{t('United States')}</SelectItem>*/}
            {/*      <SelectItem value="cn">{t('China')}</SelectItem>*/}
            {/*      <SelectItem value="uk">{t('United Kingdom')}</SelectItem>*/}
            {/*      <SelectItem value="ca">{t('Canada')}</SelectItem>*/}
            {/*      <SelectItem value="au">{t('Australia')}</SelectItem>*/}
            {/*      <SelectItem value="de">{t('Germany')}</SelectItem>*/}
            {/*      <SelectItem value="fr">{t('France')}</SelectItem>*/}
            {/*      <SelectItem value="jp">{t('Japan')}</SelectItem>*/}
            {/*      <SelectItem value="kr">{t('South Korea')}</SelectItem>*/}
            {/*      <SelectItem value="br">{t('Brazil')}</SelectItem>*/}
            {/*    </SelectContent>*/}
            {/*  </Select>*/}
            {/*</div>*/}
          </CardContent>
        </Card>

        {/* Audio Quality */}
        <Card className="bg-white music-shadow-soft border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <Volume2 className="h-5 w-5 text-orange-500" />
              {t('Audio Quality')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">
                  {t('Streaming Quality')}
                </label>
                <p className="text-sm text-gray-500">
                  {t('Higher quality uses more data')}
                </p>
              </div>
              <Select defaultValue="high">
                <SelectTrigger className="w-48 bg-white border-gray-200 focus:border-orange-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('Low (96 kbps)')}</SelectItem>
                  <SelectItem value="normal">
                    {t('Normal (160 kbps)')}
                  </SelectItem>
                  <SelectItem value="high">{t('High (320 kbps)')}</SelectItem>
                  <SelectItem value="lossless">
                    {t('Lossless (FLAC)')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">
                  {t('Download Quality')}
                </label>
                <p className="text-sm text-gray-500">
                  {t('For offline listening')}
                </p>
              </div>
              <Select defaultValue="high">
                <SelectTrigger className="w-48 bg-white border-gray-200 focus:border-orange-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">
                    {t('Normal (160 kbps)')}
                  </SelectItem>
                  <SelectItem value="high">{t('High (320 kbps)')}</SelectItem>
                  <SelectItem value="lossless">
                    {t('Lossless (FLAC)')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">
                  {t('Volume Normalization')}
                </label>
                <p className="text-sm text-gray-500">
                  {t('Consistent volume across tracks')}
                </p>
              </div>
              <Switch
                defaultChecked
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Playback Settings */}
        <Card className="bg-white music-shadow-soft border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <Play className="h-5 w-5 text-orange-500" />
              {t('Playback')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">
                  {t('Crossfade Duration')}
                </label>
                <p className="text-sm text-gray-500">
                  {t('Smooth transitions between songs')}
                </p>
              </div>
              <div className="w-48 flex items-center gap-3">
                <Slider
                  defaultValue={[3]}
                  max={12}
                  min={0}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-8">3s</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">
                  {t('Gapless Playback')}
                </label>
                <p className="text-sm text-gray-500">
                  {t('No silence between tracks')}
                </p>
              </div>
              <Switch
                defaultChecked
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">
                  {t('Auto-play Similar Songs')}
                </label>
                <p className="text-sm text-gray-500">
                  {t('Continue with recommendations')}
                </p>
              </div>
              <Switch
                defaultChecked
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">
                  {t('Default Shuffle Mode')}
                </label>
                <p className="text-sm text-gray-500">
                  {t('Start playlists in shuffle')}
                </p>
              </div>
              <Switch className="data-[state=checked]:bg-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Data & Storage */}
        <Card className="bg-white music-shadow-soft border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <HardDrive className="h-5 w-5 text-orange-500" />
              {t('Data & Storage')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="font-medium text-gray-700">
                  {t('Used by Stores')}
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('stores-description')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-gray-500">{formatBytes(storeSize)}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="font-medium text-gray-700">
                  {t('Used by States')}
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('states-description')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-gray-500">{formatBytes(stateSize)}</p>
            </div>
            <div className="flex items-center justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent hover:text-orange-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t('Clear Cache')} ({formatBytes(totalSize)})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('Are you absolutely sure?')}</DialogTitle>
                    <DialogDescription>
                      {t(
                        'This action cannot be undone - This will permanently delete your settings and media data',
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="ghost">{t('Cancel')}</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="destructive"
                        onClick={() => handleClearCache()}
                      >
                        {t('Confirm')}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-white music-shadow-soft border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <Bell className="h-5 w-5 text-orange-500" />
              {t('Notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">
                  {t('New Releases')}
                </label>
                <p className="text-sm text-gray-500">
                  {t('From artists you follow')}
                </p>
              </div>
              <Switch
                defaultChecked
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">
                  {t('Playlist Updates')}
                </label>
                <p className="text-sm text-gray-500">
                  {t('When followed playlists change')}
                </p>
              </div>
              <Switch
                defaultChecked
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">
                  {t('Concert Alerts')}
                </label>
                <p className="text-sm text-gray-500">
                  {t('Shows near your location')}
                </p>
              </div>
              <Switch className="data-[state=checked]:bg-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="bg-white music-shadow-soft border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <Shield className="h-5 w-5 text-orange-500" />
              {t('Privacy & Security')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">
                  {t('Private Session')}
                </label>
                <p className="text-sm text-gray-500">
                  {t("Don't save listening history")}
                </p>
              </div>
              <Switch className="data-[state=checked]:bg-orange-500" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">
                  {t('Share Listening Activity')}
                </label>
                <p className="text-sm text-gray-500">
                  {t("Let friends see what you're playing")}
                </p>
              </div>
              <Switch
                defaultChecked
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">
                  {t('Personalized Ads')}
                </label>
                <p className="text-sm text-gray-500">
                  {t('Based on your music taste')}
                </p>
              </div>
              <Switch
                defaultChecked
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-white music-shadow-soft border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <Music className="h-5 w-5 text-orange-500" />
              {t('About')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">{t('Version')}</span>
              <span className="text-sm text-gray-600">1.2.3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">{t('Build')}</span>
              <span className="text-sm text-gray-600">2024.01.15</span>
            </div>
            <div className="pt-2 flex gap-3">
              <Button
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
              >
                {t('Check for Updates')}
              </Button>
              <Button
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
              >
                {t('Terms of Service')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
