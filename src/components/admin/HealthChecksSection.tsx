import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Search, Download, Eye, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import HealthCheckForm from "./HealthCheckForm";
import HealthCheckDetail from "./HealthCheckDetail";

interface HealthCheck {
  id: string;
  animal_id: string;
  check_date: string;
  check_type: string;
  health_status: string;
  veterinarian: string | null;
  next_appointment: string | null;
  visibility: string;
  created_at: string;
  adopt_animals: {
    name: string;
    image_url: string | null;
  };
  created_by_user?: {
    email: string;
  };
}

const HealthChecksSection = () => {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<HealthCheck | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchHealthChecks();
  }, []);

  const fetchHealthChecks = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("animal_health_checks")
        .select(`
          *,
          adopt_animals (
            name,
            image_url
          )
        `)
        .order("check_date", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setHealthChecks(data || []);
    } catch (error: any) {
      console.error("Error fetching health checks:", error);
      toast.error("Failed to load health checks: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this health check?")) return;

    try {
      const { error } = await supabase
        .from("animal_health_checks")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Health check deleted successfully");
      fetchHealthChecks();
    } catch (error: any) {
      console.error("Error deleting health check:", error);
      toast.error("Failed to delete: " + error.message);
    }
  };

  const exportToCSV = () => {
    const headers = ["Animal Name", "Check Date", "Type", "Health Status", "Veterinarian", "Next Appointment", "Visibility"];
    const rows = filteredChecks.map(check => [
      check.adopt_animals.name,
      format(new Date(check.check_date), "PPP"),
      check.check_type,
      check.health_status,
      check.veterinarian || "N/A",
      check.next_appointment ? format(new Date(check.next_appointment), "PPP") : "N/A",
      check.visibility
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `health_checks_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Export completed");
  };

  const filteredChecks = healthChecks.filter(check => {
    const matchesSearch = check.adopt_animals.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || check.health_status === statusFilter;
    const matchesType = typeFilter === "all" || check.check_type === typeFilter;
    const matchesVisibility = visibilityFilter === "all" || check.visibility === visibilityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesVisibility;
  });

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

  if (showForm) {
    return (
      <HealthCheckForm
        onClose={() => {
          setShowForm(false);
          fetchHealthChecks();
        }}
        editingCheck={selectedCheck}
      />
    );
  }

  if (showDetail && selectedCheck) {
    return (
      <HealthCheckDetail
        checkId={selectedCheck.id}
        onClose={() => {
          setShowDetail(false);
          setSelectedCheck(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Health Checks</h2>
          <p className="text-muted-foreground">Monitor animal health and schedule appointments</p>
        </div>
        <Button onClick={() => { setSelectedCheck(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Health Check
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by animal name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Health Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Excellent">Excellent</SelectItem>
            <SelectItem value="Good">Good</SelectItem>
            <SelectItem value="Fair">Fair</SelectItem>
            <SelectItem value="Poor">Poor</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Check Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Home Visit">Home Visit</SelectItem>
            <SelectItem value="Clinic Visit">Clinic Visit</SelectItem>
            <SelectItem value="Self Report">Self Report</SelectItem>
            <SelectItem value="Remote Followup">Remote Followup</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visibility</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="adopter-only">Adopter Only</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Animal</TableHead>
              <TableHead>Check Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Health Status</TableHead>
              <TableHead>Veterinarian</TableHead>
              <TableHead>Next Appointment</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredChecks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No health checks found
                </TableCell>
              </TableRow>
            ) : (
              filteredChecks.map((check) => (
                <TableRow key={check.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {check.adopt_animals.image_url && (
                        <img
                          src={check.adopt_animals.image_url}
                          alt={check.adopt_animals.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <span className="font-medium">{check.adopt_animals.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(check.check_date), "PPP")}</TableCell>
                  <TableCell>{check.check_type}</TableCell>
                  <TableCell>{getStatusBadge(check.health_status)}</TableCell>
                  <TableCell>{check.veterinarian || "N/A"}</TableCell>
                  <TableCell>
                    {check.next_appointment ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(check.next_appointment), "PPP")}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{check.visibility}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCheck(check);
                          setShowDetail(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCheck(check);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(check.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default HealthChecksSection;
