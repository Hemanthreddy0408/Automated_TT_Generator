import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getRooms } from "@/lib/api";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { RoomTable } from "@/components/tables/RoomTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

    fetchRooms();
  }, []);
  console.log("ROOMS STATE:", rooms);
  // ---------------- FILTER LOGIC ----------------
 const filteredRooms = rooms.filter((room) => {
  const matchesSearch =
  (room.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
  (room.code ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
  (room.building ?? "").toLowerCase().includes(searchQuery.toLowerCase());


  const matchesType =
    typeFilter === "all" || room.type === typeFilter;

  const matchesStatus =
    statusFilter === "all" ||
    (statusFilter === "active" && room.active) ||
    (statusFilter === "inactive" && !room.active);

  return matchesSearch && matchesType && matchesStatus;
});


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

          <Button variant="outline">
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
          onDelete={(room) => console.log("Delete:", room)}
          onViewSchedule={(room) => console.log("Schedule:", room)}
        />
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