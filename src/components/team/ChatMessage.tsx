"use client";

import { clockAgo, initials } from "@/lib/formatters";
import type { ChatMessage as ChatMessageType, User } from "@/lib/types";

export function ChatMessage({
  message,
  author,
  mine,
}: {
  message: ChatMessageType;
  author: User;
  mine: boolean;
}) {
  return (
    <div className={`flex gap-3 ${mine ? "justify-end" : "justify-start"}`}>
      {!mine ? (
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: author.color }}
        >
          {initials(author.name)}
        </div>
      ) : null}
      <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${mine ? "bg-[var(--accent-soft)]" : "bg-[var(--bg)]"}`}>
        <div className="text-xs font-semibold text-[var(--ink-soft)]">{author.name}</div>
        <div className="mt-1 text-sm">{message.text}</div>
        <div className="mt-2 text-[11px] text-[var(--grey)]">{clockAgo(message.at)}</div>
      </div>
    </div>
  );
}
