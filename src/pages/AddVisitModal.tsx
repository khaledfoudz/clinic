import { useState, useRef } from "react";
import { X, CalendarIcon, Paperclip, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarWithDropdowns as Calendar } from "@/components/ui/calendar-with-dropdowns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface Visit {
  visit_id?: number;
  visit_date?: string;
  spayed_neutered?: string;
  weight_kg?: number;
  diagnostics_url?: string;
  what_was_done_today?: string;
  diagnosis?: string;
  treatment?: string;
  today_visit_url?: string;
  follow_up_date?: string;
}

interface AddVisitModalProps {
  petId:     number | null;
  petName:   string;
  visit:     Visit | null;   // null = add mode, Visit = edit mode
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

const AddVisitModal = ({ petId, petName, visit, isOpen, onClose, onSuccess }: AddVisitModalProps) => {
  const isEditMode = visit !== null;

  const [visitDate,        setVisitDate]        = useState<Date | undefined>(visit?.visit_date ? new Date(visit.visit_date) : new Date());
  const [spayedNeutered,   setSpayedNeutered]   = useState(visit?.spayed_neutered?.toLowerCase() || "");
  const [weightKg,         setWeightKg]         = useState(visit?.weight_kg?.toString() || "");
  const [whatDoneToday,    setWhatDoneToday]     = useState(visit?.what_was_done_today || "");
  const [diagnosis,        setDiagnosis]         = useState(visit?.diagnosis || "");
  const [treatment,        setTreatment]         = useState(visit?.treatment || "");
  const [followUpDate,     setFollowUpDate]      = useState<Date | undefined>(visit?.follow_up_date ? new Date(visit.follow_up_date) : undefined);
  const [diagnosticsFile,  setDiagnosticsFile]   = useState<File | null>(null);
  const [todayVisitFile,   setTodayVisitFile]    = useState<File | null>(null);
  const [isSubmitting,     setIsSubmitting]      = useState(false);

  const whatDoneRef   = useRef<HTMLTextAreaElement>(null);
  const diagnosisRef  = useRef<HTMLTextAreaElement>(null);
  const treatmentRef  = useRef<HTMLTextAreaElement>(null);
  const weightRef     = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      if (visitDate)       fd.append("visit_date",          format(visitDate, "yyyy-MM-dd"));
      if (spayedNeutered)  fd.append("spayed_neutered",     spayedNeutered === "yes" ? "Yes" : "No");
      if (weightKg)        fd.append("weight_kg",           weightKg);
      if (whatDoneToday)   fd.append("what_was_done_today", whatDoneToday);
      if (diagnosis)       fd.append("diagnosis",           diagnosis);
      if (treatment)       fd.append("treatment",           treatment);
      if (followUpDate)    fd.append("follow_up_date",      format(followUpDate, "yyyy-MM-dd"));
      if (diagnosticsFile) fd.append("diagnostics",         diagnosticsFile);
      if (todayVisitFile)  fd.append("today_visit",         todayVisitFile);

      const url    = isEditMode ? `${API_BASE}/api/visits/${visit!.visit_id}` : `${API_BASE}/api/pets/${petId}/visits`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save visit");
      }

      toast.success(isEditMode ? "Visit updated successfully" : "Visit added successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold">{isEditMode ? "Edit Visit" : "Add New Visit"}</h2>
            <p className="text-sm text-muted-foreground">Patient: {petName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Visit Date */}
            <div className="space-y-2">
              <Label>Visit Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !visitDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {visitDate ? format(visitDate, "PPP") : "Pick visit date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={visitDate} onSelect={setVisitDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            {/* Spayed / Neutered */}
            <div className="space-y-2">
              <Label>Spayed / Neutered</Label>
              <Select value={spayedNeutered} onValueChange={setSpayedNeutered}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input ref={weightRef} type="number" min="0" step="0.1" placeholder="e.g. 4.5" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </div>

            {/* Diagnostics */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Paperclip size={14} /> Diagnostics (PDF / Image)</Label>
              <Input type="file" accept=".pdf,image/*" onChange={(e) => setDiagnosticsFile(e.target.files?.[0] || null)} />
              {isEditMode && visit?.diagnostics_url && !diagnosticsFile && (
                <p className="text-xs text-muted-foreground">Existing file available (upload to replace)</p>
              )}
            </div>

            {/* What was done */}
            <div className="space-y-2">
              <Label>What was done today</Label>
              <Textarea ref={whatDoneRef} placeholder="Examination, procedures performed..." rows={3} value={whatDoneToday} onChange={(e) => setWhatDoneToday(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); diagnosisRef.current?.focus(); } }} />
            </div>

            {/* Diagnosis */}
            <div className="space-y-2">
              <Label>Diagnosis</Label>
              <Textarea ref={diagnosisRef} placeholder="Diagnosis details..." rows={3} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); treatmentRef.current?.focus(); } }} />
            </div>

            {/* Treatment */}
            <div className="space-y-2">
              <Label>Treatment</Label>
              <Textarea ref={treatmentRef} placeholder="Prescribed treatment, medications..." rows={3} value={treatment} onChange={(e) => setTreatment(e.target.value)} />
            </div>

            {/* Follow-up Date */}
            <div className="space-y-2">
              <Label>Follow-up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !followUpDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {followUpDate ? format(followUpDate, "PPP") : "Pick follow-up date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={followUpDate} onSelect={setFollowUpDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            {/* Today's Visit Attachment */}
            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-1"><Paperclip size={14} /> Today's Visit Attachment (PDF / Image)</Label>
              <Input type="file" accept=".pdf,image/*" onChange={(e) => setTodayVisitFile(e.target.files?.[0] || null)} />
              {isEditMode && visit?.today_visit_url && !todayVisitFile && (
                <p className="text-xs text-muted-foreground">Existing file available (upload to replace)</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-accent text-accent-foreground">
              {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Add Visit"}
              <Check size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVisitModal;