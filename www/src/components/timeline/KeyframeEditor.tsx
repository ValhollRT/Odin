import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { SelectedKeyframe, AnimationData } from "./interfaces";

export const KeyframeEditor: React.FC<{
  selectedKeyframes: SelectedKeyframe[];
  animationData: AnimationData;
  updateKeyframeValue: (field: string, value: number) => void;
}> = ({ selectedKeyframes, animationData, updateKeyframeValue }) => {
  if (selectedKeyframes.length === 0) {
    return (
      <div className="w-full bg-white p-4">
        <p className="text-gray-500">No keyframe selected</p>
      </div>
    );
  }

  const { objectId, property, keyframeId } = selectedKeyframes[0];
  const keyframe = animationData[objectId]?.[property]?.find((k) => k.id === keyframeId);

  if (!keyframe) {
    return (
      <div className="w-full bg-white p-4">
        <p className="text-gray-500">Keyframe not found</p>
      </div>
    );
  }

  return (
    <div className="keyframe-editor">
      <h2 className="keyframe-editor-title">Keyframe Editor</h2>
      <div className="keyframe-editor-content">
        <div>
          <Label htmlFor="frame">Frame</Label>
          <Input
            id="frame"
            type="number"
            value={keyframe.frame}
            onChange={(e) => updateKeyframeValue("frame", Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="value-x">X</Label>
          <Input
            id="value-x"
            type="number"
            value={keyframe.value.x}
            onChange={(e) => updateKeyframeValue("value.x", Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="value-y">Y</Label>
          <Input
            id="value-y"
            type="number"
            value={keyframe.value.y}
            onChange={(e) => updateKeyframeValue("value.y", Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="value-z">Z</Label>
          <Input
            id="value-z"
            type="number"
            value={keyframe.value.z}
            onChange={(e) => updateKeyframeValue("value.z", Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="angle">Angle</Label>
          <Input
            id="angle"
            type="number"
            value={keyframe.angle}
            onChange={(e) => updateKeyframeValue("angle", Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="weight">Weight</Label>
          <Input
            id="weight"
            type="number"
            value={keyframe.weight}
            onChange={(e) => updateKeyframeValue("weight", Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};
