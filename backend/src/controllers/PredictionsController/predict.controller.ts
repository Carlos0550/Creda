import { Request, Response } from "express";
import pool from "../../connections/database_conn";

export async function analyzeFile(req:Request, res:Response) {
    const file = req.file

}