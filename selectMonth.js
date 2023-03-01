const List = require('prompt-list');

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const question = new List({
    name: 'chosenMonth',
    message: 'Please choose a month from the following list:',
    // choices may be defined as an array or a function that returns an array
    choices: months
});
// List of all months


function selectMonth() {
    // Configure prompt
    // Prompt user to choose a month
    return question.run()
        .then(function (answer) {

            // Check if the chosen month is valid
            const monthNumber = months.indexOf(answer) + 1;

            if (monthNumber >= 1 && monthNumber <= 12) {
                return monthNumber;
            } else {
                console.log(monthNumber)
                throw new Error('Invalid month selection.');
            }
        })
        .catch(function (error) {
            throw error;
        });
}

module.exports = {
    selectMonth: selectMonth
};
