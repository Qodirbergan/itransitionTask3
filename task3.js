const crypto = require('crypto');

class KeyGenerator {
    static generateKey() {
        return crypto.randomBytes(32).toString('hex'); // Generates a 256-bit key (32 bytes)
    }
}

class HmacCalculator {
    calculateHmac(key, data) {
        const hmac = crypto.createHmac('sha256', key);
        hmac.update(data);
        return hmac.digest('hex');
    }
}

class MoveRules {
    constructor(moves) {
        this.moves = moves;
        this.moveCount = moves.length;
        this.rules = this.generateRules();
    }

    generateRules() {
        const rules = {};

        for (let i = 0; i < this.moveCount; i++) {
            rules[this.moves[i]] = {};

            for (let j = 0; j < this.moveCount; j++) {
                if (i === j) {
                    rules[this.moves[i]][this.moves[j]] = 'Draw';
                } else if ((i + 1) % this.moveCount === j) {
                    rules[this.moves[i]][this.moves[j]] = 'Win';
                } else {
                    rules[this.moves[i]][this.moves[j]] = 'Lose';
                }
            }
        }

        return rules;
    }

    getMoveResult(playerMove, computerMove) {
        return this.rules[playerMove][computerMove];
    }
}

class TableGenerator {
    static generateTable(moves, rules) {
        const table = [['Moves', ...moves]];

        for (let i = 0; i < moves.length; i++) {
            const row = [moves[i]];
            for (let j = 0; j < moves.length; j++) {
                row.push(rules[moves[i]][moves[j]]);
            }
            table.push(row);
        }

        return table;
    }

    static printTable(table) {
        const maxLengths = table[0].map((_, i) => Math.max(...table.map(row => row[i].length)));
        const separator = maxLengths.map(length => '-'.repeat(length)).join('-+-');

        console.log(table.map(row => row.map((cell, i) => cell.padEnd(maxLengths[i])).join(' | ')).join('\n'));
        console.log(separator);
    }
}

function playGame(moves) {
    const numberOfMoves = moves.length;

    // Check if the number of moves is odd and greater than 1
    if (numberOfMoves % 2 === 0 || numberOfMoves < 3) {
        console.log('Error: The number of moves must be an odd number >= 3.');
        console.log('Example: node rockPaperScissors.js Rock Paper Scissors');
        return;
    }

    const key = KeyGenerator.generateKey();
    const hmacCalculator = new HmacCalculator(); // Create an instance of HmacCalculator

    console.log(`Generated Key: ${key}`);

    const moveRules = new MoveRules(moves);
    const table = TableGenerator.generateTable(moves, moveRules.rules);

    console.log('Move Rules:');
    TableGenerator.printTable(table);

    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('Menu:');
    moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
    console.log('0 - Exit');

    rl.question('Enter your choice: ', (choice) => {
        rl.close();

        const playerChoice = parseInt(choice);

        if (playerChoice === 0) {
            console.log('Exiting the game.');
            return;
        }

        if (isNaN(playerChoice) || playerChoice < 1 || playerChoice > numberOfMoves) {
            console.log('Error: Invalid choice.');
            playGame(moves);
            return;
        }

        const playerMove = moves[playerChoice - 1];
        const computerMove = moves[Math.floor(Math.random() * numberOfMoves)];
        const hmac = hmacCalculator.calculateHmac(key, playerMove); // Call the calculateHmac method on the instance

        console.log(`Player's Move: ${playerMove}`);
        console.log(`Computer's Move: ${computerMove}`);
        console.log(`HMAC: ${hmac}`);

        const result = moveRules.getMoveResult(playerMove, computerMove);
        console.log(`Result: ${result}`);

        playGame(moves);
    });
}

// Extract moves from command line arguments excluding the first two arguments
const moves = process.argv.slice(2);

playGame(moves);
