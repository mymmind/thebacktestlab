import { StatsCards } from "@/components/stats/StatsCards";
import { PageLayout } from "@/components/app-shell/PageLayout";

export default function StatsPage() {
  return (
    <PageLayout
      title="Stats"
      subtitle="Discipline metrics from your replay sessions. No vanity dashboards — just the numbers that matter."
    >
      <StatsCards />
    </PageLayout>
  );
}
