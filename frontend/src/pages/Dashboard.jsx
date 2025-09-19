import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfile } from "../api/auth";
import {
  fetchApplications,
  submitApplication,
} from "../api/user";
import { AuthContext } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  FileText,
  Plus,
  UserCircle,
  Clock,
  X,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    service_name: "",
    reason: "",
    payment_plan: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        const userData = await fetchProfile(token);
        setUser(userData.user);

        const apps = await fetchApplications(token);
        setApplications(apps);
        
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load data");
      }
    };

    loadData();
  }, [token, navigate]);

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newApp = await submitApplication(form, token);
      setApplications((prev) => [newApp, ...prev]);
      setForm({ service_name: "", reason: "", payment_plan: "" });
      setShowForm(false);
      toast.success("Application submitted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit application");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = (status || "pending").toLowerCase();
    switch (statusLower) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            ✓ Approved
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">✗ Rejected</Badge>;
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">🍒</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome back, {user.first_name}!
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your CherryCare applications
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
          {/* Profile Card */}
          <Card className="self-start">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCircle className="w-5 h-5 mr-2 text-pink-500" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium">
                  {user.first_name} {user.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Role:</span>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Applications Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-pink-500" />
                  Applications ({applications.length})
                </CardTitle>
                <Button
                  onClick={() => setShowForm(!showForm)}
                  size="sm"
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                >
                  {showForm ? (
                    <X className="w-4 h-4 mr-1" />
                  ) : (
                    <Plus className="w-4 h-4 mr-1" />
                  )}
                  {showForm ? "Cancel" : "New Request"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showForm && (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">New Application</CardTitle>
                    <CardDescription>
                      Submit a new financing request
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSubmitApplication}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="service_name">Service Name</Label>
                        <Input
                          id="service_name"
                          placeholder="e.g., Dental Treatment, Therapy Session"
                          value={form.service_name}
                          onChange={(e) =>
                            setForm({ ...form, service_name: e.target.value })
                          }
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Input
                          id="reason"
                          placeholder="Why do you need this service?"
                          value={form.reason}
                          onChange={(e) =>
                            setForm({ ...form, reason: e.target.value })
                          }
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment_plan">Payment Plan</Label>
                        <Input
                          id="payment_plan"
                          placeholder="e.g., Monthly installments, Lump sum"
                          value={form.payment_plan}
                          onChange={(e) =>
                            setForm({ ...form, payment_plan: e.target.value })
                          }
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                        disabled={isLoading}
                      >
                        {isLoading ? "Submitting..." : "Submit Application"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No applications yet</p>
                  <p className="text-sm text-gray-500">
                    Create your first financing request
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-white"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {app.service_name}
                        </h4>
                        <p className="text-sm text-gray-600">{app.reason}</p>
                        <p className="text-xs text-gray-500">
                          Payment: {app.payment_plan}
                        </p>
                      </div>
                      <div className="ml-4">{getStatusBadge(app.status)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;