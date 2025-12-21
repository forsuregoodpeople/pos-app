"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Settings } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
  updated_at: string;
}

const resources = [
  "users",
  "roles", 
  "permissions",
  "barang",
  "jasa",
  "mekanik",
  "transaksi",
  "pos",
  "dashboard"
];

const actions = [
  "create",
  "read",
  "update",
  "delete",
  "access"
];

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    resource: "",
    action: ""
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      // TODO: Implement fetch permissions from Supabase
      setLoading(false);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setLoading(false);
    }
  };

  const handleCreatePermission = async () => {
    try {
      // TODO: Implement create permission in Supabase
      setIsCreateDialogOpen(false);
      resetForm();
      fetchPermissions();
    } catch (error) {
      console.error("Error creating permission:", error);
    }
  };

  const handleUpdatePermission = async () => {
    try {
      // TODO: Implement update permission in Supabase
      setIsEditDialogOpen(false);
      resetForm();
      fetchPermissions();
    } catch (error) {
      console.error("Error updating permission:", error);
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus permission ini?")) return;
    
    try {
      // TODO: Implement delete permission in Supabase
      fetchPermissions();
    } catch (error) {
      console.error("Error deleting permission:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      resource: "",
      action: ""
    });
    setSelectedPermission(null);
  };

  const openEditDialog = (permission: Permission) => {
    setSelectedPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action
    });
    setIsEditDialogOpen(true);
  };

  const generatePermissionName = () => {
    if (formData.resource && formData.action) {
      return `${formData.resource}.${formData.action}`;
    }
    return "";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Permission</h1>
          <p className="text-muted-foreground">Kelola permissions sistem</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Permission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Permission Baru</DialogTitle>
              <DialogDescription>
                Buat permission baru untuk mengontrol akses sistem
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="resource">Resource</Label>
                <Select value={formData.resource} onValueChange={(value) => 
                  setFormData({ ...formData, resource: value, name: generatePermissionName() })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((resource) => (
                      <SelectItem key={resource} value={resource}>
                        {resource}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="action">Action</Label>
                <Select value={formData.action} onValueChange={(value) => 
                  setFormData({ ...formData, action: value, name: generatePermissionName() })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih action" />
                  </SelectTrigger>
                  <SelectContent>
                    {actions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Nama Permission</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="resource.action (contoh: users.read)"
                />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masukkan deskripsi permission"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreatePermission}>
                  Simpan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Permission</CardTitle>
          <CardDescription>
            Semua permissions yang terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Belum ada permission yang terdaftar
                    </TableCell>
                  </TableRow>
                ) : (
                  permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">
                          <Settings className="w-3 h-3 mr-1" />
                          {permission.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{permission.resource}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{permission.action}</Badge>
                      </TableCell>
                      <TableCell>{permission.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(permission)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePermission(permission.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>
              Update data permission
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-resource">Resource</Label>
              <Select value={formData.resource} onValueChange={(value) => 
                setFormData({ ...formData, resource: value, name: generatePermissionName() })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource} value={resource}>
                      {resource}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-action">Action</Label>
              <Select value={formData.action} onValueChange={(value) => 
                setFormData({ ...formData, action: value, name: generatePermissionName() })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih action" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-name">Nama Permission</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="resource.action (contoh: users.read)"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Masukkan deskripsi permission"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdatePermission}>
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}