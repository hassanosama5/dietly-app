import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

import {
  Users,
  Search,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  X,
} from "lucide-react";

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [userStats, setUserStats] = useState(null);

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // ============================
  //     FETCH USERS
  // ============================
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // 🔥 FIXED: remove "/api/v1"
      const response = await api.get("/admin/users");

      // Backend returns: { success: true, data: [...] }
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  //     VIEW USER + STATS
  // ============================
  const handleViewUser = async (user) => {
    setSelectedUser(user);
    try {
      // 🔥 FIXED route
      const response = await api.get(`/admin/users/${user._id}/stats`);

      // Stats are inside data
      setUserStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error.response?.data || error);
    }
    setShowViewModal(true);
  };

  // ============================
  //     OPEN EDIT MODAL
  // ============================
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role || "user",
    });
    setShowEditModal(true);
  };

  // ============================
  //        UPDATE USER
  // ============================
  const handleUpdateUser = async () => {
    try {
      // 🔥 FIXED route
      await api.put(`/admin/users/${selectedUser._id}`, editFormData);

      await fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error.response?.data || error);
      alert("Failed to update user");
    }
  };

  // ============================
  //        DELETE USER
  // ============================
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      // 🔥 FIXED route
      await api.delete(`/admin/users/${selectedUser._id}`);

      await fetchUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error.response?.data || error);
      alert("Failed to delete user");
    }
  };

  // Search filtering
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-black">

      {/* HEADER */}
      <div className="bg-[#246608]/10 border-b border-[#246608]/20">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate("/admin-dashboard")}
              variant="ghost"
              size="sm"
              className="text-[#246608] hover:bg-[#246608]/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-[#246608]" />
              <h1 className="text-3xl font-bold">Manage Users</h1>
            </div>

            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-[1400px] mx-auto px-8 py-8">

        {/* SEARCH BAR */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#246608]/20 rounded-lg"
            />
          </div>
          <div className="text-sm text-[#246608]/70 ml-4">
            Total Users:{" "}
            <span className="font-bold text-[#246608]">{users.length}</span>
          </div>
        </div>

        {/* USERS TABLE */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-[#246608]/20 border-t-[#246608] rounded-full animate-spin"></div>
            <p className="mt-4 text-[#246608]/70">Loading users...</p>
          </div>
        ) : (
          <Card className="border-[#246608]/20">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#246608]/5 border-b border-[#246608]/20">
                    <tr>
                      <th className="py-4 px-6 text-left text-[#246608] font-semibold">Name</th>
                      <th className="py-4 px-6 text-left text-[#246608] font-semibold">Email</th>
                      <th className="py-4 px-6 text-left text-[#246608] font-semibold">Role</th>
                      <th className="py-4 px-6 text-left text-[#246608] font-semibold">Joined</th>
                      <th className="py-4 px-6 text-center text-[#246608] font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-12 text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="border-b border-[#246608]/10 hover:bg-[#246608]/5"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-[#246608]/20 flex items-center justify-center">
                                <Users className="w-5 h-5 text-[#246608]" />
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-gray-600">{user.email}</td>

                          <td className="py-4 px-6">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.role === "admin"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-[#246608]/10 text-[#246608]"
                              }`}
                            >
                              {user.role || "user"}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-gray-600">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>

                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center space-x-2">
                              <Button
                                onClick={() => handleViewUser(user)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>

                              <Button
                                onClick={() => handleEditUser(user)}
                                variant="ghost"
                                size="sm"
                                className="text-[#246608] hover:bg-[#246608]/10"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>

                              <Button
                                onClick={() => handleDeleteUser(user)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ========= VIEW USER MODAL ========= */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#246608]">User Details</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* BASIC USER INFO */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4 border-b border-[#246608]/20 pb-4">
                  <div className="w-16 h-16 rounded-full bg-[#246608]/20 flex items-center justify-center">
                    <Users className="w-8 h-8 text-[#246608]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>

                {/* USER STATS */}
                {userStats && (
                  <div className="mt-4">
                    <h4 className="font-bold text-lg text-[#246608] mb-3">Statistics</h4>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-[#246608]/5 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-[#246608]">
                          {userStats.mealsCreated || 0}
                        </p>
                        <p className="text-sm text-[#246608]/70">Meals</p>
                      </div>

                      <div className="bg-[#246608]/5 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-[#246608]">
                          {userStats.mealPlans?.total || 0}
                        </p>
                        <p className="text-sm text-[#246608]/70">Plans</p>
                      </div>

                      <div className="bg-[#246608]/5 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-[#246608]">
                          {userStats.progress?.totalEntries || 0}
                        </p>
                        <p className="text-sm text-[#246608]/70">Progress Entries</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========= EDIT MODAL ========= */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#246608]">Edit User</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* NAME */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#246608]">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-[#246608]/20 rounded-lg focus:border-[#246608]"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#246608]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-[#246608]/20 rounded-lg focus:border-[#246608]"
                  />
                </div>

                {/* ROLE */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#246608]">
                    Role
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, role: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-[#246608]/20 rounded-lg focus:border-[#246608]"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* BUTTONS */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 border-2 border-[#246608]/20 hover:bg-[#246608]/10"
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleUpdateUser}
                    className="flex-1 bg-gradient-to-r from-[#2F7A0A] to-[#246608]"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========= DELETE MODAL ========= */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">

              <h2 className="text-2xl font-bold text-red-600 mb-4">Confirm Delete</h2>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-bold">{selectedUser.name}</span>?  
                This action cannot be undone.
              </p>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </Button>

                <Button
                  onClick={confirmDeleteUser}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete User
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};

export default ManageUsers;
