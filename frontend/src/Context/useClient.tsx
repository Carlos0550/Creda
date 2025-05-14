import { useCallback, useMemo } from "react";
import { showNotification } from "@mantine/notifications";
import { globalApis } from "./APIs";

function useClient() {
  // Create a new client
  const createClient = useCallback(async (clientData: any) => {
    const url = new URL(globalApis.clients + "/create-client");
    try {
      const result = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      });

      const responseData = await result.json();
      if (!result.ok) {
        showNotification({
          title: "Error creating client",
          message: responseData.msg || "Unknown error",
          position: "top-right",
          autoClose: 3500,
          color: "red",
        });
        return false;
      }

      showNotification({
        title: "Client created successfully",
        message: responseData.msg || "Client information processed successfully",
        position: "top-right",
        autoClose: 3500,
        color: "green",
      });

      return responseData;
    } catch (error: any) {
      showNotification({
        title: "Could not create client",
        message: error.message || "Unknown error",
        position: "top-right",
        autoClose: 5000,
        color: "red",
      });

      return false;
    }
  }, []);

  // Get client information by ID
  const getClientById = useCallback(async (clientId: string) => {
    const url = new URL(globalApis.clients + "/client/" + clientId);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();
      if (!response.ok) {
        showNotification({
          title: "Error retrieving client",
          message: responseData.msg || "Client not found",
          position: "top-right",
          autoClose: 3500,
          color: "yellow",
        });
        return false;
      }

      return responseData;
    } catch (error: any) {
      showNotification({
        title: "Error retrieving client",
        message: error.message || "Unknown error.",
        position: "top-right",
        autoClose: 5000,
        color: "red",
      });
      return false;
    }
  }, []);

  // Check client credit status
  const checkClientCredit = useCallback(async (clientId: string) => {
    const url = new URL(globalApis.clients + "/check-credit");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ client_id: clientId }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        showNotification({
          title: "Error checking credit",
          message: responseData.msg || "Unable to check credit status",
          position: "top-right",
          autoClose: 3500,
          color: "yellow",
        });
        return false;
      }

      return {
        creditStatus: responseData.client_credit_status || "unknown",
        score: responseData.client_score || "0",
        message: responseData.msg || "Credit status retrieved",
      };
    } catch (error: any) {
      showNotification({
        title: "Error checking credit",
        message: error.message || "Unknown error.",
        position: "top-right",
        autoClose: 5000,
        color: "red",
      });
      return false;
    }
  }, []);

  // Update client information
  const updateClient = useCallback(async (clientId: string, updateData: any) => {
    const url = new URL(globalApis.clients + "/update-client");
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          ...updateData
        }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        showNotification({
          title: "Error updating client",
          message: responseData.msg || "Unable to update client information",
          position: "top-right",
          autoClose: 3500,
          color: "yellow",
        });
        return false;
      }

      showNotification({
        title: "Client updated successfully",
        message: responseData.msg || "Client information updated",
        position: "top-right",
        autoClose: 3500,
        color: "blue",
      });

      return responseData;
    } catch (error: any) {
      showNotification({
        title: "Error updating client",
        message: error.message || "Unknown error.",
        position: "top-right",
        autoClose: 5000,
        color: "red",
      });
      return false;
    }
  }, []);

  return useMemo(
    () => ({
      createClient,
      getClientById,
      checkClientCredit,
      updateClient
    }),
    [createClient, getClientById, checkClientCredit, updateClient]
  );
}

export default useClient;