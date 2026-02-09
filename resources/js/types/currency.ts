export type Currency = {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
};

export type UserCurrency = {
    currency_code: string;
    currency?: Currency;
};

export type ExchangeRate = {
    currencyCode: string;
    currencyName: string;
    rate: number | null;
    effectiveDate: string | null;
    change: string | null;
};

export type GoldPrice = {
    date: string;
    price: number;
};
