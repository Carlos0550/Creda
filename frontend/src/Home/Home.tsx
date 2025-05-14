import React, { useEffect, useRef } from "react";
import "./Home.css";
import { useAppContext } from "../Context/AppContext";
import {
  Flex,
  Skeleton,
  Title,
  TextInput,
  Button,
  Select,
  Grid,
  Paper,
  Text,
} from "@mantine/core";
import { useFormClient } from "./utils/useClientForm";

function Home() {
  const {
    usePredictHook: {
      gettingPendingFiles,
      verifyPendingFilesForUser,
      userId,
      currentFileData,
    },
  } = useAppContext();

  const alreadyFetched = useRef(false);
  useEffect(() => {
    if (!userId || alreadyFetched.current) return;
    verifyPendingFilesForUser();
    alreadyFetched.current = true;
  }, [userId]);

  const {
    formValues,
    errors,
    handleInputChange,
    handleSelectChange,
    handleFormSubmit,
  } = useFormClient();

  // ID type options
  const idTypeOptions = [
    { value: "na", label: "N/A" },
    { value: "national", label: "National ID" },
    { value: "passport", label: "Passport" },
    { value: "driverLicense", label: "Driver's License" },
    { value: "other", label: "Other" },
  ];

  return (
    <React.Fragment>
      <div className="home-container">
        {gettingPendingFiles ? (
          <div className="operations-register-container">
            <Flex
              direction={"column"}
              gap={20}
              mt={10}
              mb={10}
              justify={"center"}
              align={"flex-start"}
              style={{ flex: "1" }}
            >
              <Skeleton height={15} width={300} animate />
              <Skeleton height={15} width={400} animate />
              <Skeleton height={15} width={400} animate />
              <Skeleton height={15} width={400} animate />
              <Skeleton height={15} width={400} animate />
              <Skeleton height={15} width={400} animate />
              <Skeleton height={15} width={400} animate />
            </Flex>
          </div>
        ) : (
          <Grid
            grow
            gutter={32}
            style={{
              width: "100%",
              margin: 0,
              minHeight: "calc(100vh - 60px)",
            }}
          >
            {/* Left column - Form */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Paper
                p="xl"
                radius="md"
                withBorder
                className="form-container"
                style={{
                  height: "100%",
                  minHeight: "calc(100vh - 80px)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Title order={1} ta="center" mb="md">
                  Credit Risk Analysis
                </Title>
                <Title order={3} ta="center" mb="xl" c="dimmed">
                  Customer form
                </Title>

                <form
                  onSubmit={handleFormSubmit}
                  style={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Grid gutter="md" style={{ flexGrow: 1 }}>
                   
                    <Grid.Col span={{ base: 12, sm: 8 }}>
                      <TextInput
                        name="client_name"
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={formValues.client_name || ""}
                        onChange={handleInputChange}
                        required
                        error={errors.client_name}
                        styles={{
                          input: {
                            borderColor: errors.client_name
                              ? "#ef4444"
                              : "#e2e8f0",
                            "&:focus": {
                              borderColor: "#3b82f6",
                            },
                          },
                        }}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        name="client_nationality"
                        label="Nationality"
                        placeholder="Enter your nationality"
                        value={formValues.client_nationality || ""}
                        onChange={handleInputChange}
                        required
                        error={errors.client_nationality}
                        styles={{
                          input: {
                            borderColor: errors.client_nationality
                              ? "#ef4444"
                              : "#e2e8f0",
                            "&:focus": {
                              borderColor: "#3b82f6",
                            },
                          },
                        }}
                      />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <Select
                        name="client_id_type"
                        label="ID Type"
                        placeholder="Select ID Type"
                        data={idTypeOptions}
                        value={formValues.client_id_type || "na"}
                        onChange={(value) =>
                          handleSelectChange("client_id_type", value)
                        }
                        required
                        error={errors.client_id_type}
                        styles={{
                          input: {
                            borderColor: errors.client_id_type
                              ? "#ef4444"
                              : "#e2e8f0",
                            "&:focus": {
                              borderColor: "#3b82f6",
                            },
                          },
                        }}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 8 }}>
                      {formValues.client_id_type &&
                      formValues.client_id_type !== "na" ? (
                        <TextInput
                          name="client_id"
                          label="ID Number"
                          placeholder={`Enter your ${
                            idTypeOptions.find(
                              (opt) => opt.value === formValues.client_id_type
                            )?.label
                          } number`}
                          value={formValues.client_id || ""}
                          onChange={handleInputChange}
                          required
                          error={errors.client_id}
                          styles={{
                            input: {
                              borderColor: errors.client_id
                                ? "#ef4444"
                                : "#e2e8f0",
                              "&:focus": {
                                borderColor: "#3b82f6",
                              },
                            },
                          }}
                        />
                      ) : (
                        <div style={{ height: "56px" }}></div> // Placeholder to maintain layout
                      )}
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 8 }}>
                      <TextInput
                        name="client_email"
                        label="Email Address"
                        placeholder="Enter your email"
                        value={formValues.client_email || ""}
                        onChange={handleInputChange}
                        required
                        error={errors.client_email}
                        styles={{
                          input: {
                            borderColor: errors.client_email
                              ? "#ef4444"
                              : "#e2e8f0",
                            "&:focus": {
                              borderColor: "#3b82f6",
                            },
                          },
                        }}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        name="client_phone"
                        label="Phone Number (Optional)"
                        placeholder="Enter your phone number"
                        value={formValues.client_phone || ""}
                        onChange={handleInputChange}
                        styles={{
                          input: {
                            borderColor: errors.client_phone
                              ? "#ef4444"
                              : "#e2e8f0",
                            "&:focus": {
                              borderColor: "#3b82f6",
                            },
                          },
                        }}
                      />
                    </Grid.Col>

                    <Grid.Col span={12} style={{ marginTop: "auto" }}>
                      <Button
                        type="submit"
                        fullWidth
                        styles={{
                          root: {
                            backgroundColor: "#2563eb",
                            "&:hover": {
                              backgroundColor: "#1d4ed8",
                            },
                          },
                        }}
                      >
                        Submit Application
                      </Button>
                    </Grid.Col>
                  </Grid>
                </form>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper
                p="xl"
                radius="md"
                withBorder
                className="credit-score-container"
                style={{
                  height: "100%",
                  minHeight: "calc(100vh - 80px)",
                  backgroundColor: "white",
                }}
              >
                <Title order={2} ta="center" mb="lg" c="#4764cf">
                  Credit Score
                </Title>
                <Text size="lg" ta="center" mb="md" fw={500}>
                  Score Interpretation
                </Text>
                <Text mb="md">The credit score in our system is binary:</Text>
                <Flex gap="md" direction="column" mb="md">
                  <Flex align="center" gap="sm">
                    <div
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: "50%",
                        backgroundColor: "#ef4444",
                      }}
                    ></div>
                    <Text>
                      <b>1</b> = Bad credit risk
                    </Text>
                  </Flex>
                  <Flex align="center" gap="sm">
                    <div
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: "50%",
                        backgroundColor: "#10b981",
                      }}
                    ></div>
                    <Text>
                      <b>0</b> = Good credit risk
                    </Text>
                  </Flex>
                </Flex>
                <Text size="sm" fs="italic" c="dimmed" mt="xl">
                  After submitting the form, our AI model will analyze your
                  information and provide a credit risk assessment.
                </Text>
              </Paper>
            </Grid.Col>
          </Grid>
        )}
      </div>
    </React.Fragment>
  );
}

export default Home;
