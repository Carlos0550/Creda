import React, { useState } from "react";
import RegisterForm from "./RegisterForm/RegisterForm";
import LoginForm from "./LoginForm/LoginForm";
import {
  Button,
  Container,
  Paper,
  Title,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { BsShieldCheck, BsGraphUp } from "react-icons/bs";

function AuthComponentManager() {
  const [formOption, setFormOption] = useState<1 | 2>(2);
  const theme = useMantineTheme();

  const handleSwitchForm = (option: 1 | 2) => {
    setFormOption(option);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Container size="xs" p={0} className="w-full max-w-md">
        <Paper
          radius="lg"
          shadow="md"
          p="xl"
          className="border border-gray-100"
          style={{
            backgroundColor: "white",
          }}
        >
          <div className="flex flex-col items-center mb-4">
            <Title
              order={2}
              style={{ textAlign: "center" }}
              className="text-slate-700 text-lg font-medium mb-1"
            >
              Welcome to
            </Title>

            <div className="flex items-center justify-center mb-3">
              <BsShieldCheck className="text-blue-700 text-3xl mr-2" />
              <Title
                order={1}
                style={{ textAlign: "center" }}
                className="text-blue-700 text-3xl font-bold"
              >
                Creda
              </Title>
            </div>
          </div>

          <div className="form-container opacity-transition">
            {formOption === 1 ? <RegisterForm /> : <LoginForm />}
          </div>

          <div className="mt-8 relative">
            <Button
              variant="subtle"
              onClick={() => handleSwitchForm(formOption === 1 ? 2 : 1)}
              fullWidth
              mt="md"
              size="md"
              className="font-medium text-blue-600 hover:text-blue-800 transition-all duration-200 group relative overflow-hidden"
              styles={{
                root: {
                  border: "1px solid #e5e7eb",
                  borderRadius: "9999px",
                  padding: "0.625rem 1rem",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                },
                label: {
                  fontSize: "0.875rem",
                },
              }}
            >
              <span className="absolute inset-0 w-full h-full bg-blue-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              <span className="relative">
                {formOption === 1
                  ? "Already have an account? Log in"
                  : "Don't have an account? Register"}
              </span>
            </Button>
          </div>
        </Paper>
      </Container>

      <style>
        {`
          .opacity-transition {
            transition: opacity 0.3s ease-in-out;
          }
          .form-container {
            position: relative;
          }
        `}
      </style>
    </div>
  );
}

export default AuthComponentManager;
