"use client";

import { TeamChat } from "./TeamChat";
import { TaskList } from "./TaskList";

export function TeamWorkspace() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
      <TeamChat />
      <TaskList />
    </div>
  );
}
