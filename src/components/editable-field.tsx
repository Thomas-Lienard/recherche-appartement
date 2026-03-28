"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  value: string | number | null | undefined;
  field: string;
  listingId: string;
  type?: "text" | "number" | "textarea" | "select";
  options?: { value: string; label: string }[];
  suffix?: string;
  label?: string;
  className?: string;
  onSaved?: (newValue: string | number | null) => void;
  displayClassName?: string;
}

export function EditableField({
  value,
  field,
  listingId,
  type = "text",
  options,
  suffix,
  label,
  className,
  onSaved,
  displayClassName,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  function startEditing() {
    setEditValue(displayValue ?? "");
    setEditing(true);
  }

  async function save() {
    setEditing(false);

    const newValue =
      type === "number"
        ? editValue === "" || editValue === null
          ? null
          : Number(editValue)
        : editValue === ""
          ? null
          : editValue;

    if (newValue === displayValue) return;

    const previousValue = displayValue;
    setDisplayValue(newValue as typeof displayValue);
    setSaving(true);

    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });

      if (!res.ok) throw new Error("Save failed");

      onSaved?.(newValue);
    } catch {
      setDisplayValue(previousValue);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && type !== "textarea") {
      e.preventDefault();
      save();
    }
    if (e.key === "Escape") {
      setEditing(false);
    }
  }

  if (editing) {
    const sharedClassName =
      "h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50";

    return (
      <div className={cn("min-w-0", className)}>
        {label && (
          <span className="mb-0.5 block text-xs text-muted-foreground">
            {label}
          </span>
        )}
        {type === "textarea" ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            className={cn(sharedClassName, "h-20 resize-y")}
            value={editValue as string}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={save}
            onKeyDown={handleKeyDown}
          />
        ) : type === "select" ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            className={cn(sharedClassName)}
            value={editValue as string}
            onChange={(e) => {
              const newVal = e.target.value;
              setEditValue(newVal);
              // Auto-save on select change: save directly with the new value
              setEditing(false);
              const parsed = newVal === "" ? null : newVal;
              if (parsed === displayValue) return;
              const prev = displayValue;
              setDisplayValue(parsed as typeof displayValue);
              setSaving(true);
              fetch(`/api/listings/${listingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [field]: parsed }),
              })
                .then((res) => {
                  if (!res.ok) throw new Error();
                  onSaved?.(parsed);
                })
                .catch(() => {
                  setDisplayValue(prev);
                  toast.error("Erreur de sauvegarde");
                })
                .finally(() => setSaving(false));
            }}
            onBlur={save}
          >
            <option value="">--</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            className="h-8 px-2 py-1 text-sm"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={save}
            onKeyDown={handleKeyDown}
          />
        )}
      </div>
    );
  }

  const isEmpty = displayValue === null || displayValue === undefined || displayValue === "";
  const formattedValue = isEmpty
    ? "\u2014"
    : suffix
      ? `${typeof displayValue === "number" ? displayValue.toLocaleString("fr-FR") : displayValue}${suffix}`
      : String(displayValue);

  return (
    <div
      className={cn("group min-w-0 cursor-pointer", className)}
      onClick={startEditing}
    >
      {label && (
        <span className="mb-0.5 block text-xs text-muted-foreground">
          {label}
        </span>
      )}
      <span className="inline-flex items-center gap-1">
        <span
          className={cn(
            "decoration-muted-foreground/40 underline-offset-2 group-hover:underline group-hover:decoration-dashed",
            isEmpty && "text-muted-foreground",
            displayClassName
          )}
        >
          {formattedValue}
        </span>
        {saving && (
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        )}
      </span>
    </div>
  );
}
