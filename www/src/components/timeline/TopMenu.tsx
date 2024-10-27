import React from "react";
import { Undo, Redo, ChevronDown } from "lucide-react";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { Switch } from "../ui/switch";
import { Directory } from "./interfaces";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/DropdownMenu";

const DirectoryDropdown: React.FC<{
    directories: Directory[];
    currentDirectoryId: string;
    onDirectoryChange: (directoryId: string) => void;
  }> = ({ directories, currentDirectoryId, onDirectoryChange }) => {
    return (
      <DropdownMenu>
        <DropdownMenuContent>
          {directories.map((directory) => (
            <DropdownMenuItem
              key={directory.id}
              onClick={() => onDirectoryChange(directory.id)}
            >
              {directory.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

export const TopMenu: React.FC<{
  directories: Directory[];
  currentDirectoryId: string;
  showAll: boolean;
  onDirectoryChange: (directoryId: string) => void;
  onAllToggle: (checked: boolean) => void;
  onAddObject: () => void;
  onAddDirectory: () => void;
  onUndo: () => void;
  onRedo: () => void;
}> = ({
  directories,
  currentDirectoryId,
  showAll,
  onDirectoryChange,
  onAllToggle,
  onAddObject,
  onAddDirectory,
  onUndo,
  onRedo,
}) => {
  return (
    <div className="top-menu">
      <div className="top-menu-left">
        <DirectoryDropdown
          directories={directories}
          currentDirectoryId={currentDirectoryId}
          onDirectoryChange={onDirectoryChange}
        />
        <Button onClick={onAddObject}>Add Object</Button>
        <Button onClick={onAddDirectory}>Add Directory</Button>
        <Button onClick={onUndo}>
          <Undo className="h-4 w-4 mr-2" />
          Undo
        </Button>
        <Button onClick={onRedo}>
          <Redo className="h-4 w-4 mr-2" />
          Redo
        </Button>
      </div>
      <div className="top-menu-right">
        <Label htmlFor="all-toggle">All</Label>
        <Switch
          id="all-toggle"
          checked={showAll}
          onCheckedChange={onAllToggle}
        />
      </div>
    </div>
  );
};
