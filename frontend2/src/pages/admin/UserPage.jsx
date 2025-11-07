import { useEffect, useState } from "react";
import { Button } from "../../component/ui/button";
import { Badge } from "../../component/ui/badge";
import { Input } from "../../component/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../component/ui/dialog";
import { UserCheck, UserX } from "lucide-react";
import apiConnector from "../../services/apiConnector";
import { AdminApi } from "../../services/api";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const { token } = useSelector((state) => state.Auth);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const res = await apiConnector(
          AdminApi.usersByRoleListApi,
          "GET",
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );
        const data = res.data;
        const students = (data.students || []).map((u) => ({
          ...u,
          role: "student",
        }));
        setUsers(students);
        setFilteredUsers(students);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(
          err?.response?.data?.message || err?.message || "Failed to load users"
        );
        toast.error(
          err?.response?.data?.message || err?.message || "Failed to load users"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [token]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter(
          (u) =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.role?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, users]);

  async function handleBanUser(userId, ban) {
    setActionLoading((l) => ({ ...l, [userId]: true }));

    try {
      const res = await apiConnector(
        AdminApi.banUserApi,
        "POST",
        {
          userId,
          ban,
        },
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      if (res.data.success) {
        toast.success(
          res.data.message || (ban ? "User banned" : "User unbanned")
        );
        setUsers((users) =>
          users.map((u) => (u._id === userId ? { ...u, isBanned: ban } : u))
        );
        setFilteredUsers((users) =>
          users.map((u) => (u._id === userId ? { ...u, isBanned: ban } : u))
        );
      } else {
        throw new Error(res.data.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update user"
      );
    } finally {
      setActionLoading((l) => ({ ...l, [userId]: false }));
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">All Users</h1>
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <Input
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 text-gray-50 focus:outline-none"
        />
      </div>
      {loading ? (
        <div className="text-slate-300 py-12 text-center">Loading users...</div>
      ) : error ? (
        <div className="text-red-400 py-12 text-center">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white/10 rounded-xl">
          <table className="min-w-full text-white bg-white/5 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-white/10">
                <th className="px-4 py-2 font-semibold text-black">Name</th>
                <th className="px-4 py-2 font-semibold text-black">Email</th>
                <th className="px-4 py-2 font-semibold text-black">Phone</th>
                <th className="px-4 py-2 font-semibold text-black">Role</th>
                <th className="px-4 py-2 font-semibold text-black">Banned</th>
                <th className="px-4 py-2 font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-white/10 hover:bg-white/10 transition group"
                  >
                    <td
                      className="px-4 py-2 font-medium text-white cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      {user.name}
                    </td>
                    <td className="px-4 py-2 text-white">{user.email}</td>
                    <td className="px-4 py-2 text-white">
                      {user.phone || "N/A"}
                    </td>
                    <td className="px-4 py-2 capitalize text-white">
                      {user.role}
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        variant={user.isBanned ? "destructive" : "secondary"}
                        className={
                          user.isBanned
                            ? "bg-red-500/90 text-white"
                            : "bg-gray-700/80 text-white"
                        }
                      >
                        {user.isBanned ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`rounded-full border ${
                          user.isBanned
                            ? "text-green-400 border-green-400 hover:bg-green-600/20"
                            : "text-red-400 border-red-400 hover:bg-red-600/20"
                        }`}
                        onClick={() => handleBanUser(user._id, !user.isBanned)}
                        aria-label={user.isBanned ? "Unban User" : "Ban User"}
                        disabled={actionLoading[user._id]}
                      >
                        {actionLoading[user._id] ? (
                          <span
                            className={`animate-spin w-5 h-5 border-2 ${
                              user.isBanned
                                ? "border-green-400"
                                : "border-red-400"
                            } border-t-transparent rounded-full`}
                          ></span>
                        ) : user.isBanned ? (
                          <UserCheck className="w-5 h-5" />
                        ) : (
                          <UserX className="w-5 h-5" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md text-white">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Name:</span> {selectedUser.name}
              </div>
              <div>
                <span className="font-semibold">Email:</span>{" "}
                {selectedUser.email}
              </div>
              <div>
                <span className="font-semibold">Role:</span> {selectedUser.role}
              </div>
              <div>
                <span className="font-semibold">Banned:</span>{" "}
                {selectedUser.isBanned ? "Yes" : "No"}
              </div>
              {selectedUser.campus && (
                <div>
                  <span className="font-semibold">Campus:</span>{" "}
                  {typeof selectedUser.campus === "object"
                    ? selectedUser.campus.name
                    : selectedUser.campus}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
