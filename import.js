import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // bu satır önemli!

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Product from "./src/models/Product.js";

const MONGO_URI = process.env.MONGODB_URI;

async function importData() {
  console.log("🚀 Dosya çalışıyor. Bağlantı kuruluyor...");

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB bağlantısı başarılı.");

    const filePath = path.join(process.cwd(), "data", "products.json");
    console.log("📂 Dosya yolu:", filePath);

    const jsonData = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(jsonData);
    console.log(`📦 ${products.length} ürün bulundu, yükleniyor...`);

    await Product.insertMany(products);
    console.log("🟢 Ürünler başarıyla yüklendi.");
    process.exit();
  } catch (err) {
    console.error("❌ HATA:", err.message);
    process.exit(1);
  }
}

importData();
