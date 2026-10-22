"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Edit, Trash2, Users, Mail, Shield, Loader2, Send } from "lucide-react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { toast } from "sonner";

export default function StaffPage() {
  const { 
    currentRestaurant, 
    isLoading: restaurantLoading,
    fetchStaff,
    error 
  } = useRestaurant();

  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [invitingEmail, setInvitingEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("staff");
  const [staff, setStaff] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);

  const loadStaff = async () => {
    if (!currentRestaurant) return;
    setStaffLoading(true);
    try {
      const data = await fetchStaff(currentRestaurant.slug);
      setStaff(data);
    } catch (err) {
      toast.error("Failed to load staff");
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    if (currentRestaurant) {
      loadStaff();
    }
  }, [currentRestaurant, fetchStaff]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitingEmail) return;
    // TODO: Implement invite staff API call
    toast.info("Invite functionality requires backend endpoint");
    setShowInviteDialog(false);
    setInvitingEmail("");
  };

  const handleEdit = (member: any) => {
    toast.info("Edit functionality requires backend endpoint");
  };

  const handleRemove = (member: any) => {
    if (confirm(`Remove ${member.user?.name || member.user?.email} from staff?`)) {
      toast.info("Remove functionality requires backend endpoint");
    }
  };

  const filteredStaff = staff.filter(member =>
    member.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentRestaurant) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Manage team members and their roles</p>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 mx-auto text-ink-300 mb-4" />
            <h3 className="text-lg font-semibold text-ink-900 mb-2">No Restaurant Selected</h3>
            <p className="text-ink-500 mb-6 max-w-md mx-auto">
              Create or select a restaurant to manage staff.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Manage team members and their roles</p>
        </div>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Invite Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@restaurant.com"
                    value={invitingEmail}
                    onChange={(e) => setInvitingEmail(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  id="role"
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                  options={[
                    { value: "staff", label: "Staff" },
                    { value: "manager", label: "Manager" },
                  ]}
                  placeholder="Select role"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => { setShowInviteDialog(false); setInvitingEmail(""); }}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <Input
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-0">
          {staffLoading ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-ink-100 rounded animate-shimmer" />
              ))}
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-ink-500">
              <Users className="h-12 w-12 mx-auto text-ink-300 mb-4" />
              <p>No staff members yet. Invite your first team member.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-200 text-left text-sm text-ink-500">
                    <th className="pb-3 font-medium text-ink-900">Member</th>
                    <th className="pb-3 font-medium text-ink-900">Email</th>
                    <th className="pb-3 font-medium text-ink-900">Role</th>
                    <th className="pb-3 font-medium text-ink-900">Status</th>
                    <th className="pb-3 font-medium text-ink-900">Joined</th>
                    <th className="pb-3 font-medium text-ink-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-ink-50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.user?.avatar_url || undefined} alt={member.user?.name} />
                            <AvatarFallback>{member.user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <p className="font-medium text-ink-900">{member.user?.name}</p>
                        </div>
                      </td>
                      <td className="py-4 text-ink-900">{member.user?.email}</td>
                      <td className="py-4">
                        <span className={member.role === "manager" ? "badge-crimson" : "badge-blue"}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={member.is_active ? "badge-green" : "badge-gray"}>
                          {member.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 text-ink-500">{new Date(member.joined_at).toLocaleDateString()}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleRemove(member)}>
                            <Trash2 className="h-4 w-4 text-crimson-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}