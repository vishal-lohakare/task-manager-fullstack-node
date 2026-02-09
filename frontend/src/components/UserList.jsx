function UserList({ users }) {
  return (
    <div>
      <h2>Users</h2>

      {users.map((user) => (
        <div key={user.id}>
          {user.name} - {user.email}
        </div>
      ))}
    </div>
  );
}

export default UserList;
