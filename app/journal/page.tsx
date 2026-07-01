import { JournalPageClient } from "@/components/journal/JournalPageClient";
import { PersistenceProvider } from "@/store/persistence-store";

export default function JournalPage() {
  return (
    <PersistenceProvider>
      <JournalPageClient />
    </PersistenceProvider>
  );
}
