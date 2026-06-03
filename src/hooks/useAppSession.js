import { useEffect, useState } from "react";
import { APP_EVENT, ensureSeedData, getCurrentUser, loginUser, logoutUser, registerUser, updateCurrentUser } from "../lib/appState";

export default function useAppSession() {
  const [currentUser, setCurrentUser] = useState(() => {
    ensureSeedData();
    return getCurrentUser();
  });

  useEffect(() => {
    function syncSession() {
      setCurrentUser(getCurrentUser());
    }

    window.addEventListener(APP_EVENT, syncSession);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener(APP_EVENT, syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  async function signIn(credentials) {
    const nextUser = loginUser(credentials);
    setCurrentUser(nextUser);
    return nextUser;
  }

  async function signUp(payload) {
    const nextUser = registerUser(payload);
    setCurrentUser(nextUser);
    return nextUser;
  }

  function signOut() {
    logoutUser();
    setCurrentUser(null);
  }

  async function saveProfile(patch) {
    const nextUser = updateCurrentUser(patch);
    setCurrentUser(nextUser);
    return nextUser;
  }

  return {
    currentUser,
    signIn,
    signUp,
    signOut,
    saveProfile,
  };
}
