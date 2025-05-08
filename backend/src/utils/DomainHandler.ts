import "dotenv/config";

const nodeEnv = process.env.NODE_ENV;

const domains: Record<string, string> = {
  production: "https://creda-development.up.railway.app/api",
  development: "http://localhost:5000/api",
};

export const getDomain = (): string => {
  return domains[nodeEnv || "development"];
};
