'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import FileUpload from '@/components/FileUpload';
import AdCard from '@/components/AdCard';
import TableView from '@/components/TableView';
import { LayoutGrid, List, Table, Filter } from 'lucide-react';
import DualRangeSlider from '@/components/DualRangeSlider';
import { parseBRL } from '@/utils/currency';

export default function Home() {
  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [visibleCount, setVisibleCount] = useState(8);

  // UI Filter States (Pending)
  const [cityFilter, setCityFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [discountRange, setDiscountRange] = useState([0, 100]);

  // Active Filter States (Applied)
  const [activeCityFilter, setActiveCityFilter] = useState('');
  const [activeDistrictFilter, setActiveDistrictFilter] = useState('');
  const [activePriceRange, setActivePriceRange] = useState([0, 1000000]);
  const [activeDiscountRange, setActiveDiscountRange] = useState([0, 100]);

  // Data Limits & Options
  const [priceLimits, setPriceLimits] = useState({ min: 0, max: 1000000 });
  const [discountLimits, setDiscountLimits] = useState({ min: 0, max: 100 });
  const [availableCities, setAvailableCities] = useState([]);
  const [cityDistrictsMap, setCityDistrictsMap] = useState({}); // { 'City': ['District1', ...] }

  const handleDataLoaded = (parsedData) => {
    // 1. Data Normalization Step
    const normalizedData = parsedData.map(item => {
      return {
        ...item,
        'Cidade': item['Cidade'] ? String(item['Cidade']).trim() : '',
        'Bairro': item['Bairro'] ? String(item['Bairro']).trim() : '',
      };
    });

    setData(normalizedData);
    setVisibleCount(8);

    // Initial Limits Calculation (Full Global Range)
    calculateLimits(normalizedData, true, true);

    const cities = new Set();
    const map = {};

    normalizedData.forEach(item => {
      // Locations
      const city = item['Cidade'];
      const district = item['Bairro'];

      if (city) {
        cities.add(city);
        if (!map[city]) map[city] = new Set();
        if (district) map[city].add(district);
      }
    });

    // Sort options alphabetically
    setAvailableCities(Array.from(cities).sort());

    // Convert Set map to Array map for render
    const finalMap = {};
    Object.keys(map).forEach(city => {
      finalMap[city] = Array.from(map[city]).sort();
    });
    setCityDistrictsMap(finalMap);

    // Reset location filters on new file load
    setCityFilter('');
    setDistrictFilter('');
    setActiveCityFilter('');
    setActiveDistrictFilter('');
  };

  // Helper to calculate min/max of a dataset
  const calculateLimits = (dataset, resetRanges = false, updateActive = false) => {
    let minP = Infinity;
    let maxP = -Infinity;
    let minD = Infinity;
    let maxD = -Infinity;

    dataset.forEach(item => {
      // Price
      const p = parseBRL(item['Preço']);
      if (p < minP) minP = p;
      if (p > maxP) maxP = p;

      // Discount
      let d = item['Desconto'];
      if (typeof d === 'number') {
        if (d < 1 && d > 0) d *= 100;
      } else {
        d = parseFloat(d) || 0;
        if (d < 1 && d > 0) d *= 100;
      }
      if (d < minD) minD = d;
      if (d > maxD) maxD = d;
    });

    if (minP === Infinity) minP = 0;
    if (maxP === -Infinity) maxP = 0;
    if (minD === Infinity) minD = 0;
    if (maxD === -Infinity) maxD = 0;

    if (minP === maxP) maxP += 1000; // avoid zero range
    if (minD === maxD) maxD += 10;

    setPriceLimits({ min: minP, max: maxP });
    setDiscountLimits({ min: minD, max: maxD });

    if (resetRanges) {
      setPriceRange([minP, maxP]);
      setDiscountRange([minD, maxD]);

      if (updateActive) {
        setActivePriceRange([minP, maxP]);
        setActiveDiscountRange([minD, maxD]);
      }
    } else {
      // If not resetting fully, ensure current range is within new bounds
      setPriceRange(prev => [
        Math.max(minP, Math.min(prev[0], maxP)),
        Math.min(maxP, Math.max(prev[1], minP))
      ]);
      // Note: We generally don't auto-update Active ranges here either.
    }
  };

  // Effect: Recalculate Limits when Location Filters Change
  useEffect(() => {
    if (data.length === 0) return;

    // Filter data based on PENDING locaition filters
    const locationFilteredData = data.filter(item => {
      if (cityFilter && item['Cidade'] !== cityFilter) return false;
      if (districtFilter && item['Bairro'] !== districtFilter) return false;
      return true;
    });

    // If we have data matching the location, recalculate range using ONLY that data.
    // If no data matches (shouldn't happen with correct dependent dropdowns), fallback to global? 
    // Actually, if locationFilteredData is empty, limits might go 0-0. that's correct.

    if (locationFilteredData.length > 0) {
      // We pass 'false' to resetRanges because we might want to keep the user's relative selection?
      // Actually user said "adjust automatically", usually meaning "show me the range for this city".
      // It's cleaner to reset the handles to the full new range so they see "all options for this city".
      calculateLimits(locationFilteredData, true, true); // Auto-update active ranges too
    } else {
      // Fallback to global if something weird happens or all cleared?
      // If filters are cleared (''), locationFilteredData == data. So it works.
      // If filters select something with 0 results... handling empty.
      if (cityFilter || districtFilter) {
        setPriceLimits({ min: 0, max: 0 });
        setDiscountLimits({ min: 0, max: 0 });
        setPriceRange([0, 0]);
        setDiscountRange([0, 0]);
        setActivePriceRange([0, 0]);
        setActiveDiscountRange([0, 0]);
      } else {
        calculateLimits(data, true, true);
      }
    }

  }, [cityFilter, districtFilter, data]);


  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setCityFilter(newCity);
    setActiveCityFilter(newCity); // LIVE UPDATE
    // Reset district when city changes
    setDistrictFilter('');
    setActiveDistrictFilter(''); // LIVE UPDATE
  };

  const applyFilters = () => {
    setActiveCityFilter(cityFilter);
    setActiveDistrictFilter(districtFilter);
    setActivePriceRange(priceRange);
    setActiveDiscountRange(discountRange);
    setVisibleCount(8); // Reset pagination on filter apply
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 8);
  };

  // Filter Logic (Uses Active States)
  const filteredData = data.filter(item => {
    // 1. Dropdown filters (Exact match against Normalized Data)
    if (activeCityFilter && item['Cidade'] !== activeCityFilter) return false;
    if (activeDistrictFilter && item['Bairro'] !== activeDistrictFilter) return false;

    // 2. Price Range
    const price = parseBRL(item['Preço']);
    // Check if price is within valid range
    if (price < activePriceRange[0] || price > activePriceRange[1]) return false;

    // 3. Discount Range
    let d = item['Desconto'];
    if (typeof d === 'number') { if (d < 1 && d > 0) d *= 100; }
    else { d = parseFloat(d) || 0; if (d < 1 && d > 0) d *= 100; }

    if (d < activeDiscountRange[0] || d > activeDiscountRange[1]) return false;

    return true;
  });

  const visibleData = filteredData.slice(0, visibleCount);
  const formatPrice = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  const formatDiscount = (val) => `${Math.floor(val)}%`;

  // Get available districts based on selected city (pending state)
  const currentDistricts = cityFilter ? (cityDistrictsMap[cityFilter] || []) : [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Spreadsheet<span style={{ color: '#0070f3' }}>Visualizer</span></h1>
        {data.length > 0 && (
          <div className={styles.controls}>
            <button onClick={() => setViewMode('grid')} className={`${styles.iconBtn} ${viewMode === 'grid' ? styles.active : ''}`}><LayoutGrid size={20} /></button>
            <button onClick={() => setViewMode('list')} className={`${styles.iconBtn} ${viewMode === 'list' ? styles.active : ''}`}><List size={20} /></button>
            <button onClick={() => setViewMode('table')} className={`${styles.iconBtn} ${viewMode === 'table' ? styles.active : ''}`}><Table size={20} /></button>
          </div>
        )}
      </header>

      <main className={styles.main}>
        {data.length === 0 ? (
          <div className={styles.uploadSection}>
            <h2 className={styles.heroTitle}>Visualize your Real Estate Ads</h2>
            <p className={styles.heroText}>Upload your spreadsheet to get started.</p>
            <FileUpload onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          <>
            {/* Filter Section */}
            <div className={styles.filters}>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Cidade</span>
                <select
                  value={cityFilter}
                  onChange={handleCityChange}
                  className={styles.select}
                >
                  <option value="">Todas</option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Bairro</span>
                <select
                  value={districtFilter}
                  onChange={e => {
                    setDistrictFilter(e.target.value);
                    setActiveDistrictFilter(e.target.value); // LIVE UPDATE
                  }}
                  className={styles.select}
                  disabled={!cityFilter}
                  style={{ opacity: !cityFilter ? 0.5 : 1, cursor: !cityFilter ? 'not-allowed' : 'pointer' }}
                >
                  <option value="">{cityFilter ? "Todos os Bairros" : "Selecione a Cidade..."}</option>
                  {currentDistricts.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              {/* Price Slider */}
              <div className={styles.filterGroup} style={{ minWidth: '250px' }}>
                <span className={styles.filterLabel}>Preço</span>
                <DualRangeSlider
                  min={priceLimits.min}
                  max={priceLimits.max}
                  onChange={(min, max) => setPriceRange([min, max])}
                  formatLabel={formatPrice}
                />
              </div>

              {/* Discount Slider */}
              <div className={styles.filterGroup} style={{ minWidth: '200px' }}>
                <span className={styles.filterLabel}>Desconto</span>
                <DualRangeSlider
                  min={discountLimits.min}
                  max={discountLimits.max}
                  onChange={(min, max) => setDiscountRange([min, max])}
                  formatLabel={formatDiscount}
                />
              </div>

              <div className={styles.filterActions}>
                <button onClick={applyFilters} className={styles.applyBtn}>
                  Filtrar Resultados <Filter size={16} style={{ marginLeft: 8 }} />
                </button>
              </div>
            </div>

            {/* Results Count Helper */}
            <div style={{ padding: '0 24px', marginBottom: '16px', color: '#666', fontSize: '0.9rem' }}>
              Exibindo {visibleData.length} de {filteredData.length} resultados encontrados.
            </div>

            <div className={viewMode === 'grid' ? styles.grid : (viewMode === 'list' ? styles.list : '')}>
              {viewMode === 'table' ? (
                <TableView data={visibleData} />
              ) : (
                visibleData.map((row, index) => (
                  <AdCard key={index} data={row} />
                ))
              )}
            </div>

            {visibleCount < filteredData.length && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', paddingBottom: '32px' }}>
                <button onClick={loadMore} className={styles.loadMoreBtn}>
                  Carregar Mais
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
