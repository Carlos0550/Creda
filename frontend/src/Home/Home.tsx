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
  NumberInput,
  Checkbox,
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

  // Options for select fields
  const sexOptions = [
    { value: "M", label: "Male" },
    { value: "F", label: "Female" },
  ];

  const maritalStatusOptions = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
  ];

  const residenceTypeOptions = [
    { value: "own", label: "Own" },
    { value: "rent", label: "Rent" },
    { value: "family", label: "Family" },
    { value: "other", label: "Other" },
  ];

  const applicationSubmissionTypeOptions = [
    { value: "online", label: "Online" },
    { value: "branch", label: "Branch" },
    { value: "phone", label: "Phone" },
  ];

  const incomeRangeOptions = [
    { value: "0-1000", label: "0 - 1,000" },
    { value: "1001-3000", label: "1,001 - 3,000" },
    { value: "3001-5000", label: "3,001 - 5,000" },
    { value: "5001-10000", label: "5,001 - 10,000" },
    { value: "10001+", label: "10,001+" },
  ];

  const assetsValueRangeOptions = [
    { value: "0-10000", label: "0 - 10,000" },
    { value: "10001-50000", label: "10,001 - 50,000" },
    { value: "50001-100000", label: "50,001 - 100,000" },
    { value: "100001+", label: "100,001+" },
  ];

  return (
    <React.Fragment>
      <div className="home-container" style={{ overflow: "hidden" }}>
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
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Title order={1} ta="center" mb="md">
                  Credit Risk Analysis
                </Title>
                <Title order={3} ta="center" mb="xl" c="dimmed">
                  Customer Information Form
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
                    {/* Client ID */}
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        name="client_id"
                        label="Client ID"
                        placeholder="Enter client ID"
                        value={formValues.client_id || ""}
                        onChange={handleInputChange}
                        required
                        error={errors.client_id}
                      />
                    </Grid.Col>

                    {/* PAYMENT_DAY */}
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <NumberInput
                        name="PAYMENT_DAY"
                        label="Payment Day"
                        placeholder="1-31"
                        min={1}
                        max={31}
                        value={formValues.PAYMENT_DAY || ""}
                        onChange={(value) =>
                          handleSelectChange("PAYMENT_DAY", value)
                        }
                        required
                        error={errors.PAYMENT_DAY}
                      />
                    </Grid.Col>

                    {/* APPLICATION_SUBMISSION_TYPE */}
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <Select
                        name="APPLICATION_SUBMISSION_TYPE"
                        label="Application Type"
                        placeholder="Select application type"
                        data={applicationSubmissionTypeOptions}
                        value={formValues.APPLICATION_SUBMISSION_TYPE || ""}
                        onChange={(value) =>
                          handleSelectChange(
                            "APPLICATION_SUBMISSION_TYPE",
                            value
                          )
                        }
                        required
                        error={errors.APPLICATION_SUBMISSION_TYPE}
                      />
                    </Grid.Col>

                    {/* SEX */}
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <Select
                        name="SEX"
                        label="Sex"
                        placeholder="Select sex"
                        data={sexOptions}
                        value={formValues.SEX || ""}
                        onChange={(value) => handleSelectChange("SEX", value)}
                        required
                        error={errors.SEX}
                      />
                    </Grid.Col>

                    {/* MARITAL_STATUS */}
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <Select
                        name="MARITAL_STATUS"
                        label="Marital Status"
                        placeholder="Select marital status"
                        data={maritalStatusOptions}
                        value={formValues.MARITAL_STATUS || ""}
                        onChange={(value) =>
                          handleSelectChange("MARITAL_STATUS", value)
                        }
                        required
                        error={errors.MARITAL_STATUS}
                      />
                    </Grid.Col>

                    {/* QUANT_DEPENDANTS */}
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <NumberInput
                        name="QUANT_DEPENDANTS"
                        label="Number of Dependents"
                        placeholder="0-99"
                        min={0}
                        value={formValues.QUANT_DEPENDANTS || ""}
                        onChange={(value) =>
                          handleSelectChange("QUANT_DEPENDANTS", value)
                        }
                        required
                        error={errors.QUANT_DEPENDANTS}
                      />
                    </Grid.Col>

                    {/* STATE_OF_BIRTH */}
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        name="STATE_OF_BIRTH"
                        label="State of Birth"
                        placeholder="Enter state of birth"
                        value={formValues.STATE_OF_BIRTH || ""}
                        onChange={handleInputChange}
                        required
                        error={errors.STATE_OF_BIRTH}
                      />
                    </Grid.Col>

                    {/* CITY_OF_BIRTH */}
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        name="CITY_OF_BIRTH"
                        label="City of Birth"
                        placeholder="Enter city of birth"
                        value={formValues.CITY_OF_BIRTH || ""}
                        onChange={handleInputChange}
                        required
                        error={errors.CITY_OF_BIRTH}
                      />
                    </Grid.Col>

                    {/* RESIDENCIAL_STATE */}
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        name="RESIDENCIAL_STATE"
                        label="Residential State"
                        placeholder="Enter residential state"
                        value={formValues.RESIDENCIAL_STATE || ""}
                        onChange={handleInputChange}
                        required
                        error={errors.RESIDENCIAL_STATE}
                      />
                    </Grid.Col>

                    {/* RESIDENCIAL_CITY */}
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        name="RESIDENCIAL_CITY"
                        label="Residential City"
                        placeholder="Enter residential city"
                        value={formValues.RESIDENCIAL_CITY || ""}
                        onChange={handleInputChange}
                        required
                        error={errors.RESIDENCIAL_CITY}
                      />
                    </Grid.Col>

                    {/* RESIDENCIAL_ZIP_3 */}
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        name="RESIDENCIAL_ZIP_3"
                        label="Residential ZIP (First 3 digits)"
                        placeholder="Enter first 3 digits"
                        value={formValues.RESIDENCIAL_ZIP_3 || ""}
                        onChange={handleInputChange}
                        required
                        error={errors.RESIDENCIAL_ZIP_3}
                        maxLength={3}
                      />
                    </Grid.Col>

                    {/* FLAG_RESIDENCIAL_PHONE */}
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <Checkbox
                        name="FLAG_RESIDENCIAL_PHONE"
                        label="Has Residential Phone"
                        checked={formValues.FLAG_RESIDENCIAL_PHONE || false}
                        onChange={(e) =>
                          handleSelectChange(
                            "FLAG_RESIDENCIAL_PHONE",
                            e.currentTarget.checked
                          )
                        }
                      />
                    </Grid.Col>

                    {/* FLAG_EMAIL */}
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <Checkbox
                        name="FLAG_EMAIL"
                        label="Has Email"
                        checked={formValues.FLAG_EMAIL || false}
                        onChange={(e) =>
                          handleSelectChange(
                            "FLAG_EMAIL",
                            e.currentTarget.checked
                          )
                        }
                      />
                    </Grid.Col>

                    {/* RESIDENCE_TYPE */}
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        name="RESIDENCE_TYPE"
                        label="Residence Type"
                        placeholder="Select residence type"
                        data={residenceTypeOptions}
                        value={formValues.RESIDENCE_TYPE || ""}
                        onChange={(value) =>
                          handleSelectChange("RESIDENCE_TYPE", value)
                        }
                        required
                        error={errors.RESIDENCE_TYPE}
                      />
                    </Grid.Col>

                    {/* MONTHS_IN_RESIDENCE */}
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <NumberInput
                        name="MONTHS_IN_RESIDENCE"
                        label="Months in Current Residence"
                        placeholder="0-999"
                        min={0}
                        value={formValues.MONTHS_IN_RESIDENCE || ""}
                        onChange={(value) =>
                          handleSelectChange("MONTHS_IN_RESIDENCE", value)
                        }
                        required
                        error={errors.MONTHS_IN_RESIDENCE}
                      />
                    </Grid.Col>

                    {/* TOTAL_MONTHLY_INCOME */}
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        name="TOTAL_MONTHLY_INCOME"
                        label="Monthly Income Range"
                        placeholder="Select income range"
                        data={incomeRangeOptions}
                        value={formValues.TOTAL_MONTHLY_INCOME || ""}
                        onChange={(value) =>
                          handleSelectChange("TOTAL_MONTHLY_INCOME", value)
                        }
                        required
                        error={errors.TOTAL_MONTHLY_INCOME}
                      />
                    </Grid.Col>

                    {/* PERSONAL_ASSETS_VALUE */}
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        name="PERSONAL_ASSETS_VALUE"
                        label="Personal Assets Value"
                        placeholder="Select value range"
                        data={assetsValueRangeOptions}
                        value={formValues.PERSONAL_ASSETS_VALUE || ""}
                        onChange={(value) =>
                          handleSelectChange("PERSONAL_ASSETS_VALUE", value)
                        }
                        required
                        error={errors.PERSONAL_ASSETS_VALUE}
                      />
                    </Grid.Col>

                    {/* QUANT_BANKING_ACCOUNTS */}
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <NumberInput
                        name="QUANT_BANKING_ACCOUNTS"
                        label="Banking Accounts"
                        placeholder="0-99"
                        min={0}
                        value={formValues.QUANT_BANKING_ACCOUNTS || ""}
                        onChange={(value) =>
                          handleSelectChange("QUANT_BANKING_ACCOUNTS", value)
                        }
                        required
                        error={errors.QUANT_BANKING_ACCOUNTS}
                      />
                    </Grid.Col>

                    {/* QUANT_SPECIAL_BANKING_ACCOUNTS */}
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <NumberInput
                        name="QUANT_SPECIAL_BANKING_ACCOUNTS"
                        label="Special Banking Accounts"
                        placeholder="0-99"
                        min={0}
                        value={formValues.QUANT_SPECIAL_BANKING_ACCOUNTS || ""}
                        onChange={(value) =>
                          handleSelectChange(
                            "QUANT_SPECIAL_BANKING_ACCOUNTS",
                            value
                          )
                        }
                        required
                        error={errors.QUANT_SPECIAL_BANKING_ACCOUNTS}
                      />
                    </Grid.Col>

                    {/* QUANT_CARS */}
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <NumberInput
                        name="QUANT_CARS"
                        label="Number of Vehicles"
                        placeholder="0-99"
                        min={0}
                        value={formValues.QUANT_CARS || ""}
                        onChange={(value) =>
                          handleSelectChange("QUANT_CARS", value)
                        }
                        required
                        error={errors.QUANT_CARS}
                      />
                    </Grid.Col>

                    {/* COMPANY */}
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        name="COMPANY"
                        label="Employer Company"
                        placeholder="Enter company name"
                        value={formValues.COMPANY || ""}
                        onChange={handleInputChange}
                        required
                        error={errors.COMPANY}
                      />
                    </Grid.Col>

                    {/* PROFESSION_CODE */}
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        name="PROFESSION_CODE"
                        label="Profession Code"
                        placeholder="Enter profession code"
                        value={formValues.PROFESSION_CODE || ""}
                        onChange={handleInputChange}
                        required
                        error={errors.PROFESSION_CODE}
                      />
                    </Grid.Col>

                    {/* OCCUPATION_TYPE */}
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        name="OCCUPATION_TYPE"
                        label="Occupation Type"
                        placeholder="Enter occupation type"
                        value={formValues.OCCUPATION_TYPE || ""}
                        onChange={handleInputChange}
                        required
                        error={errors.OCCUPATION_TYPE}
                      />
                    </Grid.Col>

                    {/* AGE */}
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <NumberInput
                        name="AGE"
                        label="Age"
                        placeholder="18-99"
                        min={18}
                        value={formValues.AGE || ""}
                        onChange={(value) => handleSelectChange("AGE", value)}
                        required
                        error={errors.AGE}
                      />
                    </Grid.Col>

                    {/* Credit Cards */}
                    <Grid.Col span={12}>
                      <Title order={4} mb="sm">
                        Credit Cards
                      </Title>
                      <Flex gap="md">
                        <Checkbox
                          name="FLAG_VISA"
                          label="Visa"
                          checked={formValues.FLAG_VISA || false}
                          onChange={(e) =>
                            handleSelectChange(
                              "FLAG_VISA",
                              e.currentTarget.checked
                            )
                          }
                        />
                        <Checkbox
                          name="FLAG_MASTERCARD"
                          label="Mastercard"
                          checked={formValues.FLAG_MASTERCARD || false}
                          onChange={(e) =>
                            handleSelectChange(
                              "FLAG_MASTERCARD",
                              e.currentTarget.checked
                            )
                          }
                        />
                        <Checkbox
                          name="FLAG_OTHER_CARDS"
                          label="Other Cards"
                          checked={formValues.FLAG_OTHER_CARDS || false}
                          onChange={(e) =>
                            handleSelectChange(
                              "FLAG_OTHER_CARDS",
                              e.currentTarget.checked
                            )
                          }
                        />
                      </Flex>
                    </Grid.Col>

                    {/* PRODUCT */}
                    <Grid.Col span={12}>
                      <TextInput
                        name="PRODUCT"
                        label="Product"
                        placeholder="Enter requested product"
                        value={formValues.PRODUCT || ""}
                        onChange={handleInputChange}
                        required
                        error={errors.PRODUCT}
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
                        Evaluate Credit Risk
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
