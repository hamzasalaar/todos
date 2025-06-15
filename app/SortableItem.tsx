"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // optional utility if you use it

export default function SortableItem({
  id,
  task,
  column,
  index,
}: {
  id: string;
  task: string;
  column: string;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { column, index } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing rounded-xl bg-white border shadow-sm transition-shadow",
        isDragging ? "opacity-40 shadow-md" : "hover:shadow-md"
      )}
    >
      <CardContent className="p-4">
        <p className="text-sm text-gray-800">{task}</p>
      </CardContent>
    </Card>
  );
}
