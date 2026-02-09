import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/forms/Input";
import { Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users", form);
      toast.success("Signup successful");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-lg shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-6">Signup</h2>
        <Input name="name" placeholder="Name" onChange={handleChange} />
        <div className="h-4" />

        <Input name="email" placeholder="Email" onChange={handleChange} />
        <div className="h-4" />

        <Input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button className="w-full mt-6 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Signup
        </button>
        <p className="mt-4 text-sm">
          Already a user?{" "}
          <Link className="text-blue-600 hover:underline" to="/login">
            Login here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
