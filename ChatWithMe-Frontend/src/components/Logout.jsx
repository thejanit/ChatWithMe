const LogoutButton = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload(); // or navigate to login page if using React Router
  };

  return (
    <button
      onClick={handleLogout}
      className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
