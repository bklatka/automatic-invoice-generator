const axios = require('axios');
const fs = require('fs');
require('dotenv').config();
const path = require('path');
const os = require('os');
const { addDays, endOfMonth } = require('date-fns');

const monthChooser = require('./selectMonth');



function getEndOfMonthDay(monthNumber) {
    // Check if the month number is valid
    if (monthNumber >= 1 && monthNumber <= 12) {
        // Create a date object for the end of the month
        const endOfMonthDate = endOfMonth(new Date(2023, monthNumber - 1));
        // Add 14 days to the end of the month
        return endOfMonthDate;
    } else {
        throw new Error('Invalid month number.');
    }
}



const { INFAKT_API_KEY, SELLER_NAME, SELLER_NIP, SELLER_BANK_ACOCUNT, SERVICE_NAME, CLIENT_ID } = process.env;
const NET_PRICE = parseFloat(process.env.NET_PRICE);
const YOUR_DATA = {
    name: SELLER_NAME,
    tax_no: SELLER_NIP,
    bank_account: SELLER_BANK_ACOCUNT,
    serviceName: SERVICE_NAME
}



// Ustawienia Infakt API
const infaktApiKey = INFAKT_API_KEY;
const infaktUrl = 'https://api.infakt.pl/v3';

const FILE_NAME = `${new Date().getMonth() + 1}.pdf`;

const filePath = path.join(os.homedir(), 'Desktop', FILE_NAME);




monthChooser.selectMonth().then(month => {

// Ustawienia faktury
    const lastDayOfMonth = getEndOfMonthDay(month);
    const paymentDate = addDays(lastDayOfMonth, 14);
    const invoiceData = {
        invoice_date: lastDayOfMonth.toISOString().slice(0, 10), // Data wystawienia faktury
        sale_date: lastDayOfMonth.toISOString().slice(0, 10), // Data wystawienia faktury
        payment_date: paymentDate.toISOString().slice(0, 10), // Data płatności
        seller_name: YOUR_DATA.name, // Nazwa sprzedawcy
        seller_tax_no: YOUR_DATA.tax_no, // NIP sprzedawcy
        seller_bank_account: YOUR_DATA.bank_account, // Numer konta bankowego sprzedawcy
        client_id: CLIENT_ID,
        services: [ // Pozycje na fakturze
            {
                name: YOUR_DATA.serviceName,
                quantity: 1,
                unit: 'szt.',
                net_price: NET_PRICE * 100,
                tax_price: NET_PRICE * 0.23 * 100,
                gross_price: NET_PRICE * 1.23 * 100, // gross price in grosze
                tax_symbol: 23,
            },
        ],
    };


// Tworzenie faktury w Infakt
    axios.post(`${infaktUrl}/invoices.json`, { invoice: invoiceData }, {
        headers: {
            "X-inFakt-ApiKey": infaktApiKey,
            'Content-Type': 'application/json',
        },
    })
        .then((response) => {
            const invoiceId = response.data.id;

            axios({
                method: 'get',
                url: `${infaktUrl}/invoices/${invoiceId}/pdf.json`,
                responseType: "arraybuffer",
                data: {
                    document_type: "original"
                },
                headers: {
                    "X-inFakt-ApiKey": infaktApiKey,
                    'Content-Type': 'application/json',
                }
            })
                .then(response => {
                    fs.writeFileSync(filePath, response.data);
                    console.log(`Zapisano fakturę w ${filePath}`);
                })

        })
        .catch((error) => {
            console.error(error);
        });



})

