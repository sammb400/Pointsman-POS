import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, MoreHorizontal, Mail, Phone } from "lucide-react";

export default function Employees() {
  // todo: remove mock functionality - replace with real data from API
  const employees = [
    { id: 1, name: "Emily Johnson", email: "emily.j@store.com", phone: "(555) 123-4567", role: "Store Manager", status: "Active" },
    { id: 2, name: "Michael Chen", email: "m.chen@store.com", phone: "(555) 234-5678", role: "Cashier", status: "Active" },
    { id: 3, name: "Sarah Williams", email: "s.williams@store.com", phone: "(555) 345-6789", role: "Cashier", status: "Active" },
    { id: 4, name: "David Rodriguez", email: "d.rodriguez@store.com", phone: "(555) 456-7890", role: "Stock Associate", status: "Active" },
    { id: 5, name: "Jessica Brown", email: "j.brown@store.com", phone: "(555) 567-8901", role: "Cashier", status: "On Leave" },
    { id: 6, name: "Christopher Lee", email: "c.lee@store.com", phone: "(555) 678-9012", role: "Assistant Manager", status: "Active" },
    { id: 7, name: "Amanda Martinez", email: "a.martinez@store.com", phone: "(555) 789-0123", role: "Stock Associate", status: "Active" },
    { id: 8, name: "James Wilson", email: "j.wilson@store.com", phone: "(555) 890-1234", role: "Cashier", status: "Inactive" },
  ];

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
          <Button data-testid="button-add-employee">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
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
