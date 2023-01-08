const fs = require("fs");
const { parse } = require("csv-parse");
const nodeplotlib = require('nodeplotlib');

const LinearRegressionModel = (data) => {
    // Extract the features and labels from the data
    const [X, y] = data;

    // Initialize the model parameters
    let w = 1;
    let b = 1;

    // Define the learning rate
    const alpha = 0.01;

    // Define the number of iterations
    const iterations = 100000;

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

const gradientDescentog = (X, y, alpha, iterations, w, b) => {
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

const calculateGradient = (X, y, w, b) => {
    // console.log("line 66", w);
    const m = X.length;
    return X.reduce((accumulator, x, j) => {
        // console.log("line-69", j, accumulator, x, y[j], w, b);
        const predictedValue = predict({ w, b }, x);
        const difference = predictedValue - y[j];
        const product = difference * x;
        // console.log("line 73", predictedValue, difference, product, x);
        return accumulator + product;
    }, 0) * (1 / (2 * m));
};

const gradientDescent = (X, y, alpha, iterations, w, b) => {
    console.log("line 78", w);
    // Initialize variables
    let converged = false;
    let iter = 0;
    const m = X.length;
    const tolerance = 1e-3;

    // Initialize an array to store the costs per iteration
    const costs = [];

    // Start gradient descent loop
    while (!converged && iter < iterations) {
        // console.log("WandB",w,b);
        // Initialize gradients to 0
        let gradient = 0;
        let yPred = X.map(x => predict({ w, b }, x));

        // Compute gradients
        gradient = calculateGradient(X, y, w, b);

        // Update parameters
        w -= alpha * gradient;
        // console.log("line 98",iter,  alpha, gradient);
        b -= alpha * (1 / m) * X.reduce((accumulator, x, j) => accumulator + (predict({ w, b }, x) - y[j]), 0);

        // Check for convergence
        if (Math.abs(gradient) < tolerance) {
            converged = true;
        }

        // Calculate the mean squared cost
        const cost = meanSquaredCost(yPred, y);

        // Add the cost to the array
        costs.push([cost, iter]);

        // Print the cost per iteration
        console.clear()
        console.log(`Iteration ${iter + 1}: cost = ${cost}`);

        // Increment iterations
        iter++;
    }

    return { w, b, costs };
};

const meanSquaredCost = (yPred, y) => {
    // Check if yPred and y are arrays or single numbers
    if (Array.isArray(yPred) && Array.isArray(y)) {
        // Calculate the error between the prediction and the actual label
        const error = y.map((yVal, index) => yVal - yPred[index]);

        // Return the mean squared error
        return (1 / y.length) * error.reduce((sum, current) => sum + current ** 2, 0);
    } else {
        // Calculate the error between the prediction and the actual label
        const error = y - yPred;

        // Return the squared error
        return error ** 2;
    }
};

const predict = (model, X) => {
    // Extract the weights and bias from the model
    const { w, b } = model;

    // Check if X is an array of features or a single feature
    if (Array.isArray(X)) {
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
    } else {
        // Return the prediction for the single feature
        return w * X + b;
    }
};

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
        grid[yPos][xPos + 2] = "*";
    });

    // Add the x-axis scale to the plot grid
    for (let i = xMin; i <= xMax; i++) {
        const xPos = Math.round((i - xMin) / xScale);
        grid[9][xPos + 3] = abbreviateNumber(i);
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

const scatterPlot = (data, xLabel, yLabel) => {
    // Find the min and max values for both axes
    const xValues = data.map(point => point[0]);
    const yValues = data.map(point => point[1]);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    // Create the plot with a 20x40 grid
    let plot = '';
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 40; j++) {
            // Check if this point is within the bounding box
            if (j >= xMin && j <= xMax && 20 - i <= yMax && 20 - i >= yMin) {
                // Check if there is a data point at this location
                let point = data.find(point => point[0] === j && point[1] === 20 - i);
                if (point) {
                    plot += 'X';
                } else {
                    plot += ' ';
                }
            } else {
                plot += ' ';
            }
        }
        plot += '\n';
    }

    // Add the x-axis label
    plot += '\n';
    for (let i = 0; i < xLabel.length; i++) {
        plot += ' ';
    }
    for (let i = 0; i < 40 - xLabel.length; i++) {
        plot += '_';
    }
    plot += '\n';
    for (let i = 0; i < xLabel.length; i++) {
        plot += ' ';
    }
    plot += xLabel;

    // Add the y-axis label
    const yLabelPadding = Array(yMax + 1).join('\n');
    plot = yLabelPadding + plot;
    let yLabelLines = yLabel.split('\n');
    for (let i = 0; i < yLabelLines.length; i++) {
        plot = ' ' + yLabelLines[i] + '\n' + plot;
    }

    console.log(plot);
}

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

const unnormalize = (x_norm, x_min, x_max) => {
    return x_norm * (x_max - x_min) + x_min;
}

const findMinMax = list => {
    return {
        min: Math.min(...list),
        max: Math.max(...list),
    };
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

    // console.log("\n\n \t\tValidation data set\n\n");
    // let xLabel = 'prices';
    // let yLabel = 'area';
    // const zipped = validationX.map((x, i) => [x, yPred[i]]);
    // plot(zipped, xLabel, yLabel); 

    const { min: x_min, max: x_max } = findMinMax(validationX);
    const x_unnormalized = validationX.map(xn => unnormalize(xn, x_min, x_max));

    const { min: y_min, max: y_max } = findMinMax(yPred);
    const y_unnormalized = yPred.map(xn => unnormalize(xn, y_min, y_max));

    let layout = {
        legend: {
            y: 0.5,
            yref: 'paper',
            font: {
                family: 'Arial, sans-serif',
                size: 20,
                color: 'grey',
            }
        },
        title: 'Price vs area',
        showlegend: false
    };
    nodeplotlib.plot([{
        x: validationX,
        y: validationY,
        // x: x_unnormalized,
        // y: y_unnormalized,
        mode: 'markers',
        type: 'scatter',
        name: "Error cost per iteration"
    }, {
        x: validationX,
        y: yPred,
        // x: x_unnormalized,
        // y: y_unnormalized,
        mode: 'lines+markers',
        type: 'scatter',
        name: "Error cost per iteration"
    }], layout);


    // console.log("\t\tError per iteration set\n");
    // console.log("line 186",yPred, validationY);
    const cost = meanSquaredCost(yPred, validationY);

    console.log('\n\nValidation results:');
    // console.log(`  Predictions: ${yPred.slice(0, 3)}...`);
    // console.log(`  Labels: ${y.slice(0, 3)}...`);
    console.log(`  Mean Squared Cost: ${cost} for W:${model.w} B:${model.b}\n\n`);

    // xLabel = 'error';
    // yLabel = 'iteration';
    // console.log(model.costs);
    // plot(model.costs, xLabel, yLabel);

    a = model.costs.map(pair => pair[0]);
    b = model.costs.map(pair => pair[1]);

    layout = {
        legend: {
            y: 0.5,
            yref: 'paper',
            font: {
                family: 'Arial, sans-serif',
                size: 20,
                color: 'grey',
            }
        },
        title: 'Cost per iteration',
        showlegend: false
    };
    nodeplotlib.plot([{
        x: b,
        y: a,
        mode: 'lines+markers',
        type: 'scatter',
        name: "Error cost per iteration"
    }], layout);

};

main();