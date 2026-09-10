import {
  LayoutDashboard,
  Tag,
  Database,
  BellRing,
  Share2,
  Workflow,
  Sliders,
  DollarSign,
  BarChart3,
  TrendingUp,
  Link2,
  Wallet,
  History,
  Server,
  Terminal,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  optional?: boolean;
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export const HUB_NAV_GROUPS: NavGroup[] = [
  {
    id: "core-pipeline",
    title: "CORE PIPELINE",
    items: [
      {
        id: "overview",
        label: "Overview",
        href: "/hub",
        icon: LayoutDashboard,
      },
      {
        id: "curated-deals",
        label: "Curated Deals",
        href: "/hub/curated-deals",
        icon: Tag,
        badge: "Live",
      },
      {
        id: "products-database",
        label: "Products Database",
        href: "/hub/products",
        icon: Database,
      },
      {
        id: "deal-alerts-drafts",
        label: "Deal Alerts Drafts",
        href: "/hub/deal-alerts-drafts",
        icon: BellRing,
        badge: "3 New",
      },
      {
        id: "publishing-channels",
        label: "Publishing Channels",
        href: "/hub/publishing-channels",
        icon: Share2,
      },
    ],
  },
  {
    id: "automation-control",
    title: "AUTOMATION & CONTROL",
    items: [
      {
        id: "automation-pipeline",
        label: "Automation Pipeline",
        href: "/hub/automation-pipeline",
        icon: Workflow,
      },
      {
        id: "control-center",
        label: "Control Center",
        href: "/hub/control-center",
        icon: Sliders,
      },
      {
        id: "earnkaro",
        label: "EarnKaro (Optional)",
        href: "/hub/earnkaro",
        icon: DollarSign,
        optional: true,
      },
    ],
  },
  {
    id: "telemetry-analytics",
    title: "TELEMETRY & ANALYTICS",
    items: [
      {
        id: "analytics",
        label: "Analytics",
        href: "/hub/analytics",
        icon: BarChart3,
      },
      {
        id: "performance",
        label: "Performance",
        href: "/hub/performance",
        icon: TrendingUp,
      },
      {
        id: "link-tracking",
        label: "Link Tracking",
        href: "/hub/link-tracking",
        icon: Link2,
      },
      {
        id: "earnings-settlements",
        label: "Earnings Settlements",
        href: "/hub/earnings-settlements",
        icon: Wallet,
      },
      {
        id: "price-history",
        label: "Price History",
        href: "/hub/price-history",
        icon: History,
      },
    ],
  },
  {
    id: "system-ops",
    title: "SYSTEM & OPS",
    items: [
      {
        id: "system-deployment",
        label: "System Deployment",
        href: "/hub/system-deployment",
        icon: Server,
        badge: "v2.4",
      },
      {
        id: "system-logs",
        label: "System Logs",
        href: "/hub/system-logs",
        icon: Terminal,
      },
      {
        id: "settings",
        label: "Settings",
        href: "/hub/settings",
        icon: Settings,
      },
    ],
  },
];
