import { STORAGE_KEY } from "./constants";
import type { CrmData } from "./types";

export function downloadData(data: CrmData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `bitebrands-crm-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function clearStoredData() {
  localStorage.removeItem(STORAGE_KEY);
}
