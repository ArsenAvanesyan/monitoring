const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const processImages = async (buffer) => {

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const outputFileName = `${uniqueSuffix}.jpeg`;
    const outputPath = path.join(
        __dirname,
        "../../",
        "public/images",
        outputFileName
    );

    // Создание директории, если её нет
    const dir = path.join(__dirname, "..", "public/images");
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Обработка изображения с помощью sharp
    await sharp(buffer)
        .resize(300, 300) // Изменение размера
        .toFormat("jpeg", { quality: 80 }) // Конвертация в JPEG
        .toFile(outputPath); // Сохранение файла

    return outputFileName;
};

module.exports = { upload, processImages };
