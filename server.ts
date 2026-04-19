import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_here_for_dev";

let supabaseClient: SupabaseClient | null = null;
function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    // Prefer service role key (bypasses RLS) over anon key for a secure backend
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Missing Supabase configuration! Please open the Settings (Secrets) menu in AI Studio and add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is required.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // API ROUTES

  // Auth: Login / Signup
  app.post("/api/auth/register", async (req, res) => {
    const { username, password, isAdmin } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    try {
      const supabase = getSupabase();
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const { data, error } = await supabase
        .from("users")
        .insert([{ username, password: hashedPassword, is_admin: isAdmin || false }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: "Username already exists" });
        }
        throw error;
      }

      const token = jwt.sign({ userId: data.id, isAdmin: data.is_admin, username: data.username }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, user: { id: data.id, username: data.username, isAdmin: data.is_admin } });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (error || !data) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, data.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: data.id, isAdmin: data.is_admin, username: data.username }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, user: { id: data.id, username: data.username, isAdmin: data.is_admin } });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Server error" });
    }
  });

  // Middleware for verifying JWT
  const authMiddleware = (req: any, res: any, next: any) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "No token provided" });
    const token = header.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // Get daily progress
  app.get("/api/progress/today", authMiddleware, async (req: any, res: any) => {
    const userId = req.user.userId;
    const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    try {
      const supabase = getSupabase();
      let { data, error } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("date", dateStr)
        .single();

      if (!data) {
        // Create today's entry
        const { data: newData, error: insertError } = await supabase
          .from("daily_progress")
          .insert([{ user_id: userId, date: dateStr }])
          .select()
          .single();
        
        if (insertError) throw insertError;
        data = newData;
      }
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to fetch progress" });
    }
  });

  // Update daily progress
  app.put("/api/progress/today", authMiddleware, async (req: any, res: any) => {
    const userId = req.user.userId;
    const dateStr = new Date().toISOString().split("T")[0];
    const updateData = req.body;

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("daily_progress")
        .update(updateData)
        .eq("user_id", userId)
        .eq("date", dateStr)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to update progress" });
    }
  });

  // Get weekly data
  app.get("/api/progress/weekly", authMiddleware, async (req: any, res: any) => {
    const userId = req.user.userId;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split("T")[0];

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", userId)
        .gte("date", dateStr)
        .order("date", { ascending: true });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to fetch weekly stats" });
    }
  });

  // Get daily vocab
  app.get("/api/vocab/today", authMiddleware, async (req: any, res: any) => {
    const dateStr = new Date().toISOString().split("T")[0];
    
    try {
      const supabase = getSupabase();
      let { data, error } = await supabase
        .from("daily_vocab")
        .select("*")
        .eq("date", dateStr)
        .single();

      // If data is null or words is empty, we must generate via AI.
      if (!data || !data.words || data.words.length === 0) {
        // Generate via Gemini
        const ai = getAI();
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash", // Standard model
          contents: "Generate exactly 5 useful advanced IELTS vocabulary words. Return JSON as an array of objects. Format: [{'word': '...', 'meaning': '...', 'example': '...'}]",
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  word: { type: "STRING" },
                  meaning: { type: "STRING" },
                  example: { type: "STRING" }
                },
                required: ["word", "meaning", "example"]
              }
            }
          }
        });
        
        let words = [];
        try {
          words = JSON.parse(response.text?.trim() || "[]");
        } catch(e) {
          console.error("Failed to parse vocab", response.text);
        }

        if (!Array.isArray(words) || words.length === 0) {
          throw new Error("AI returned empty or invalid words");
        }

        if (data && data.id) {
          // Row exists but is empty, update it
          const { data: updatedData, error: updateError } = await supabase
            .from("daily_vocab")
            .update({ words })
            .eq("id", data.id)
            .select()
            .single();
          if (updateError) throw updateError;
          data = updatedData;
        } else {
          // Row doesn't exist at all, insert
          const { data: newData, error: insertError } = await supabase
            .from("daily_vocab")
            .insert([{ date: dateStr, words }])
            .select()
            .single();
          if (insertError) throw insertError;
          data = newData;
        }
      }
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to fetch vocab" });
    }
  });

  // Force generate fresh vocab
  app.post("/api/vocab/generate", authMiddleware, async (req: any, res: any) => {
    const dateStr = new Date().toISOString().split("T")[0];
    
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate exactly 5 NEW and extremely useful advanced IELTS vocabulary words (different from common ones). Return JSON as an array of objects. Format: [{'word': '...', 'meaning': '...', 'example': '...'}]",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                word: { type: "STRING" },
                meaning: { type: "STRING" },
                example: { type: "STRING" }
              },
              required: ["word", "meaning", "example"]
            }
          }
        }
      });
      
      let words = [];
      try {
        words = JSON.parse(response.text?.trim() || "[]");
      } catch(e) {
        console.error("Failed to parse freshly generated vocab", response.text);
      }

      if (!Array.isArray(words) || words.length === 0) {
        throw new Error("AI returned empty or invalid words");
      }

      const supabase = getSupabase();
      const { data: existing } = await supabase.from("daily_vocab").select("id").eq("date", dateStr).single();
      
      let finalData;
      if (existing) {
        const { data, error } = await supabase.from("daily_vocab").update({ words }).eq("id", existing.id).select().single();
        if (error) throw error;
        finalData = data;
      } else {
        const { data, error } = await supabase.from("daily_vocab").insert([{ date: dateStr, words }]).select().single();
        if (error) throw error;
        finalData = data;
      }
      
      res.json(finalData);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to generate fresh vocab" });
    }
  });

  // Generate weekly report
  app.post("/api/reports/weekly", authMiddleware, async (req: any, res: any) => {
    try {
      const { stats } = req.body;
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Act as an expert IELTS tutor. Analyze the following 7-day progress stats of a student and provide an improvement summary, strengths, weaknesses, and suggestions. Return the output in a structured JSON format: { "summary": "...", "strengths": ["..."], "weaknesses": ["..."], "suggestions": ["..."] }. Stats: ${JSON.stringify(stats)}`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const report = JSON.parse(response.text?.trim() || "{}");
      res.json(report);
    } catch(err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to generate AI report" });
    }
  });

  // Admin Features
  app.get("/api/admin/users", authMiddleware, async (req: any, res: any) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: "Unauthorized" });
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("users").select("id, username, created_at, is_admin");
      if (error) throw error;
      res.json(data || []);
    } catch(err: any) {
      res.status(500).json({ error: err.message || "Failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // For Express 4
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
