export type PortalAction =
  | { type: "missing" }
  | { type: "placeholder" }
  | { type: "external"; url: string };

export function getPortalAction(url: string | undefined | null): PortalAction {
  const trimmed = url?.trim() ?? "";

  if (!trimmed) {
    return { type: "missing" };
  }

  try {
    const parsed = new URL(trimmed);
    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";
    const isPlaceholder = parsed.hostname.endsWith(".local");

    if (!isHttp) {
      return { type: "missing" };
    }

    if (isPlaceholder) {
      return { type: "placeholder" };
    }

    return { type: "external", url: trimmed };
  } catch {
    return { type: "missing" };
  }
}
