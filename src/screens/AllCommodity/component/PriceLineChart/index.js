import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { ref, get } from 'firebase/database';
import { database } from '../../../../firebase/index';
import { Canvas, Path, Circle } from '@shopify/react-native-skia';
// Ukuran chart
const { width } = Dimensions.get('window');
// Konstanta ukuran chart
const CHART_WIDTH = width * 0.89;
// Tinggi chart tetap
const CHART_HEIGHT = 250;
// Padding di dalam chart
const PADDING = 25;
// Ukuran font untuk label sumbu
const LABEL_FONT_SIZE = 10;
// Ukuran font untuk nilai harga
const VALUE_FONT_SIZE = 11;

// Fungsi bantu untuk format harga dan tanggal
const formatShortPrice = v => v >= 1000 ? `${Math.round(v / 1000)}k` : v.toString();
const formatShortDate = d => {
  if (!d) return '';
  let parts = String(d).split('-');
  if (parts.length !== 3) parts = String(d).split('/');

  if (parts.length === 3) {
    // YYYY-MM-DD
    if (parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}`; // hapus tahun
    }
  }
  return String(d);
};
// Fungsi bantu untuk hitung rata-rata
const average = (arr) => {
  if (!arr || arr.length === 0) return 0;
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length;
};
const buildVisualizationData = (labels, data) => {
  if (!labels || !data || labels.length === 0 || data.length === 0) {
    return { vizLabels: [], vizData: [] };
  }

  const vizLabels = [...labels];
  const vizData = [...data];

  // Forward-fill: jika ada nilai kosong, gunakan harga terakhir yang ada
  for (let i = 0; i < vizData.length; i++) {
    const value = vizData[i];
    // Jika nilai kosong/undefined/null, cari nilai terakhir sebelumnya yang ada
    if (value === undefined || value === null || value === '' || isNaN(value)) {
      // Cari nilai terakhir dari index sebelumnya
      let lastValidValue = null;
      for (let j = i - 1; j >= 0; j--) {
        if (vizData[j] !== undefined && vizData[j] !== null && vizData[j] !== '' && !isNaN(vizData[j])) {
          lastValidValue = vizData[j];
          break;
        }
      }
      // Jika ditemukan nilai valid sebelumnya, gunakan untuk visualisasi
      if (lastValidValue !== null) {
        vizData[i] = lastValidValue;
      }
    }
  }

  return { vizLabels, vizData };
};



// Komponen utama PriceLineChart
const PriceLineChart = ({ commodity, timeframe: timeframeProp }) => {
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [allLabels, setAllLabels] = useState([]);
  const [predictedData, setPredictedData] = useState([]);
  const [predictedLabels, setPredictedLabels] = useState([]);
  const [timeframe, setTimeframe] = useState(timeframeProp ?? 'harian');
  
  // Cache untuk tracking commodity yang sudah di-fetch
  const fetchedCommodities = useRef(new Set());
  const isMounted = useRef(true);

 
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Cek apakah commodity ini sudah pernah di-fetch
    if (fetchedCommodities.current.has(commodity)) {
      setLoading(false);
      return; // Skip jika sudah di-cache
    }
    
    setLoading(true);
    // Ambil data actual dari Firebase - HANYA DIPANGGIL SEKALI per commodity
    const dbRef = ref(database, `realTimePrice/v2/${commodity}/actual`);
    get(dbRef).then(snap => {
      // Cek apakah component masih mounted sebelum setState
      if (!isMounted.current) return;
      
      const val = snap.val() || {};
      // Urutkan tanggal dari paling lama ke paling baru
      let labels = Object.keys(val).sort((a, b) => {
        // Sort format YYYY-MM-DD, fallback ke string compare jika gagal
        const da = new Date(a);
        const db = new Date(b);
        if (!isNaN(da) && !isNaN(db)) return da - db;
        return String(a).localeCompare(String(b));
      });
      let data = labels.map(k => Number(val[k]));
      
      // HANDLING: Generate data actual yang hilang hingga hari ini
      if (labels.length > 0) {
        const lastActualLabel = labels[labels.length - 1];
        const lastActualPrice = data[data.length - 1];
        const lastDate = new Date(lastActualLabel);
        const today = new Date();
        
        lastDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        // Jika ada gap antara data terakhir dan hari ini, generate forward-fill
        if (lastDate < today) {
          let currentDate = new Date(lastDate);
          currentDate.setDate(currentDate.getDate() + 1);
          
          while (currentDate <= today) {
            const dateStr = currentDate.toISOString().split('T')[0];
            labels.push(dateStr);
            data.push(lastActualPrice); // Forward-fill dengan harga yang sama
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          console.log('[PriceLineChart] Actual Data Handling (Forward-Fill):', {
            commodity: commodity,
            lastActualDateFromDB: lastActualLabel,
            lastActualPrice: lastActualPrice,
            today: today.toISOString().split('T')[0],
            generatedDates: labels.slice(-5), // 5 tanggal terakhir
            totalPoints: labels.length,
          });
        } else {
          console.log('[PriceLineChart] Actual Data Loaded:', {
            commodity: commodity,
            totalPoints: labels.length,
            firstDate: labels[0],
            lastDate: labels[labels.length - 1],
            lastPrice: data[data.length - 1],
            allDates: labels.slice(-5), // 5 tanggal terakhir
          });
        }
      }
      
      setAllLabels(labels);
      setAllData(data);
      //  OPTIMASI: Mark commodity sebagai sudah di-fetch
      fetchedCommodities.current.add(commodity);
      setLoading(false);
    });
    // Dependency array hanya commodity - fetch hanya sekali per commodity
  }, [commodity]);

  // Ambil hanya 1 data predicted (kuning) terakhir
  useEffect(() => {
    // OPTIMASI: Cek apakah predicted data untuk commodity ini sudah pernah di-fetch
    if (fetchedCommodities.current.has(`${commodity}_pred`)) {
      return; // Skip jika sudah di-cache
    }
    
    // Ambil data predicted dari Firebase - HANYA DIPANGGIL SEKALI per commodity
    const predictedRef = ref(database, `realTimePrice/v2/${commodity}/predicted`);
    get(predictedRef).then(snap => {
      // Cek apakah component masih mounted sebelum setState
      if (!isMounted.current) return;
      
      // semua data di simpan di val
      const val = snap.val();
      if (!val) {
        // Tidak ada predicted, biarkan kosong
        fetchedCommodities.current.add(`${commodity}_pred`);
        return;
      }
      // Asumsi val = { tanggal1: harga1, tanggal2: harga2, ... }
      let labels = Object.keys(val).sort((a, b) => {
        const da = new Date(a);
        const db = new Date(b);
        if (!isNaN(da) && !isNaN(db)) return da - db;
        return String(a).localeCompare(String(b));
      });
      let data = labels.map(k => Number(val[k]));
      
      // HANDLING: Generate predicted data hingga +1 hari dari hari ini
      if (labels.length > 0) {
        const lastPredictedLabel = labels[labels.length - 1];
        const lastPredictedPrice = data[data.length - 1];
        const lastDate = new Date(lastPredictedLabel);
        const today = new Date();
        
        lastDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        // Generate predicted data dari hari setelah terakhir hingga +1 hari dari hari ini
        let tomorrowDate = new Date(today);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        
        // Jika ada gap antara predicted terakhir dan besok, generate forward-fill
        if (lastDate < tomorrowDate) {
          let currentDate = new Date(lastDate);
          currentDate.setDate(currentDate.getDate() + 1);
          
          while (currentDate <= tomorrowDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            labels.push(dateStr);
            data.push(lastPredictedPrice); // Forward-fill dengan harga yang sama
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          console.log('📊 [PriceLineChart] Predicted Data Handling (Forward-Fill to +1 day):', {
            commodity: commodity,
            lastPredictedDateFromDB: lastPredictedLabel,
            lastPredictedPrice: lastPredictedPrice,
            today: today.toISOString().split('T')[0],
            tomorrow: tomorrowDate.toISOString().split('T')[0],
            generatedDates: labels.slice(-5),
            totalPoints: labels.length,
          });
        } else {
          console.log('📊 [PriceLineChart] Predicted Data Loaded:', {
            commodity: commodity,
            totalPoints: labels.length,
            lastDate: labels[labels.length - 1],
            lastPrice: data[data.length - 1],
          });
        }
      }
      
      // Set hanya data terakhir untuk ditampilkan
      setPredictedLabels(labels.slice(-1)); //data terbaru (setelah forward-fill)
      setPredictedData(data.slice(-1));
      
      // OPTIMASI: Mark predicted sebagai sudah di-fetch
      fetchedCommodities.current.add(`${commodity}_pred`);
    }).catch(err => console.warn('Gagal ambil data predicted:', err));
    
    // Dependency array hanya commodity - fetch hanya sekali per commodity
  }, [commodity]);

  const { chartData, chartLabels } = useMemo(() => {
    // DATA VISUALIZATION HANDLING: Forward-fill missing values untuk visualisasi
    // Terapkan visualization handling terlebih dahulu sebelum menggunakan data
    const { vizLabels: allLabelsViz, vizData: allDataViz } = buildVisualizationData(allLabels, allData);
    // END DATA VISUALIZATION HANDLING

    //all data firebase di buat menjadi variabel number
    const Number = allDataViz.length;
    // Jika data tidak cukup, kembalikan array kosong
    if (Number < 2) return { chartData: [], chartLabels: [] };
    
    let data = [];
    let labels = [];

    switch (timeframe) {
      // Spek: 6 data terbaru ("0-5")
      case 'harian': {
        // Jika ada predicted untuk tanggal setelah actual terakhir, tampilkan hanya 4 titik actual
        let numPoints = 5;
        try {
          const lastActual = allLabelsViz && allLabelsViz.length ? new Date(allLabelsViz[allLabelsViz.length - 1]) : null;
          const hasFuturePred = predictedLabels && predictedLabels.some(l => {
            const d = new Date(l);
            return lastActual && !isNaN(d) && d > lastActual;
          });
          if (hasFuturePred) numPoints = 4;
        } catch (e) {
          // ignore
        }

        if (Number < numPoints) {
           // Tidak cukup data, tampilkan apa adanya
           return { chartData: allDataViz, chartLabels: allLabelsViz };
        }
        data = allDataViz.slice(Number - numPoints);
        labels = allLabelsViz.slice(Number - numPoints);
        break;
      }

      // Spek: 5 titik (4 rata-rata mingguan + 1 terbaru)
      case 'mingguan': {
        const numPoints = 29; // (4 * 7) + 1
        if (Number < numPoints) {
          // Tidak cukup data, fallback ke harian
          console.warn(`Data tidak cukup (${Number}) untuk mingguan, butuh ${numPoints}.`);
          return { chartData: allDataViz.slice(Number - 6), chartLabels: allLabelsViz.slice(Number - 6) };
        }
        
        // Asumsi data [..., d-2, d-1, d-0] (d-0 adalah terbaru) 
        // rata - rata data setiap minggu akan di tampilkan di mingguan
        const p5_today = allDataViz[Number - 1]; // Titik ke-5 (Terbaru "0")
        const p4_w1 = average(allDataViz.slice(Number - 8, Number - 1)); // Rata-rata 7 hari ("1-7")
        const p3_w2 = average(allDataViz.slice(Number - 15, Number - 8)); // Rata-rata 7 hari ("8-14")
        const p2_w3 = average(allDataViz.slice(Number - 22, Number - 15)); // Rata-rata 7 hari ("15-21")
        const p1_w4 = average(allDataViz.slice(Number - 29, Number - 22)); // Rata-rata 7 hari ("22-28")
        
        data = [p1_w4, p2_w3, p3_w2, p4_w1, p5_today];
        labels = ["4 Minggu", "3 Minggu", "2 Minggu", "1 Minggu", "Hari Ini"];
        break;
      }

      // Spek: 2 titik (1 rata-rata 30 hari + 1 terbaru)
      case 'bulanan': {
        const numPoints = 30; 
        if (Number < numPoints) {
          // Tidak cukup data, fallback ke harian
          console.warn(`Data tidak cukup (${Number}) untuk bulanan, butuh ${numPoints}.`);
          return { chartData: allDataViz.slice(Number - 6), chartLabels: allLabelsViz.slice(Number - 6) };
        }
        
        const p2_today = allDataViz[Number - 1]; // data terbaru ("0")
        const p1_avg30 = average(allDataViz.slice(Number - 31, Number - 1)); // Rata-rata 30 hari ("1-30")
        
        data = [p1_avg30, p2_today];
        labels = ["Rata-rata 30 Hari", "Hari Ini"];
        break;
      }
      
      default: {
        // Fallback
        data = allDataViz.slice(Math.max(0, Number - 6));
        labels = allLabelsViz.slice(Math.max(0, Number - 6));
      }
    }
    
    return { chartData: data, chartLabels: labels };

  }, [allData, allLabels, timeframe, predictedLabels, predictedData]); // Hitung ulang jika data atau timeframe berubah
  
//render section

  if (loading) {
    return (
      <View style={styles.chartContainer}>
        <Text style={{ color: '#888', textAlign: 'center' }}>Memuat grafik...</Text>
      </View>
    );
  }

  // Gunakan chartData.length
  if (chartData.length < 2) { 
    return (
      <View style={styles.chartContainer}>
        <Text style={{ color: '#888', textAlign: 'center' }}>Data tidak cukup untuk timeframe ini</Text>
      </View>
    );
  }

  // Siapkan label X untuk ditampilkan:
  // - Jika ada predicted: 4 actual terakhir + 1 predicted 1 hari kedepan
  // - Jika tidak ada predicted: 5 actual terakhir
  let xAxisLabels;
  let nextDayLabel = null; // Track the synthetic next-day label untuk predicted
  
  if (timeframe === 'harian' && predictedLabels && predictedLabels.length > 0 && predictedData && predictedData.length > 0) {
    // Ada predicted: tampilkan 4 actual + 1 predicted
    xAxisLabels = chartLabels.slice(-4);
    const lastActualLabel = chartLabels[chartLabels.length - 1];
    // Gunakan label predicted jika ada, jika tidak hitung 1 hari setelah actual terakhir
    const predLabel = predictedLabels[predictedLabels.length - 1];
    if (predLabel && predLabel !== '') {
      nextDayLabel = predLabel;
    } else {
      // Fallback: hitung 1 hari setelah actual terakhir
      const lastDate = new Date(lastActualLabel);
      lastDate.setDate(lastDate.getDate() + 1);
      nextDayLabel = lastDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    }
    xAxisLabels = [...xAxisLabels, nextDayLabel];
  } else {
    // Tidak ada predicted: tampilkan 5 actual terakhir
    xAxisLabels = chartLabels.slice(-5);
  }

  // Buat array nilai sesuai xAxisLabels (undefined jika tidak ada nilai)
  const displayValues = xAxisLabels.map((lab, idx) => {
    const isLast = idx === xAxisLabels.length - 1;
    // Jika ini adalah titik terakhir dan ada predicted, gunakan predicted value
    if (isLast && predictedLabels && predictedLabels.length > 0 && predictedData && predictedData.length > 0) {
      return predictedData[predictedData.length - 1]; // Selalu gunakan predicted terakhir
    }
    const ai = chartLabels.indexOf(lab);
    if (ai !== -1) return chartData[ai];
    const pi = (predictedLabels || []).indexOf(lab);
    if (pi !== -1) return predictedData[pi];
    return undefined;
  });

  // Kalkulasi range Y menggunakan semua nilai yang ada (actual + predicted jika ada)
  const existingValues = displayValues.filter(v => typeof v === 'number');
  const minPrice = existingValues.length ? Math.min(...existingValues) : Math.min(...chartData);
  const maxPrice = existingValues.length ? Math.max(...existingValues) : Math.max(...chartData);
  const buffer = 30000;
  const minY = Math.max(0, minPrice - buffer);
  const maxY = maxPrice + buffer;
  const range = maxY - minY || 1;

  // Jarak antar titik di sumbu X: selalu berdasarkan jumlah label X yang ditampilkan
  const totalPoints = xAxisLabels.length > 1 ? xAxisLabels.length : 1;
  const stepX = (CHART_WIDTH - PADDING * 2.7) / (totalPoints - 1);

  // Generate actual path: hanya koneksikan titik-titik actual yang ada
  let path = '';
  xAxisLabels.forEach((lab, i) => {
    // Jangan gambar actual jika ini adalah label synthetic next-day (khusus predicted)
    const isLast = i === xAxisLabels.length - 1;
    const isPredAtLast = isLast && nextDayLabel && lab === nextDayLabel;
    if (isPredAtLast) return;// Lewati jika ini adalah predicted
    const ai = chartLabels.indexOf(lab);
    if (ai === -1) return; // Lewati jika tidak ada nilai actual 
    const y = chartData[ai];
    const x = PADDING + i * stepX;
    const yNorm = CHART_HEIGHT - PADDING - ((y - minY) / range * (CHART_HEIGHT - PADDING * 2));
    path += path === '' ? `M ${x} ${yNorm}` : ` L ${x} ${yNorm}`;
  });

  // Siapkan label Y (5 garis harga)
  const yLabels = [];
  for (let i = 0; i < 5; i++) {
    const value = Math.round(minY + (range * (4 - i) / 4));
    yLabels.push(value);
  }

    // Siapkan predicted path & titik (kuning) pada posisi xAxisLabels
    let predictedPath = '';
    const predictedPoints = []; //// Menyimpan koordinat {x, yNorm} titik predicted untuk rendering Circle
    // Array berisi index posisi predicted di xAxisLabels
    const predIndices = (predictedLabels && nextDayLabel && predictedLabels.length > 0) ? [xAxisLabels.lastIndexOf(nextDayLabel)] : [];
    const showPredicted = timeframe === 'harian' && predIndices.filter(idx => idx !== -1).length > 0;
    if (predIndices.length && predIndices[0] !== -1 && predictedData && predictedData.length > 0) {
      // Hitung titik actual terakhir berdasarkan chartData[-1] dan posisinya di xAxisLabels
      let lastActualX = null;
      let lastActualY = null;
      // Titik actual terakhir selalu merupakan elemen terakhir dari chartData
      const lastActualValue = chartData[chartData.length - 1];
      const lastActualLabel = chartLabels[chartLabels.length - 1];
      // Cari posisi label ini di xAxisLabels (biasanya di indeks 3 karena 4 actual + 1 predicted)
      const lastActualIdx = xAxisLabels.indexOf(lastActualLabel);
      if (lastActualIdx !== -1) {
        lastActualX = PADDING + lastActualIdx * stepX;
        lastActualY = CHART_HEIGHT - PADDING - ((lastActualValue - minY) / range * (CHART_HEIGHT - PADDING * 2));
      }
      // Gambarkan garis predicted
      // X = Posisi horizontal pixel di canvas (Tanggal)
      // Y = Posisi vertikal pixel di canvas (Harga)
      predIndices.forEach((posIdx, j) => {
        if (posIdx === -1) return;
        const pIdx = predictedLabels.length - 1; // Selalu gunakan predicted data terakhir
        const y = predictedData[pIdx]; // nilai predicted
        const x = PADDING + posIdx * stepX; // posisi x ada di semua label xAxis
        const yNorm = CHART_HEIGHT - PADDING - ((y - minY) / range * (CHART_HEIGHT - PADDING * 2));
        if (j === 0) {
          if (lastActualX !== null) predictedPath += `M ${lastActualX} ${lastActualY} L ${x} ${yNorm}`;
          else predictedPath += `M ${x} ${yNorm}`;
        } else {
          predictedPath += ` L ${x} ${yNorm}`;
        }
        predictedPoints.push({ x, yNorm });
      });
    }

  // Render komponen chart di bagian ini
  return (
    <View style={styles.chartContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.subTitle}>Index Harga</Text>
      </View>
      

      {!timeframeProp && (
        <View style={styles.timeframeRow}>
          <TouchableOpacity
            style={[styles.timeBtn, timeframe === 'harian' && styles.timeBtnActive]}
            onPress={() => setTimeframe('harian')}
          >
            <Text style={[styles.timeBtnText, timeframe === 'harian' && styles.timeBtnTextActive]}>
              Harian
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeBtn, timeframe === 'mingguan' && styles.timeBtnActive]}
            onPress={() => setTimeframe('mingguan')}
          >
            <Text style={[styles.timeBtnText, timeframe === 'mingguan' && styles.timeBtnTextActive]}>
              Mingguan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeBtn, timeframe === 'bulanan' && styles.timeBtnActive]}
            onPress={() => setTimeframe('bulanan')}
          >
            <Text style={[styles.timeBtnText, timeframe === 'bulanan' && styles.timeBtnTextActive]}>
              Bulanan
            </Text>
          </TouchableOpacity>
        </View>
      )}


      <View style={{ width: CHART_WIDTH, height: CHART_HEIGHT, marginTop: 8, position: 'relative' }}>
        <Canvas style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
          {/* Y-Axis Grid Lines (line harga) */}
          {yLabels.map((v, i) => {
            const y = PADDING + i * ((CHART_HEIGHT - PADDING * 2) / 4);
            return (
              <Path
                key={`grid-${i}`}
                path={`M ${PADDING} ${y} L ${CHART_WIDTH - PADDING} ${y}`}
                color="#e0e6ed"
                style="stroke"
                strokeWidth={1}
              />
            );
          })}
          {/* actual data lines */}
          <Path path={path} color="#39A5E1" style="stroke" strokeWidth={3} />
          {xAxisLabels.map((lab, i) => {
            // Jangan render titik actual jika ini adalah label synthetic next-day (predicted)
            const isLast = i === xAxisLabels.length - 1;
            const isPredAtLast = isLast && nextDayLabel && lab === nextDayLabel;
            if (isPredAtLast) return null; // Lewati jika ini adalah predicted
            const ai = chartLabels.indexOf(lab);
            if (ai === -1) return null; // Lewati jika tidak ada nilai actual
            const y = chartData[ai]; // nilai actual
            const x = PADDING + i * stepX; // posisi x ada di semua label xAxis
            const yNorm = CHART_HEIGHT - PADDING - ((y - minY) / range * (CHART_HEIGHT - PADDING * 2));
            return (
              <Circle key={`point-${i}`} cx={x} cy={yNorm} r={4} color="#39A5E1" />
            );
          })}
          {/* Predicted line & points (kuning, 3 titik terakhir, hanya harian) */}
          {showPredicted && (
            <>
              <Path path={predictedPath} color="#FFD700" style="stroke" strokeWidth={3} />
              {predictedPoints.map((pt, i) => (
                <Circle key={`pred-point-${i}`} cx={pt.x} cy={pt.yNorm} r={4} color="#FFD700" opacity={0.85} />
              ))}
            </>
          )}
        </Canvas>
        {/* style price */}
        <View style={{
          position: 'absolute',
          left: 6,
          top: PADDING - 6,
          height: CHART_HEIGHT - PADDING * 1.5,
          justifyContent: 'space-between',
        }}>
          {yLabels.map((v, i) => (
            <Text key={`yval-${i}`} style={{ color: '#888', fontSize: LABEL_FONT_SIZE }}>
              {formatShortPrice(v)}
            </Text>
          ))}
        </View>

    

        <View style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: CHART_WIDTH, 
          height: CHART_HEIGHT,
          pointerEvents: 'none' 
        }}>
          {(() => {
            // Cari index pertama dan terakhir yang punya nilai pada displayValues
            let firstIdx = -1; // inisialisasi untuk index pertama
            let lastIdx = -1; // inisialisasi untuk index terakhir
            for (let i = 0; i < displayValues.length; i++) if (typeof displayValues[i] === 'number') { firstIdx = i; break; }
            for (let i = displayValues.length - 1; i >= 0; i--) if (typeof displayValues[i] === 'number') { lastIdx = i; break; }
            const nodes = [];
            [firstIdx, lastIdx].forEach(idx => {
              if (idx === -1) return;
              const val = displayValues[idx]; // ambil nilai harga
              const x = PADDING + idx * stepX; // posisi x sesuai index yang ada.
              const yNorm = CHART_HEIGHT - PADDING - ((val - minY) / range * (CHART_HEIGHT - PADDING * 2));
              let textLeft = x - 20; // posisi default kiri tengah dari titik
              if (idx === 0) textLeft = PADDING; 
              if (idx === displayValues.length - 1) textLeft = x - (String(formatShortPrice(val)).length * 7);
              const isPred = chartLabels.indexOf(xAxisLabels[idx]) === -1 && (predictedLabels && predictedLabels.indexOf(xAxisLabels[idx]) !== -1); // true jika ini predicted atau label synthetic
              nodes.push(
                <Text
                  key={`price-label-${idx}`}
                  style={{
                    position: 'absolute',
                    left: textLeft,
                    top: yNorm - 20,
                    color: isPred ? '#B8860B' : '#39A5E1',
                    fontSize: VALUE_FONT_SIZE,
                    fontWeight: 'bold',
                  }}
                >
                  {formatShortPrice(val)}
                </Text>
              );
            });
            return nodes;
          })()}
        </View>
      </View>


      <View style={{
        flexDirection: 'row',
        width: CHART_WIDTH - PADDING * 1,
        justifyContent: 'space-between',
        alignSelf: 'center',
        marginTop: 8,
        paddingHorizontal: PADDING / 2,
      }}>
        
        {xAxisLabels.map((label, i) => (
          <Text 
            key={`date-label-${i}`} 
            style={{ 
              color: '#888', 
              fontSize: LABEL_FONT_SIZE,
              textAlign: 'center',
            }}
          >
            {formatShortDate(label)}
          </Text>
        ))}
      </View>

      {/* penjelasan untuk garis dan circle pada canvas kuning untuk predicted dan biru untuk actual */}
      <View style={{ flexDirection: 'row', alignSelf: 'center', marginTop: 8, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#39A5E1' }} />
          <Text style={{ color: '#222', fontSize: 12, fontWeight: '500' }}>Actual</Text>
        </View>
        {showPredicted && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFD700' }} />
            <Text style={{ color: '#222', fontSize: 12, fontWeight: '500' }}>Predicted</Text>
          </View>
        )}
      </View>

    </View>
  );
};
// StyleSheet untuk styling komponen khususnya chart
const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#f5f9fd',
    borderRadius: 12,
    padding: 8,
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    width: CHART_WIDTH,
    alignSelf: 'center',
  },
  timeframeRow: { 
    flexDirection: 'row', 
    alignSelf: 'flex-end', 
    marginBottom: 6, 
    marginRight: 4,
    
  },
  timeBtn: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginLeft: 8,
  },
  timeBtnActive: { 
    backgroundColor: '#373737', 
    borderColor: '#222' 
  },
  timeBtnText: { 
    color: '#373737',
    fontSize: 10,
  },
  timeBtnTextActive: { 
    color: '#fff' 
  },
  subTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  textContainer: {
    position: 'absolute',
    left: 10,
    top: 3,
    zIndex: 1,
  },
});

export default PriceLineChart;