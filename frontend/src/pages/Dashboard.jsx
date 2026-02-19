// ...existing code...
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import TaskSection from "../components/TaskSection";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const initials = (email = "") => {
    const name = email.split("@")[0] || "";
    const parts = name.split(/[\._-]/).filter(Boolean);
    const chars = parts.length
      ? (parts[0][0] || "") + (parts[1]?.[0] || "")
      : name[0] || "";
    return (chars || "U").toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Users</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded shadow-sm hover:bg-gray-100"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg
                className="animate-spin w-6 h-6 text-blue-600"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No users found.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((u) => (
                <div
                  key={u.id || u._id || u.email}
                  className="flex items-center gap-4 p-4 border rounded hover:shadow-sm"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold">
                    {initials(u.email)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{u.email}</p>
                    <p className="text-sm text-gray-500">
                      {u.name || `ID: ${u.id || u._id || "-"}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <TaskSection />
      </div>
    </div>
  );
}
