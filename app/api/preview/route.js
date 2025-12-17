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

        // 3. Product/Gallery Images
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

            // Enhanced filter against logo/icon names and common UI elements
            const lower = absoluteSrc.toLowerCase();
            const invalidTerms = ['logo', 'icon', 'svg', 'print', 'btn', 'button', 'fale', 'voltar', 'selo'];
            if (invalidTerms.some(term => lower.includes(term))) {
                return;
            }

            if (!images.includes(absoluteSrc)) {
                images.push(absoluteSrc);
            }
        });

        // 4. Extract Data (Price, AP, AT) from text content
        const pageText = $('body').text();

        // Extract Price (Valor mínimo de venda)
        // Example: "Valor mínimo de venda: R$ 376.468,66"
        let price = null;
        const priceMatch = pageText.match(/Valor m[íi]nimo de venda:\s*R\$\s*([\d.,]+)/i);
        if (priceMatch && priceMatch[1]) {
            // Keep it as string or number? Frontend expects number for formatting usually, 
            // but the scrape result effectively gives a formatted string minus the "R$".
            // Let's return the raw number to be safe for re-formatting
            const numericString = priceMatch[1].replace(/\./g, '').replace(',', '.');
            price = parseFloat(numericString);
        }

        // Extract Private Area (Área privativa)
        // Example: "Área privativa = 356,53m2"
        let privateArea = null;
        const apMatch = pageText.match(/Área privativa\s*=\s*([\d.,]+)\s*m2/i);
        if (apMatch && apMatch[1]) {
            privateArea = apMatch[1] + "m²";
        }

        // Extract Land Area (Área do terreno)
        // Example: "Área do terreno = 1.200,00m2"
        let landArea = null;
        const atMatch = pageText.match(/Área do terreno\s*=\s*([\d.,]+)\s*m2/i);
        if (atMatch && atMatch[1]) {
            landArea = atMatch[1] + "m²";
        }

        return NextResponse.json({ images, price, privateArea, landArea });

    } catch (error) {
        console.error('Error scraping:', error);
        return NextResponse.json({ images: [] });
    }
}
