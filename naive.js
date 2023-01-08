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
    const numData = trainingData.length
    const labels = []
    for (let index = 0; index < numData; index++) {
        // y = wx + b
        labels.push(w * trainingData[x][index] + b)
    }
    return labels;
}


const predict = (w, b, validation) => {
    console.log("Predicting the values for the validation set");
    const predictedLabels = []
    for (let index = 0; index < validation[x].length; index++) {
        // y = wx + b
        predictedLabels.push(w * validation[x][index] + b)
    }
    return predictedLabels
}


const meanSquaredCost = (predictions, labels) => {
    // Check that the arrays have the same length
    if (predictions.length !== labels.length) {
        throw new Error('Error: predictions and labels must have the same length.')
    }

    // Calculate the squared error for each prediction
    const squaredErrors = predictions.map((prediction, index) => {
        const error = prediction - labels[index]
        return error * error
    })

    // Calculate the mean of the squared errors
    const meanSquaredError = squaredErrors.reduce((a, b) => a + b) / squaredErrors.length
    return meanSquaredError
}


const gradientDescent = () => {
    console.log("Finding local minima");
}

const train = () => {
    console.log("Training Model");
    const mode = model(w, b, training)
    console.log("slope from model", label);

    const predictions = predict(w, b, validation)
    console.log("predicted labels per feature", predictions);
}

const validate = () => {
    console.log("Validation step");
}


ETL(file, () => {
    train()
    // validate()
})