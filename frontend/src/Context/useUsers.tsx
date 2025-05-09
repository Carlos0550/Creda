import React, { useCallback, useMemo } from "react";
import { globalApis } from "./APIs";
import { showNotification } from "@mantine/notifications";

function useUsers() {
  const createUser = useCallback(async (userData: any) => {
    const url = new URL(globalApis.users + "/create-manager");
    try {
      const result = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const responseData = await result.json();
      if (!result.ok) {
        showNotification({
          title: "Could not create your account",
          message: responseData.msg || "Unknown error",
          position: "top-right",
          autoClose: 3500,
          color: "red",
        });
        return false;
      }

      showNotification({
        title: "Account created successfully",
        message: responseData.msg,
        position: "top-right",
        autoClose: 3500,
        color: "green",
      });

      return true;
    } catch (error) {
      showNotification({
        title: "Could not create your account",
        message: error.message || "Unknown error",
        position: "top-right",
        autoClose: 5000,
        color: "red",
      });

      return false;
    }
  }, []);

  const loginUser = useCallback(async (userData: any) => {
    const url = new URL(globalApis.users + "/login-manager");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        showNotification({
          title: "Error logging in",
          message: responseData.msg || "Unknown error.",
          position: "top-right",
          autoClose: 3500,
          color: "yellow",
        });
        return false;
      }

      showNotification({
        title: "You have logged in successfully.",
        message: responseData.msg || "One moment...",
        position: "top-right",
        autoClose: 2500,
        color: "blue",
      });

      let respondeUserData =
        responseData.userData ||
        responseData.user ||
        responseData.manager ||
        {};

      if (respondeUserData) {
        const structuredUserData = {
          manager_id:
            respondeUserData.manager_id ||
            respondeUserData.id ||
            respondeUserData._id ||
            responseData.id ||
            responseData.userId ||
            "unknown",

          ...respondeUserData,
        };

        localStorage.setItem("user_data", JSON.stringify(structuredUserData));
        localStorage.setItem("auth_status", "authenticated"); 
      } else {
        localStorage.setItem(
          "user_data",
          JSON.stringify({
            manager_id: "default",
            error: "No user data returned from server",
          })
        );
      }
      return true;
    } catch (error) {
      showNotification({
        title: "Error logging in",
        message: error.message || "Unknown error.",
        position: "top-right",
        autoClose: 5500,
        color: "red",
      });
      return false;
    }
  }, []);

  const getLocaleUserInfo = useCallback(() => {
    const locale_user = localStorage.getItem("user_data");

    if (!locale_user) {
      showNotification({
        title: "User data not found.",
        message: "Try logging in again,",
        autoClose: 3500,
        position: "top-right",
        color: "yellow",
      });
      return undefined;
    }

    try {
      const user_info = JSON.parse(locale_user);

      if (!user_info.manager_id) {
        user_info.manager_id = user_info.id || "default";
      }

      return user_info;
    } catch (error) {
      localStorage.removeItem("user_data");
      return undefined;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user_data");
    localStorage.removeItem("auth_status");
    sessionStorage.clear();
  }, []);

  return useMemo(
    () => ({
      createUser,
      loginUser,
      getLocaleUserInfo,
      logout,
    }),
    [createUser, loginUser, getLocaleUserInfo, logout]
  );
}

export default useUsers;
