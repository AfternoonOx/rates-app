export function AppFooter() {
    return (
        <footer className="mt-auto border-t border-gray-200 bg-white">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 text-center text-sm text-gray-500">
                <p>
                    &copy; {new Date().getFullYear()} RatesApp. Market data
                    provided by NBP API.
                </p>
            </div>
        </footer>
    );
}
