const fs = require("fs");
const { parse } = require("csv-parse");

const LinearRegressionModel = (data) => {
    // Extract the features and labels from the data
    const [X, y] = data;

    // Initialize the model parameters
    let w = 1;
    let b = 1;

    // Define the learning rate
    const alpha = 0.001;

    // Define the number of iterations
    const iterations = 1000;

    // Train the model
    const model = train(X, y, alpha, iterations, w, b);

    // Return the trained model
    return model;
};

const train = (X, y, alpha, iterations, w, b) => {
    // Run the gradient descent algorithm
    const { w: trainedW, b: trainedB, costs } = gradientDescent(X, y, alpha, iterations, w, b);

    // Return the trained model
    return { w: trainedW, b: trainedB, costs };
};

const gradientDescent = (X, y, alpha, iterations, w, b) => {
    console.log('Training model...');

    // Initialize an array to store the costs per iteration
    const costs = [];

    for (let i = 0; i < iterations; i++) {
        // Make a prediction using the current model parameters
        const yPred = X.map((x) => w * x + b);

        // Calculate the error between the prediction and the actual label
        const error = y.map((yVal, index) => yVal - yPred[index]);

        // Update the model parameters using the gradient
        w = w - alpha * (1 / X.length) * error.reduce((sum, current) => sum + current, 0);
        b = b - alpha * (1 / X.length) * error.reduce((sum, current) => sum + current, 0);

        // Calculate the mean squared cost
        const cost = meanSquaredCost(yPred, y);

        // Add the cost to the array
        costs.push([cost, i]);

        // Print the cost per iteration
        console.log(`Iteration ${i + 1}: cost = ${cost}`);
    }

    console.log('Training complete.');

    return { w, b, costs };
};

const meanSquaredCost = (yPred, y) => {
    // Calculate the error between the prediction and the actual label
    const error = y.map((yVal, index) => yVal - yPred[index]);

    // Return the mean squared error
    return (1 / y.length) * error.reduce((sum, current) => sum + current ** 2, 0);
};

const predict = (model, X) => {
    // console.log("line 67 ", model, X);
    // Extract the weights and bias from the model
    const { w, b } = model;

    // Initialize an array to store the predictions
    const predictions = [];

    // Loop over the data and use the model to make predictions
    for (let i = 0; i < X.length; i++) {
        const x = X[i];
        const prediction = w * x + b;
        predictions.push(prediction);
    }

    // Return the predictions
    return predictions;
}

const abbreviateNumber = (num) => {
    if (num >= 1000) {
        return (Math.round((num / 1000) * 10) / 10) + 'k';
    } else {
        return String(num);
    }
}

const plot = (points, xLabel, yLabel) => {
    // Extract the x and y values from the points
    const x = points.map((point) => point[1]);
    const y = points.map((point) => point[0]);

    // Find the minimum and maximum x values
    const xMin = Math.floor(Math.min(...x));
    const xMax = Math.ceil(Math.max(...x));

    // Find the minimum and maximum y values
    const yMin = Math.floor(Math.min(...y));
    const yMax = Math.ceil(Math.max(...y));

    // Calculate the x and y scales
    const xScale = (xMax - xMin) / 25;
    const yScale = (yMax - yMin) / 10;

    // Initialize the plot grid
    const grid = [];

    // Generate the plot grid
    for (let i = 0; i < 10; i++) {
        grid.push(new Array(25).fill(" "));
    }

    // Add the points to the plot grid
    points.forEach((point) => {
        const xPos = Math.round((point[1] - xMin) / xScale);
        const yPos = 10 - Math.round((point[0] - yMin) / yScale);
        // console.log("line 121",xPos);
        grid[yPos][xPos] = "*";
    });

    // Add the x-axis scale to the plot grid
    for (let i = xMin; i <= xMax; i++) {
        const xPos = Math.round((i - xMin) / xScale);
        grid[9][xPos+3] = abbreviateNumber(i);
    }

    // Add the y-axis scale to the plot grid
    for (let i = yMin; i <= yMax; i++) {
        let yPos = 9 - Math.round((i - yMin) / yScale);
        if (yPos < 0)
            yPos = 0;
        grid[yPos][1] = abbreviateNumber(i);
    }

    // Add the x-axis label to the plot grid
    grid[9][26] = xLabel;

    // Add the y-axis label to the plot grid
    for (let i = 0; i < yLabel.length; i++) {
        grid[i + 2][0] = yLabel[0 + i];
    }

    // Print the plot to the console
    console.log(grid.map((row) => row.join(" ")).join("\n"));
};


const sample = (arrayLength, n) => {
    // console.log(arrayLength, n);
    const sample = new Set();
    while (sample.size < n) {
        sample.add(Math.floor(Math.random() * arrayLength));
    }
    return Array.from(sample);
};

const ETL = (filePath, column1, column2) => {
    return new Promise((resolve, reject) => {
        const feature = [];
        const label = [];

        fs.createReadStream(filePath)
            .pipe(parse({ columns: true }))
            .on('data', (row) => {
                feature.push(Number(row[column1]));
                label.push(Number(row[column2]));
            })
            .on('end', () => {
                resolve([feature, label]);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

const normalize = (values) => {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const std = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
    return values.map((value) => (value - mean) / std);
};


const main = async () => {
    // Load the data
    const data = await ETL("housing.csv", "area", "price");
    let [X, y, costs] = data;

    X = normalize(X);
    y = normalize(y);

    // Sample 5% of the data as a validation set
    const sampleSize = Math.round(X.length * 0.05);
    const sampleIndices = sample(X.length, sampleSize);

    const validationX = sampleIndices.map(i => X[i]);
    X = X.filter((_, i) => !sampleIndices.includes(i));

    const validationY = sampleIndices.map(i => y[i]);
    y = y.filter((_, i) => !sampleIndices.includes(i));

    // console.log("line 171", validationX, validationY);

    // Initialize the model with a single feature and a random weight
    const model = LinearRegressionModel([X, y]);

    // Evaluate the model using the mean squared cost function
    const yPred = predict(model, validationX);

    console.log("\n\n \t\tValidation data set\n\n");
    let xLabel = 'prices';
    let yLabel = 'area';
    const zipped = validationX.map((x, i) => [x, yPred[i]]);
    plot(zipped, xLabel, yLabel);

    
    console.log("\n\n \t\tError per iteration set\n\n");
    const cost = meanSquaredCost(yPred, validationY);
    console.log('\n\n\nValidation results:');
    // console.log(`  Predictions: ${yPred.slice(0, 3)}...`);
    // console.log(`  Labels: ${y.slice(0, 3)}...`);
    console.log(`  Mean Squared Cost: ${cost}`);


    xLabel = 'iteration';
    yLabel = 'error';
    plot(model.costs, xLabel, yLabel);
};

main();