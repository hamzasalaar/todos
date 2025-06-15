// "use client";

// import { useState } from "react";
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragEndEvent,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { Button } from "@/components/ui/button";
// import SortableItem from "../SortableItem";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import type { Database } from ""

// type Task = {
//   id: string;
//   text: string;
// };
// type TaskColumn = "todo" | "pending" | "done";
// type Tasks = Record<TaskColumn, Task[]>;

// export default function DashboardClient({
//   initialTasks,
// }: {
//   initialTasks: Tasks;
// }) {
//   const [tasks, setTasks] = useState<Tasks>(initialTasks);

//   const sensors = useSensors(useSensor(PointerSensor));
//   const supabase = createClientComponentClient<Database>();

//   const handleDragEnd = async (event: DragEndEvent) => {
//     const { active, over } = event;

//     if (!over || active.id === over.id) return;

//     const sourceColumn = (Object.keys(tasks) as TaskColumn[]).find((column) =>
//       tasks[column].some((t) => t.id === active.id)
//     )!;
//     const destColumn = (Object.keys(tasks) as TaskColumn[]).find(
//       (column) => column === over.data.current?.column
//     )!;

//     if (!sourceColumn || !destColumn) return;

//     const sourceItems = [...tasks[sourceColumn]];
//     const [movedItem] = sourceItems.splice(
//       sourceItems.findIndex((t) => t.id === active.id),
//       1
//     );

//     const destItems = [...tasks[destColumn]];
//     const insertIndex = over.data.current?.index ?? destItems.length;
//     destItems.splice(insertIndex, 0, movedItem);

//     // Update local state
//     setTasks({
//       ...tasks,
//       [sourceColumn]: sourceItems,
//       [destColumn]: destItems,
//     });

//     // Update Supabase
//     try {
//       const { error } = await supabase
//         .from("todos")
//         .update({ task_status: destColumn })
//         .eq("id", movedItem.id);

//       if (error) {
//         console.error("Error updating task_status:", error.message);
//       }
//     } catch (err) {
//       console.error("Unexpected error updating task_status:", err);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Tasks Pipeline</h1>

//       <DndContext
//         sensors={sensors}
//         collisionDetection={closestCenter}
//         onDragEnd={handleDragEnd}
//       >
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {(Object.keys(tasks) as TaskColumn[]).map((status) => (
//             <div
//               key={status}
//               className="bg-muted/50 p-4 rounded-xl min-h-[300px] flex flex-col"
//             >
//               <h2 className="text-lg font-semibold capitalize mb-4">
//                 {status}
//               </h2>

//               <SortableContext
//                 items={tasks[status].map((item) => item.id)}
//                 strategy={verticalListSortingStrategy}
//               >
//                 {tasks[status].map((item, index) => (
//                   <SortableItem
//                     key={`${status}-${item.id}`}
//                     id={item.id}
//                     task={item.text}
//                     column={status}
//                     index={index}
//                   />
//                 ))}
//               </SortableContext>

//               <Button
//                 variant="outline"
//                 className="mt-auto"
//                 onClick={() => alert(`Add task to ${status}`)}
//               >
//                 +
//               </Button>
//             </div>
//           ))}
//         </div>
//       </DndContext>
//     </div>
//   );
// }
