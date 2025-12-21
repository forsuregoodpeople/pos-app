"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldPlus, Edit, Trash2, Shield, Settings } from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissionIds: [] as string[]
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      // TODO: Implement fetch roles from Supabase
      setLoading(false);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      // TODO: Implement fetch permissions from Supabase
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const handleCreateRole = async () => {
    try {
      // TODO: Implement create role in Supabase
      setIsCreateDialogOpen(false);
      resetForm();
      fetchRoles();
    } catch (error) {
      console.error("Error creating role:", error);
    }
  };

  const handleUpdateRole = async () => {
    try {
      // TODO: Implement update role in Supabase
      setIsEditDialogOpen(false);
      resetForm();
      fetchRoles();
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus role ini?")) return;
    
    try {
      // TODO: Implement delete role in Supabase
      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      permissionIds: []
    });
    setSelectedRole(null);
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissionIds: role.permissions.map(permission => permission.id)
    });
    setIsEditDialogOpen(true);
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Role</h1>
          <p className="text-muted-foreground">Kelola role dan permissions sistem</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <ShieldPlus className="w-4 h-4 mr-2" />
              Tambah Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Tambah Role Baru</DialogTitle>
              <DialogDescription>
                Buat role baru dan tentukan permissions-nya
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Role</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama role"
                />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masukkan deskripsi role"
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="max-h-60 overflow-y-auto space-y-4 border rounded-lg p-4">
                  {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                    <div key={resource}>
                      <h4 className="font-medium mb-2 capitalize">{resource}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {resourcePermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={formData.permissionIds.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    permissionIds: [...formData.permissionIds, permission.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    permissionIds: formData.permissionIds.filter(id => id !== permission.id)
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={permission.id} className="text-sm">
                              <div>
                                <div className="font-medium">{permission.name}</div>
                                <div className="text-muted-foreground text-xs">
                                  {permission.description}
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreateRole}>
                  Simpan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Role</CardTitle>
          <CardDescription>
            Semua role yang terdaftar dalam sistem
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
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Belum ada role yang terdaftar
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((permission) => (
                            <Badge key={permission.id} variant="secondary" className="text-xs">
                              {permission.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(role)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRole(role.id)}
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update data role dan permissions-nya
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nama Role</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama role"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Masukkan deskripsi role"
              />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="max-h-60 overflow-y-auto space-y-4 border rounded-lg p-4">
                {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                  <div key={resource}>
                    <h4 className="font-medium mb-2 capitalize">{resource}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {resourcePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${permission.id}`}
                            checked={formData.permissionIds.includes(permission.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  permissionIds: [...formData.permissionIds, permission.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  permissionIds: formData.permissionIds.filter(id => id !== permission.id)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`edit-${permission.id}`} className="text-sm">
                            <div>
                              <div className="font-medium">{permission.name}</div>
                              <div className="text-muted-foreground text-xs">
                                {permission.description}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdateRole}>
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}