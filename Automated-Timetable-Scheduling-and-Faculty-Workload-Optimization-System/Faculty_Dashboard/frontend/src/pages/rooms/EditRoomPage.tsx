import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRooms, updateRoom } from "@/lib/api";
import { Room } from "@/types/timetable";

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

export default function EditRoomPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const roomId = parseInt(id || "0");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [type, setType] = useState("LECTURE");
  const [capacity, setCapacity] = useState<number>(0);
  const [accessible, setAccessible] = useState<boolean>(true);
  const [equipment, setEquipment] = useState<string[]>([
    "Projector",
    "Whiteboard",
  ]);
  const [customEquipment, setCustomEquipment] = useState("");

  // Load room data
  useEffect(() => {
    const loadRoom = async () => {
      try {
        const rooms = await getRooms();
        const room = rooms.find((r: Room) => r.id === roomId);
        if (room) {
          setName(room.name);
          setCode(room.code);
          setBuilding(room.building);
          setFloor(room.floor);
          setType(room.type);
          setCapacity(room.capacity);
          setAccessible(room.wheelchairAccessible);
          setEquipment(room.equipment || []);
        }
      } catch (error) {
        console.error("Error loading room:", error);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      loadRoom();
    }
  }, [roomId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateRoom(roomId, {
        name,
        code,
        building,
        floor,
        type,
        capacity,
        equipment,
        wheelchairAccessible: accessible,
        active: true,
      });
      navigate("/admin/rooms");
    } catch (error) {
      console.error("Error updating room:", error);
      // TODO: show error message
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = () => {
    const payload = {
      name,
      code,
      building,
      floor,
      type,
      capacity,
      equipment,
      wheelchairAccessible: accessible,
      active: true,
      id: roomId,
      savedAt: new Date().toLocaleString(),
    };
    localStorage.setItem("room_draft", JSON.stringify(payload));
    alert("Draft saved!");
    navigate("/admin/rooms");
  };

  if (loading) {
    return (
      <AdminLayout title="Room Management" subtitle="Edit Room">
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Loading room data...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Room Management" subtitle="Edit Room">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Edit Room Configuration</h1>
            <p className="text-sm text-muted-foreground">
              Update room details for automated scheduling.
            </p>
          </div>

          <Button variant="ghost" onClick={() => navigate("/admin/rooms")}>
            ← Back to List
          </Button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8 space-y-8">

            {/* BASIC INFO */}
            <Section title="Basic Information">
              <div className="grid md:grid-cols-2 gap-8">
                <Input label="Room Name" placeholder="Physics Lab A" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Room Code" placeholder="PH-LAB-A" value={code} onChange={(e) => setCode(e.target.value)} />
                <Select label="Building" value={building} onChange={(e) => setBuilding(e.target.value)}>
                  <option value="">Select Building</option>
                  <option>Main Block</option>
                  <option>Tech Block</option>
                  <option>Science Center</option>
                </Select>
                <Input label="Floor" placeholder="Ground Floor" value={floor} onChange={(e) => setFloor(e.target.value)} />
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
            <Button type="button" variant="outline" onClick={() => navigate("/admin/rooms")}>
              Cancel
            </Button>
            <Button type="button" variant="secondary" onClick={handleSaveDraft} className="gap-2">
              <FileText className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Update Room"}
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
  ...props
}: {
  label: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select {...props} className="mt-1 w-full px-4 py-2 rounded-lg border">
        {children}
      </select>
    </div>
  );
}