"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  PenLine, 
  Plus, 
  X, 
  Check,
  Trash2 
} from "lucide-react";

interface SourceReferencesProps {
  sources?: string[];            // AI-retrieved sources (read-only display)
  userReferences?: string[];     // User-added references (editable)
  onAddReference?: (ref: string) => void;
  onEditReference?: (index: number, newRef: string) => void;
  onDeleteReference?: (index: number) => void;
  isEditable?: boolean;          // Whether user can add/edit references
}

export function SourceReferences({
  sources = [],
  userReferences = [],
  onAddReference,
  onEditReference,
  onDeleteReference,
  isEditable = true,
}: SourceReferencesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newReference, setNewReference] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const hasContent = sources.length > 0 || userReferences.length > 0;

  if (!hasContent && !isEditable) {
    return null;
  }

  const handleAddReference = () => {
    if (newReference.trim() && onAddReference) {
      onAddReference(newReference.trim());
      setNewReference("");
      setIsAdding(false);
    }
  };

  const handleEditReference = (index: number) => {
    if (editingValue.trim() && onEditReference) {
      onEditReference(index, editingValue.trim());
      setEditingIndex(null);
      setEditingValue("");
    }
  };

  const startEditing = (index: number, currentValue: string) => {
    setEditingIndex(index);
    setEditingValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  return (
    <div className="mt-3 border border-gray-200 rounded-lg bg-gray-50/50 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <BookOpen className="w-4 h-4 text-byzantine-500" />
          <span>Sources & References</span>
          {hasContent && (
            <span className="text-xs text-gray-500">
              ({sources.length + userReferences.length})
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* AI-retrieved Sources (Read-only) */}
          {sources.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                AI Sources
              </h4>
              <ul className="space-y-1">
                {sources.map((source, index) => (
                  <li 
                    key={`source-${index}`}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="text-byzantine-500 mt-1">•</span>
                    <span className="flex-1">{source}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* User-added References (Editable) */}
          {(userReferences.length > 0 || isEditable) && (
            <div className="space-y-1">
              {userReferences.length > 0 && (
                <>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <PenLine className="w-3 h-3" />
                    Your References
                  </h4>
                  <ul className="space-y-1">
                    {userReferences.map((ref, index) => (
                      <li 
                        key={`user-ref-${index}`}
                        className="flex items-start gap-2 text-sm text-gray-700 group"
                      >
                        {editingIndex === index ? (
                          // Edit mode
                          <div className="flex-1 flex items-center gap-1">
                            <Input
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="h-7 text-sm flex-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleEditReference(index);
                                if (e.key === "Escape") cancelEditing();
                              }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                              onClick={() => handleEditReference(index)}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
                              onClick={cancelEditing}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          // View mode
                          <>
                            <span className="text-orthodox-500 mt-1">•</span>
                            <span className="flex-1">{ref}</span>
                            {isEditable && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-byzantine-600"
                                  onClick={() => startEditing(index, ref)}
                                >
                                  <PenLine className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                  onClick={() => onDeleteReference?.(index)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Add Reference UI */}
              {isEditable && (
                <div className="pt-2">
                  {isAdding ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={newReference}
                        onChange={(e) => setNewReference(e.target.value)}
                        placeholder="Enter reference (e.g., Book title, page number)"
                        className="h-8 text-sm flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddReference();
                          if (e.key === "Escape") {
                            setIsAdding(false);
                            setNewReference("");
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                        onClick={handleAddReference}
                        disabled={!newReference.trim()}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setIsAdding(false);
                          setNewReference("");
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-sm text-byzantine-600 hover:text-byzantine-700 hover:bg-byzantine-50 px-2"
                      onClick={() => setIsAdding(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Reference
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
