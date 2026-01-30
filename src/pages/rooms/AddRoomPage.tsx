import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  const [capacity, setCapacity] = useState<number>(0);
  const [accessible, setAccessible] = useState<boolean>(true);
  const [equipment, setEquipment] = useState<string[]>([
    "Projector",
    "Whiteboard",
  ]);
  const [customEquipment, setCustomEquipment] = useState("");

  /* ----------------------------------
     Equipment Toggle
  ----------------------------------- */
  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item)
        ? prev.filter((e) => e !== item)
        : [...prev, item]
    );
  };

  const addCustomEquipment = () => {
    if (!customEquipment.trim()) return;
    if (!equipment.includes(customEquipment)) {
      setEquipment((prev) => [...prev, customEquipment]);
    }
    setCustomEquipment("");
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
                <Input label="Room Name" placeholder="Physics Lab A" />
                <Input label="Room Code" placeholder="PH-LAB-A" />
                <Select label="Building">
                  <option>Main Block</option>
                  <option>Tech Block</option>
                  <option>Science Center</option>
                </Select>
                <Input label="Floor" placeholder="Ground Floor" />
              </div>
            </Section>

            {/* ROOM DETAILS */}
            <Section title="Room Details">
              <div className="grid md:grid-cols-2 gap-8">
                <Select label="Room Type">
                  <option value="lecture">Lecture Hall</option>
                  <option value="lab">Laboratory</option>
                  <option value="seminar">Seminar Room</option>
                </Select>

                <div>
                  <label className="text-sm font-medium">Total Capacity</label>
                  <div className="relative mt-1">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(+e.target.value)}
                      className="w-full pl-9 px-4 py-2 rounded-lg border"
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

                {/* ADD OTHER */}
                <div className="flex items-center gap-2">
                  <input
                    value={customEquipment}
                    onChange={(e) => setCustomEquipment(e.target.value)}
                    placeholder="Add other"
                    className="px-3 py-2 rounded-full border text-sm w-32"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={addCustomEquipment}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Section>

            {/* ACCESSIBILITY */}
            <div className="flex justify-between items-center p-4 rounded-xl bg-muted">
              <div className="flex gap-3">
                <Info className="text-primary" />
                <div>
                  <p className="font-semibold">Wheelchair Accessible</p>
                  <p className="text-xs text-muted-foreground">
                    Mark this room for accessibility-aware scheduling.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={accessible}
                onChange={() => setAccessible(!accessible)}
                className="toggle"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-8 py-6 border-t bg-muted/40 flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate("/admin/rooms")}>
              Cancel
            </Button>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Save Room
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

/* ----------------- REUSABLE UI ----------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">{title}</h2>
      {children}
    </div>
  );
}

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        {...props}
        className="mt-1 w-full px-4 py-2 rounded-lg border"
      />
    </div>
  );
}

function Select({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select className="mt-1 w-full px-4 py-2 rounded-lg border">
        {children}
      </select>
    </div>
  );
}
