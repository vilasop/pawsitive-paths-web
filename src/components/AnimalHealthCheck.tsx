import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AnimalHealthCheckProps {
  animalId: string;
}

const AnimalHealthCheck = ({ animalId }: AnimalHealthCheckProps) => {
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthChecks();
  }, [animalId]);

  const fetchHealthChecks = async () => {
    try {
      const { data, error } = await supabase
        .from("animal_health_checks")
        .select("*")
        .eq("animal_id", animalId)
        .in("visibility", ["public", "adopter-only"])
        .order("check_date", { ascending: false })
        .limit(5);

      if (error) throw error;
      setChecks(data || []);
    } catch (error: any) {
      console.error("Error fetching health checks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Excellent: "bg-green-500",
      Good: "bg-blue-500",
      Fair: "bg-yellow-500",
      Poor: "bg-orange-500",
      Critical: "bg-red-500"
    };
    return <Badge className={colors[status as keyof typeof colors] || "bg-gray-500"}>{status}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-4">Loading health checks...</div>;
  }

  if (checks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No health checks available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Health Checks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {checks.map((check) => (
          <div key={check.id} className="border-b last:border-0 pb-4 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{check.check_type}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(check.check_date), "PPP")}
                </p>
              </div>
              {getStatusBadge(check.health_status)}
            </div>
            
            {check.veterinarian && (
              <p className="text-sm">
                <span className="text-muted-foreground">Vet:</span> {check.veterinarian}
              </p>
            )}
            
            {check.next_appointment && (
              <p className="text-sm">
                <span className="text-muted-foreground">Next Appointment:</span>{" "}
                {format(new Date(check.next_appointment), "PPP")}
              </p>
            )}
            
            {check.notes && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{check.notes}</p>
            )}
            
            {check.photos && check.photos.length > 0 && (
              <div className="flex gap-2 mt-2">
                {check.photos.slice(0, 3).map((url: string, idx: number) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Check photo ${idx + 1}`}
                    className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80"
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
                {check.photos.length > 3 && (
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-sm">
                    +{check.photos.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {checks.length === 5 && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            Showing latest 5 checks
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AnimalHealthCheck;
