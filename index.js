const fs = require("fs");
const { parse } = require("csv-parse");

const x = 0 //features
const y = 1 //labels
let w = 1
let b = 1
let yHat = 0
const data = [[], []]
let training = [[], []]
let validation = [[], []]
const file = "./housing.csv"

const ETL = (file, next) => {
    fs.createReadStream(file)
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
            // console.log(row);
            //  Square foot
            data[x].push(row[1])
            // prices
            data[y].push(row[0])
        })
        .on("end", function () {
            console.log("File loaded, features and labels extracted");
            // console.log(data)
            for (let index = 0; index < data[0].length; index++) {
                // 5:1 sampling for validation data set
                if (index % 5 == 0) {
                    // labels
                    training[y] = [...training[y], data[y][index]]
                    validation[y] = [...validation[y], data[y][index]]
                } else {
                    // features
                    training[x] = [...training[x], data[x][index]]
                    validation[x] = [...validation[x], data[x][index]]
                }
            }
            // console.log(
            //     training[x].length,
            //     validation[y].length,
            //     training[x].length,
            //     validation[y].length
            // );
            next();
        })
        .on("error", function (error) {
            console.log(error.message);
        });
}

const model = (w, b, trainingData) => {
    console.log("Creating Model");
    const numData = trainingData[x].length
    const label = []
    for (let index = 0; index < numData; index++) {
        // y = mx + b
        label.push((w * trainingData[x][index]) + b)
    }
    // I think this is the mean of all the Y's produced
    return label.reduce((a, b) => a + b) / label.length;
}

const predict = (w, b, y, validation) => {
    console.log("Predicting the values for the validation set");
    const predictedLabels = []
    for (let index = 0; index < validation[x].length; index++) {
        // y−b = m (x−a)
        predictedLabels.push([validation[x][index], ((y - b) / w)])
    }
    // console.log(predictedLabels);
    return predictedLabels
}

const cost = (model, validation) => {
}

const gradientDescent = () => {
    console.log("Finding local minima");
}

const train = () => {
    console.log("Training Model");
    const label = model(w, b, training)
    console.log("slope from model", label);

    const predictions = predict(w, b, label, validation)
    console.log("predicted labels per feature", predictions);
}

const validate = () => {
    console.log("Validation step");
}


ETL(file, () => {
    train()
    // validate()
})