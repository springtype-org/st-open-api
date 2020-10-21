module.exports = {
    "roots": [
        "<rootDir>/test"
    ],
    "testMatch": [
        "**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
}
