import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VendorKey {
  id: string;
  vendor: string;
  scope: string | null;
  key_value: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const VendorKeyManagement: React.FC = () => {
  const [vendorKeys, setVendorKeys] = useState<VendorKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<VendorKey | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    vendor: '',
    scope: '',
    key_value: ''
  });

  const vendors = [
    'openai',
    'finnhub', 
    'polygon',
    'benzinga',
    'quiver',
    'stripe',
    'discord'
  ];

  useEffect(() => {
    loadVendorKeys();
  }, []);

  const loadVendorKeys = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('vendor_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendor keys:', error);
        toast.error('Failed to load vendor keys');
        setVendorKeys([]);
      } else {
        // Transform data to match component interface
        const transformedKeys = (data || []).map(config => ({
          id: config.vendor + '_' + (config.scope || 'default'),
          vendor: config.vendor,
          scope: config.scope,
          key_value: config.api_key,
          is_active: true, // vendor_configs doesn't have is_active field
          created_at: config.created_at || new Date().toISOString(),
          updated_at: config.updated_at || new Date().toISOString()
        }));
        setVendorKeys(transformedKeys);
      }
    } catch (error) {
      console.error('Error fetching vendor keys:', error);
      toast.error('Failed to load vendor keys');
      setVendorKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.vendor || !formData.key_value) {
      toast.error('Vendor and API key are required');
      return;
    }

    try {
      // Use vendor_set function to safely manage vendor keys
      const { error } = await supabase.rpc('vendor_set', {
        _vendor: formData.vendor,
        _scope: formData.scope || null,
        _api_key: formData.key_value,
        _meta: {}
      });

      if (error) {
        console.error('Error saving vendor key:', error);
        toast.error('Failed to save vendor key: ' + error.message);
        return;
      }

      toast.success(editingKey ? 'Vendor key updated' : 'Vendor key added');
      setIsDialogOpen(false);
      setEditingKey(null);
      setFormData({ vendor: '', scope: '', key_value: '' });
      
      // Reload the keys list
      await loadVendorKeys();
    } catch (error) {
      console.error('Error saving vendor key:', error);
      toast.error('Failed to save vendor key');
    }
  };

  const handleEdit = (key: VendorKey) => {
    setEditingKey(key);
    setFormData({
      vendor: key.vendor,
      scope: key.scope || '',
      key_value: key.key_value
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this vendor key?')) return;

    try {
      const key = vendorKeys.find(k => k.id === keyId);
      if (!key) return;

      const { error } = await supabase
        .from('vendor_configs')
        .delete()
        .eq('vendor', key.vendor)
        .eq('scope', key.scope);

      if (error) {
        console.error('Error deleting vendor key:', error);
        toast.error('Failed to delete vendor key: ' + error.message);
        return;
      }

      toast.success('Vendor key deleted');
      await loadVendorKeys();
    } catch (error) {
      console.error('Error deleting vendor key:', error);
      toast.error('Failed to delete vendor key');
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(Math.max(0, key.length - 8)) + key.substring(key.length - 4);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendor API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Vendor API Keys</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingKey(null);
                  setFormData({ vendor: '', scope: '', key_value: '' });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingKey ? 'Edit Vendor Key' : 'Add Vendor Key'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Select 
                    value={formData.vendor} 
                    onValueChange={(value) => setFormData({ ...formData, vendor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor} value={vendor}>
                          {vendor.charAt(0).toUpperCase() + vendor.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scope">Scope (Optional)</Label>
                  <Input
                    id="scope"
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    placeholder="e.g., production, development"
                  />
                </div>
                <div>
                  <Label htmlFor="key_value">API Key</Label>
                  <Input
                    id="key_value"
                    type="password"
                    value={formData.key_value}
                    onChange={(e) => setFormData({ ...formData, key_value: e.target.value })}
                    placeholder="Enter API key"
                  />
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editingKey ? 'Update' : 'Add'} Key
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {vendorKeys.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No vendor keys configured</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vendorKeys.map((key) => (
              <div key={key.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold capitalize">{key.vendor}</h4>
                      {key.scope && (
                        <Badge variant="outline">{key.scope}</Badge>
                      )}
                      <Badge variant={key.is_active ? "default" : "secondary"}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-mono">
                        {visibleKeys.has(key.id) ? key.key_value : maskKey(key.key_value)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyVisibility(key.id)}
                        className="h-auto p-1"
                      >
                        {visibleKeys.has(key.id) ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(key.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(key)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(key.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};