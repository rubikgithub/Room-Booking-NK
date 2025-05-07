const User = {
    fetchUsers: {
      url: "/users",
      method: "GET",
    },
    createUser: {
      url: "/createUser",
      method: "POST",
    },
    deleteUser: {
      url: "/users/:id",
      method: "DELETE",
    },
    updateUser: {
      url: "/users/:id",
      method: "PUT",
    },
    grantAccess: {
      url: "/users/grant-access/:id",
      method: "POST",
    },
    getUser: {
      url: "/users/me",
      method: "GET",
    },
  };
  
  export default User;