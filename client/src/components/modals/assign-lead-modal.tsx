import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users } from "lucide-react";

interface AssignLeadModalProps {
  leadId: number;
  currentAssignee?: { id: number; firstName: string; lastName: string } | null;
  trigger?: React.ReactNode;
}

export function AssignLeadModal({ leadId, currentAssignee, trigger }: AssignLeadModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["/api/users"],
    enabled: open,
  });

  const assignMutation = useMutation({
    mutationFn: async (assignedToId: number) => {
      return await apiRequest(`/api/leads/${leadId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/team"] });
      toast({
        title: "Lead assigned successfully",
        description: "The lead has been assigned to the selected team member.",
      });
      setOpen(false);
      setSelectedUserId("");
    },
    onError: () => {
      toast({
        title: "Assignment failed",
        description: "Failed to assign the lead. Please try again.",
        variant: "destructive",
      });
    },
  });

  const unassignMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/leads/${leadId}/unassign`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/team"] });
      toast({
        title: "Lead unassigned successfully",
        description: "The lead has been unassigned and is now available for assignment.",
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Unassignment failed",
        description: "Failed to unassign the lead. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAssign = () => {
    if (selectedUserId) {
      assignMutation.mutate(parseInt(selectedUserId));
    }
  };

  const handleUnassign = () => {
    unassignMutation.mutate();
  };

  // Filter team members to only show agents and sales managers
  const assignableMembers = teamMembers.filter((member: any) => 
    member.role?.name === 'agent' || member.role?.name === 'sales manager'
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            {currentAssignee ? "Reassign" : "Assign"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {currentAssignee ? "Reassign Lead" : "Assign Lead"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {currentAssignee && (
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Currently assigned to:</Label>
              <p className="text-sm text-muted-foreground">
                {currentAssignee.firstName} {currentAssignee.lastName}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="assignee">Select team member</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a team member..." />
              </SelectTrigger>
              <SelectContent>
                {assignableMembers.map((member: any) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.firstName} {member.lastName} ({member.role?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between gap-2 pt-4">
            {currentAssignee && (
              <Button
                variant="outline"
                onClick={handleUnassign}
                disabled={unassignMutation.isPending}
              >
                Unassign
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={!selectedUserId || assignMutation.isPending}
              >
                {assignMutation.isPending ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}