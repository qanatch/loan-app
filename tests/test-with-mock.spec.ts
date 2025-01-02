import {test, expect} from '@playwright/test';
//https://backend.tallinn-learning.ee/api/loan-calc?amount=1561&period=12

const routeToMock = '**/api/loan-calc?amount=*&period=*'

test('test-with-mock', async ({page}) => {
    const mockValue = 10.51
    await page.route(routeToMock, async (route) => {
        const mockResponse = {paymentAmountMonthly: mockValue,};
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockResponse),
        });
    })

    await page.goto('http://localhost:3000/small-loan');
    await page.waitForResponse(routeToMock)

    const amountText = await page
        .getByTestId('ib-small-loan-calculator-field-monthlyPayment')
        .textContent();

    expect(amountText).toBe(mockValue + ' €');
})

test('open and verify bad request-400)', async ({page}) => {
    await page.route(routeToMock, async (route) => {
        await route.fulfill({
            status: 400
        });
    });

    await page.goto('http://localhost:3000/small-loan');

    // we have to wait until response received to be displayed
    await page.waitForResponse(routeToMock)

    const errorText = await page
        .getByTestId('id-small-loan-calculator-field-error')
        .textContent();

    expect(errorText).toBe('Oops, something went wrong');
});