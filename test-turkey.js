
const turkey = require('turkey-neighbourhoods');

console.log('City List Sample:', turkey.cityList.slice(0, 1));
try {
    const districts = turkey.getDistrictsByCityCode('06');
    console.log('Districts of 06:', districts.slice(0, 2));
} catch (e) {
    console.log('Error 06:', e.message);
    try {
        const districts = turkey.getDistrictsByCityCode(6);
        console.log('Districts of 6:', districts.slice(0, 2));
    } catch (e2) {
        console.log('Error 6:', e2.message);
    }
}
