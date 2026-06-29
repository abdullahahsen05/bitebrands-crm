"use client";

import { useState } from "react";

import { Button } from "@/components/shared/Button";
import { useCrmStore } from "@/lib/crm-store";

import { ChatMessage } from "./ChatMessage";

export function TeamChat() {
  const [message, setMessage] = useState("");
  const data = useCrmStore((state) => state.data);
  const sendChatMessage = useCrmStore((state) => state.sendChatMessage);

  return (
    <div className="surface-card flex flex-col overflow-hidden">
      <div className="border-b border-[var(--line)] px-5 py-4">
        <h3 className="grotesk text-lg font-semibold">Team chat</h3>
      </div>
      <div className="app-scroll flex max-h-[52vh] flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
        {data.chat.map((entry) => {
          const author = data.users.find((user) => user.id === entry.byId) ?? data.users[0];
          return (
            <ChatMessage
              key={entry.id}
              message={entry}
              author={author}
              mine={entry.byId === data.currentUserId}
            />
          );
        })}
      </div>
      <div className="flex gap-3 border-t border-[var(--line)] px-5 py-4">
        <input
          className="h-10 flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3"
          placeholder="Typ een bericht..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              sendChatMessage(message);
              setMessage("");
            }
          }}
        />
        <Button
          variant="primary"
          onClick={() => {
            sendChatMessage(message);
            setMessage("");
          }}
        >
          Verstuur
        </Button>
      </div>
    </div>
  );
}
