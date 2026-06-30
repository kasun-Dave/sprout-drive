import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, Database, RefreshCw, ExternalLink } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type StorageInfo = {
  provider: string;
  localDbPath: string | null;
  projectId: string | null;
  consoleUrl: string | null;
  firebase: {
    enabled: boolean;
    connected: boolean;
    projectId: string | null;
    lastSyncAt: string | null;
    lastError: string | null;
    orgId: string;
    firestorePath: string;
  };
};

export function StorageInfoCard() {
  const { toast } = useToast();

  const { data, isLoading } = useQuery<StorageInfo>({
    queryKey: ["/api/system/storage"],
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/system/storage/sync");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/storage"] });
      toast({ title: "Synced", description: "Local data pushed to Firebase Firestore." });
    },
    onError: (error: Error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading || !data) return null;

  const providerLabel =
    data.provider === "firebase+local"
      ? "Firebase + Local JSON"
      : data.provider === "local-json"
        ? "Local JSON only"
        : data.provider;

  return (
    <Card data-testid="card-storage-info">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5 text-primary" />
          Enterprise Storage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">Provider:</span>
          <Badge variant="secondary">{providerLabel}</Badge>
          {data.firebase.connected && (
            <Badge className="bg-green-600">Cloud connected</Badge>
          )}
          {data.firebase.enabled && !data.firebase.connected && (
            <Badge variant="destructive">Cloud offline</Badge>
          )}
        </div>

        {data.localDbPath && (
          <p>
            <span className="text-muted-foreground">Local backup: </span>
            <code className="text-xs bg-muted px-1 py-0.5 rounded">{data.localDbPath}</code>
          </p>
        )}

        {data.firebase.enabled ? (
          <>
            <p>
              <span className="text-muted-foreground">Firestore path: </span>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">{data.firebase.firestorePath}</code>
            </p>
            {data.firebase.lastSyncAt && (
              <p className="text-muted-foreground">
                Last cloud sync: {new Date(data.firebase.lastSyncAt).toLocaleString()}
              </p>
            )}
            {data.firebase.lastError && (
              <p className="text-destructive text-xs">{data.firebase.lastError}</p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">
            Add Firebase credentials in <code>.env</code> to enable cloud sync.
            See <code>docs/FIREBASE_SETUP.md</code>.
          </p>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 flex flex-wrap gap-2">
        {data.firebase.enabled && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            data-testid="button-sync-firebase"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            Sync to Firebase
          </Button>
        )}
        {data.consoleUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={data.consoleUrl} target="_blank" rel="noopener noreferrer">
              <Cloud className="h-4 w-4 mr-2" />
              Firebase Console
              <ExternalLink className="h-3 w-3 ml-2" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
