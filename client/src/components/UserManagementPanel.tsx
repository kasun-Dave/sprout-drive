import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { Shield, UserRound } from "lucide-react";

const roleLabels: Record<string, string> = {
  owner: "Admin",
  staff: "Staff",
};

function roleBadgeVariant(role: string): "default" | "secondary" {
  return role === "owner" ? "default" : "secondary";
}

export function UserManagementPanel() {
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Role updated", description: "User permissions have been saved." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-48" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Roles
        </CardTitle>
        <CardDescription>
          Admin users see the full dashboard. Staff users only see deliveries and orders.
          Sign in with any email and password — new users start as Staff until you promote them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users yet. Sign in once to create an account.</p>
        ) : (
          users.map((user) => {
            const displayName =
              user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email || "Unknown user";

            return (
              <div
                key={user.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-muted p-2">
                    {user.role === "owner" ? (
                      <Shield className="h-4 w-4 text-primary" />
                    ) : (
                      <UserRound className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{displayName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={roleBadgeVariant(user.role)}>
                    {roleLabels[user.role] ?? user.role}
                  </Badge>
                  <Select
                    value={user.role}
                    onValueChange={(role) => updateRoleMutation.mutate({ id: user.id, role })}
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="w-[140px]" data-testid={`select-role-${user.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
