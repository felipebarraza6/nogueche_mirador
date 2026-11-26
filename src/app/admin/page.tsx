import { TopNav } from "@/components/brand/TopNav";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-atmosphere-mist text-ocean">
      <TopNav tone="dark" />
      <AdminDashboard />
    </div>
  );
}
