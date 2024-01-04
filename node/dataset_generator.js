const fs = require("fs");
const { createCanvas } = require("canvas");
const constants = require("../common/constants");
const draw = require("../common/draw");
const utils = require("../common/utils");

const canvas = createCanvas(400, 400);
const ctx = canvas.getContext("2d");

const fileNames = fs.readdirSync(constants.RAW_DIR);
const samples = [];
let id = 1;

const generateImageFile = (outFile, paths) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw.paths(ctx, paths);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outFile, buffer);
};

fileNames
    .filter((fn) => fn.endsWith(".json"))
    .forEach((fn) => {
        const filePath = `${constants.RAW_DIR}/${fn}`;
        const numOfFiles = fileNames.filter((fn) =>
            fn.endsWith(".json")
        ).length;
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

                utils.printProgress(id, numOfFiles * 8);

                id++;
            }
        } catch (error) {
            console.error(`Error parsing JSON in file: ${filePath}`);
            console.error(error);
        }
    });

fs.writeFileSync(constants.SAMPLES, JSON.stringify(samples));
fs.writeFileSync(
    constants.SAMPLES_JS,
    `const samples = ${JSON.stringify(samples)};`
);
