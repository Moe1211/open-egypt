'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Partner } from '@/types/partner';
import { 
  Building2, 
  Trash2,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsTabProps {
  partner: Partner;
  onUpdatePartner: (updates: Partial<Partner>) => Promise<void>;
  onResetData: () => Promise<void>;
}

export function SettingsTab({ partner, onUpdatePartner, onResetData }: SettingsTabProps) {
  const [name, setName] = useState(partner.name);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Application name is required');
      return;
    }
    setIsSaving(true);
    try {
      await onUpdatePartner({ 
        name: name.trim(),
        slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + partner.id.substring(0, 4)
      });
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await onResetData();
      setShowResetDialog(false);
      toast.success('All data has been reset');
    } catch (error: any) {
      toast.error('Failed to reset data');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-white">Settings</h1>
        <p className="text-zinc-400 mt-1">
          Manage your account and application settings
        </p>
      </div>

      {/* Application Settings */}
      <Card className="glass border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Building2 className="w-5 h-5 text-primary" />
            Application Settings
          </CardTitle>
          <CardDescription className="text-zinc-500">Update your application information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="appName" className="text-zinc-300">Application Name</Label>
            <Input
              id="appName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-md bg-zinc-950 border-zinc-800 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-zinc-500">Slug</Label>
            <Input
              value={name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}
              disabled
              className="max-w-md bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed"
            />
            <p className="text-xs text-zinc-500">
              Automatically generated from your application name
            </p>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="bg-white text-black font-bold hover:bg-zinc-200">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="glass border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive text-lg">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-zinc-500">
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-950/50 border border-zinc-800">
            <div>
              <h4 className="font-medium text-white">Reset All Data</h4>
              <p className="text-sm text-zinc-500">
                Delete your partner account and all API keys.
              </p>
            </div>
            <Button 
              variant="destructive"
              onClick={() => setShowResetDialog(true)}
              className="font-bold"
            >
              Reset Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Reset All Data?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This will delete your partner account and all API keys. You'll need to go through onboarding again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReset}
              disabled={isResetting}
              className="bg-destructive text-white hover:bg-destructive/90 font-bold"
            >
              {isResetting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}