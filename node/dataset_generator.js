const fs = require("fs");
const { createCanvas } = require("canvas");
const draw = require("../common/draw");

const canvas = createCanvas(400, 400);
const ctx = canvas.getContext("2d");
const constants = {};

constants.DATA_DIR = "../data";
constants.RAW_DIR = `${constants.DATA_DIR}/raw`;
constants.DATASET_DIR = `${constants.DATA_DIR}/dataset`;
constants.JSON_DIR = `${constants.DATASET_DIR}/json`;
constants.IMG_DIR = `${constants.DATASET_DIR}/img`;
constants.SAMPLES = `${constants.DATASET_DIR}/samples.json`;

const fileNames = fs.readdirSync(constants.RAW_DIR);
const samples = [];
let id = 1;

const generateImageFile = (outFile, paths) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw.paths(ctx, paths);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outFile, buffer);
};

fileNames.forEach((fn) => {
    // Skip files that start with a dot (e.g., .DS_Store)
    if (fn.startsWith(".")) {
        console.log(`Skipping file: ${fn}`);
        return;
    }

    const filePath = `${constants.RAW_DIR}/${fn}`;
    try {
        const content = fs.readFileSync(filePath);
        const { session, student, drawings } = JSON.parse(content);
        for (let label in drawings) {
            samples.push({
                id,
                label,
                student_name: student,
                student_id: session,
            });

            const paths = drawings[label];

            fs.writeFileSync(
                `${constants.JSON_DIR}/${id}.json`,
                JSON.stringify(paths)
            );

            generateImageFile(`${constants.IMG_DIR}/${id}.png`, paths);

            id++;
        }
    } catch (error) {
        console.error(`Error parsing JSON in file: ${filePath}`);
        console.error(error);
    }
});

fs.writeFileSync(constants.SAMPLES, JSON.stringify(samples));
