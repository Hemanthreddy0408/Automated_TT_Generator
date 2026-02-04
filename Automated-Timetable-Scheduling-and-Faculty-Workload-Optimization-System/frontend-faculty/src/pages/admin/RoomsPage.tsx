import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getRooms, deleteRoom } from "@/lib/api";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { RoomTable } from "@/components/tables/RoomTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Room } from "@/types/timetable";

import {
  Plus,
  Search,
  Filter,
  Download,
  Building2,
  Users,
  FlaskConical,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

console.log("Rooms page loaded");

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

export default function RoomsPage() {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  // Draft State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [draft, setDraft] = useState<any>(null);

  // ---------------- FETCH ROOMS ----------------
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms();
        console.log("Rooms from API:", data);
        setRooms(data);
      } catch (err) {
        console.error("Failed to fetch rooms", err);
      } finally {
        setLoading(false);
      }
    };

    const savedDraft = localStorage.getItem("room_draft");
    if (savedDraft) {
      try {
        setDraft(JSON.parse(savedDraft));
      } catch (e) {
        console.error("Error parsing room draft:", e);
        localStorage.removeItem("room_draft");
      }
    }

    fetchRooms();
  }, []);

  // ---------------- DRAFT HANDLERS ----------------
  const handleDiscardDraft = () => {
    if (confirm("Are you sure you want to discard this unsaved draft?")) {
      localStorage.removeItem("room_draft");
      setDraft(null);
    }
  };

  const handleResumeDraft = () => {
    navigate("/admin/rooms/add", { state: draft });
  };
  console.log("ROOMS STATE:", rooms);
  // ---------------- FILTER LOGIC ----------------
  const filteredRooms = (rooms || []).filter((room) => {
    if (!room) return false;

    const name = room.name?.toLowerCase() || "";
    const code = room.code?.toLowerCase() || "";
    const building = room.building?.toLowerCase() || "";
    const search = searchQuery.toLowerCase();

    const matchesSearch = name.includes(search) || code.includes(search) || building.includes(search);
    const matchesType = typeFilter === "all" || room.type === typeFilter;
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && room.active) ||
      (statusFilter === "inactive" && !room.active);

    return matchesSearch && matchesType && matchesStatus;
  });
  const exportToCSV = () => {
    const headers = "Name,Code,Building,Floor,Type,Capacity,Status\n";
    const data = filteredRooms.map(r =>
      `${r.name},${r.code},${r.building},${r.floor},${r.type},${r.capacity},${r.active ? 'Active' : 'Inactive'}`
    ).join("\n");

    const csvContent = headers + data;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rooms-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ---------------- DELETE HANDLERS ----------------
  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return;

    try {
      await deleteRoom(roomToDelete.id);
      setRooms(rooms.filter(r => r.id !== roomToDelete.id));
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
    } catch (err) {
      console.error("Failed to delete room", err);
    }
  };
  // ---------------- STATS ----------------
  const totalCapacity = rooms
    .filter((r) => r.active)
    .reduce((sum, r) => sum + r.capacity, 0);

  const lectureRooms = rooms.filter(
    (r) => r.type === "LECTURE" && r.active
  ).length;

  const labRooms = rooms.filter(
    (r) => r.type === "LAB" && r.active
  ).length;

  return (
    <AdminLayout
      title="Room Management"
      subtitle="Manage classrooms, labs, and other venues"
      actions={
        <Button onClick={() => navigate("/admin/rooms/add")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      }
    >
      <div className="space-y-6">

        {/* ---------------- DRAFT BANNER ---------------- */}
        {draft && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-full border border-blue-100 text-blue-600 shadow-sm">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">Unsaved Room Draft Found</h4>
                <p className="text-sm text-blue-700 mt-0.5">
                  You have an unsaved configuration for <span className="font-medium">{draft.name || "New Room"}</span>.
                  <span className="opacity-70 ml-2 text-xs">Last saved: {draft.savedAt}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleDiscardDraft} className="text-red-600 border-red-200 bg-white">
                Discard
              </Button>
              <Button size="sm" onClick={handleResumeDraft} className="bg-[#0f172a] text-white">
                Resume Editing
              </Button>
            </div>
          </div>
        )}

        {/* ---------------- QUICK STATS ---------------- */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard icon={<Building2 />} value={rooms.length} label="Total Rooms" />
          <StatCard icon={<Building2 />} value={lectureRooms} label="Lecture Halls" />
          <StatCard icon={<FlaskConical />} value={labRooms} label="Laboratories" />
          <StatCard icon={<Users />} value={totalCapacity} label="Total Capacity" />
        </div>

        {/* ---------------- FILTERS ---------------- */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or building..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="LECTURE">Lecture</SelectItem>
              <SelectItem value="LAB">Lab</SelectItem>
              <SelectItem value="SEMINAR">Seminar</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Available</SelectItem>
              <SelectItem value="inactive">Unavailable</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* ---------------- RESULT INFO ---------------- */}
        <Badge variant="secondary">
          {filteredRooms.length} rooms
        </Badge>

        {/* ---------------- TABLE ---------------- */}
        <RoomTable
          rooms={filteredRooms}
          onEdit={(room) => navigate(`/admin/rooms/edit/${room.id}`)}
          onDelete={handleDeleteClick}
          onViewSchedule={(room) => console.log("Schedule:", room)}
        />

        {/* ---------------- DELETE CONFIRMATION DIALOG ---------------- */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Room</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{roomToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
/* ---------------- SMALL STAT CARD ---------------- */
function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

}