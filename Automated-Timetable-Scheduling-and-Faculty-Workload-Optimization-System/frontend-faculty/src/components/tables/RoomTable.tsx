import { Room } from '@/types/timetable';
import { cn } from '@/lib/utils';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
  MoreHorizontal,
  Users,
  Building2,
  Edit,
  Trash2,
  Calendar,
  Accessibility,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface RoomTableProps {
  rooms: Room[];
  onEdit?: (room: Room) => void;
  onDelete?: (room: Room) => void;
  onViewSchedule?: (room: Room) => void;
  className?: string;
}

const roomTypeConfig = {
  LECTURE: {
    label: 'Lecture Hall',
    class: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  },
  LAB: {
    label: 'Laboratory',
    class: 'bg-violet-500/10 text-violet-700 border-violet-500/30',
  },
  SEMINAR: {
    label: 'Seminar Room',
    class: 'bg-teal-500/10 text-teal-700 border-teal-500/30',
  },
};


export function RoomTable({
  rooms,
  onEdit,
  onDelete,
  onViewSchedule,
  className,
}: RoomTableProps) {
  return (
    <div className={cn('rounded-xl border bg-card shadow-sm overflow-hidden', className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[250px]">Room</TableHead>
            <TableHead>Building</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-center">Capacity</TableHead>
            <TableHead>Equipment</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-[70px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {rooms.map((room) => {
            const typeConfig = roomTypeConfig[room.type] ?? {
              label: room.type,
              class: '',
            };


            return (
              <TableRow key={room.id} className="group">
                {/* Room */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{room.name}</p>
                      <p className="text-sm text-muted-foreground">{room.code}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Building */}
                <TableCell>
                  <span className="text-sm">
                    {room.building}, Floor {room.floor}
                  </span>
                </TableCell>

                {/* Type */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn('font-medium', typeConfig.class)}
                  >
                    {typeConfig.label}
                  </Badge>
                </TableCell>

                {/* Capacity */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{room.capacity}</span>
                  </div>
                </TableCell>

                {/* Equipment */}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(room.equipment ?? []).slice(0, 2).map((item) => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}

                    {(room.equipment?.length ?? 0) > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{room.equipment.length - 2}
                      </Badge>
                    )}

                  </div>
                </TableCell>

                {/* Status + Accessibility */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-medium',
                        room.active
                          ? 'status-active'
                          : 'status-inactive'
                      )}
                    >
                      {room.active ? 'Available' : 'Unavailable'}
                    </Badge>

                    {room.wheelchairAccessible && (
                      <div title="Wheelchair Accessible">
                        <Accessibility
                          className="h-4 w-4 text-primary"
                          aria-label="Wheelchair Accessible"
                        />
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onViewSchedule?.(room)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        View Schedule
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => onEdit?.(room)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Details
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => onDelete?.(room)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Room
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
