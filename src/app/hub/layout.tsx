import React from "react";
import type { Metadata } from "next";
import { AutoBotHubLayout } from "@/components/hub/AutoBotHubLayout";

export const metadata: Metadata = {
  title: "AutoBot HUB — Operations Center",
  description: "Operations Center, Deal Automation, Pipeline Telemetry & Control Dashboard",
};

export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AutoBotHubLayout>{children}</AutoBotHubLayout>;
}
