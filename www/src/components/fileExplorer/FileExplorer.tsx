import * as React from "react";
import {
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  Search,
  Settings,
  Plus,
  Trash2,
  ArrowUpDown,
  Grid,
  List,
} from "lucide-react";
import { useCallback, useState, useRef, useEffect } from "react";
import "./fileExplorer.css";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip";
import { ScrollArea } from "./ScrollArea";

type FileSystemItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileSystemItem[];
  parentId?: string;
  dateModified: string;
  size?: string;
};

const initialFileSystem: FileSystemItem[] = [
  {
    id: "1",
    name: "Documents",
    type: "folder",
    dateModified: "01/23/2024",
    children: [
      {
        id: "2",
        name: "Work",
        type: "folder",
        dateModified: "01/23/2024",
        children: [
          {
            id: "3",
            name: "report.pdf",
            type: "file",
            dateModified: "01/23/2024",
            size: "2.5 MB",
          },
        ],
      },
      {
        id: "7",
        name: "personal_notes.txt",
        type: "file",
        dateModified: "01/24/2024",
        size: "10 KB",
      },
    ],
  },
  {
    id: "4",
    name: "Pictures",
    type: "folder",
    dateModified: "01/23/2024",
    children: [
      {
        id: "5",
        name: "vacation.jpg",
        type: "file",
        dateModified: "01/23/2024",
        size: "4.2 MB",
      },
    ],
  },
  {
    id: "6",
    name: "Downloads",
    type: "folder",
    dateModified: "01/23/2024",
    children: [],
  },
];

export default function Component() {
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>(initialFileSystem);
  const [selectedFolder, setSelectedFolder] = useState<FileSystemItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "icons">("list");
  const editInputRef = useRef<HTMLInputElement>(null);

  const toggleFolder = (folderId: string) => {
    if (editingItemId) return; // Prevent expansion/collapse if we're editing
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, item: FileSystemItem) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(item));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent, targetFolder: FileSystemItem) => {
      e.preventDefault();
      if (editingItemId) return; // Prevent drop if we're editing
      const droppedItem = JSON.parse(e.dataTransfer.getData("text/plain")) as FileSystemItem;
      setDragOverFolder(null);

      const updateFileSystem = (items: FileSystemItem[]): FileSystemItem[] => {
        return items
          .map((item) => {
            if (item.id === droppedItem.id) {
              return { ...item, parentId: targetFolder.id };
            }
            if (item.children) {
              return { ...item, children: updateFileSystem(item.children) };
            }
            return item;
          })
          .filter((item) => item.id !== droppedItem.id);
      };

      setFileSystem((prev) => {
        const updated = updateFileSystem(prev);
        return updated.map((item) => {
          if (item.id === targetFolder.id && item.type === "folder") {
            return {
              ...item,
              children: [...(item.children || []), droppedItem],
            };
          }
          return item;
        });
      });

      if (selectedFolder && droppedItem.type === "file") {
        setSelectedFolder((prev) => {
          if (prev) {
            return {
              ...prev,
              children: prev.children?.filter((child) => child.id !== droppedItem.id),
            };
          }
          return prev;
        });
      }
    },
    [selectedFolder, editingItemId]
  );

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDragOverFolder(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const createNewFolder = () => {
    if (!selectedFolder) return;

    const newFolder: FileSystemItem = {
      id: Date.now().toString(),
      name: "New Folder",
      type: "folder",
      dateModified: new Date().toLocaleDateString(),
      children: [],
    };

    setFileSystem((prev) => {
      const addNewFolder = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map((item) => {
          if (item.id === selectedFolder.id) {
            return {
              ...item,
              children: [...(item.children || []), newFolder],
            };
          }
          if (item.children) {
            return {
              ...item,
              children: addNewFolder(item.children),
            };
          }
          return item;
        });
      };

      return addNewFolder(prev);
    });

    setExpandedFolders((prev) => new Set(prev).add(selectedFolder.id));
  };

  const deleteFolder = () => {
    if (!selectedFolder) return;

    setFileSystem((prev) => {
      const deleteRecursive = (items: FileSystemItem[]): FileSystemItem[] => {
        return items
          .filter((item) => item.id !== selectedFolder.id)
          .map((item) => {
            if (item.children) {
              return {
                ...item,
                children: deleteRecursive(item.children),
              };
            }
            return item;
          });
      };

      return deleteRecursive(prev);
    });

    setSelectedFolder(null);
  };

  const startEditing = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setEditingItemId(itemId);
  };

  const finishEditing = () => {
    if (!editingItemId || !editInputRef.current) return;

    const newName = editInputRef.current.value.trim();
    if (newName) {
      setFileSystem((prev) => {
        const updateItemName = (items: FileSystemItem[]): FileSystemItem[] => {
          return items.map((item) => {
            if (item.id === editingItemId) {
              return { ...item, name: newName };
            }
            if (item.children) {
              return { ...item, children: updateItemName(item.children) };
            }
            return item;
          });
        };

        return updateItemName(prev);
      });

      if (selectedFolder && selectedFolder.id === editingItemId) {
        setSelectedFolder((prev) => (prev ? { ...prev, name: newName } : null));
      }
    }

    setEditingItemId(null);
  };

  useEffect(() => {
    if (editingItemId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingItemId]);

  const FolderTreeItem = ({ item, level = 0 }: { item: FileSystemItem; level?: number }) => {
    const isExpanded = expandedFolders.has(item.id);
    const isDragOver = dragOverFolder === item.id;
    const isEditing = editingItemId === item.id;

    if (item.type !== "folder") return null;

    return (
      <div>
        <div
          className={`folder-item ${selectedFolder?.id === item.id ? "selected" : ""} ${isDragOver ? "drag-over" : ""}`}
          style={{ paddingLeft: `${level * 16}px` }}
          onClick={(e) => {
            if (!editingItemId) {
              toggleFolder(item.id);
              setSelectedFolder(item);
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            startEditing(e, item.id);
          }}
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          onDrop={(e) => handleDrop(e, item)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDragLeave={handleDragLeave}
        >
          <ChevronRight className={`chevron ${isExpanded ? "expanded" : ""}`} />
          {isExpanded ? <FolderOpen className="folder-icon open" /> : <Folder className="folder-icon" />}
          {isEditing ? (
            <Input
              ref={editInputRef}
              defaultValue={item.name}
              className="edit-input"
              onBlur={finishEditing}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") {
                  e.preventDefault();
                  finishEditing();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setEditingItemId(null);
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="folder-name">{item.name}</span>
          )}
        </div>
        {isExpanded && item.children && (
          <div>
            {item.children
              .filter((child) => child.type === "folder")
              .map((child) => (
                <FolderTreeItem key={child.id} item={child} level={level + 1} />
              ))}
          </div>
        )}
      </div>
    );
  };

  const filterItems = (items: FileSystemItem[], query: string): FileSystemItem[] => {
    return items.filter((item) => {
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
      if (item.children) {
        const filteredChildren = filterItems(item.children, query);
        return matchesQuery || filteredChildren.length > 0;
      }
      return matchesQuery;
    });
  };

  const filteredFileSystem = searchQuery ? filterItems(fileSystem, searchQuery) : fileSystem;

  const getAllFiles = (folder: FileSystemItem): FileSystemItem[] => {
    let files: FileSystemItem[] = [];
    if (folder.children) {
      folder.children.forEach((item) => {
        if (item.type === "file") {
          files.push(item);
        } else if (item.type === "folder") {
          files = files.concat(getAllFiles(item));
        }
      });
    }
    return files;
  };

  const filesToDisplay = selectedFolder ? getAllFiles(selectedFolder) : [];

  const sortedFiles = [...filesToDisplay].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  return (
    <div className="file-explorer">
      <div className="sidebar">
        <div className="sidebar-header">
          <Input
            placeholder="Search folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            prefix={<Search className="search-icon" />}
          />
          <div className="sidebar-actions">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={createNewFolder}
                    disabled={!selectedFolder}
                    className="action-button"
                  >
                    <Plus className="action-icon" />
                    <span className="sr-only">Create new folder</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create new folder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={deleteFolder}
                    disabled={!selectedFolder}
                    className="action-button"
                  >
                    <Trash2 className="action-icon" />
                    <span className="sr-only">Delete selected folder</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete selected folder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <ScrollArea className="folder-tree">
          {filteredFileSystem.map((item) => (
            <FolderTreeItem key={item.id} item={item} />
          ))}
        </ScrollArea>
      </div>

      <div className="main-content">
        <div className="main-header">
          <h2 className="folder-title">{selectedFolder ? selectedFolder.name : "All Files"}</h2>
          <div className="main-actions">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    className="action-button"
                  >
                    <ArrowUpDown className="action-icon" />
                    <span className="sr-only">Sort files</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sort by name ({sortOrder === "asc" ? "ascending" : "descending"})</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode((prev) => (prev === "list" ? "icons" : "list"))}
                    className="action-button"
                  >
                    {viewMode === "list" ? <Grid className="action-icon" /> : <List className="action-icon" />}
                    <span className="sr-only">Toggle view mode</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to {viewMode === "list" ? "icon" : "list"} view</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="icon" className="action-button">
              <Settings className="action-icon" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
        <ScrollArea className="file-list">
          <div className="file-list-content">
            {sortedFiles.length > 0 ? (
              <div className={`file-grid ${viewMode}`}>
                {sortedFiles.map((item) => (
                  <div
                    key={item.id}
                    className={`file-item ${viewMode}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDoubleClick={(e) => startEditing(e, item.id)}
                  >
                    <div className={`file-info ${viewMode}`}>
                      <File className={`file-icon ${viewMode}`} />
                      {editingItemId === item.id ? (
                        <Input
                          ref={editInputRef}
                          defaultValue={item.name}
                          className="edit-input"
                          onBlur={finishEditing}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              finishEditing();
                            }
                            if (e.key === "Escape") {
                              e.preventDefault();
                              setEditingItemId(null);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="file-name">{item.name}</span>
                      )}
                    </div>
                    <div className={`file-meta ${viewMode}`}>
                      <span className="file-date">{item.dateModified}</span>
                      {item.size && <span className="file-size">{item.size}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-message">
                {selectedFolder ? "This folder is empty" : "Select a folder to view its files"}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
