import { Suspense } from "react";
import { TopNav } from "@/components/brand/TopNav";
import { GuestPortalExperience } from "@/components/guest/GuestPortalExperience";

export default function MiReservaPage() {
  return (
    <div className="min-h-screen bg-atmosphere-mist text-ocean">
      <TopNav tone="light" />
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-6 pt-32 text-ocean/60">
            Cargando Portal del Huésped...
          </div>
        }
      >
        <GuestPortalExperience />
      </Suspense>
    </div>
  );
}
