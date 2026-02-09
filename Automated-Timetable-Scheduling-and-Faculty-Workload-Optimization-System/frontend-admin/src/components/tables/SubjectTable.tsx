import { Subject } from '@/types/timetable';
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
import { MoreHorizontal, BookOpen, FlaskConical, Users, Edit, Trash2, GraduationCap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface SubjectTableProps {
  subjects: Subject[];
  onEdit?: (subject: Subject) => void;
  onDelete?: (subject: Subject) => void;
  className?: string;
}

export function SubjectTable({
  subjects,
  onEdit,
  onDelete,
  className,
}: SubjectTableProps) {
  return (
    <div className={cn('rounded-xl border bg-card shadow-sm overflow-hidden', className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[300px]">Subject</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="text-center">Credits</TableHead>
            <TableHead className="text-center">Year</TableHead>
            <TableHead className="text-center">Weekly Hours</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-center">Faculty</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((subject) => (
            <TableRow key={subject.id} className="group">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{subject.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">{subject.code}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{subject.department}</span>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="font-semibold">
                  {subject.credits}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <span className="font-semibold">{subject.year}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-3 text-xs">
                  <div className="flex items-center gap-1 text-blue-600">
                    <BookOpen className="h-3 w-3" />
                    <span>{subject.lectureHoursPerWeek}L</span>
                  </div>
                  <div className="flex items-center gap-1 text-teal-600">
                    <Users className="h-3 w-3" />
                    <span>{subject.tutorialHoursPerWeek}T</span>
                  </div>
                  <div className="flex items-center gap-1 text-violet-600">
                    <FlaskConical className="h-3 w-3" />
                    <span>{subject.labHoursPerWeek}P</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className={cn(
                    'font-medium',
                    subject.elective
                      ? 'bg-warning/10 text-warning border-warning/30'
                      : 'bg-primary/10 text-primary border-primary/30'
                  )}
                >
                  {subject.elective ? 'Elective' : 'Core'}
                </Badge>
                {subject.commonCourse && (
                  <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 border-blue-200">
                    Common
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm">
                  <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{subject.eligibleFaculty?.length || 0}</span>
                </div>
              </TableCell>
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
                    <DropdownMenuItem onClick={() => onEdit?.(subject)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Subject
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete?.(subject)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Subject
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
