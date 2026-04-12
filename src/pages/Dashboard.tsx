import { useState } from "react";
import { Search, PawPrint, Phone, MapPin, Calendar, Stethoscope, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const sampleRecords = [
  {
    id: 1,
    petName: "Buddy",
    type: "Dog",
    gender: "Male",
    birthdate: "2020-03-15",
    spayedNeutered: "Yes",
    ownerName: "Ahmed Mohamed",
    mobile: "+20 100 123 4567",
    address: "15 El-Tahrir St, Cairo",
    diseaseHistory: "Skin allergy — treated with antihistamines",
    vaccinationHistory: "Rabies (2024), DHPP (2024), Bordetella (2023)",
    todayExam: "Full body examination, blood work",
    diagnosis: "Mild ear infection (left ear)",
    treatment: "Ear drops — Otomax, 2x daily for 10 days",
    followUp: "2026-04-25",
  },
  {
    id: 2,
    petName: "Luna",
    type: "Cat",
    gender: "Female",
    birthdate: "2021-07-10",
    spayedNeutered: "Yes",
    ownerName: "Sara Khalil",
    mobile: "+20 111 987 6543",
    address: "22 Nasr City, Cairo",
    diseaseHistory: "No prior diseases",
    vaccinationHistory: "FVRCP (2024), Rabies (2024)",
    todayExam: "Routine checkup, dental exam",
    diagnosis: "Mild tartar buildup",
    treatment: "Dental cleaning recommended, dental diet advised",
    followUp: "2026-05-10",
  },
  {
    id: 3,
    petName: "Max",
    type: "Dog",
    gender: "Male",
    birthdate: "2019-01-22",
    spayedNeutered: "No",
    ownerName: "Omar Hassan",
    mobile: "+20 122 555 8899",
    address: "8 Maadi, Cairo",
    diseaseHistory: "Hip dysplasia — managed with supplements",
    vaccinationHistory: "Rabies (2025), DHPP (2025)",
    todayExam: "X-ray of hips, mobility assessment",
    diagnosis: "Progressive hip dysplasia, Grade II",
    treatment: "Glucosamine supplement, weight management plan",
    followUp: "2026-05-01",
  },
  {
    id: 4,
    petName: "Milo",
    type: "Cat",
    gender: "Male",
    birthdate: "2022-11-05",
    spayedNeutered: "Yes",
    ownerName: "Sara Khalil",
    mobile: "+20 111 987 6543",
    address: "22 Nasr City, Cairo",
    diseaseHistory: "Feline lower urinary tract disease (FLUTD)",
    vaccinationHistory: "FVRCP (2024)",
    todayExam: "Urinalysis, abdominal palpation",
    diagnosis: "Recurrent FLUTD episode",
    treatment: "Prescription urinary diet, increased water intake",
    followUp: "2026-04-20",
  },
  {
    id: 5,
    petName: "Bella",
    type: "Dog",
    gender: "Female",
    birthdate: "2023-05-18",
    spayedNeutered: "No",
    ownerName: "Nadia Fathi",
    mobile: "+20 100 222 3344",
    address: "5 Heliopolis, Cairo",
    diseaseHistory: "Parvovirus — recovered (2023)",
    vaccinationHistory: "Rabies (2025), DHPP (2025), Bordetella (2025)",
    todayExam: "Vaccination booster, general checkup",
    diagnosis: "Healthy — no issues found",
    treatment: "Booster vaccines administered",
    followUp: "2026-10-18",
  },
];

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("petName");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = sampleRecords.filter((r) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    if (searchType === "petName") return r.petName.toLowerCase().includes(q);
    if (searchType === "ownerName") return r.ownerName.toLowerCase().includes(q);
    if (searchType === "mobile") return r.mobile.includes(q);
    return true;
  });

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
                          {r.petName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {r.type === "Cat" ? "🐱" : "🐶"} {r.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.ownerName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.mobile}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">{r.diagnosis}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-xs">
                          {r.followUp}
                        </Badge>
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
                        <TableCell colSpan={7} className="bg-muted/20 p-0">
                          <div className="p-6 grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <DetailBlock label="Gender" value={r.gender} />
                            <DetailBlock label="Birthdate" value={r.birthdate} />
                            <DetailBlock label="Spayed/Neutered" value={r.spayedNeutered} />
                            <DetailBlock label="Address" value={r.address} />
                            <DetailBlock label="Disease History" value={r.diseaseHistory} />
                            <DetailBlock label="Vaccination History" value={r.vaccinationHistory} />
                            <DetailBlock label="Today's Exam" value={r.todayExam} />
                            <DetailBlock label="Treatment" value={r.treatment} />
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
                        <p className="font-semibold text-foreground">{r.petName}</p>
                        <p className="text-xs text-muted-foreground">{r.ownerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-normal">
                        {r.type === "Cat" ? "🐱" : "🐶"} {r.type}
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
                      <Phone size={10} className="mr-1" /> {r.mobile}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-normal">
                      <Calendar size={10} className="mr-1" /> {r.followUp}
                    </Badge>
                  </div>
                </button>

                {expandedId === r.id && (
                  <div className="border-t border-border p-4 bg-muted/20 space-y-3">
                    <DetailBlock label="Gender" value={`${r.gender} · ${r.spayedNeutered === "Yes" ? "Spayed/Neutered" : "Intact"}`} />
                    <DetailBlock label="Birthdate" value={r.birthdate} />
                    <DetailBlock label="Address" value={r.address} />
                    <Separator />
                    <DetailBlock label="Disease History" value={r.diseaseHistory} />
                    <DetailBlock label="Vaccination History" value={r.vaccinationHistory} />
                    <Separator />
                    <DetailBlock label="Today's Exam" value={r.todayExam} />
                    <DetailBlock label="Diagnosis" value={r.diagnosis} />
                    <DetailBlock label="Treatment" value={r.treatment} />
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
