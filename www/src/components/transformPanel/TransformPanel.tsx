import { useState, useRef, useCallback, useEffect } from "react"
import { ChevronDown } from 'lucide-react'
import { Button } from "../ui/Button"
import { Label } from "../ui/Label"
import { Separator } from "../ui/Separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./Collapsable"
import { Input } from "../ui/Input"
import "./transformPanel.css"


// Custom hook for scrubbing functionality with infinite dragging
const useScrubInput = (initialValue: number, onChange: (value: number) => void, baseStep: number = 1) => {
  const [value, setValue] = useState(initialValue)
  const isDragging = useRef(false)
  const lastClientX = useRef(0)
  const accumulatedDelta = useRef(0)
  const shiftKey = useRef(false)
  const ctrlKey = useRef(false)

  const getStep = useCallback(() => {
    if (ctrlKey.current && shiftKey.current) return baseStep * 0.001
    if (ctrlKey.current) return baseStep * 0.1
    if (shiftKey.current) return baseStep * 10
    return baseStep
  }, [baseStep])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    lastClientX.current = e.clientX
    accumulatedDelta.current = 0
    shiftKey.current = e.shiftKey
    ctrlKey.current = e.ctrlKey
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging.current) {
      const delta = e.clientX - lastClientX.current
      accumulatedDelta.current += delta
      lastClientX.current = e.clientX

      const step = getStep()
      const newValue = value + (accumulatedDelta.current * step) / 100
      setValue(newValue)
      onChange(newValue)
    }
  }, [value, onChange, getStep])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey) shiftKey.current = true
      if (e.ctrlKey) ctrlKey.current = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.shiftKey) shiftKey.current = false
      if (!e.ctrlKey) ctrlKey.current = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return {
    value,
    setValue,
    handleMouseDown,
  }
}

// ScrubInput component
const ScrubInput = ({ value, onChange, baseStep = 1, ...props }: { value: number, onChange: (value: number) => void, baseStep?: number } & React.InputHTMLAttributes<HTMLInputElement>) => {
  const { value: scrubValue, setValue, handleMouseDown } = useScrubInput(value, onChange, baseStep)

  return (
    <Input
      type="number"
      value={scrubValue.toFixed(4)}
      onChange={(e) => {
        const newValue = parseFloat(e.target.value)
        if (!isNaN(newValue)) {
          setValue(newValue)
          onChange(newValue)
        }
      }}
      onMouseDown={handleMouseDown}
      className="scrub-input"
      {...props}
    />
  )
}

export default function Component() {
  const [coordinates, setCoordinates] = useState("parent")
  const [mode, setMode] = useState("absolute")
  const [position, setPosition] = useState({ x: 318.1904, y: 157.1068, z: 0.0 })
  const [rotation, setRotation] = useState({ x: 0.0, y: 0.0, z: 0.0 })
  const [rotationOrder, setRotationOrder] = useState("xyz")
  const [scale, setScale] = useState({ x: 1.0, y: 1.0, z: 1.0 })
  const [scaleMode, setScaleMode] = useState("locked")
  const [axisCenter, setAxisCenter] = useState({ x: 0.0, y: 0.0, z: 0.0 })
  const [screenPosition, setScreenPosition] = useState({ x: 1659, y: -0 })
  const [screenSize, setScreenSize] = useState({ x: 261, y: 261 })

  const handlePositionChange = (axis: keyof typeof position, value: number) => {
    setPosition(prev => ({ ...prev, [axis]: value }))
  }

  const handleRotationChange = (axis: keyof typeof rotation, value: number) => {
    setRotation(prev => ({ ...prev, [axis]: value }))
  }

  const handleScaleChange = (axis: keyof typeof scale, value: number) => {
    if (scaleMode === "locked") {
      setScale({ x: value, y: value, z: value })
    } else {
      setScale(prev => ({ ...prev, [axis]: value }))
    }
  }

  return (
    <>
      <div className="transform-panel">
        {/* Coordinate System */}
        <div className="coordinate-system">
          <div className="button-group">
            <Button
              variant={coordinates === "parent" ? "default" : "secondary"}
              className="button"
              onClick={() => setCoordinates("parent")}
            >
              Parent
            </Button>
            <Button
              variant={coordinates === "local" ? "default" : "secondary"}
              className="button"
              onClick={() => setCoordinates("local")}
            >
              Local
            </Button>
            <Button
              variant={coordinates === "world" ? "default" : "secondary"}
              className="button"
              onClick={() => setCoordinates("world")}
            >
              World
            </Button>
          </div>
          <div className="button-group">
            <Button
              variant={mode === "absolute" ? "default" : "secondary"}
              className="button"
              onClick={() => setMode("absolute")}
            >
              Absolute
            </Button>
            <Button
              variant={mode === "relative" ? "default" : "secondary"}
              className="button"
              onClick={() => setMode("relative")}
            >
              Relative
            </Button>
          </div>
        </div>

        {/* Position */}
        <div className="section">
          <Label>Position</Label>
          <div className="input-group">
            <div className="input-wrapper">
              <Label className="input-label">X</Label>
              <ScrubInput
                value={position.x}
                onChange={(value) => handlePositionChange("x", value as number)}
                baseStep={1}
              />
            </div>
            <div className="input-wrapper">
              <Label className="input-label">Y</Label>
              <ScrubInput
                value={position.y}
                onChange={(value) => handlePositionChange("y", value as number)}
                baseStep={1}
              />
            </div>
            <div className="input-wrapper">
              <Label className="input-label">Z</Label>
              <ScrubInput
                value={position.z}
                onChange={(value) => handlePositionChange("z", value as number)}
                baseStep={1}
              />
            </div>
          </div>
          <Button className="full-width-button" variant="outline">
            Center to Camera
          </Button>
        </div>

        {/* Rotation */}
        <div className="section">
          <Label>Rotation</Label>
          <div className="input-group">
            <div className="input-wrapper">
              <Label className="input-label">X</Label>
              <ScrubInput
                value={rotation.x}
                onChange={(value) => handleRotationChange("x", value as number)}
                baseStep={1}
              />
            </div>
            <div className="input-wrapper">
              <Label className="input-label">Y</Label>
              <ScrubInput
                value={rotation.y}
                onChange={(value) => handleRotationChange("y", value as number)}
                baseStep={1}
              />
            </div>
            <div className="input-wrapper">
              <Label className="input-label">Z</Label>
              <ScrubInput
                value={rotation.z}
                onChange={(value) => handleRotationChange("z", value as number)}
                baseStep={1}
              />
            </div>
          </div>
          <div className="rotation-order">
            {["XYZ", "YXZ", "ZXY", "ZYX", "XZY", "YZX"].map((order) => (
              <Button
                key={order}
                variant={rotationOrder === order.toLowerCase() ? "default" : "outline"}
                className="rotation-button"
                onClick={() => setRotationOrder(order.toLowerCase())}
              >
                {order}
              </Button>
            ))}
          </div>
          <Button className="full-width-button" variant="outline">
            Face Camera
          </Button>
        </div>

        {/* Scale */}
        <div className="section">
          <Label>Scale</Label>
          <div className="input-group">
            <div className="input-wrapper">
              <Label className="input-label">X</Label>
              <ScrubInput
                value={scale.x}
                onChange={(value) => handleScaleChange("x", value as number)}
                baseStep={0.01}
              />
            </div>
            <div className="input-wrapper">
              <Label className="input-label">Y</Label>
              <ScrubInput
                value={scale.y}
                onChange={(value) => handleScaleChange("y", value as number)}
                baseStep={0.01}
              />
            </div>
            <div className="input-wrapper">
              <Label className="input-label">Z</Label>
              <ScrubInput
                value={scale.z}
                onChange={(value) => handleScaleChange("z", value as number)}
                baseStep={0.01}
              />
            </div>
          </div>
          <div className="button-group">
            <Button
              variant={scaleMode === "single" ? "default" : "outline"}
              className="button"
              onClick={() => setScaleMode("single")}
            >
              Single
            </Button>
            <Button
              variant={scaleMode === "locked" ? "default" : "outline"}
              className="button"
              onClick={() => setScaleMode("locked")}
            >
              Locked
            </Button>
            <Button
              variant={scaleMode === "proportional" ? "default" : "outline"}
              className="button"
              onClick={() => setScaleMode("proportional")}
            >
              Proportional
            </Button>
          </div>
        </div>

        {/* Axis Center */}
        <div className="section">
          <Label>Axis Center</Label>
          <div className="axis-center">
            <div className="axis-input">
              <ScrubInput
                value={axisCenter.x}
                onChange={(value) => setAxisCenter(prev => ({ ...prev, x: value as number }))}
                baseStep={0.1}
              />
              <div className="button-group">
                <Button variant="outline" className="small-button">L</Button>
                <Button variant="outline" className="small-button">C</Button>
                <Button variant="outline" className="small-button">R</Button>
              </div>
            </div>
            <div className="axis-input">
              <ScrubInput
                value={axisCenter.y}
                onChange={(value) => setAxisCenter(prev => ({ ...prev, y: value as number }))}
                baseStep={0.1}
              />
              <div className="button-group">
                <Button variant="outline" className="small-button">B</Button>
                <Button variant="outline" className="small-button">C</Button>
                <Button variant="outline" className="small-button">T</Button>
              </div>
            </div>
            <div className="axis-input">
              <ScrubInput
                value={axisCenter.z}
                onChange={(value) => setAxisCenter(prev => ({ ...prev, z: value as number }))}
                baseStep={0.1}
              />
              <div className="button-group">
                <Button variant="outline" className="small-button">B</Button>
                <Button variant="outline" className="small-button">C</Button>
                <Button variant="outline" className="small-button">F</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Screen Transformations */}
        <Collapsible>
          <CollapsibleTrigger>
            <ChevronDown className="chevron-icon" />
            <span>Screen Transformations</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="section">
              <Label>Bounding Box</Label>
              <div className="bounding-box">
                <div className="axis-input">
                  <ScrubInput
                    value={screenPosition.x}
                    onChange={(value) => setScreenPosition(prev => ({ ...prev, x: value as number }))}
                    baseStep={1}
                  />
                  <div className="button-group">
                    <Button variant="outline" className="small-button">L</Button>
                    <Button variant="outline" className="small-button">C</Button>
                    <Button variant="outline" className="small-button">R</Button>
                  </div>
                </div>
                <div className="axis-input">
                  <ScrubInput
                    value={screenPosition.y}
                    onChange={(value) => setScreenPosition(prev => ({ ...prev, y: value as number}))}
                    baseStep={1}
                  />
                  <div className="button-group">
                    <Button variant="outline" className="small-button">B</Button>
                    <Button variant="outline" className="small-button">C</Button>
                    <Button variant="outline" className="small-button">T</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="section">
              <Label>Screen Size</Label>
              <div className="input-group">
                <div className="input-wrapper">
                  <Label className="input-label">X</Label>
                  <ScrubInput
                    value={screenSize.x}
                    onChange={(value) => setScreenSize(prev => ({ ...prev, x: value as number}))}
                    baseStep={1}
                  />
                </div>
                <div className="input-wrapper">
                  <Label className="input-label">Y</Label>
                  <ScrubInput
                    value={screenSize.y}
                    onChange={(value) => setScreenSize(prev => ({ ...prev, y: value as number}))}
                    baseStep={1}
                  />
                </div>
              </div>
              <div className="button-group-vertical">
                <Button className="full-width-button" variant="outline">
                  Scale to Screen
                </Button>
                <Button className="full-width-button" variant="outline">
                  Scale to Image
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Container Info */}
        <Collapsible>
          <CollapsibleTrigger>
            <ChevronDown className="chevron-icon" />
            <span>Container Info</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="container-info">
              <div className="info-row">
                <span>Width:</span>
                <span>100.00</span>
              </div>
              <div className="info-row">
                <span>Height:</span>
                <span>100.00</span>
              </div>
              <div className="info-row">
                <span>Depth:</span>
                <span>0.00</span>
              </div>
              <Separator />
              <div className="info-row">
                <span>Containers:</span>
                <span>1</span>
              </div>
              <div className="info-row">
                <span>Vertices:</span>
                <span>82</span>
              </div>
              <div className="info-row">
                <span>Primitives:</span>
                <span>1</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  )
}