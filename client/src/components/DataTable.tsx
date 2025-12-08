import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, LucideIcon } from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title: string;
  icon: LucideIcon;
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchKey?: keyof T;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  addButtonLabel?: string;
  formContent?: React.ReactNode;
  idKey?: keyof T;
}

export function DataTable<T extends Record<string, any>>({
  title,
  icon: Icon,
  data,
  columns,
  searchable = true,
  searchKey,
  onAdd,
  onEdit,
  onDelete,
  addButtonLabel = "Add New",
  formContent,
  idKey = "id" as keyof T,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredData = searchable && searchKey
    ? data.filter((item) =>
        String(item[searchKey]).toLowerCase().includes(search.toLowerCase())
      )
    : data;

  return (
    <Card data-testid={`card-datatable-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-3 flex-wrap">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-[200px]"
                  data-testid="input-search"
                />
              </div>
            )}
            {onAdd && (
              formContent ? (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="default" data-testid="button-add-new">
                      <Plus className="h-4 w-4 mr-2" />
                      {addButtonLabel}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{addButtonLabel}</DialogTitle>
                    </DialogHeader>
                    {formContent}
                  </DialogContent>
                </Dialog>
              ) : (
                <Button size="default" onClick={onAdd} data-testid="button-add-new">
                  <Plus className="h-4 w-4 mr-2" />
                  {addButtonLabel}
                </Button>
              )
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={String(col.key)}>{col.header}</TableHead>
                ))}
                {(onEdit || onDelete) && (
                  <TableHead className="w-[100px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, idx) => (
                <TableRow key={String(item[idKey]) || idx} data-testid={`row-${String(item[idKey]) || idx}`}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {col.render
                        ? col.render(item)
                        : String(item[col.key as keyof T] ?? "")}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                            data-testid={`button-edit-${String(item[idKey])}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item)}
                            data-testid={`button-delete-${String(item[idKey])}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
