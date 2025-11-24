import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Check, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface HealthCheckDetailProps {
  checkId: string;
  onClose: () => void;
}

const HealthCheckDetail = ({ checkId, onClose }: HealthCheckDetailProps) => {
  const [check, setCheck] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckDetail();
  }, [checkId]);

  const fetchCheckDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("animal_health_checks")
        .select(`
          *,
          adopt_animals (
            name,
            species,
            breed,
            image_url
          )
        `)
        .eq("id", checkId)
        .single();

      if (error) throw error;
      setCheck(data);
    } catch (error: any) {
      console.error("Error fetching health check detail:", error);
      toast.error("Failed to load details: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Loading...</p>
      </div>
    );
  }

  if (!check) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Health check not found</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Health Check Details</h2>
          <p className="text-muted-foreground">Complete health record for {check.adopt_animals?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Animal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {check.adopt_animals?.image_url && (
                  <img
                    src={check.adopt_animals.image_url}
                    alt={check.adopt_animals.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold">{check.adopt_animals?.name}</h3>
                  <p className="text-muted-foreground">
                    {check.animal_type || check.adopt_animals?.species} 
                    {check.animal_age && ` • ${check.animal_age} years old`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Check Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Check Date</p>
                  <p className="font-medium">{format(new Date(check.check_date), "PPP")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check Type</p>
                  <p className="font-medium">{check.check_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Health Status</p>
                  <div>{getStatusBadge(check.health_status)}</div>
                </div>
                {check.weight_kg && (
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-medium">{check.weight_kg} kg</p>
                  </div>
                )}
                {check.veterinarian && (
                  <div>
                    <p className="text-sm text-muted-foreground">Veterinarian</p>
                    <p className="font-medium">{check.veterinarian}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Visibility</p>
                  <Badge variant="outline">{check.visibility}</Badge>
                </div>
              </div>

              {check.next_appointment && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Next Appointment:</span>
                    <span>{format(new Date(check.next_appointment), "PPP p")}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vaccinations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {check.vaccinations_up_to_date ? (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-700">Vaccinations are up to date</span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-700">Vaccinations not up to date</span>
                  </>
                )}
              </div>
              {check.vaccinations_notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes:</p>
                  <p className="mt-1">{check.vaccinations_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {check.notes && (
            <Card>
              <CardHeader>
                <CardTitle>General Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{check.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {check.photos && check.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photos ({check.photos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {check.photos.map((url: string, idx: number) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Check photo ${idx + 1}`}
                      className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition"
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{format(new Date(check.created_at), "PPP p")}</p>
              </div>
              {check.updated_at !== check.created_at && (
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p>{format(new Date(check.updated_at), "PPP p")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthCheckDetail;
