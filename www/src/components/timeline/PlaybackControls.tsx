import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export const PlaybackControls: React.FC<{
  currentFrame: number;
  totalFrames: number;
  isPlaying: boolean;
  gridSpacing: number;

  selectedProperty: { objectId: string; property: string } | null;
  onSetCurrentFrame: (frame: number) => void;
  onTogglePlay: () => void;
  onSetGridSpacing: (spacing: number) => void;
  onAddKeyframe: () => void;
  onSetTotalFrames: (frames: number) => void;
}> = ({
  currentFrame,
  totalFrames,
  isPlaying,
  gridSpacing,
  selectedProperty,
  onSetCurrentFrame,
  onTogglePlay,
  onSetGridSpacing,
  onAddKeyframe,
  onSetTotalFrames,
}) => {
  return (
    <div className="playback-controls">
      {" "}
      {/* Nueva clase para el contenedor principal */}
      <div className="playback-controls-left">
        <Button variant="outline" size="icon" onClick={() => onSetCurrentFrame(Math.max(0, currentFrame - 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onTogglePlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onSetCurrentFrame(Math.min(totalFrames, currentFrame + 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="playback-controls-center">
        {" "}
        {/* Nueva clase para la sección central */}
        <span className="playback-controls-text">Frame:</span>
        <Input
          type="number"
          value={currentFrame}
          onChange={(e) => onSetCurrentFrame(Number(e.target.value))}
          className="playback-controls-input w-16 text-center" /* Combinar clases */
          min={0}
          max={totalFrames}
        />
        <span className="text-sm font-medium">/</span>
        <Input
          type="number"
          value={totalFrames}
          onChange={(e) => onSetTotalFrames(Number(e.target.value))}
          className="playback-controls-input w-16 text-center" /* Combinar clases */
          min={1}
        />
      </div>
      <div className="playback-controls-right">
        {" "}
        {/* Nueva clase para la sección derecha */}
        <span className="playback-controls-text">Grid Spacing:</span>
        <Input
          type="number"
          value={gridSpacing}
          onChange={(e) => onSetGridSpacing(Number(e.target.value))}
          className="playback-controls-input w-16 text-center" /* Combinar clases */
          min={1}
        />
      </div>
      <Button onClick={onAddKeyframe} disabled={!selectedProperty}>
        Add Keyframe
      </Button>
    </div>
  );
};
