import { useState } from "react";
import { createUser } from "../api/userApi";

function UserForm({ refreshUsers }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createUser(form);

    setForm({ name: "", email: "", password: "" });

    refreshUsers();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create User</h2>

      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <input
        name="password"
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={handleChange}
      />

      <button type="submit">Create</button>
    </form>
  );
}

export default UserForm;
