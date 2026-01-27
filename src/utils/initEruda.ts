// utils/initEruda.ts
export function initEruda() {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    script.onload = () => {
      // @ts-ignore
      eruda.init();
      console.log("[DEBUG] Eruda initialized");
    };
    document.body.appendChild(script);
  }
}