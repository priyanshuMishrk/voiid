const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "VOIID",
            version: "1.0.0",
            description: "All the apis for the voiid app",
        },
        servers: [
            {
                url: "http://localhost:3000", // Your local server URL
            },
            {
                url: "http://13.201.20.196", // Your local server URL
            },
        ],
    },
    apis: ["./routes/*/*.js"], // Path to your route files or inline docs
};

module.exports = swaggerOptions;