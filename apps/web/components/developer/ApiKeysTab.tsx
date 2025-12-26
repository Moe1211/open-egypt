'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ApiKey } from '@/types/partner';
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  KeyRound,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ApiKeysTabProps {
  apiKeys: ApiKey[];
  onGenerateKey: () => Promise<string | void>;
  onRevokeKey: (keyId: string) => Promise<void>;
}

export function ApiKeysTab({ apiKeys, onGenerateKey, onRevokeKey }: ApiKeysTabProps) {
  const [newKey, setNewKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    try {
      const apiKey = await onGenerateKey();
      if (apiKey) {
        setNewKey(apiKey);
        toast.success('API key generated successfully');
      }
    } catch (error: any) {
      toast.error('Failed to generate key: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      toast.success('API key copied to clipboard');
    }
  };

  const handleRevokeKey = async () => {
    if (keyToRevoke) {
      setIsRevoking(true);
      try {
        await onRevokeKey(keyToRevoke);
        setKeyToRevoke(null);
        toast.success('API key revoked');
      } catch (error: any) {
        toast.error('Failed to revoke key: ' + error.message);
      } finally {
        setIsRevoking(false);
      }
    }
  };

  const activeKeys = apiKeys.filter(k => !k.is_revoked);
  const revokedKeys = apiKeys.filter(k => k.is_revoked);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">API Keys</h1>
          <p className="text-muted-foreground mt-1">
            Manage your API keys for authentication
          </p>
        </div>
        <Button 
          onClick={handleGenerateKey}
          disabled={isGenerating}
          className="gradient-primary text-primary-foreground"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          {isGenerating ? 'Generating...' : 'Create New Key'}
        </Button>
      </div>

      {/* Active Keys */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Active Keys
          </CardTitle>
          <CardDescription>
            Keys that are currently active and can be used for API requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeKeys.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">No active keys</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first API key to start making requests
              </p>
              <Button 
                onClick={handleGenerateKey}
                disabled={isGenerating}
                variant="outline"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create API Key
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key Prefix</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-mono text-sm">
                      <span className="text-muted-foreground">oeg_</span>{key.prefix}...
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(key.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setKeyToRevoke(key.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Revoked Keys */}
      {revokedKeys.length > 0 && (
        <Card className="glass opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Key className="w-5 h-5" />
              Revoked Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key Prefix</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revokedKeys.map((key) => (
                  <TableRow key={key.id} className="opacity-60">
                    <TableCell className="font-mono text-sm">
                      <span className="text-muted-foreground">oeg_</span>{key.prefix}...
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(key.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        Revoked
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* New Key Dialog */}
      <Dialog open={!!newKey} onOpenChange={() => setNewKey(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              API Key Generated
            </DialogTitle>
            <DialogDescription>
              Copy your API key now. For security reasons, it won't be shown again.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-sm text-warning">
                  Make sure to save this key somewhere safe. You won't be able to see it again!
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary font-mono text-sm break-all">
              {newKey}
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleCopyKey} className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy Key
              </Button>
              <Button variant="outline" onClick={() => setNewKey(null)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation */}
      <AlertDialog open={!!keyToRevoke} onOpenChange={() => setKeyToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Any applications using this key will no longer be able to authenticate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRevokeKey}
              disabled={isRevoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRevoking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}