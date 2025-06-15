"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (taskName: string) => Promise<void>;
  initialTaskName?: string;
  title: string;
  description?: string;
}

export function TaskModal({
  open,
  onOpenChange,
  onSubmit,
  initialTaskName = "",
  title,
  description,
}: TaskModalProps) {
  const [taskName, setTaskName] = React.useState(initialTaskName);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setTaskName(initialTaskName);
  }, [initialTaskName]);

  const handleSubmit = async () => {
    if (!taskName.trim()) return;
    setLoading(true);
    await onSubmit(taskName.trim());
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Input
          autoFocus
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Task name"
          disabled={loading}
        />
        <DialogFooter className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
