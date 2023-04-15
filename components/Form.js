import React, { useState } from "react";

const Form = ({ action }) => {
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [matchingPassword, setMatchingPassword] = useState(true);
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const [usernameAlreadyExists, setUsernameAlreadyExists] = useState(false);
  const [usernameWithinCharacters, setUsernameWithinCharacters] = useState(true);
  const [usernameOnlyContains, setUsernameOnlyContains] = useState(true);
  const [passwordWithinCharacters, setPasswordWithinCharacters] = useState(true);


  const resetErrs = () => {
    setMatchingPassword(true);
    setInvalidCredentials(false);
    setUsernameAlreadyExists(false);
    setUsernameWithinCharacters(true);
    setUsernameOnlyContains(true);
    setPasswordWithinCharacters(true);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (action === "register"){
        if (password === confirmPassword){
          setMatchingPassword(true);
        } else {
          resetErrs();
          setMatchingPassword(false);
          throw new Error("Passwords do not match.")
        }
      }

      let fetchURI;
      if (action === "login") {
        fetchURI = "/login";
      } else if (action === "register") {
        fetchURI = "/register";
      }
      const response = await fetch(fetchURI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      
 
      let data;
      let stringTable;
      let status;
      let token;
      if (action === "register"){
        data = await response.json();
        stringTable = data[0];
        status = data[1];
        console.log([stringTable, status]);
      }
      if (action === "login"){
        data = await response.text();
        token = data;
        console.log(token);
      }


      if (action === "login" && token != "{}") {
        resetErrs();
        document.cookie = `auth-token=${token}; path=/;`;
        window.location.href = "/";
      } else if (action === "login" && token == "{}") {
        resetErrs();
        setInvalidCredentials(true);
      }

      if (action === "register" && data[1] == "USERNAME_EXISTS") {
        resetErrs();
        setUsernameAlreadyExists(true);
      } else if (action === "register" && data[1] == "USERNAME_NOT_WITHIN") {
        resetErrs();
        setUsernameWithinCharacters(false);
      } else if (action === "register" && data[1] == "USERNAME_NOT_WITHIN") {
        resetErrs();
        setUsernameOnlyContains(false);
      } else if (action === "register" && data[1] == "PASSWORD_NOT_WITHIN") {
        resetErrs();
        setPasswordWithinCharacters(false);
      } else if (action === "register" && data[1] == "SUCCESS") {
        resetErrs();
        window.location.href = "/";
      }
      
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{action === "register" ? "Register" : "Login"}</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {action === "register" ? 
      <input
        type="password"
        placeholder="Comfirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      /> 
      : 
      ""}
      <button type="submit">
        {action === "register" ? "Register" : "Login"}
      </button>
      {matchingPassword === false ? "Passwords do not match" : ""}
      {invalidCredentials === true ? "Unable to login. Please check your username or password." : ""}
      {usernameAlreadyExists === true ? "Username already exists." : ""}
      {usernameWithinCharacters === false ? "Username not within 3 to 15 characters" : ""}
      {usernameOnlyContains === false ? "Username can only contain letters, numbers, hyphens, and underscores" : ""}
      {passwordWithinCharacters === false ? "Password not within 5 to 32 characters" : ""}
    </form>
  );
};

export default Form;
