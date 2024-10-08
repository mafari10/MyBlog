import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import { fileURLToPath } from "url";
import path from "path";

const app = express();
const port = "3000";
const pathfile = "public";
const datastore = [];
// file path for configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Apply Bootsrap for styling
app.use(
  "/bootstrap",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist"))
);

// Configure multer storage for image upload
const ImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads")); // Save to the 'uploads' folder relative to the current directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save file with timestamp and original extension
  },
});
const upload = multer({ storage: ImgStorage });

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(pathfile));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.render("index.ejs", { datastore });
});
app.get("/add", (req, res) => {
  const index = req.query.index;
  const post = index !== undefined ? datastore[parseInt(index)] : null;
  res.render("add.ejs", { post, index });
  console.log(req.query.index);
});
app.post("/add", upload.single("image"), (req, res) => {
  const { title, message } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : ""; // Get the uploaded file path

  if (title && message) {
    datastore.push({ title, message, image }); // Add the post data to the array
  }
  res.redirect("/");
});

// POST route to update data
app.post("/update", upload.single("image"), (req, res) => {
  const { index, title, message } = req.body;

  // Keep the old image if none is uploaded
  const image = req.file
    ? `/uploads/${req.file.filename}`
    : datastore[parseInt(index)].image;

  // Update image if new one is uploaded
  if (index && title && message) {
    datastore[parseInt(index)].title = title;
    datastore[parseInt(index)].message = message;
    datastore[parseInt(index)].image = image;
  }

  res.redirect("/");
});

// POST route to delete data
app.post("/delete", (req, res) => {
  const { index } = req.body;
  if (index) {
    // Remove the data by index
    datastore.splice(parseInt(index), 1);
  }
  res.redirect("/");
});

app.listen(`${port}`, () => {
  console.log("Server has started on port " + port);
});
