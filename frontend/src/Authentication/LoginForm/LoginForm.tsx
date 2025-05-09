import React from "react";
import { Button, Input } from "@mantine/core";
import "./LoginForm.css";
import useLoginForm from "./utils/useLoginForm";

function LoginForm() {
  const { errors, handleInputChange, onFinish, formValues, isLogging } =
    useLoginForm();

  return (
    <div className="w-full">
      <form className="space-y-6" onSubmit={onFinish}>
        <h2 className="text-2xl font-medium text-center text-slate-700 mb-6">
          Login
        </h2>

        <div className="space-y-4">
          <Input.Wrapper
            label="Email"
            required
            styles={{
              label: {
                color: "#334155",
                fontWeight: 500,
                marginBottom: "4px",
              },
            }}
          >
            <Input
              placeholder="jhondoe@example.com"
              type="email"
              name="manager_email"
              value={formValues.manager_email}
              onChange={handleInputChange}
              styles={{
                input: {
                  borderColor: errors.manager_email ? "#ef4444" : "#e2e8f0",
                  borderRadius: "9999px",
                  "&:focus": {
                    borderColor: "#3b82f6",
                    boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.5)",
                  },
                },
              }}
            />
            {errors.manager_email && (
              <p className="mt-1 text-sm text-red-500">{errors.manager_email}</p>
            )}
          </Input.Wrapper>

          <Input.Wrapper
            label="Password"
            required
            styles={{
              label: {
                color: "#334155",
                fontWeight: 500,
                marginBottom: "4px",
              },
            }}
          >
            <Input
              name="manager_password"
              type="password"
              value={formValues.manager_password}
              onChange={handleInputChange}
              styles={{
                input: {
                  borderColor: errors.manager_password ? "#ef4444" : "#e2e8f0",
                  borderRadius: "9999px",
                  "&:focus": {
                    borderColor: "#3b82f6",
                    boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.5)",
                  },
                },
              }}
            />
            {errors.manager_password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.manager_password}
              </p>
            )}
          </Input.Wrapper>
        </div>

        <div className="flex justify-center mt-6">
          <Button
            type="submit"
            disabled={isLogging}
            loading={isLogging}
            styles={{
              root: {
                backgroundColor: isLogging ? "#93c5fd" : "#3b82f6",
                borderRadius: "9999px",
                height: "2.75rem",
                padding: "0 2.5rem",
                minWidth: "12rem",
                maxWidth: "18rem",
                width: "100%",
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "#2563eb",
                },
                "&:disabled": {
                  backgroundColor: "#bfdbfe",
                  opacity: 0.7,
                },
              },
              label: {
                color: "white",
                fontWeight: 500,
                fontSize: "0.95rem",
              },
            }}
          >
            Sign in
          </Button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
