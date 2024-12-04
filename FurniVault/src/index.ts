import { v4 as uuidv4 } from "uuid";
import { StableBTreeMap } from "azle";
import express from "express";
import { time } from "azle";

/**
 * Kelas `FurnitureItem` merepresentasikan perabot rumah tangga yang akan dijual atau dilelang.
 */
class FurnitureItem {
  id: string;
  name: string;
  description: string;
  startingPrice: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date | null;
  seller: string; // Nama atau ID penjual
  status: "available" | "sold" | "auction"; // Status barang
}

const furnitureStorage = StableBTreeMap<string, FurnitureItem>(0);

const app = express();
app.use(express.json());

/**
 * Endpoint untuk menambahkan barang baru.
 */
app.post("/furniture", (req, res) => {
  const furnitureItem: FurnitureItem = {
    id: uuidv4(),
    createdAt: getCurrentDate(),
    updatedAt: null,
    status: "available",
    ...req.body,
  };
  furnitureStorage.insert(furnitureItem.id, furnitureItem);
  res.json(furnitureItem);
});

/**
 * Endpoint untuk mendapatkan semua barang.
 */
app.get("/furniture", (req, res) => {
  res.json(furnitureStorage.values());
});

/**
 * Endpoint untuk mendapatkan detail barang berdasarkan ID.
 */
app.get("/furniture/:id", (req, res) => {
  const furnitureId = req.params.id;
  const furnitureOpt = furnitureStorage.get(furnitureId);
  if (!furnitureOpt) {
    res.status(404).send(`Barang dengan ID=${furnitureId} tidak ditemukan`);
  } else {
    res.json(furnitureOpt);
  }
});

/**
 * Endpoint untuk memperbarui detail barang.
 */
app.put("/furniture/:id", (req, res) => {
  const furnitureId = req.params.id;
  const furnitureOpt = furnitureStorage.get(furnitureId);
  if (!furnitureOpt) {
    res
      .status(400)
      .send(
        `Tidak dapat memperbarui barang dengan ID=${furnitureId}. Barang tidak ditemukan.`
      );
  } else {
    const furnitureItem = furnitureOpt;

    const updatedFurniture = {
      ...furnitureItem,
      ...req.body,
      updatedAt: getCurrentDate(),
    };
    furnitureStorage.insert(furnitureItem.id, updatedFurniture);
    res.json(updatedFurniture);
  }
});

/**
 * Endpoint untuk menghapus barang.
 */
app.delete("/furniture/:id", (req, res) => {
  const furnitureId = req.params.id;
  const deletedFurniture = furnitureStorage.remove(furnitureId);
  if (!deletedFurniture) {
    res
      .status(400)
      .send(
        `Tidak dapat menghapus barang dengan ID=${furnitureId}. Barang tidak ditemukan.`
      );
  } else {
    res.json(deletedFurniture);
  }
});

app.listen();

/**
 * Fungsi untuk mendapatkan tanggal saat ini dengan format ICP.
 */
function getCurrentDate() {
  const timestamp = new Number(time());
  return new Date(timestamp.valueOf() / 1000_000);
}
