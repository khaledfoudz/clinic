// Dashboard.tsx
import { useState, useEffect } from "react";
import {
  Search, PawPrint, Phone, Calendar, Stethoscope,
  ChevronDown, ChevronUp, Pencil, FileText, Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import EditModal from "./EditModal";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Pet {
  pet_id: number;
  pet_name: string;
  type: string;
  gender: string;
  birth_date: string;
  age: string;
  spayed_neutered: boolean | string;
  weight_kg: number;
  disease_history: string;
  vaccination_history: string;
  diagnostics_url: string;
  what_was_done_today: string;
  diagnosis: string;
  treatment: string;
  today_visit_url: string;
  follow_up_date: string;
  created_at: string;
}

interface Owner {
  owner_id: number;
  owner_name: string;
  mobile_number: string;
  address: string;
  owner_created_at: string;
  pets: Pet[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const petTypeIcon = (type: string) =>
  type?.toLowerCase() === "cat" ? "🐱" : "🐶";

const spayedLabel = (val: boolean | string) => {
  if (val === true  || val === "Yes" || val === "yes") return "Yes";
  if (val === false || val === "No"  || val === "no")  return "No";
  return String(val ?? "—");
};

// ── Component ─────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("petName");

  // Which owner row is expanded
  const [expandedOwnerId, setExpandedOwnerId] = useState<number | null>(null);
  // Which pet sub-row is expanded inside the owner
  const [expandedPetId, setExpandedPetId] = useState<number | null>(null);

  // Edit / Add-pet modal state
  const [editModalOpen, setEditModalOpen]     = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState<number | null>(null);
  const [selectedPetId, setSelectedPetId]     = useState<number | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchOwners = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/owners`);
      if (!res.ok) throw new Error("Failed to fetch records");
      const result = await res.json();
      // Filter out null pet entries (owner with no pets yet from LEFT JOIN)
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

  // ── Search filter ──────────────────────────────────────────────────────────

  const filtered = owners.filter((o) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    if (searchType === "petName")
      return o.pets.some((p) => p.pet_name?.toLowerCase().includes(q));
    if (searchType === "ownerName")
      return o.owner_name?.toLowerCase().includes(q);
    if (searchType === "mobile")
      return o.mobile_number?.includes(q);
    return true;
  });

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openEditPet = (ownerId: number, petId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOwnerId(ownerId);
    setSelectedPetId(petId);
    setEditModalOpen(true);
  };

  const openAddPet = (ownerId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOwnerId(ownerId);
    setSelectedPetId(null); // null = "add new pet" mode
    setEditModalOpen(true);
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading records...</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

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
              {filtered.length} owner{filtered.length !== 1 ? "s" : ""} found
            </p>
          </CardContent>
        </Card>

        {/* ── Desktop Table ─────────────────────────────────────────────── */}
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
                    {/* ── Owner Row ── */}
                    <TableRow
                      key={owner.owner_id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => {
                        setExpandedOwnerId(
                          expandedOwnerId === owner.owner_id ? null : owner.owner_id
                        );
                        setExpandedPetId(null);
                      }}
                    >
                      <TableCell className="font-medium">{owner.owner_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {owner.mobile_number}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {owner.address || "—"}
                      </TableCell>
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
                        {owner.owner_created_at
                          ? new Date(owner.owner_created_at).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {expandedOwnerId === owner.owner_id
                          ? <ChevronUp  size={16} className="text-muted-foreground" />
                          : <ChevronDown size={16} className="text-muted-foreground" />}
                      </TableCell>
                    </TableRow>

                    {/* ── Expanded: Pets section ── */}
                    {expandedOwnerId === owner.owner_id && (
                      <TableRow key={`${owner.owner_id}-pets`}>
                        <TableCell colSpan={6} className="bg-muted/10 p-0">
                          <div className="px-6 py-4">
                            {/* Section header + Add Pet button */}
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Pets ({owner.pets.length})
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1 border-dashed"
                                onClick={(e) => openAddPet(owner.owner_id, e)}
                              >
                                <Plus size={12} /> Add Pet
                              </Button>
                            </div>

                            {owner.pets.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No pets yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {owner.pets.map((pet) => (
                                  <>
                                    {/* ── Pet Row ── */}
                                    <div
                                      key={pet.pet_id}
                                      className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-2 cursor-pointer hover:bg-muted/20"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedPetId(
                                          expandedPetId === pet.pet_id ? null : pet.pet_id
                                        );
                                      }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <PawPrint size={14} className="text-primary" />
                                        <span className="font-medium text-sm">{pet.pet_name}</span>
                                        <Badge variant="secondary" className="font-normal text-xs">
                                          {petTypeIcon(pet.type)} {pet.type}
                                        </Badge>
                                        {pet.diagnosis && (
                                          <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                                            {pet.diagnosis}
                                          </span>
                                        )}
                                        {pet.follow_up_date && (
                                          <Badge variant="outline" className="font-normal text-xs">
                                            Follow-up: {new Date(pet.follow_up_date).toLocaleDateString()}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7"
                                          onClick={(e) => openEditPet(owner.owner_id, pet.pet_id, e)}
                                        >
                                          <Pencil size={13} className="text-muted-foreground hover:text-primary" />
                                        </Button>
                                        {expandedPetId === pet.pet_id
                                          ? <ChevronUp  size={14} className="text-muted-foreground" />
                                          : <ChevronDown size={14} className="text-muted-foreground" />}
                                      </div>
                                    </div>

                                    {/* ── Pet Detail Panel ── */}
                                    {expandedPetId === pet.pet_id && (
                                      <div
                                        key={`${pet.pet_id}-detail`}
                                        className="mx-1 rounded-md border border-border bg-muted/20 p-5 grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <DetailBlock label="Gender"     value={pet.gender || "—"} />
                                        <DetailBlock
                                          label="Birthdate"
                                          value={pet.birth_date ? new Date(pet.birth_date).toLocaleDateString() : "—"}
                                        />
                                        <DetailBlock label="Age"        value={pet.age || "—"} />
                                        <DetailBlock label="Spayed / Neutered" value={spayedLabel(pet.spayed_neutered)} />
                                        <DetailBlock label="Weight"     value={pet.weight_kg ? `${pet.weight_kg} kg` : "—"} />
                                        <DetailBlock label="Disease History"     value={pet.disease_history     || "—"} />
                                        <DetailBlock label="Vaccination History" value={pet.vaccination_history || "—"} />
                                        <DetailBlock label="Today's Exam"        value={pet.what_was_done_today || "—"} />
                                        <DetailBlock label="Diagnosis"  value={pet.diagnosis  || "—"} />
                                        <DetailBlock label="Treatment"  value={pet.treatment  || "—"} />
                                        <DetailBlock
                                          label="Created At"
                                          value={pet.created_at ? new Date(pet.created_at).toLocaleString() : "—"}
                                        />
                                        {pet.diagnostics_url && (
                                          <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                                              Diagnostics PDF
                                            </p>
                                            <a
                                              href={`${API_BASE}/${pet.diagnostics_url}`}
                                              target="_blank" rel="noopener noreferrer"
                                              className="text-primary hover:underline flex items-center gap-1 text-sm"
                                            >
                                              <FileText size={14} /> View PDF
                                            </a>
                                          </div>
                                        )}
                                        {pet.today_visit_url && (
                                          <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                                              Today's Visit PDF
                                            </p>
                                            <a
                                              href={`${API_BASE}/${pet.today_visit_url}`}
                                              target="_blank" rel="noopener noreferrer"
                                              className="text-primary hover:underline flex items-center gap-1 text-sm"
                                            >
                                              <FileText size={14} /> View PDF
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </>
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

        {/* ── Mobile Cards ──────────────────────────────────────────────── */}
        <div className="lg:hidden space-y-4">
          {filtered.map((owner) => (
            <Card key={owner.owner_id} className="border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                {/* Owner header button */}
                <button
                  className="w-full p-4 text-left"
                  onClick={() => {
                    setExpandedOwnerId(
                      expandedOwnerId === owner.owner_id ? null : owner.owner_id
                    );
                    setExpandedPetId(null);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{owner.owner_name}</p>
                      <p className="text-xs text-muted-foreground">{owner.mobile_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-normal">
                        {owner.pets.length} pet{owner.pets.length !== 1 ? "s" : ""}
                      </Badge>
                      {expandedOwnerId === owner.owner_id
                        ? <ChevronUp  size={16} className="text-muted-foreground" />
                        : <ChevronDown size={16} className="text-muted-foreground" />}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {owner.pets.map((p) => (
                      <Badge key={p.pet_id} variant="secondary" className="text-xs font-normal">
                        {petTypeIcon(p.type)} {p.pet_name}
                      </Badge>
                    ))}
                  </div>
                </button>

                {/* Expanded: Pets list */}
                {expandedOwnerId === owner.owner_id && (
                  <div className="border-t border-border bg-muted/10 px-4 pb-4 pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Pets
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1 border-dashed"
                        onClick={(e) => openAddPet(owner.owner_id, e)}
                      >
                        <Plus size={12} /> Add Pet
                      </Button>
                    </div>

                    {owner.pets.map((pet) => (
                      <div key={pet.pet_id} className="rounded-md border border-border bg-background">
                        <button
                          className="w-full p-3 text-left flex items-center justify-between"
                          onClick={() =>
                            setExpandedPetId(expandedPetId === pet.pet_id ? null : pet.pet_id)
                          }
                        >
                          <div className="flex items-center gap-2">
                            <PawPrint size={14} className="text-primary" />
                            <span className="font-medium text-sm">{pet.pet_name}</span>
                            <Badge variant="secondary" className="text-xs font-normal">
                              {petTypeIcon(pet.type)} {pet.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => openEditPet(owner.owner_id, pet.pet_id, e)}
                            >
                              <Pencil size={13} className="text-muted-foreground" />
                            </Button>
                            {expandedPetId === pet.pet_id
                              ? <ChevronUp  size={14} className="text-muted-foreground" />
                              : <ChevronDown size={14} className="text-muted-foreground" />}
                          </div>
                        </button>

                        {expandedPetId === pet.pet_id && (
                          <div className="border-t border-border p-3 space-y-2">
                            <DetailBlock
                              label="Gender"
                              value={`${pet.gender || "—"} · ${spayedLabel(pet.spayed_neutered) === "Yes" ? "Spayed/Neutered" : "Intact"}`}
                            />
                            <DetailBlock
                              label="Birthdate"
                              value={pet.birth_date ? new Date(pet.birth_date).toLocaleDateString() : "—"}
                            />
                            <DetailBlock label="Age"    value={pet.age    || "—"} />
                            <DetailBlock label="Weight" value={pet.weight_kg ? `${pet.weight_kg} kg` : "—"} />
                            <DetailBlock label="Address" value={owner.address || "—"} />
                            <Separator />
                            <DetailBlock label="Disease History"     value={pet.disease_history     || "—"} />
                            <DetailBlock label="Vaccination History" value={pet.vaccination_history || "—"} />
                            <Separator />
                            <DetailBlock label="Today's Exam" value={pet.what_was_done_today || "—"} />
                            <DetailBlock label="Diagnosis"    value={pet.diagnosis  || "—"} />
                            <DetailBlock label="Treatment"    value={pet.treatment  || "—"} />
                            {pet.diagnostics_url && (
                              <a
                                href={`${API_BASE}/${pet.diagnostics_url}`}
                                target="_blank" rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1 text-sm"
                              >
                                <FileText size={14} /> Diagnostics PDF
                              </a>
                            )}
                            {pet.today_visit_url && (
                              <a
                                href={`${API_BASE}/${pet.today_visit_url}`}
                                target="_blank" rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1 text-sm"
                              >
                                <FileText size={14} /> Today's Visit PDF
                              </a>
                            )}
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

      {/* Edit / Add-Pet Modal */}
      <EditModal
        ownerId={selectedOwnerId}
        petId={selectedPetId}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchOwners}
      />
    </div>
  );
};

const DetailBlock = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
      {label}
    </p>
    <p className="text-foreground text-sm">{value}</p>
  </div>
);

export default Dashboard;