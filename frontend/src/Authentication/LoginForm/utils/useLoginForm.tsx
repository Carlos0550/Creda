import { useState } from "react";
import { useAppContext } from "../../../Context/AppContext";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";

interface FormValuesInterface {
  manager_email: string;
  manager_password: string;
}
type formErrors = Partial<Record<keyof FormValuesInterface, string>>;

function useLoginForm() {
  const [formValues, setFormValues] = useState<FormValuesInterface>({
    manager_email: "",
    manager_password: "",
  });

  const {
    usersHook: { loginUser, getLocaleUserInfo },
  } = useAppContext();

  const [errors, setErrors] = useState<formErrors>({});
  const [authError, setAuthError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    if (errors[name as keyof FormValuesInterface]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    if (authError) {
      setAuthError("");
    }
  };

  const handleCheckErrors = () => {
    let newErrors: formErrors = {};

    if (!formValues.manager_email.trim()) {
      newErrors["manager_email"] = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formValues.manager_email)) {
        newErrors["manager_email"] = "Please enter a valid email address";
      }
    }

    if (!formValues.manager_password.trim()) {
      newErrors["manager_password"] = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isLogging, setIsLogging] = useState<boolean>(false);
  const navigate = useNavigate();

  const onFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (handleCheckErrors()) {
      setIsLogging(true);
      try {
        const result = await loginUser(formValues);
        setIsLogging(false);

        if (result) {
          setFormValues({
            manager_email: "",
            manager_password: "",
          });

          const userData = getLocaleUserInfo();

          const { manager_id, manager_name } = userData || {};

          if (!manager_id) {
            setAuthError("Failed to retrieve user information");
            return;
          }

          showNotification({
            title: `Welcome back, ${manager_name}`,
            message: "",
            autoClose: 1500,
            position: "top-right",
            color: "green",
          });

          navigate(`/home/${manager_id}`);
        } else {
          setAuthError("Invalid email or password");
        }
      } catch (error) {
        setIsLogging(false);
        setAuthError("Connection error. Please try again.");
      }
    }
  };

  return {
    errors,
    handleInputChange,
    formValues,
    onFinish,
    isLogging,
    authError,
  };
}

export default useLoginForm;
