export const orderKeys = {
  all: ["orders"] as const,
  new: () => [...orderKeys.all, "new"] as const,
  ongoing: () => [...orderKeys.all, "ongoing"] as const,
  history: () => [...orderKeys.all, "history"] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};
