"use client";

import { useDroppable } from "@dnd-kit/core";

export default function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id,
    data: { column: id }, // <-- critical to know drop target
  });

  return (
    <div ref={setNodeRef} className="min-h-[100px]">
      {children}
    </div>
  );
}
