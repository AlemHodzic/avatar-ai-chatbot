
const arrValidOrigins = [
    'localhost',
    'promoplaza.nl',
    'heygendemoapp1638.azurewebsites.net',
    'iamsara.io'
];

export default function isValidOrigin(originToValidate) {

    return arrValidOrigins.includes(originToValidate);

}
