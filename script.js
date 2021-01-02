'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-12-06T17:01:17.194Z',
    '2020-12-09T23:36:17.929Z',
    '2020-12-10T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDayPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

  const daysPassed = calcDayPassed(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, '0');
    // const month = `${date.getMonth() + 1}`.padStart(2, '0');
    // const year = date.getFullYear();

    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date); // international date format based on account settings
  }
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);

    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    // In each call\ print the maining time to UI

    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    // When 0 reach\ stop timer and user log out

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }

    // Decrease 1s

    time--;
  };
  // set time to 5 mines

  let time = 300;

  // call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// // fake loggin
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

/////////////

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  //console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // create current date and time with international settings

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long', // December
      year: '2-digit', // 20
      weekday: 'short', // Fri
    };
    // const locale = navigator.language; // get information from browser
    // console.log(locale); // 'tr-TR'

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // update timer - check if there is already a timer running, if yes, clear it
    if (timer) clearInterval(timer);

    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date

    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value); // to avoid asking loan in decimal number

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add transfer date

      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
///////////// NUMBERS //////////

// all number are in JS are the same whether they are wrintten in as integers or decimals.

console.log(23 === 23.0);

// numbers always are stored in binary format. js with numbers can couse some problems with scientific or financial operations.

console.log(0.1 + 0.2); // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false

// this is an error in JS we have to accept.

/// convers a string to number

console.log(Number('23')); //23
console.log(+'23'); // 23 - Number

// parsing - pars a string to number.  JS will autamaticly figure out which part of it is a number.
// string has to start with Number or else it won't work
// ParseInt() excepts second argument which is our base number (normal numbers are 10 based' binary 2 based). this will avoid some confusions.

console.log(Number.parseInt('30px', 10)); // 30
console.log(Number.parseInt('px30', 10)); // NaN

// reading decimals from strings

console.log(Number.parseFloat('2.5rem')); // 2.5
console.log(Number.parseInt('2.5rem')); // 2

// these functions are also global functions. we dont have to call them on Number but in modern JS they are called with Number

console.log(parseFloat('2.5rem')); // 2.5

// isNan() function. we can use that to chech the valie is a Number or no

console.log(Number.isNaN(20)); // false - is not a NaN
console.log(Number.isNaN('20')); // false
console.log(Number.isNaN(+'20px')); // true
console.log(Number.isNaN(23 / 0)); // false - this gives Infinite result normally

/////// isFinite() /////
// this a better way to chech if value is a Number or not

console.log(Number.isFinite(20)); // true
console.log(Number.isFinite('20')); // true
console.log(Number.isFinite(+'20x')); // false
console.log(Number.isFinite(20 / 0)); // false

/////// isInteger /////////
// we can also check if value is an Integer but isFinite is a bettery to determine number

console.log(Number.isInteger(23)); // true
console.log(Number.isInteger(23.0)); // true  // 23===23.0
console.log(Number.isInteger(23 / 0)); // false


/////////  MATH AND ROUNDING /////

/// Math.sqrt() Square Root - Gives us square root of number

console.log(Math.sqrt(25)); // 5
console.log(25 ** (1 / 2)); // 5 - formula to find square root
console.log(8 ** (1 / 3)); // 2 - qubik root of a number

// Math.max() returns us max value

console.log(Math.max(5, 18, '23', 11, 2)); // 23 - this also does type cuorsion
console.log(Math.max('50px')); // NaN - but not parsing

// Math.min() return us min value

console.log(Math.min(5, 18, '23', 11, '2')); // 2

// PI value

console.log(Math.PI); // 3.141592653589793

// Random Number

console.log(Math.trunc(Math.random() * 6) + 1); // values between 1-6

// Creating a random number between 2 numbers

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;

console.log(randomInt(10, 20));

// Rounding integers
// Math.round() returns decimal number to closest integer
console.log(Math.trunc(23.3)); // 23

console.log(Math.round(23.4)); // 23
console.log(Math.round(23.6)); // 24

// ceil() return decimal to upper integer

console.log(Math.ceil('23.3')); // 24
console.log(Math.ceil(23.6)); // 24

// floor() returns decimal to down integer

console.log(Math.floor(23.3)); // 23
console.log(Math.floor('23.6')); // 23

// floor() and trunc() are the same with positive decimals

console.log(Math.trunc(-23.4)); // 23 - trunc will to positive side
console.log(Math.floor(-23.4)); // 24 -floor will go to negative side: so floor is better usualy

// Rounding Floating Points // decimals

// toFixed() will return strings
console.log((2.7).toFixed(0)); // 3
console.log(+(2.7).toFixed(0)); // 3 (Number)
console.log((2.7).toFixed(2)); // 2.70
console.log((2.722365).toFixed(2)); // 2.72

// primitive types dont have methods. JS convers integer (number here) into an object, apply method then returns it as a primitive type again.


////////// REMINDER OPERATOR //////////

// returns a reminder of a division

console.log(5 % 2); // 1
console.log(5 / 2); // 2.5

// if we take only integer part of (5/2)  result it will be 2. Then 5 = 2 + 2 + 1 . 1 is reminder here

console.log(8 % 3); // 2
console.log(8 / 3); // 2.6 // 8 = 2* 3 + 2; 2 is reminder

// we use this function to find if numbers are even or odd (tek / cift)

console.log(6 % 2); // 0 =
console.log(6 / 2); // 3 = no decimals
console.log(7 % 2); // 1
console.log(7 / 2); // 3.5

// finding numbers odd or even

const isEven = n => n % 2 === 0; // true is even, false is odd

console.log(isEven(8)); // true
console.log(isEven(23)); // false
console.log(isEven(842)); // true

// usage on our application
// when click balance, change color of balance row 

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered'; // 0,2,4,6
    if (i % 3 === 0) row.style.backgroundColor = 'blue'; // 1,3.6.9
  });
});


/////// BIG INT  - ES2020 ///////

// in JS variables can be max 64bits and that will contain only 53 digits.

console.log(2 ** 53 - 1); //9007199254740991
console.log(Number.MAX_SAFE_INTEGER); // safe number, bigger numbers wil be the same

// in some situations we may want to use bigger numbers. getting numbers from APIs and databases are examples.

console.log(654338284323135384383353434); //6.543382843231353e+26
console.log(654338284323135384383353434n); //654338284323135384383353434n
console.log(BigInt(654338284323135384383353434)); //654338284323135339408392192n
// BigInt is not working as it should be but can be used with smaller numbers
console.log(BigInt(6543382843231)); //6543382843231n

// Operations with these numbers are the as normal numbers

console.log(10000n + 10000n); // 200000n
console.log(65535434331541304640844n * 23543135353513513n);
// 1542909600918773309759490114127965724972n
//bigInt does not work with normal numbers.

const huge = 1531354343213213543431351351n;
const num = 252;
// so we should do use BigInt contractor operator to change it into a BigInt
console.log(huge * BigInt(num));

// some exceptions cuz of type coersion
console.log(20n > 2); // true - will work
console.log(20n === 20); // false - does not work
console.log(typeof 20n); // bigInt
console.log(typeof 20); // number

console.log(20n == '20'); // true - JS does type coersion

console.log(huge + ' is Really Big'); // 1531354343213213543431351351 is Really Big

// divisions

console.log(10n / 3n); // 3n - will cut out decimal parts but divisible ones are OK


/////////// DATES ////////

// create a date - 4 ways

// 1 - new Date
const now = new Date(); // simdiki zaman, surekli guncellenir
console.log(now); //Thu Dec 10 2020 22:23:26 GMT+0300 (GMT+03:00)

// 2 - Parse date from a string. it will figure out date and complete it. Yet it's not reliable.
console.log(new Date('Dec 10 2020 22:23:26')); //Thu Dec 10 2020 22:23:26 GMT+0300 (GMT+03:00)
console.log(new Date('December 24, 2015')); //Thu Dec 24 2015 00:00:00 GMT+0200 (GMT+03:00)
console.log(new Date(account1.movementsDates[0])); // getting from reliable source is ok

//3 - By writing time ourselves
console.log(new Date(2037, 10, 19, 15, 23, 5)); //Thu Nov 19 2037 15:23:05 GMT+0300 (GMT+03:00)
// year, month, day, clock. minute, seconds
// months in JS is 0 based, so 10 is november (11)
console.log(new Date(2037, 10, 31, 15, 23, 5)); // Tue Dec 01 2037 15:23:05 GMT+0300 (GMT+03:00)
// JS autocorrect date. nov has 30, so 31 will be dec 1

// by calculating in miliseconds
// JS starts time at Jan 01 1970 and started counting time in miliseconds.
console.log(new Date(0)); //Sat Jan 01 2000 00:00:00 GMT+0200 (GMT+03:00)

console.log(new Date(3 * 24 * 60 * 60 * 1000)); //script.js:479
// three days after starting counting calculated by 3 days, 24 hours, 60 minutes, 60 seconds and 1000 milisec


/// working with dates // - Date is an object

const future = new Date(2037, 10, 19, 15, 23);

console.log(future); // Thu Nov 19 2037 15:23:00 GMT+0300 (GMT+03:00)
console.log(future.getFullYear()); // 2037
console.log(future.getMonth()); // 10
console.log(future.getDate()); // 19 Day of the month
console.log(future.getDay()); // 4 - Day of the week
console.log(future.getHours()); //15
console.log(future.getMinutes()); // 23
console.log(future.getSeconds()); // 0

console.log(future.toISOString()); //2037-11-19T12:23:00.000Z - international standart

console.log(future.getTime()); // 2142246180000 - Miliseconds have passed
console.log(new Date(2142246180000)); // Thu Nov 19 2037 15:23:00 GMT+0300 (GMT+03:00)
console.log(Date.now()); // 1607629246749 passed till now

future.setFullYear(2040); // all dates can be sete with this methods
console.log(future); // Mon Nov 19 2040 15:23:00 GMT+0300 (GMT+03:00)


////// OPERATIONS WITH DATES ////////

// CALCULATING - How many days
//results will be in miliseconds and we will calculate

const future = new Date(2037, 10, 19, 15, 23);

console.log(Number(future)); // 2142246180000
console.log(+future); // 2142246180000

const calcDayPassed = (date1, date2) =>
  Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));

const days1 = calcDayPassed(new Date(2037, 10, 19), new Date(2037, 10, 24));

console.log(days1); // 5 - 10



///////// INTERNATIONALIZASING DATES ( INTL ) /////////

// changes format of dates based on users location

const num = 3884764.23;

const options = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
  //useGrouping: false,
};

// options let us define what unit or parameter will be used in numbers

console.log('US:', new Intl.NumberFormat('en-US', options).format(num));

console.log('Germany:', new Intl.NumberFormat('de-GR', options).format(num));

console.log('Syria:', new Intl.NumberFormat('ar-SY', options).format(num));

console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, options).format(num)
);


/////////// TIMERS //////////

const ingredients = ['olives', 'apple'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza' with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
);

// first variable is funcion, second is time in miliseconds

console.log('waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// // setInterval - repats functions everytime specified

// setInterval(function () {
//   const now = new Date();
//   console.log(now);
// }, 3000);
*/
