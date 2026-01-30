import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { RoomTable } from '@/components/tables/RoomTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockRooms } from '@/data/mockData';
import { Plus, Search, Filter, Download, Building2, Users, FlaskConical } from 'lucide-react';
import { useNavigate } from "react-router-dom";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RoomsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRooms = mockRooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && room.isActive) ||
      (statusFilter === 'inactive' && !room.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalCapacity = mockRooms.filter(r => r.isActive).reduce((sum, r) => sum + r.capacity, 0);
  const lectureRooms = mockRooms.filter(r => r.type === 'lecture' && r.isActive).length;
  const labRooms = mockRooms.filter(r => r.type === 'lab' && r.isActive).length;

  return (
    <AdminLayout
      title="Room Management"
      subtitle="Manage classrooms, labs, and other venues"
      actions={
        <Button onClick={() => navigate("/admin/rooms/add")}>
          + Add Room
        </Button>

      }
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockRooms.length}</p>
                <p className="text-sm text-muted-foreground">Total Rooms</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lectureRooms}</p>
                <p className="text-sm text-muted-foreground">Lecture Halls</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
                <FlaskConical className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{labRooms}</p>
                <p className="text-sm text-muted-foreground">Laboratories</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCapacity}</p>
                <p className="text-sm text-muted-foreground">Total Capacity</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
              <SelectItem value="lecture">Lecture Hall</SelectItem>
              <SelectItem value="lab">Laboratory</SelectItem>
              <SelectItem value="seminar">Seminar Room</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Available</SelectItem>
              <SelectItem value="inactive">Unavailable</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Results Info */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {filteredRooms.length} rooms
          </Badge>
          {searchQuery && (
            <span className="text-sm text-muted-foreground">
              matching "{searchQuery}"
            </span>
          )}
        </div>

        {/* Room Table */}
        <RoomTable
          rooms={filteredRooms}
          onEdit={(room) => console.log('Edit:', room)}
          onDelete={(room) => console.log('Delete:', room)}
          onViewSchedule={(room) => console.log('View schedule:', room)}
        />
      </div>
    </AdminLayout>
  );
}
