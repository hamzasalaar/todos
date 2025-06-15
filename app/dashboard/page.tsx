"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import SortableItem from "../SortableItem";
import { supabase } from "@/lib/supabaseClient";
import DroppableColumn from "./DroppableColumn";

import { TaskModal } from "@/components/TaskModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
type Task = {
  id: string;
  text: string;
  status: "todo" | "pending" | "done";
};
type TaskColumn = "todo" | "pending" | "done";
type Tasks = Record<TaskColumn, Task[]>;

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Tasks>({
    todo: [],
    pending: [],
    done: [],
  });

  const sensors = useSensors(useSensor(PointerSensor));
  const [username, setUsername] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Modal state
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // Which column and task we are editing or deleting
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingColumn, setEditingColumn] = useState<TaskColumn | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUserEmail(user.email ?? null);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else {
      setUsername(profile?.username || null);
    }

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    const formattedTasks: Tasks = {
      todo: [],
      pending: [],
      done: [],
    };

    data.forEach((t) => {
      formattedTasks[t.task_status as TaskColumn].push({
        id: t.id,
        text: t.task_name,
        status: t.task_status,
      });
    });

    setTasks(formattedTasks);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceColumn = (Object.keys(tasks) as TaskColumn[]).find((col) =>
      tasks[col].some((t) => t.id === active.id)
    )!;
    const destColumn: TaskColumn =
      over?.data?.current?.column || (over?.id as TaskColumn);

    if (sourceColumn === destColumn) return;

    const sourceItems = [...tasks[sourceColumn]];
    const [movedItem] = sourceItems.splice(
      sourceItems.findIndex((t) => t.id === active.id),
      1
    );
    const destItems = [...tasks[destColumn]];
    destItems.push({ ...movedItem, status: destColumn });

    setTasks({
      ...tasks,
      [sourceColumn]: sourceItems,
      [destColumn]: destItems,
    });

    const { error } = await supabase
      .from("todos")
      .update({ task_status: destColumn })
      .eq("id", active.id);

    if (error) {
      console.error(error);
      fetchTasks();
    }
  };

  // Open add modal for a column
  const openAddModal = (column: TaskColumn) => {
    setEditingTask(null);
    setEditingColumn(column);
    setTaskModalOpen(true);
  };

  // Open edit modal for a task
  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditingColumn(task.status);
    setTaskModalOpen(true);
  };

  // Add or edit task handler from modal submit
  const onSubmitTask = async (taskName: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (editingTask) {
      // Edit existing task
      const { error } = await supabase
        .from("todos")
        .update({ task_name: taskName })
        .eq("id", editingTask.id);

      if (error) {
        console.error(error);
      }
    } else if (editingColumn) {
      // Add new task
      const { error } = await supabase.from("todos").insert([
        {
          task_name: taskName,
          task_status: editingColumn,
          user_id: user.id,
        },
      ]);

      if (error) {
        console.error(error);
      }
    }
    await fetchTasks();
  };

  // Delete modal state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const openDeleteModal = (task: Task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!taskToDelete) return;
    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", taskToDelete.id);

    if (error) {
      console.error(error);
    } else {
      await fetchTasks();
    }
    setTaskToDelete(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Tasks</h1>

        <div className="flex flex-col items-end">
          {username && <span>Welcome: {username}</span>}
          {userEmail && (
            <p className="text-sm text-gray-500 mb-1">
              Logged in as: {userEmail}
            </p>
          )}
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(tasks) as TaskColumn[]).map((column) => (
            <div key={column} className="space-y-4">
              <h2 className="text-lg font-semibold capitalize">{column}</h2>

              <DroppableColumn id={column}>
                <SortableContext
                  items={tasks[column].map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 min-h-[50px]">
                    {tasks[column].map((task, index) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between bg-gray-100 p-2 rounded"
                      >
                        <SortableItem
                          id={task.id}
                          task={task.text}
                          column={column}
                          index={index}
                        />
                        <div className="space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(task)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDeleteModal(task)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DroppableColumn>

              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => openAddModal(column)}
              >
                + Add Task
              </Button>
            </div>
          ))}
        </div>
      </DndContext>

      {/* Add/Edit Task Modal */}
      <TaskModal
        open={isTaskModalOpen}
        onOpenChange={setTaskModalOpen}
        onSubmit={onSubmitTask}
        initialTaskName={editingTask?.text}
        title={editingTask ? "Edit Task" : "Add Task"}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={onConfirmDelete}
        taskName={taskToDelete?.text}
      />
    </div>
  );
}
