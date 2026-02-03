import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createRoom, updateRoom } from "@/lib/api";

import {
  Save,
  Users,
  Video,
  Edit3,
  Monitor,
  Wind,
  FlaskConical,
  Plus,
  Info,
  FileText,
} from "lucide-react";

/* ----------------------------------
   Equipment Config
----------------------------------- */
const EQUIPMENT_OPTIONS = [
  { label: "Projector", icon: Video },
  { label: "Whiteboard", icon: Edit3 },
  { label: "Computers", icon: Monitor },
  { label: "Air Conditioning", icon: Wind },
  { label: "Lab Equipment", icon: FlaskConical },
];

export default function AddRoomPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state;

  // ---------------- STATE ----------------
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [type, setType] = useState("LECTURE");
  const [capacity, setCapacity] = useState<number>(0);
  const [accessible, setAccessible] = useState<boolean>(true);
  const [equipment, setEquipment] = useState<string[]>(["Projector", "Whiteboard"]);
  const [customEquipment, setCustomEquipment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Data (Edit or Draft)
  useEffect(() => {
    if (editData) {
      loadState(editData);
    } else {
      const draft = localStorage.getItem("room_draft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (confirm(`Unsaved draft for "${parsed.name || "New Room"}" found. Load it?`)) {
            loadState(parsed);
          }
        } catch (e) {
          console.error("Error parsing room draft:", e);
          localStorage.removeItem("room_draft");
        }
      }
    }
  }, [editData]);

  const loadState = (data: any) => {
    setName(data.name || "");
    setCode(data.code || "");
    setBuilding(data.building || "");
    setFloor(data.floor || "");
    setType(data.type || "LECTURE");
    setCapacity(data.capacity || 0);
    setAccessible(data.wheelchairAccessible ?? true);
    setEquipment(data.equipment || ["Projector", "Whiteboard"]);
  };

  const buildPayload = (status: "PUBLISHED" | "DRAFT" = "PUBLISHED") => ({
    name,
    code,
    building,
    floor,
    type,
    capacity,
    equipment,
    wheelchairAccessible: accessible,
    active: true,
    status: status,
    savedAt: new Date().toLocaleString(),
  });

  // ---------------- HANDLERS ----------------
  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const addCustomEquipment = () => {
    if (!customEquipment.trim()) return;
    if (!equipment.includes(customEquipment)) {
      setEquipment((prev) => [...prev, customEquipment]);
    }
    setCustomEquipment("");
  };

  const handleSaveDraft = () => {
    const payload = buildPayload("DRAFT");
    localStorage.setItem("room_draft", JSON.stringify(payload));
    alert("Local draft saved!");
    navigate("/admin/rooms");
  };

  const handleSave = async (e: React.FormEvent, status: "PUBLISHED" | "DRAFT" = "PUBLISHED") => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = buildPayload(status);
    try {
      if (editData?.id) {
        await updateRoom(editData.id, payload);
      } else {
        await createRoom(payload);
      }
      localStorage.removeItem("room_draft");
      navigate("/admin/rooms");
    } catch (error) {
      console.error("Error saving room:", error);
      alert("Failed to save room.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Room Management" subtitle="Add New Room">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Add New Room Configuration</h1>
            <p className="text-sm text-muted-foreground">
              Configure room details for automated scheduling.
            </p>
          </div>

          <Button variant="ghost" onClick={() => navigate("/admin/rooms")}>
            ← Back to List
          </Button>
        </div>

        {/* FORM */}
        <form className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8 space-y-8">
            {/* BASIC INFO */}
            <Section title="Basic Information">
              <div className="grid md:grid-cols-2 gap-8">
                <Input
                  label="Room Name"
                  placeholder="Physics Lab A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Room Code"
                  placeholder="PH-LAB-A"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <Select
                  label="Building"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                >
                  <option value="">Select Building</option>
                  <option>Main Block</option>
                  <option>Tech Block</option>
                  <option>Science Center</option>
                </Select>
                <Input
                  label="Floor"
                  placeholder="Ground Floor"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                />
              </div>
            </Section>

            {/* ROOM DETAILS */}
            <Section title="Room Details">
              <div className="grid md:grid-cols-2 gap-8">
                <Select label="Room Type" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="LECTURE">Lecture Hall</option>
                  <option value="LAB">Laboratory</option>
                  <option value="SEMINAR">Seminar Room</option>
                </Select>

                <div>
                  <label className="text-sm font-medium">Total Capacity</label>
                  <div className="relative mt-1">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(+e.target.value)}
                      className="w-full pl-9 px-4 py-2 rounded-lg border bg-background"
                    />
                  </div>
                </div>
              </div>
            </Section>

            {/* EQUIPMENT & FEATURES */}
            <Section title="Equipment & Features">
              <div className="flex flex-wrap gap-3">
                {EQUIPMENT_OPTIONS.map(({ label, icon: Icon }) => {
                  const active = equipment.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleEquipment(label)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all",
                        active
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background hover:border-primary/40"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  );
                })}

                <div className="flex items-center gap-2">
                  <input
                    value={customEquipment}
                    onChange={(e) => setCustomEquipment(e.target.value)}
                    placeholder="Add other"
                    className="px-3 py-2 rounded-full border text-sm w-32 bg-background"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="rounded-full h-9 w-9"
                    onClick={addCustomEquipment}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Section>

            {/* ACCESSIBILITY */}
            <div className="flex justify-between items-center p-4 rounded-xl bg-muted/50">
              <div className="flex gap-3">
                <Info className="text-primary h-5 w-5" />
                <div>
                  <p className="font-semibold text-sm">Wheelchair Accessible</p>
                  <p className="text-xs text-muted-foreground">
                    Mark this room for accessibility-aware scheduling.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={accessible}
                onChange={() => setAccessible(!accessible)}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-8 py-6 border-t bg-muted/20 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/rooms")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              <FileText className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              type="submit"
              className="gap-2"
              onClick={(e) => handleSave(e, "PUBLISHED")}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : editData?.id ? "Update Room" : "Save Room"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

/* ----------------- REUSABLE UI ----------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold border-b pb-2">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <input {...props} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
    </div>
  );
}

function Select({
  label,
  children,
  ...props
}: {
  label: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium leading-none">{label}</label>
      <select
        {...props}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {children}
      </select>
    </div>
  );
}