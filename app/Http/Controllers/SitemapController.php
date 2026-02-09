<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

class SitemapController extends Controller
{
    /**
     * Generate the sitemap.xml file
     */
    public function __invoke(): Response
    {
        $currentDate = now()->toAtomString();
        $urls = [];

        if (Route::has('home')) {
            $urls[] = [
                'loc' => route('home'),
                'lastmod' => $currentDate,
                'changefreq' => 'daily',
                'priority' => '1.0',
            ];
        }

        if (Route::has('login')) {
            $urls[] = [
                'loc' => route('login'),
                'lastmod' => $currentDate,
                'changefreq' => 'monthly',
                'priority' => '0.5',
            ];
        }

        if (Route::has('register') && Features::enabled(Features::registration())) {
            $urls[] = [
                'loc' => route('register'),
                'lastmod' => $currentDate,
                'changefreq' => 'monthly',
                'priority' => '0.5',
            ];
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'.PHP_EOL;
        $xml .= '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">' .PHP_EOL;

        foreach ($urls as $url) {
            $xml .= '  <url>'.PHP_EOL;
            $xml .= '    <loc>'.htmlspecialchars($url['loc']).'</loc>'.PHP_EOL;
            $xml .= '    <lastmod>'.$url['lastmod'].'</lastmod>'.PHP_EOL;
            $xml .= '    <changefreq>'.$url['changefreq'].'</changefreq>'.PHP_EOL;
            $xml .= '    <priority>'.$url['priority'].'</priority>'.PHP_EOL;
            $xml .= '  </url>'.PHP_EOL;
        }

        $xml .= '</urlset>';

        return response($xml, 200)
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
