import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/forms/Input";
import { Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await api.post("/login", form);

    localStorage.setItem("token", res.data.accessToken);

    navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-6">Login</h2>

        <Input name="email" placeholder="Email" onChange={handleChange} />
        <div className="h-4" />

        <Input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button className="w-full mt-6 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Login
        </button>
        <p className="mt-4 text-sm">
          New user?{" "}
          <Link className="text-blue-600 hover:underline" to="/signup">
            Signup here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
