// Dashboard.tsx
import { useState, useEffect } from "react";
import { Search, PawPrint, Phone, Calendar, Stethoscope, ChevronDown, ChevronUp, Pencil, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import EditModal from "./EditModal";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface Record {
  id: number;
  pet_name: string;
  type: string;
  gender: string;
  birth_date: string;
  age: string;
  spayed_neutered: string;
  owner_name: string;
  mobile_number: string;
  address: string;
  disease_history: string;
  vaccination_history: string;
  diagnostics_url: string;
  what_was_done_today: string;
  diagnosis: string;
  treatment: string;
  today_visit_url: string;
  follow_up_date: string;
  weight_kg: number;
  created_at: string;
}

const Dashboard = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("petName");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  // Fetch records
  const fetchRecords = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/clinic-records`);
      if (!response.ok) throw new Error("Failed to fetch records");
      const result = await response.json();
      setRecords(result.data);
    } catch (error) {
      toast.error("Failed to load records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleEdit = (id: number) => {
    setSelectedRecordId(id);
    setEditModalOpen(true);
  };

  const filtered = records.filter((r) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    if (searchType === "petName") return r.pet_name?.toLowerCase().includes(q);
    if (searchType === "ownerName") return r.owner_name?.toLowerCase().includes(q);
    if (searchType === "mobile") return r.mobile_number?.includes(q);
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Stethoscope className="text-primary-foreground" size={28} />
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary-foreground">
                Patient Dashboard
              </h1>
              <p className="text-primary-foreground/70 text-sm mt-0.5">
                View and search all patient records
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Bar */}
        <Card className="mb-6 border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="petName">By Pet Name</SelectItem>
                  <SelectItem value="ownerName">By Owner Name</SelectItem>
                  <SelectItem value="mobile">By Mobile Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""} found
            </p>
          </CardContent>
        </Card>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <Card className="border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Pet</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Owner</TableHead>
                  <TableHead className="font-semibold">Mobile</TableHead>
                  <TableHead className="font-semibold">Diagnosis</TableHead>
                  <TableHead className="font-semibold">Follow-up</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <>
                    <TableRow
                      key={r.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <PawPrint size={14} className="text-primary" />
                          {r.pet_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {r.type === "Cat" || r.type === "cat" ? "🐱" : "🐶"} {r.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.owner_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.mobile_number}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">{r.diagnosis || "—"}</TableCell>
                      <TableCell>
                        {r.follow_up_date ? (
                          <Badge variant="outline" className="font-normal text-xs">
                            {new Date(r.follow_up_date).toLocaleDateString()}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(r.id);
                          }}
                        >
                          <Pencil size={14} className="text-muted-foreground hover:text-primary" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        {expandedId === r.id ? (
                          <ChevronUp size={16} className="text-muted-foreground" />
                        ) : (
                          <ChevronDown size={16} className="text-muted-foreground" />
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedId === r.id && (
                      <TableRow key={`${r.id}-detail`}>
                        <TableCell colSpan={9} className="bg-muted/20 p-0">
                          <div className="p-6 grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <DetailBlock label="Gender" value={r.gender} />
                            <DetailBlock 
                              label="Birthdate" 
                              value={r.birth_date ? new Date(r.birth_date).toLocaleDateString() : "—"} 
                            />
                            <DetailBlock label="Age" value={r.age || "—"} />
                            <DetailBlock 
                              label="Spayed/Neutered" 
                              value={r.spayed_neutered === "Yes" ? "Yes" : r.spayed_neutered === "No" ? "No" : String(r.spayed_neutered)} 
                            />
                            <DetailBlock label="Weight" value={r.weight_kg ? `${r.weight_kg} kg` : "—"} />
                            <DetailBlock label="Address" value={r.address || "—"} />
                            <DetailBlock label="Disease History" value={r.disease_history || "—"} />
                            <DetailBlock label="Vaccination History" value={r.vaccination_history || "—"} />
                            <DetailBlock label="Today's Exam" value={r.what_was_done_today || "—"} />
                            <DetailBlock label="Treatment" value={r.treatment || "—"} />
                            <DetailBlock 
                              label="Created At" 
                              value={r.created_at ? new Date(r.created_at).toLocaleString() : "—"} 
                            />
                            {r.diagnostics_url && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Diagnostics PDF</p>
                                <a 
                                  href={`${API_BASE}/${r.diagnostics_url}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1 text-sm"
                                >
                                  <FileText size={14} /> View PDF
                                </a>
                              </div>
                            )}
                            {r.today_visit_url && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Today's Visit PDF</p>
                                <a 
                                  href={`${API_BASE}/${r.today_visit_url}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1 text-sm"
                                >
                                  <FileText size={14} /> View PDF
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filtered.map((r) => (
            <Card key={r.id} className="border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <button
                  className="w-full p-4 text-left"
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <PawPrint size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{r.pet_name}</p>
                        <p className="text-xs text-muted-foreground">{r.owner_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(r.id);
                        }}
                      >
                        <Pencil size={14} className="text-muted-foreground" />
                      </Button>
                      <Badge variant="secondary" className="text-xs font-normal">
                        {r.type === "Cat" || r.type === "cat" ? "🐱" : "🐶"} {r.type}
                      </Badge>
                      {expandedId === r.id ? (
                        <ChevronUp size={16} className="text-muted-foreground" />
                      ) : (
                        <ChevronDown size={16} className="text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs font-normal">
                      <Phone size={10} className="mr-1" /> {r.mobile_number}
                    </Badge>
                    {r.follow_up_date && (
                      <Badge variant="outline" className="text-xs font-normal">
                        <Calendar size={10} className="mr-1" /> {new Date(r.follow_up_date).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </button>

                {expandedId === r.id && (
                  <div className="border-t border-border p-4 bg-muted/20 space-y-3">
                    <DetailBlock 
                      label="Gender" 
                      value={`${r.gender} · ${r.spayed_neutered === "Yes" ? "Spayed/Neutered" : "Intact"}`} 
                    />
                    <DetailBlock 
                      label="Birthdate" 
                      value={r.birth_date ? new Date(r.birth_date).toLocaleDateString() : "—"} 
                    />
                    <DetailBlock label="Age" value={r.age || "—"} />
                    <DetailBlock label="Weight" value={r.weight_kg ? `${r.weight_kg} kg` : "—"} />
                    <DetailBlock label="Address" value={r.address || "—"} />
                    <Separator />
                    <DetailBlock label="Disease History" value={r.disease_history || "—"} />
                    <DetailBlock label="Vaccination History" value={r.vaccination_history || "—"} />
                    <Separator />
                    <DetailBlock label="Today's Exam" value={r.what_was_done_today || "—"} />
                    <DetailBlock label="Diagnosis" value={r.diagnosis || "—"} />
                    <DetailBlock label="Treatment" value={r.treatment || "—"} />
                    <DetailBlock 
                      label="Created At" 
                      value={r.created_at ? new Date(r.created_at).toLocaleString() : "—"} 
                    />
                    {r.diagnostics_url && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Diagnostics PDF</p>
                        <a 
                          href={`${API_BASE}/${r.diagnostics_url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-sm"
                        >
                          <FileText size={14} /> View PDF
                        </a>
                      </div>
                    )}
                    {r.today_visit_url && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Today's Visit PDF</p>
                        <a 
                          href={`${API_BASE}/${r.today_visit_url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-sm"
                        >
                          <FileText size={14} /> View PDF
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <PawPrint size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No records found matching your search.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditModal
        recordId={selectedRecordId}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchRecords}
      />
    </div>
  );
};

const DetailBlock = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-foreground text-sm">{value}</p>
  </div>
);

export default Dashboard;