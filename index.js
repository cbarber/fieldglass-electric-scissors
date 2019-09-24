const puppeteer = require('puppeteer');

const argv = require('yargs')
    .usage('Usage: $0 -u [text] -p [text]')
    .demandOption(['u', 'p'])
    .argv;
const { u: username, p: password } = argv;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  console.log('Requesting fieldglass.net...');
  await page.goto('https://www.fieldglass.net/');
  
  await page.setViewport({ width: 1200, height: 900 });
  
  await page.waitForSelector('#login_wrapper > #content_area_new > #primary_content > .entryLoginInput_button > .formLoginButton_new');

  await page.type('#login_wrapper > #content_area_new > #primary_content #usernameId_new', username);
  await page.type('#login_wrapper > #content_area_new > #primary_content #passwordId_new', password);

  await page.screenshot({ path: "1_auth.png" });
  
  console.log('Authenticating...');
  await page.click('#login_wrapper > #content_area_new > #primary_content > .entryLoginInput_button > .formLoginButton_new');
  
  await page.waitForSelector('h1.welcomeMessage');
  const welcomeMessage = await page.evaluate(() => document.querySelector('h1.welcomeMessage').textContent);
  const name = welcomeMessage.replace(/^Welcome /, '');

  await page.screenshot({ path: "2_welcome.png" });

  await page.waitForSelector('.squareBox > tbody > tr > #ts_0 > a');
  console.log(`Opening first timesheet for ${name}...`);
  await page.click('.squareBox > tbody > tr > #ts_0 > a');
  
  await page.waitForSelector('#formBody div.formNavigationContainer input[value="Continue"]');

  const endDate = await page.evaluate(() => document.querySelector('li[selenium-id="badgeItem_2"] div.values').textContent);

  for(let i = 3; i < 8; i++) {
    const selector = `tr.hoursWorked td:nth-child(${i}) input.hour`;
    await page.click(selector);
    await page.keyboard.press('Backspace');
    await page.type(selector, '8');
  }

  await page.screenshot({ path: "3_timesheet.png" });

  console.log(`Submitting hours for ${endDate}...`);
  await page.click('#formBody div.formNavigationContainer input[value="Continue"]');

  await page.screenshot({ path: "4_details.png" });

  await page.waitForSelector('#formBody div.formNavigationContainer input[value="Submit"]');
  console.log(`Submitting details for ${endDate}...`);
  await page.click('#formBody div.formNavigationContainer input[value="Submit"]');
  
  await page.waitForSelector('#modalPanel input[value="Submit"]');
  await page.screenshot({ path: "5_modal_confirm.png" });
  console.log(`Submitted details for real real...`);
  await page.click('#modalPanel input[value="Submit"]');

  await page.screenshot({ path: "6_complete.png" });
  
  await browser.close();
})()
