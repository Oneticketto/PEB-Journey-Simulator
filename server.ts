import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the GoogleGenAI instance with server secrets
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for personalized Thai feedback using Gemini API
  app.post("/api/feedback", async (req, res) => {
    try {
      const { answers, ecoProfile, pebScore, carbonScore } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: "Invalid answers payload" });
      }

      // If Gemini Key is missing, alert and fallback to static logic gracefully
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is not defined in environments. Falling back to structured response.");
        return res.json({
          isFallback: true,
          strengths: [
            "คุณพยายามตัดสินใจที่เป็นมิตรต่อสิ่งแวดล้อมในหลาย ๆ ด่าน",
            "มีความเข้าใจในเรื่องการประหยัดพลังงานและการใช้ระบบขนส่งสาธารณะเป็นอย่างดี"
          ],
          weaknesses: [
            "ในบางสถานการณ์ ความสะดวกสบายส่วนตัวยังคงมีอิทธิพลเหนือการลดการปล่อยก๊าซคาร์บอน",
            "ยังมีโอกาสที่จะปรับปรุงเรื่องการลดการใช้พลาสติกแบบใช้ครั้งเดียวทิ้งเพิ่มขึ้น"
          ],
          suggestions: [
            "พยายามพกถุงผ้าและแก้วน้ำส่วนตัวให้ชินเป็นนิสัย เพื่อลดพลาสติกในชีวิตประจำวัน",
            "หันมาเลือกใช้บันไดแทนการกดลิฟต์สำหรับชั้นเรียนในระยะใกล้ เพื่อประหยัดพลังงานไฟมหาวิทยาลัย"
          ],
          summaryQuote: "ทุกก้าวเล็กๆ ของคุณช่วยเปลี่ยนแปลงมหาวิทยาลัยของเราให้กลายเป็นสังคมยั่งยืนสีเขียวได้เสมอ!"
        });
      }

      // Construct a detailed prompt describing user behavior
      let scenariosText = "";
      answers.forEach((ans, idx) => {
        scenariosText += `${idx + 1}. หมวด: ${ans.category} \n   สถานการณ์: ${ans.question} \n   ตัวเลือกที่ตัดสินใจ: "${ans.choiceText}" (คะแนนรักโลก: ${ans.pebScore}/10, ปล่อยคาร์บอน: ${ans.carbonImpact} kg CO2, ความสะดวกสบาย: ${ans.convenienceScore}/10)\n\n`;
      });

      const systemPrompt = `คุณเป็นผู้เชี่ยวชาญด้านพฤติกรรมเพื่อสิ่งแวดล้อม (Pro-Environmental Behavior หรือ PEB) และสถาปัตยกรรมย่อยสลายคาร์บอน ประจำมหาวิทยาลัย
ภารกิจของคุณคือวิเคราะห์พฤติกรรมของนักศึกษาจากการตอบคำถามจำลอง 1 วันในมหาวิทยาลัย และสร้างรายงานผลการประเมินส่วนบุคคลเป็นภาษาไทยที่สุภาพ เป็นมิตร กระตุ้นเชิงบวก และสร้างสรรค์

ข้อมูลผู้เล่น:
- ผลลัพธ์โปรไฟล์รักษ์โลกที่เลียนแบบได้: "${ecoProfile}"
- คะแนนรักษ์โลกเฉลี่ย (PEB Score): ${pebScore}/10
- รอยเท้าคาร์บอนสุทธิจากการตอบคำถาม: ${carbonScore} กิโลกรัม CO2

บทวิเคราะห์สถานการณ์ที่ตอบมา:
${scenariosText}

กรุณาวิเคราะห์จุดเด่นของนักศึกษาคนนี้ (strengths), จุดที่ยังพัฒนาพฤติกรรมรักษ์โลกเพิ่มได้อีกโดยคำนึงถึงความสะดวกสะบายที่ยังบาลานซ์ได้ (weaknesses), คำแนะนำเชิงรุกที่นำไปทำจริงได้ในวิทยเขตมหาวิทยาลัย (suggestions), และให้คำคมสั้น ๆ หนุนใจสำหรับการตัดสินใจรอบนี้ (summaryQuote)

เงื่อนไขทางภาษา:
- ทุกคำตอบและหัวข้อต้องส่งเป็น "ภาษาไทย" เท่านั้น ห้ามส่งข้อความดิบเป็นภาษาอังกฤษเด็ดขาด
- คำแนะนำเหมาะสมกับบริบทนักศึกษามหาวิทยาลัย (เช่น ตึกเรียน, การส่งสมุดรายงาน, การขึ้นลงลิฟต์, โรงอาหาร, หรือการเดินทางด้วยรถมอเตอร์ไซค์/วินวิน)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "กรุณาวิเคราะห์ผลลัพธ์พฤติกรรมรักษ์โลกตามเกณฑ์ที่กำหนด",
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "รายการจุดแข็งภาษาไทย 2 ข้อ"
              },
              weaknesses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "รายการจุดอ่อนที่พัฒนาได้ภาษาไทย 2 ข้อ"
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "คำแนะนำเชิงรุกที่ทำได้จริงภาษาไทย 2 ข้อ"
              },
              summaryQuote: {
                type: Type.STRING,
                description: "คำคมรักษ์โลกภาษาไทยปิดท้ายสร้างแรงบันดาลใจสั้นๆ 1 ประโยค"
              }
            },
            required: ["strengths", "weaknesses", "suggestions", "summaryQuote"]
          }
        }
      });

      const responseText = response.text || "{}";
      const feedbackPayload = JSON.parse(responseText.trim());
      res.json(feedbackPayload);

    } catch (error) {
      console.error("Gemini Api error: ", error);
      res.status(500).json({
        error: "Failed to generate dynamic feedback",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Vite development server / Production static server loader
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PEB Server] Running smoothly on port http://localhost:${PORT}`);
  });
}

startServer();
