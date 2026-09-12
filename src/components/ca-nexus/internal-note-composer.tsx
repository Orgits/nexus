"use client";

import { useState } from "react";

import { cn } from "cn";
import { AtSign, Bold, Code, Image, Italic, Link2, List, Paperclip, Quote, Underline, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { User, UUID } from "@/types";

export interface InternalNote {
  id: string;
  content: string;
  authorId: UUID;
  authorName: string;
  authorAvatarUrl?: string;
  authorRole?: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  mentions?: UUID[];
  linkedEntityType?: string;
  linkedEntityId?: UUID;
  attachments?: NoteAttachment[];
}

export interface NoteAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface InternalNoteComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (note: { content: string; mentions: UUID[]; attachments: NoteAttachment[] }) => void;
  currentUser: User;
  existingNotes?: InternalNote[];
  onMentionSelect?: (user: User) => void;
  availableUsers?: User[];
  placeholder?: string;
  showFormatting?: boolean;
  showMentions?: boolean;
  showAttachments?: boolean;
  maxLength?: number;
  className?: string;
  submitLabel?: string;
  disabled?: boolean;
  showPreview?: boolean;
  readOnly?: boolean;
}

export function InternalNoteComposer({
  value,
  onChange,
  onSubmit,
  currentUser,
  existingNotes = [],
  onMentionSelect,
  availableUsers = [],
  placeholder = "Write an internal note...",
  showFormatting = true,
  showMentions = true,
  showAttachments = false,
  maxLength = 10000,
  className,
  submitLabel = "Add Note",
  disabled = false,
  showPreview = false,
  readOnly = false,
}: InternalNoteComposerProps) {
  const [mentions, setMentions] = useState<string[]>([]);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [attachments, setAttachments] = useState<NoteAttachment[]>([]);
  const [showPreviewMode, setShowPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const extractMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.matchAll(mentionRegex);
    return Array.from(matches, (m) => m[1]);
  };

  const filteredUsers = availableUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(mentionQuery.toLowerCase()),
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    const newMentions = extractMentions(newValue);
    setMentions(newMentions);
  };

  const handleMentionSelect = (user: User) => {
    const mention = `@${user.fullName.replace(/\s+/g, "_")} `;
    const newValue = value + mention;
    onChange(newValue);
    const newMentions = extractMentions(newValue);
    setMentions(newMentions);
    setShowMentionMenu(false);
    setMentionQuery("");
    onMentionSelect?.(user);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "@" && showMentions) {
      setShowMentionMenu(true);
      setMentionQuery("");
    }
    if (e.key === "Enter" && !e.shiftKey && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!value.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onSubmit({
      content: value,
      mentions: mentions.map((m) => m as UUID),
      attachments,
    });
    setIsSubmitting(false);
  };

  const _getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatContent = (text: string) => {
    return text
      .replace(/@(\w+)/g, '<span class="text-primary font-medium">@$1</span>')
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code class='bg-muted px-1 rounded'>$1</code>")
      .replace(/\n/g, "<br />");
  };

  const renderFormattedContent = (text: string) => {
    const parts = text.split(/(@\w+|\*\*.+?\*\*|\*.+?\*|`.+?`|\n)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span key={index} className="text-primary font-medium">
            {part}
          </span>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={index} className="bg-muted px-1 rounded">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part === "\n") {
        return <br key={index} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const renderAttachments = () => (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((att) => (
        <div key={att.id} className="flex items-center gap-2 rounded border p-2 bg-muted/50">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm truncate max-w-[200px]">{att.name}</span>
          <span className="text-xs text-muted-foreground">{(att.size / 1024).toFixed(1)} KB</span>
          <button
            type="button"
            className="ml-auto text-muted-foreground hover:text-destructive"
            onClick={() => setAttachments((a) => a.filter((x) => x.id !== att.id))}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );

  const formatToolbar = [
    { icon: Bold, title: "Bold", shortcut: "Ctrl+B", action: () => wrapText("**", "**") },
    { icon: Italic, title: "Italic", shortcut: "Ctrl+I", action: () => wrapText("*", "*") },
    { icon: Underline, title: "Underline", shortcut: "Ctrl+U", action: () => wrapText("<u>", "</u>") },
    { icon: Code, title: "Code", shortcut: "Ctrl+`", action: () => wrapText("`", "`") },
    { icon: List, title: "Bullet List", action: () => wrapText("- ", "") },
    { icon: Quote, title: "Quote", action: () => wrapText("> ", "") },
    { icon: Image, title: "Insert Image", action: () => wrapText("![alt](", ")") },
    { icon: Link2, title: "Insert Link", action: () => wrapText("[", "]()") },
  ];

  const wrapText = (prefix: string, suffix: string) => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const newText = text.substring(0, start) + prefix + selected + suffix + text.substring(end);
    onChange(newText);
    setTimeout(() => {
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      textarea.focus();
    }, 0);
  };

  const charCount = value.length;
  const isOverLimit = charCount > maxLength;

  return (
    <div className={cn("space-y-3", className)}>
      {existingNotes.length > 0 && (
        <div className="border rounded-lg bg-muted/30 p-3">
          <h4 className="font-medium text-sm mb-2">Previous Notes</h4>
          <ScrollArea className="max-h-40">
            <div className="space-y-2">
              {existingNotes
                .slice(-5)
                .reverse()
                .map((note) => (
                  <div key={note.id} className="text-sm p-2 rounded bg-background border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={note.authorAvatarUrl} alt={note.authorName} />
                        <AvatarFallback>{note.authorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{note.authorName}</span>
                      {note.authorRole && (
                        <Badge variant="outline" className="text-[10px]">
                          {note.authorRole.replace(/_/g, " ")}
                        </Badge>
                      )}
                      <span>{formatRelativeTime(note.createdAt)}</span>
                      {note.isEdited && (
                        <Badge variant="secondary" className="text-[10px]">
                          Edited
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {note.content.slice(0, 200)}
                      {note.content.length > 200 ? "..." : ""}
                    </div>
                    {note.mentions && note.mentions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {note.mentions.slice(0, 3).map((m) => (
                          <Badge key={m} variant="secondary" className="text-[10px]">
                            @{m}
                          </Badge>
                        ))}
                        {note.mentions.length > 3 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{note.mentions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="space-y-2">
        {showFormatting && (
          <div className="flex flex-wrap gap-1 p-1 rounded border bg-muted/30" role="toolbar">
            {formatToolbar.map((tool) => (
              <Button
                key={tool.title}
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={tool.action}
                title={`${tool.title} (${tool.shortcut})`}
                disabled={disabled || readOnly}
              >
                <tool.icon className="h-4 w-4" />
              </Button>
            ))}
            {showMentions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={disabled || readOnly}>
                    <AtSign className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" sideOffset={5}>
                  <DropdownMenuLabel>Mention User</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableUsers.map((u) => (
                    <DropdownMenuItem
                      key={u.id}
                      onSelect={() => void handleMentionSelect(u)}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={u.avatarUrl} alt={u.fullName} />
                        <AvatarFallback>{u.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {showAttachments && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={disabled || readOnly}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={5}>
                  <DropdownMenuLabel>Attachments</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      /* handle file upload */
                    }}
                    disabled
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    Attach File (not implemented)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        <div className="relative">
          <Textarea
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn("min-h-[100px] resize-none", showFormatting && "pt-2", isOverLimit && "border-destructive")}
            disabled={disabled || readOnly}
            maxLength={maxLength}
          />
          {showMentions && showMentionMenu && mentionQuery !== undefined && (
            <div className="absolute bottom-full left-0 mb-1 w-64 rounded-md border bg-popover p-2 shadow-lg z-10">
              <Input
                placeholder="Search users..."
                value={mentionQuery}
                onChange={(e) => setMentionQuery(e.target.value)}
                className="mb-2"
              />
              <div className="max-h-40 overflow-y-auto">
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleMentionSelect(u)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-left text-sm"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={u.avatarUrl} alt={u.fullName} />
                      <AvatarFallback>{u.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{u.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn(isOverLimit ? "text-destructive" : "")}>
                {charCount}/{maxLength}
              </span>
              {attachments.length > 0 && <Badge variant="secondary">{attachments.length} attachment(s)</Badge>}
            </div>
            <div className="flex items-center gap-2">
              {showPreview && (
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPreviewMode(!showPreviewMode)}>
                  {showPreviewMode ? "Edit" : "Preview"}
                </Button>
              )}
              {!readOnly && !disabled && (
                <Button onClick={handleSubmit} disabled={!value.trim() || isSubmitting || isOverLimit}>
                  {isSubmitting ? "Saving..." : submitLabel}
                </Button>
              )}
            </div>
          </div>

          {showPreviewMode && value && (
            <div className="rounded border bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Preview</h4>
                <Button variant="ghost" size="icon" onClick={() => setShowPreviewMode(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="prose prose-sm max-w-none text-sm">{renderFormattedContent(value)}</div>
            </div>
          )}

          {attachments.length > 0 && renderAttachments()}
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}
