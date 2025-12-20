import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, MoreHorizontal, Mail, Phone } from "lucide-react";
import { usePOS } from "@/context/pos-context";
import { useToast } from "@/hooks/use-toast";

export default function Employees() {
  // Use real data from context
  const { employees, addEmployee } = usePOS();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Cashier",
    status: "Active"
  });

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEmployee(newEmployee);
      setIsAddOpen(false);
      setNewEmployee({ name: "", email: "", phone: "", role: "Cashier", status: "Active" });
      toast({
        title: "Employee Added",
        description: `${newEmployee.name} has been added to the team.`,
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add employee.", variant: "destructive" });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Store Manager":
        return "default";
      case "Assistant Manager":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Employees</h1>
            <p className="text-muted-foreground mt-1">Manage your team members and their roles.</p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-employee">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    required 
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    required 
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newEmployee.role} onValueChange={(val) => setNewEmployee({...newEmployee, role: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Store Manager">Store Manager</SelectItem>
                      <SelectItem value="Assistant Manager">Assistant Manager</SelectItem>
                      <SelectItem value="Cashier">Cashier</SelectItem>
                      <SelectItem value="Stock Associate">Stock Associate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Save Employee</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Employees ({employees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-b last:border-0 hover-elevate" data-testid={`employee-row-${employee.id}`}>
                      <td className="py-4 px-4">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground md:hidden">{employee.email}</div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {employee.phone}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={getRoleBadgeVariant(employee.role)}>{employee.role}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button variant="ghost" size="icon" data-testid={`button-employee-actions-${employee.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
