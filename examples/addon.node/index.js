const path = require("path");
const { whisper } = require(path.join(
  __dirname,
  "../../build/Release/whisper-addon"
));
const { promisify } = require("util");


const whisperParams = {
  language: "en",
  model: path.join(__dirname, "../../models/ggml-base.en.bin"),
  fname_inp: "../../samples/jfk.wav"
};

const arguments = process.argv.slice(2);
const params = Object.fromEntries(
  arguments.reduce((pre, item) => {
    if (item.startsWith("--")) {
      return [...pre, item.slice(2).split("=")];
    }
    return pre;
  }, [])
);

for (const key in params) {
  if (whisperParams.hasOwnProperty(key)) {
    whisperParams[key] = params[key];
  }
}

console.log("whisperParams =", whisperParams);

const whisperPromise = async ({
  whisperParams,
  verbose,
  onSegment,
  onProgress }) => {
  return new Promise((resolve, reject) => {
    whisper(whisperParams, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    }, (err, segment) => {
      if (err) {
        reject(err);
      } else {
        if (onSegment) onSegment(segment);
      }
    }, (err, progress) => {
      if (err) {
        reject(err);
      } else {
        if (onProgress) onProgress(progress);
      }
    }, verbose);
  });
}

(async () => {
  try {
    const result = await whisperPromise({
      whisperParams,
      verbose: true,
      onSegment: (segment) => {
        console.log(segment);
      },
      onProgress: (progress) => {
        console.log(`progress = ${progress}`);
      }
    });
    console.log("result =", result);
  } catch (err) {
    console.error(err);
  }
})();

