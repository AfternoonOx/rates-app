export type SparklinePoint = {
    date: string;
    value: number;
};

export type WatchlistCurrencyCardData = {
    code: string;
    name: string;
    rate: number | null;
    effectiveDate: string | null;
    change: number;
    sparklineData: SparklinePoint[];
    error?: boolean;
};
