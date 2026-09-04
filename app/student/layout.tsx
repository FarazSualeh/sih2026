import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student workspace",
  robots: { index: false, follow: false },
};

export default function StudentRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
