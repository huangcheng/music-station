import { Card, CardContent, CardHeader, CardTitle } from '@/components';

export default function Settings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Audio Quality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Streaming Quality</span>
              <span className="text-sm text-muted-foreground">
                High (320 kbps)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Download Quality</span>
              <span className="text-sm text-muted-foreground">
                Very High (320 kbps)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Playback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Crossfade</span>
              <span className="text-sm text-muted-foreground">Off</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Gapless Playback</span>
              <span className="text-sm text-muted-foreground">On</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
