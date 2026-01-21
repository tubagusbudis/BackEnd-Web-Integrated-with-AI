require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- Inisialisasi API Gemini ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY tidak ditemukan di .env");
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
// ---------------------------------

// --- Inisialisasi Server Express ---
const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Mengizinkan request dari frontend (beda port)
app.use(express.json()); // Membaca body JSON dari request
// ---------------------------------

/**
 * Fungsi internal untuk memanggil Gemini
 */
async function panggilGemini(promptPengguna) {
  try {
    const result = await model.generateContent(promptPengguna);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error di panggilGemini:", error);
    throw new Error("Gagal berkomunikasi dengan API Gemini");
  }
}

/**
 * Endpoint API yang akan diakses oleh Frontend
 */
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt dibutuhkan" });
    }

    // Panggil Gemini dan dapatkan jawabannya
    const jawabanGemini = await panggilGemini(prompt);

    // Kirim jawaban kembali ke frontend
    res.json({ jawaban: jawabanGemini });
  } catch (error) {
    console.error("Error di endpoint /api/chat:", error.message);
    res.status(500).json({ error: "Terjadi kesalahan internal di server" });
  }
});

// Jalankan server
app.listen(port, () => {
  console.log(`Backend server berjalan di http://localhost:${port}`);
});
