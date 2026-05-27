"use client";
import { I18nProvider } from "@/components/I18n";
import Landing from "@/components/Landing";

export default function Home() {
  return (
    <I18nProvider>
      <Landing />
    </I18nProvider>
  );
}
