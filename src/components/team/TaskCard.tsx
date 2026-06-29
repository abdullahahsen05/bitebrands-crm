"use client";

import { Button } from "@/components/shared/Button";
import { useCrmStore } from "@/lib/crm-store";

export function TaskCard({
  taskId,
}: {
  taskId: string;
}) {
  const task = useCrmStore((state) => state.data.tasks.find((entry) => entry.id === taskId));
  const users = useCrmStore((state) => state.data.users);
  const partners = useCrmStore((state) => state.data.partners);
  const toggleTaskStatus = useCrmStore((state) => state.toggleTaskStatus);
  const deleteTask = useCrmStore((state) => state.deleteTask);

  if (!task) {
    return null;
  }

  const assignee = users.find((user) => user.id === task.assigneeId);
  const creator = users.find((user) => user.id === task.byId);
  const partner = partners.find((entry) => entry.id === task.partnerId);

  return (
    <div className={`rounded-2xl border p-4 ${task.status === "done" ? "border-[var(--line)] bg-[var(--bg)] opacity-60" : "border-[var(--line)] bg-[var(--surface)]"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold">{task.title}</div>
        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[var(--ink-soft)]">
          {task.status}
        </span>
      </div>
      {task.desc ? <div className="mt-2 text-sm text-[var(--ink-soft)]">{task.desc}</div> : null}
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--grey)]">
        <span>Assignee: {assignee?.name}</span>
        <span>Maker: {creator?.name}</span>
        {partner ? <span>Partner: {partner.name}</span> : null}
      </div>
      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={() => toggleTaskStatus(task.id)}>
          {task.status === "open" ? "Markeer done" : "Heropen"}
        </Button>
        <Button size="sm" variant="danger" onClick={() => deleteTask(task.id)}>
          Verwijder
        </Button>
      </div>
    </div>
  );
}
