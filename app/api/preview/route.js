import { NextResponse } from 'next/server';
import { load } from 'cheerio';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            }
        });

        if (!response.ok) {
            return NextResponse.json({ images: [] });
        }

        const html = await response.text();
        const $ = load(html);
        const images = [];

        // 1. Open Graph Image (Primary)
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage) images.push(ogImage);

        // 2. Twitter Image
        const twitterImage = $('meta[name="twitter:image"]').attr('content');
        if (twitterImage && !images.includes(twitterImage)) images.push(twitterImage);

        // 3. Product/Gallery Images often in specific meta or json-ld, but basic img tags as fallback
        // Filter for reasonably likely content images (exclude common icons)
        $('img').each((i, el) => {
            if (images.length > 8) return false;
            const src = $(el).attr('src');
            if (!src) return;

            let absoluteSrc = src;
            try {
                absoluteSrc = new URL(src, targetUrl).href;
            } catch (e) {
                return;
            }

            // Basic filter against logo/icon names
            const lower = absoluteSrc.toLowerCase();
            if (lower.includes('logo') || lower.includes('icon') || lower.includes('svg')) {
                return;
            }

            if (!images.includes(absoluteSrc)) {
                images.push(absoluteSrc);
            }
        });

        return NextResponse.json({ images });

    } catch (error) {
        console.error('Error scraping:', error);
        return NextResponse.json({ images: [] });
    }
}
