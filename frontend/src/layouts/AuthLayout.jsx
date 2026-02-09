export default function AuthLayout({ children }) {
  return (
    <div className="flex h-screen">

      <div className="hidden md:flex w-1/2 bg-blue-600 text-white items-center justify-center">
        <h1 className="text-3xl font-bold">Task Manager App</h1>
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100">
        {children}
      </div>

    </div>
  );
}
