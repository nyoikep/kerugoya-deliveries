"use client";

import dynamic from "next/dynamic";

const NavBar = dynamic(() => import("@/components/NavBar"), { ssr: false });

export default function ClientOnlyNavBar() {
  return <NavBar />;
}
