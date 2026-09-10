"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportBookingsCsvAction } from "@/app/admin/(dashboard)/bookings/actions";

export function ExportCsvButton({ filename }: { filename: string }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    const result = await exportBookingsCsvAction();
    setLoading(false);
    if (!result.success) {
      alert(result.error);
      return;
    }
    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleExport} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Export CSV
    </Button>
  );
}
