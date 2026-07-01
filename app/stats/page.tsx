import { StatsCards } from "@/components/stats/StatsCards";
import { PersistenceProvider } from "@/store/persistence-store";

export default function StatsPage() {
  return (
    <PersistenceProvider>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-8">
        <h1 className="text-2xl font-bold uppercase tracking-widest">Stats</h1>
        <StatsCards />
      </main>
    </PersistenceProvider>
  );
}
