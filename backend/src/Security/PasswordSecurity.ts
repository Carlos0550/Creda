import bcrypt from "bcryptjs"

export const getHashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(11); 
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

export const comparePassword = async (password: string, hashed: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashed);
};
  