import { useState, useEffect } from "react";
import {
  Search, PawPrint, Phone, Calendar, Stethoscope,
  ChevronDown, ChevronUp, Pencil, FileText, Plus, ClipboardList,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import EditModal from "./EditModal";
import AddVisitModal from "./AddVisitModal";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface Visit {
  visit_id: number;
  visit_date: string;
  spayed_neutered: string;
  weight_kg: number;
  diagnostics_url: string;
  what_was_done_today: string;
  diagnosis: string;
  treatment: string;
  today_visit_url: string;
  follow_up_date: string;
  created_at: string;
}

interface Pet {
  pet_id: number;
  pet_name: string;
  type: string;
  gender: string;
  birth_date: string;
  disease_history: string;
  vaccination_history: string;
  created_at: string;
  visits: Visit[];
}

interface Owner {
  owner_id: number;
  owner_name: string;
  mobile_number: string;
  address: string;
  owner_created_at: string;
  pets: Pet[];
}

const petTypeIcon = (type: string) => type?.toLowerCase() === "cat" ? "🐱" : "🐶";

const calculateAge = (birthDate: string | undefined): string => {
  if (!birthDate) return "—";
  const today = new Date();
  const birth = new Date(birthDate);
  let years  = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth()    - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years  === 0) return `${months} month${months !== 1 ? "s" : ""}`;
  if (months === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years} year${years !== 1 ? "s" : ""}, ${months} month${months !== 1 ? "s" : ""}`;
};

const Dashboard = () => {
  const [owners, setOwners]       = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType,  setSearchType]  = useState("petName");

  const [expandedOwnerId, setExpandedOwnerId] = useState<number | null>(null);
  const [expandedPetId,   setExpandedPetId]   = useState<number | null>(null);
  const [expandedVisitId, setExpandedVisitId] = useState<number | null>(null);

  // Edit pet modal
  const [editModalOpen,    setEditModalOpen]    = useState(false);
  const [selectedOwnerId,  setSelectedOwnerId]  = useState<number | null>(null);
  const [selectedPetId,    setSelectedPetId]    = useState<number | null>(null);

  // Add/edit visit modal
  const [visitModalOpen,   setVisitModalOpen]   = useState(false);
  const [visitModalPetId,  setVisitModalPetId]  = useState<number | null>(null);
  const [visitModalPetName, setVisitModalPetName] = useState("");
  const [selectedVisit,    setSelectedVisit]    = useState<Visit | null>(null);

  const fetchOwners = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/owners`);
      if (!res.ok) throw new Error("Failed to fetch records");
      const result = await res.json();
      const data: Owner[] = result.data.map((o: Owner) => ({
        ...o,
        pets: (o.pets ?? []).filter((p) => p !== null && p.pet_id !== null),
      }));
      setOwners(data);
    } catch {
      toast.error("Failed to load records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOwners(); }, []);

  const filtered = owners.filter((o) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    if (searchType === "petName")  return o.pets.some((p) => p.pet_name?.toLowerCase().includes(q));
    if (searchType === "ownerName") return o.owner_name?.toLowerCase().includes(q);
    if (searchType === "mobile")   return o.mobile_number?.includes(q);
    return true;
  });

  const openEditPet = (ownerId: number, petId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOwnerId(ownerId);
    setSelectedPetId(petId);
    setEditModalOpen(true);
  };

  const openAddPet = (ownerId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOwnerId(ownerId);
    setSelectedPetId(null);
    setEditModalOpen(true);
  };

  const openAddVisit = (petId: number, petName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisitModalPetId(petId);
    setVisitModalPetName(petName);
    setSelectedVisit(null);
    setVisitModalOpen(true);
  };

  const openEditVisit = (petId: number, petName: string, visit: Visit, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisitModalPetId(petId);
    setVisitModalPetName(petName);
    setSelectedVisit(visit);
    setVisitModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading records...</p>
      </div>
    );
  }

  const FileLink = ({ url, label }: { url: string; label: string }) => {
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
    return (
      <a href={`${API_BASE}/${url}`} target="_blank" rel="noopener noreferrer"
        className="text-primary hover:underline flex items-center gap-1 text-sm">
        {isImage ? "🖼️" : <FileText size={14} />} {label}
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Stethoscope className="text-primary-foreground" size={28} />
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary-foreground">Patient Dashboard</h1>
              <p className="text-primary-foreground/70 text-sm mt-0.5">View and search all patient records</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search */}
        <Card className="mb-6 border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search records..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="petName">By Pet Name</SelectItem>
                  <SelectItem value="ownerName">By Owner Name</SelectItem>
                  <SelectItem value="mobile">By Mobile Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{filtered.length} owner{filtered.length !== 1 ? "s" : ""} found</p>
          </CardContent>
        </Card>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <Card className="border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Owner</TableHead>
                  <TableHead className="font-semibold">Mobile</TableHead>
                  <TableHead className="font-semibold">Address</TableHead>
                  <TableHead className="font-semibold">Pets</TableHead>
                  <TableHead className="font-semibold">Registered</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((owner) => (
                  <>
                    {/* Owner Row */}
                    <TableRow key={owner.owner_id} className="cursor-pointer hover:bg-muted/30"
                      onClick={() => { setExpandedOwnerId(expandedOwnerId === owner.owner_id ? null : owner.owner_id); setExpandedPetId(null); setExpandedVisitId(null); }}>
                      <TableCell className="font-medium">{owner.owner_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{owner.mobile_number}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{owner.address || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          {owner.pets.length === 0 ? (
                            <span className="text-muted-foreground text-xs">No pets</span>
                          ) : (
                            owner.pets.map((p) => (
                              <Badge key={p.pet_id} variant="secondary" className="font-normal text-xs">
                                {petTypeIcon(p.type)} {p.pet_name}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {owner.owner_created_at ? new Date(owner.owner_created_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        {expandedOwnerId === owner.owner_id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                      </TableCell>
                    </TableRow>

                    {/* Expanded: Pets */}
                    {expandedOwnerId === owner.owner_id && (
                      <TableRow key={`${owner.owner_id}-pets`}>
                        <TableCell colSpan={6} className="bg-muted/10 p-0">
                          <div className="px-6 py-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pets ({owner.pets.length})</p>
                              <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-dashed" onClick={(e) => openAddPet(owner.owner_id, e)}>
                                <Plus size={12} /> Add Pet
                              </Button>
                            </div>

                            {owner.pets.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No pets yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {owner.pets.map((pet) => (
                                  <div key={pet.pet_id}>
                                    {/* Pet Row */}
                                    <div className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-2 cursor-pointer hover:bg-muted/20"
                                      onClick={(e) => { e.stopPropagation(); setExpandedPetId(expandedPetId === pet.pet_id ? null : pet.pet_id); setExpandedVisitId(null); }}>
                                      <div className="flex items-center gap-3">
                                        <PawPrint size={14} className="text-primary" />
                                        <span className="font-medium text-sm">{pet.pet_name}</span>
                                        <Badge variant="secondary" className="font-normal text-xs">{petTypeIcon(pet.type)} {pet.type}</Badge>
                                        <span className="text-xs text-muted-foreground">{calculateAge(pet.birth_date)}</span>
                                        {pet.visits?.length > 0 && (
                                          <Badge variant="outline" className="font-normal text-xs">
                                            {pet.visits.length} visit{pet.visits.length !== 1 ? "s" : ""}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"
                                          onClick={(e) => openAddVisit(pet.pet_id, pet.pet_name, e)}>
                                          <Plus size={12} /> Add Visit
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7"
                                          onClick={(e) => openEditPet(owner.owner_id, pet.pet_id, e)}>
                                          <Pencil size={13} className="text-muted-foreground hover:text-primary" />
                                        </Button>
                                        {expandedPetId === pet.pet_id ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                                      </div>
                                    </div>

                                    {/* Pet Profile + Visits */}
                                    {expandedPetId === pet.pet_id && (
                                      <div className="mx-1 mt-1 rounded-md border border-border bg-muted/10 p-4" onClick={(e) => e.stopPropagation()}>
                                        {/* Pet Profile */}
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Profile</p>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-4">
                                          <DetailBlock label="Gender"    value={pet.gender || "—"} />
                                          <DetailBlock label="Birthdate" value={pet.birth_date ? new Date(pet.birth_date).toLocaleDateString() : "—"} />
                                          <DetailBlock label="Age"       value={calculateAge(pet.birth_date)} />
                                          <DetailBlock label="Disease History"     value={pet.disease_history     || "—"} />
                                          <DetailBlock label="Vaccination History" value={pet.vaccination_history || "—"} />
                                        </div>

                                        <Separator className="my-3" />

                                        {/* Visits */}
                                        <div className="flex items-center justify-between mb-3">
                                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Visits ({pet.visits?.length || 0})
                                          </p>
                                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-dashed"
                                            onClick={(e) => openAddVisit(pet.pet_id, pet.pet_name, e)}>
                                            <Plus size={12} /> Add Visit
                                          </Button>
                                        </div>

                                        {!pet.visits?.length ? (
                                          <p className="text-sm text-muted-foreground">No visits yet.</p>
                                        ) : (
                                          <div className="space-y-2">
                                            {pet.visits.map((visit) => (
                                              <div key={visit.visit_id}>
                                                {/* Visit Row */}
                                                <div className="flex items-center justify-between rounded border border-border bg-background px-3 py-2 cursor-pointer hover:bg-muted/20"
                                                  onClick={() => setExpandedVisitId(expandedVisitId === visit.visit_id ? null : visit.visit_id)}>
                                                  <div className="flex items-center gap-3">
                                                    <ClipboardList size={13} className="text-muted-foreground" />
                                                    <span className="text-sm font-medium">
                                                      {visit.visit_date ? new Date(visit.visit_date).toLocaleDateString() : "—"}
                                                    </span>
                                                    {visit.diagnosis && (
                                                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">{visit.diagnosis}</span>
                                                    )}
                                                    {visit.weight_kg && (
                                                      <Badge variant="outline" className="text-xs font-normal">{visit.weight_kg} kg</Badge>
                                                    )}
                                                    {visit.follow_up_date && (
                                                      <Badge variant="outline" className="text-xs font-normal">
                                                        Follow-up: {new Date(visit.follow_up_date).toLocaleDateString()}
                                                      </Badge>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7"
                                                      onClick={(e) => openEditVisit(pet.pet_id, pet.pet_name, visit, e)}>
                                                      <Pencil size={12} className="text-muted-foreground hover:text-primary" />
                                                    </Button>
                                                    {expandedVisitId === visit.visit_id ? <ChevronUp size={13} className="text-muted-foreground" /> : <ChevronDown size={13} className="text-muted-foreground" />}
                                                  </div>
                                                </div>

                                                {/* Visit Detail */}
                                                {expandedVisitId === visit.visit_id && (
                                                  <div className="mx-1 rounded border border-border bg-muted/5 p-4 grid grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                                    <DetailBlock label="Spayed / Neutered" value={visit.spayed_neutered || "—"} />
                                                    <DetailBlock label="Weight"            value={visit.weight_kg ? `${visit.weight_kg} kg` : "—"} />
                                                    <DetailBlock label="What was done"     value={visit.what_was_done_today || "—"} />
                                                    <DetailBlock label="Diagnosis"         value={visit.diagnosis  || "—"} />
                                                    <DetailBlock label="Treatment"         value={visit.treatment  || "—"} />
                                                    <DetailBlock label="Follow-up Date"    value={visit.follow_up_date ? new Date(visit.follow_up_date).toLocaleDateString() : "—"} />
                                                    {visit.diagnostics_url && <FileLink url={visit.diagnostics_url}  label="Diagnostics" />}
                                                    {visit.today_visit_url && <FileLink url={visit.today_visit_url}  label="Visit Attachment" />}
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
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
          {filtered.map((owner) => (
            <Card key={owner.owner_id} className="border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <button className="w-full p-4 text-left"
                  onClick={() => { setExpandedOwnerId(expandedOwnerId === owner.owner_id ? null : owner.owner_id); setExpandedPetId(null); setExpandedVisitId(null); }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{owner.owner_name}</p>
                      <p className="text-xs text-muted-foreground">{owner.mobile_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-normal">{owner.pets.length} pet{owner.pets.length !== 1 ? "s" : ""}</Badge>
                      {expandedOwnerId === owner.owner_id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {owner.pets.map((p) => (
                      <Badge key={p.pet_id} variant="secondary" className="text-xs font-normal">{petTypeIcon(p.type)} {p.pet_name}</Badge>
                    ))}
                  </div>
                </button>

                {expandedOwnerId === owner.owner_id && (
                  <div className="border-t border-border bg-muted/10 px-4 pb-4 pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pets</p>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-dashed" onClick={(e) => openAddPet(owner.owner_id, e)}>
                        <Plus size={12} /> Add Pet
                      </Button>
                    </div>

                    {owner.pets.map((pet) => (
                      <div key={pet.pet_id} className="rounded-md border border-border bg-background">
                        <button className="w-full p-3 text-left flex items-center justify-between"
                          onClick={() => setExpandedPetId(expandedPetId === pet.pet_id ? null : pet.pet_id)}>
                          <div className="flex items-center gap-2">
                            <PawPrint size={14} className="text-primary" />
                            <span className="font-medium text-sm">{pet.pet_name}</span>
                            <Badge variant="secondary" className="text-xs font-normal">{petTypeIcon(pet.type)} {pet.type}</Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={(e) => openAddVisit(pet.pet_id, pet.pet_name, e)}>
                              <Plus size={12} /> Visit
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => openEditPet(owner.owner_id, pet.pet_id, e)}>
                              <Pencil size={13} className="text-muted-foreground" />
                            </Button>
                            {expandedPetId === pet.pet_id ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                          </div>
                        </button>

                        {expandedPetId === pet.pet_id && (
                          <div className="border-t border-border p-3 space-y-3">
                            {/* Profile */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profile</p>
                              <DetailBlock label="Gender"   value={`${pet.gender || "—"}`} />
                              <DetailBlock label="Birthdate" value={pet.birth_date ? new Date(pet.birth_date).toLocaleDateString() : "—"} />
                              <DetailBlock label="Age"      value={calculateAge(pet.birth_date)} />
                              <DetailBlock label="Disease History"     value={pet.disease_history     || "—"} />
                              <DetailBlock label="Vaccination History" value={pet.vaccination_history || "—"} />
                            </div>
                            <Separator />
                            {/* Visits */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visits ({pet.visits?.length || 0})</p>
                                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-dashed" onClick={(e) => openAddVisit(pet.pet_id, pet.pet_name, e)}>
                                  <Plus size={12} /> Add Visit
                                </Button>
                              </div>
                              {!pet.visits?.length ? (
                                <p className="text-sm text-muted-foreground">No visits yet.</p>
                              ) : (
                                <div className="space-y-2">
                                  {pet.visits.map((visit) => (
                                    <div key={visit.visit_id} className="rounded border border-border bg-muted/5">
                                      <button className="w-full p-2 text-left flex items-center justify-between"
                                        onClick={() => setExpandedVisitId(expandedVisitId === visit.visit_id ? null : visit.visit_id)}>
                                        <div className="flex items-center gap-2">
                                          <ClipboardList size={13} className="text-muted-foreground" />
                                          <span className="text-sm font-medium">{visit.visit_date ? new Date(visit.visit_date).toLocaleDateString() : "—"}</span>
                                          {visit.weight_kg && <Badge variant="outline" className="text-xs">{visit.weight_kg} kg</Badge>}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => openEditVisit(pet.pet_id, pet.pet_name, visit, e)}>
                                            <Pencil size={11} className="text-muted-foreground" />
                                          </Button>
                                          {expandedVisitId === visit.visit_id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                        </div>
                                      </button>
                                      {expandedVisitId === visit.visit_id && (
                                        <div className="border-t border-border p-3 space-y-2">
                                          <DetailBlock label="Spayed / Neutered" value={visit.spayed_neutered || "—"} />
                                          <DetailBlock label="What was done"     value={visit.what_was_done_today || "—"} />
                                          <DetailBlock label="Diagnosis"         value={visit.diagnosis  || "—"} />
                                          <DetailBlock label="Treatment"         value={visit.treatment  || "—"} />
                                          {visit.follow_up_date && <DetailBlock label="Follow-up" value={new Date(visit.follow_up_date).toLocaleDateString()} />}
                                          {visit.diagnostics_url && <FileLink url={visit.diagnostics_url} label="Diagnostics" />}
                                          {visit.today_visit_url && <FileLink url={visit.today_visit_url} label="Visit Attachment" />}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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

      <EditModal ownerId={selectedOwnerId} petId={selectedPetId} isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} onSuccess={fetchOwners} />
      <AddVisitModal petId={visitModalPetId} petName={visitModalPetName} visit={selectedVisit} isOpen={visitModalOpen} onClose={() => setVisitModalOpen(false)} onSuccess={fetchOwners} />
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