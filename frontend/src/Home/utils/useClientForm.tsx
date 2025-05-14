import { useState } from "react";
import useClient from "../../Context/useClient";

export const useFormClient = () => {
  const { createClient, checkClientCredit } = useClient();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Default empty form state - used for initial state and resetting
  const initialFormState = {
    client_name: "",
    client_nationality: "",
    client_id_type: "na",
    client_id: "",
    client_email: "",
    client_phone: "",
  };

  const [formValues, setFormValues] = useState(initialFormState);

  const [errors, setErrors] = useState({
    client_name: "",
    client_nationality: "",
    client_id_type: "",
    client_id: "",
    client_email: "",
    client_phone: "",
  });

  // Reset form to initial state
  const resetForm = () => {
    setFormValues(initialFormState);
    setErrors({
      client_name: "",
      client_nationality: "",
      client_id_type: "",
      client_id: "",
      client_email: "",
      client_phone: "",
    });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate client_name
    if (!formValues.client_name.trim()) {
      newErrors.client_name = "Full name is required";
      isValid = false;
    } else {
      newErrors.client_name = "";
    }

    // Validate client_nationality
    if (!formValues.client_nationality.trim()) {
      newErrors.client_nationality = "Nationality is required";
      isValid = false;
    } else {
      newErrors.client_nationality = "";
    }

    // Validate client_id_type
    if (formValues.client_id_type === "na") {
      newErrors.client_id_type = "";
    } else if (!formValues.client_id_type) {
      newErrors.client_id_type = "ID type is required";
      isValid = false;
    } else {
      newErrors.client_id_type = "";
    }

    // Validate client_id if ID type is selected
    if (formValues.client_id_type && formValues.client_id_type !== "na") {
      if (!formValues.client_id.trim()) {
        newErrors.client_id = "ID number is required";
        isValid = false;
      } else {
        newErrors.client_id = "";
      }
    }

    // Validate client_email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formValues.client_email.trim()) {
      newErrors.client_email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formValues.client_email)) {
      newErrors.client_email = "Please enter a valid email address";
      isValid = false;
    } else {
      newErrors.client_email = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string | null) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value || "",
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Store all form data locally (you can use this for other purposes)
        const fullFormData = {
          client_id: formValues.client_id || "N/A",
          client_name: formValues.client_name,
          client_nationality: formValues.client_nationality,
          client_id_type: formValues.client_id_type,
          client_email: formValues.client_email,
          client_phone: formValues.client_phone || "N/A",
        };

        console.log("Full form data:", fullFormData);

        // Create payload with the specific credit values requested
        const apiPayload = {
          client_id: formValues.client_id,
          client_credit_status: "bad",
          client_score: "1",
        };

        console.log("Sending to API:", apiPayload);

        // Send all data to the API including the specified credit values
        const result = await createClient(apiPayload);

        if (result) {
          // Store the response
          setApiResponse(result);
          console.log("API Response:", result);

          // Clear the form after successful submission
          resetForm();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log("Form validation failed");
    }
  };

  return {
    formValues,
    errors,
    handleInputChange,
    handleSelectChange,
    handleFormSubmit,
    isSubmitting,
    apiResponse,
    resetForm, // Expose reset function in case you need to call it elsewhere
  };
};
