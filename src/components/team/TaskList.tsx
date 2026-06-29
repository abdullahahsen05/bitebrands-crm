"use client";

import { useCrmStore } from "@/lib/crm-store";

import { TaskCard } from "./TaskCard";

export function TaskList() {
  const tasks = useCrmStore((state) => state.data.tasks);

  return (
    <div className="surface-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="grotesk text-lg font-semibold">Taken</h3>
        <span className="mono text-xs text-[var(--grey)]">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} taskId={task.id} />
        ))}
      </div>
    </div>
  );
}
