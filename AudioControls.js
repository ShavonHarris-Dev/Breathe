import React, { useState } from 'react';
import { Volume2, Volume1, VolumeX, Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AudioControls = ({ onVolumeChange, onTrackChange }) => {
  const [volume, setVolume] = useState(0.7);
  const [selectedTrack, setSelectedTrack] = useState('rainforest');

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    onVolumeChange(newVolume);
  };

  const handleTrackChange = (value) => {
    setSelectedTrack(value);
    onTrackChange(value);
  };

  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX size={20} />;
    if (volume < 0.5) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  return (
    <Card className="w-full max-w-sm bg-white/90 backdrop-blur-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <VolumeIcon />
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-32"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Music size={20} />
          <Select value={selectedTrack} onValueChange={handleTrackChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rainforest">Rainforest</SelectItem>
              <SelectItem value="ocean">Ocean Waves</SelectItem>
              <SelectItem value="whitenoise">White Noise</SelectItem>
              <SelectItem value="meditation">Meditation Bells</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioControls;