"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Edit, Trash2, Users, Send } from "lucide-react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";

const ROLE_OPTIONS = [
  { value: "MANAGER", label: "Manager" },
  { value: "HEAD_CHEF", label: "Head Chef" },
  { value: "LINE_COOK", label: "Line Cook" },
  { value: "WAITER", label: "Waiter / Server" },
  { value: "CASHIER", label: "Cashier" },
  { value: "BARTENDER", label: "Bartender" },
  { value: "DELIVERY", label: "Delivery Driver" },
  { value: "KITCHEN_ASSISTANT", label: "Kitchen Assistant" },
];

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ...Object.fromEntries(ROLE_OPTIONS.map((option) => [option.value, option.label])),
};

interface StaffMember {
  id: number;
  user: {
    id: number;
    email: string;
    name?: string;
    avatar_url?: string | null;
  };
  role: string;
  is_active: boolean;
  joined_at?: string;
}

export default function StaffPage() {
  const {
    currentRestaurant,
    fetchStaff,
    inviteStaff,
    updateStaff,
    removeStaff,
  } = useRestaurant();
  const { user } = useAuth();
  const isOwner =
    !!user && !!currentRestaurant && currentRestaurant.owner?.id === user.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [invitingEmail, setInvitingEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("WAITER");
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [editRole, setEditRole] = useState("WAITER");
  const [editActive, setEditActive] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const loadStaff = async () => {
    if (!currentRestaurant) return;
    setStaffLoading(true);
    try {
      const data = await fetchStaff(currentRestaurant.slug);
      setStaff(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load staff");
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    if (currentRestaurant) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadStaff();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRestaurant?.slug]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant || !invitingEmail.trim()) return;

    setInviteSubmitting(true);
    try {
      await inviteStaff(currentRestaurant.slug, {
        email: invitingEmail.trim(),
        role: selectedRole,
      });
      toast.success("Staff member added");
      setShowInviteDialog(false);
      setInvitingEmail("");
      setSelectedRole("WAITER");
      await loadStaff();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to add staff member"));
    } finally {
      setInviteSubmitting(false);
    }
  };

  const handleEdit = (member: StaffMember) => {
    setEditingMember(member);
    setEditRole(member.role);
    setEditActive(member.is_active);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant || !editingMember) return;

    setEditSubmitting(true);
    try {
      await updateStaff(currentRestaurant.slug, editingMember.id, {
        role: editRole,
        is_active: editActive,
      });
      toast.success("Staff member updated");
      setEditingMember(null);
      await loadStaff();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update staff member"));
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleRemove = async (member: StaffMember) => {
    if (!currentRestaurant) return;
    if (!confirm(`Remove ${member.user?.name || member.user?.email} from staff?`)) {
      return;
    }

    setRemovingId(member.id);
    try {
      await removeStaff(currentRestaurant.slug, member.id);
      toast.success("Staff member removed");
      await loadStaff();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to remove staff member"));
    } finally {
      setRemovingId(null);
    }
  };

  const filteredStaff = staff.filter((member) => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return true;
    return (
      member.user?.name?.toLowerCase().includes(term) ||
      member.user?.email?.toLowerCase().includes(term)
    );
  });

  if (!currentRestaurant) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Manage team members and their roles</p>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Restaurant Selected</h3>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
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
            <Button disabled={!isOwner}>
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
                    required
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  The person must already have a Mesero account.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  id="role"
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                  options={ROLE_OPTIONS}
                  placeholder="Select role"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => { setShowInviteDialog(false); setInvitingEmail(""); }}>
                  Cancel
                </Button>
                <Button type="submit" loading={inviteSubmitting}>
                  <Send className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
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
                <div key={i} className="h-16 bg-neutral-100 rounded animate-shimmer" />
              ))}
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <Users className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
              <p>No staff members yet. Invite your first team member.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-sm text-neutral-500">
                    <th className="pb-3 font-medium text-neutral-900">Member</th>
                    <th className="pb-3 font-medium text-neutral-900">Email</th>
                    <th className="pb-3 font-medium text-neutral-900">Role</th>
                    <th className="pb-3 font-medium text-neutral-900">Status</th>
                    <th className="pb-3 font-medium text-neutral-900">Joined</th>
                    <th className="pb-3 font-medium text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-neutral-50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.user?.avatar_url || undefined} alt={member.user?.name} />
                            <AvatarFallback>{member.user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <p className="font-medium text-neutral-900">{member.user?.name}</p>
                        </div>
                      </td>
                      <td className="py-4 text-neutral-900">{member.user?.email}</td>
                      <td className="py-4">
                        <span className={member.role === "MANAGER" || member.role === "OWNER" ? "badge-primary" : "badge-info"}>
                          {ROLE_LABELS[member.role] || member.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={member.is_active ? "badge-success" : "badge-neutral"}>
                          {member.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 text-neutral-500">
                        {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(member)}
                            disabled={!isOwner || member.role === "OWNER"}
                            aria-label={`Edit ${member.user?.name || member.user?.email}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(member)}
                            disabled={!isOwner || member.role === "OWNER" || removingId === member.id}
                            aria-label={`Remove ${member.user?.name || member.user?.email}`}
                          >
                            <Trash2 className="h-4 w-4 text-primary-600" />
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

      <Dialog open={!!editingMember} onOpenChange={(open) => { if (!open) setEditingMember(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Member</Label>
              <p className="text-neutral-900">
                {editingMember?.user?.name || editingMember?.user?.email}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                id="edit-role"
                value={editRole}
                onValueChange={setEditRole}
                options={ROLE_OPTIONS}
              />
            </div>
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              Active
            </Label>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setEditingMember(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={editSubmitting}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
