export type PortalWrapperId = "dashboard-topbar";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
