// @ts-check

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import Footer from '../Footer';
import TopHeader from '../TopHeader';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../../../../firebase/index';

import {
  IMGBGtomat, IMGBGbawangmerahputih, IMGBGcabai, IMGBGayam, IMGBGbabi,
  IMGBGnilam, IMGBGkopra, IMGBGpala, IMGBackroundCengkeh, IMGBGberas,
  IMGBGsapi, IMGBGminyak, IMGBGtelur, IMGBGgula,
  IMGUPtren1, IMGdowntren1, IMGAI, IMGDisclaimer
} from '../../../../assets/images';
import PriceLineChart from '../PriceLineChart';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const commodityData = [
  {
    id: '1',
    name: 'Tomat',
    image: IMGBGtomat,
  },
  {
    id: '2',
    name: 'Bawang Putih',
    image: IMGBGbawangmerahputih,
  },
  {
    id: '3',
    name: 'Cabai',
    image: IMGBGcabai,
  },
  {
    id: '4',
    name: 'Daging Ayam',
    image: IMGBGayam,
  },
  {
    id: '5',
    name: 'Daging Babi',
    image: IMGBGbabi,
  },
  {
    id: '6',
    name: 'Nilam',
    image: IMGBGnilam,
  },
  {
    id: '7',
    name: 'Kopra',
    image: IMGBGkopra,
  },
  {
    id: '8',
    name: 'Pala',
    image: IMGBGpala,
  },
  {
    id: '9',
    name: 'Cengkeh',
    image: IMGBackroundCengkeh,
  },
  {
    id: '10',
    name: 'Beras',
    image: IMGBGberas,
  },
  {
    id: '11',
    name: 'Daging Sapi',
    image: IMGBGsapi,
  },
  {
    id: '12',
    name: 'Bawang Merah',
    image: IMGBGbawangmerahputih,
  },
  {
    id: '13',
    name: 'Minyak',
    image: IMGBGminyak,
  },
  {
    id: '14',
    name: 'Telur',
    image: IMGBGtelur,
  },
  {
    id: '15',
    name: 'Gula',
    image: IMGBGgula,
  },
];

/**
 * @param {string} name 
 */
function getFirebaseKey(name) {
  return name.toLowerCase().replace(/[ .]/g, '');
}

/**
 * @param {number} current 
 * @param {number?} old 
 */
const calculateTrend = (current, old) => {
  if (!old || old === 0) {
    return { trend: 'stay', change: '0,0%' };
  }
  const diff = current - old;
  const percentage = (diff / old) * 100;
  const trend = diff > 0 ? 'up' : (diff < 0 ? 'down' : 'stay');
  const sign = percentage > 0 ? '+' : '';
  const formattedChange = `${sign}${percentage.toLocaleString('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
  return { trend, change: formattedChange };
};

/** @type {{[key: string]: string}} */
const trendColors = {
  up: '#EA4335',   // Merah - harga naik (buruk untuk user)
  down: '#34A853', // Hijau - harga turun (baik untuk user)
  stay: '#5f6368', // Abu-abu - harga tetap
};

/** @typedef {import('../../../../routes').RoutesParam} RoutesParam */

/** @param {import('@react-navigation/native-stack').NativeStackScreenProps<RoutesParam, 'CommodityDetail'>} Props */
const CommodityDetail = ({ navigation, route }) => {
  const routeObj = useRoute();
  const { commodityName } = routeObj.params || {};

  const [price, setPrice] = useState(/** @type {number | null} */(null));
  const [predictedPrice, setPredictedPrice] = useState(/** @type {number | null} */(null));
  const [showLLM, setShowLLM] = useState(false);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmResult, setLlmResult] = useState(/** @type {string | null} */(null));
  // Ref untuk cache analisis per commodity agar tidak fetch ulang
  const analysisCache = useRef(/** @type {{[key: string]: string}} */({}));
  const [analysisText, setAnalysisText] = useState('');
  const [trend, setTrend] = useState('stay');
  const [change, setChange] = useState('0,0%');

  const data = commodityData.find(item => item.name === commodityName);

  useEffect(() => {
    if (!data?.name) return;

    const key = getFirebaseKey(data.name);

    if (analysisCache.current[key]) {
      setAnalysisText(analysisCache.current[key]);
    } else {
      const keyRef = ref(database, `realTimePrice/v2/${key}`);

      const unsubscribe = onValue(keyRef, (snapshot) => {
        if (snapshot.exists()) {
          const snapData = snapshot.val() || {};

          console.log('[DetailCommodity] Full Data for', key, ':', snapData);

          const actual = snapData.actual || {};

          let priceArray = [];
          let dateArray = [];

          // Format v2 telah diganti menjadi seperti ini : { "2025-10-25": 35000, "2025-10-26": 36000 }
          if (typeof actual === 'object' && Object.keys(actual).length > 0) {
            dateArray = Object.keys(actual);

            // urutkan tanggal ASC
            dateArray.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

            // ambil harga berdasarkan tanggal yang sudah diurutkan
            priceArray = dateArray.map(d => actual[d]);
          }
          let latestPredicted = null;

          const predictedDataNode = snapData.predicted;

          console.log('[DetailCommodity] Predicted Data Node:', predictedDataNode);

          if (predictedDataNode && typeof predictedDataNode === "object") {
            const predictedDates = Object.keys(predictedDataNode);

            // urutkan tanggal ASC
            predictedDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

            // ambil harga dari tanggal paling baru
            const lastPredictedDate = predictedDates[predictedDates.length - 1];
            latestPredicted = predictedDataNode[lastPredictedDate];
            
            console.log('[DetailCommodity] Latest Predicted:', latestPredicted, 'Date:', lastPredictedDate);
          }

          let analysisText = '';

          if (snapData.analysis && typeof snapData.analysis === 'object') {
            const dates = Object.keys(snapData.analysis).sort().reverse();
            if (dates.length > 0) {
              analysisText = snapData.analysis[dates[0]];
            }
          } else if (snapData.analysis && typeof snapData.analysis === 'string') {
            analysisText = snapData.analysis;
          }

          analysisCache.current[key] = analysisText;

          if (priceArray.length > 0) {
            const lastIndex = priceArray.length - 1;

            const latestPrice = priceArray[lastIndex];
            const previousPrice =
              priceArray.length > 1 ? priceArray[lastIndex - 1] : null;

            const { trend, change } = calculateTrend(latestPrice, previousPrice);

            setPrice(latestPrice);
            setTrend(trend);
            setChange(change);
            setPredictedPrice(latestPredicted);
          } else {
            setPrice(null);
            setPredictedPrice(latestPredicted);
          }

        } else {
          setPrice(null);
          setPredictedPrice(null);
          setTrend('stay');
          setChange('0,0%');
        }
      });

      return () => unsubscribe();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // ambil analisis sesuai permintaan saat pengguna membuka modal
  const fetchLLMAnalysis = async () => {
    if (!data?.name) return;
    const key = getFirebaseKey(data.name);
    setLlmLoading(true);
    setLlmResult(null);
    try {
      if (analysisCache.current[key]) {
        setLlmResult(analysisCache.current[key]);
        setLlmLoading(false);
        return;
      }
      const snap = await get(ref(database, `realTimePrice/v2/${key}`));
      if (!snap.exists()) {
        setLlmResult('Tidak ada hasil analisa.');
        setLlmLoading(false);
        return;
      }
      const snapData = snap.val() || {};
      let newAnalysis = '';
      if (snapData.analysis && typeof snapData.analysis === 'object') {
        const dates = Object.keys(snapData.analysis).sort().reverse();
        if (dates.length > 0) newAnalysis = snapData.analysis[dates[0]];
      } else if (snapData.analysis && typeof snapData.analysis === 'string') {
        newAnalysis = snapData.analysis;
      }
      analysisCache.current[key] = newAnalysis || '';
      setLlmResult(analysisCache.current[key] || 'Tidak ada hasil analisa.');
    } catch (e) {
      setLlmResult('Gagal mengambil hasil analisa.');
    } finally {
      setLlmLoading(false);
    }
  };


  // hitung perbandingan prediksi vs aktual untuk memilih warna
  let predictedComparison = /** @type {'up' | 'down' | 'stay' | null} */(null);
  if (predictedPrice != null && price != null) {
    if (predictedPrice < (price || 0)) predictedComparison = 'down';
    else if (predictedPrice > price) predictedComparison = 'up';
    else predictedComparison = 'stay';
  }
  const predictedColor = predictedComparison ? trendColors[predictedComparison] : trendColors.stay;




  if (!data) {
    return (
      <View style={styles.container}>
        <Text>Data tidak ditemukan</Text>
        <Footer onPress={() => navigation.navigate('Home')} />
      </View>
    );
  }

  return <View style={styles.container}>
    <TopHeader />

    <ScrollView contentContainerStyle={styles.scrollContent}>

      <View style={styles.imageContainer}>
        <Image source={data.image} style={styles.image} />
        <Text style={styles.imageTitle}>{data.name}</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Harga Saat ini</Text>

        {trend === 'up' && (
          <Image source={IMGUPtren1} style={styles.trendIcon} />
        )}
        {trend === 'down' && (
          <Image source={IMGdowntren1} style={styles.trendIcon} />
        )}

        <View style={[styles.trendBox, { backgroundColor: trendColors[trend] }]}>
          <Text style={styles.trendText}>{change}</Text>
        </View>
      </View>

      <View style={styles.priceValueRow}>
        <Text style={styles.priceValue}>
          {price !== null
            ? `Rp ${price.toLocaleString('id-ID')}`
            : 'Memuat harga...'}
        </Text>

        <View style={styles.predictedContainer}>
          <Text style={styles.predictedLabel}>Prediksi</Text>
          {predictedPrice !== null ? (
            <Text style={[styles.predictedValue, { color: predictedColor }]}>{`Rp ${predictedPrice.toLocaleString('id-ID')}`}</Text>
          ) : (
            <Text style={[styles.predictedValueNull, { color: '#888', fontSize: 20 }]}>Data Belum Tersedia</Text>
          )}
        </View>
      </View>

      <PriceLineChart commodity={getFirebaseKey(data.name)} />

      <TouchableOpacity style={styles.llmButton} onPress={() => { setShowLLM(true); fetchLLMAnalysis(); }}>
        <Image source={IMGAI} style={styles.llmButtonIcon} />
        <Text style={styles.llmButtonText}>Analisa Dengan AI</Text>
      </TouchableOpacity>

      <Modal
        visible={showLLM}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLLM(false)}
      >
        <View style={styles.llmModalBackdrop}>
          <View style={styles.llmModal}>
            {llmLoading ? (
              <View style={{ alignItems: 'center', marginVertical: 12 }}>
                <ActivityIndicator size="small" color="#167EE6" />
                <Text style={[styles.llmBody, { marginTop: 8 }]}>Memproses analisa...</Text>
              </View>
            ) : (
              <View style={styles.analysisBox}>
                <View style={styles.analysisTitleRow}>
                  <Image source={IMGAI} style={styles.analysisIcon} />
                  <Text style={styles.analysisTitle}>Hasil Analisa</Text>
                </View>

                <Text style={styles.analysisText}>{llmResult || 'Tidak ada hasil analisa.'}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                  <Image source={IMGDisclaimer} style={{ width: 16, height: 16, marginRight: 8, resizeMode: 'contain' }} />
                  <Text style={styles.analysisNote}>Analisa ini menggunakan LLM dan bisa saja salah.</Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={[styles.llmCloseButton, { marginTop: 12 }]} onPress={() => setShowLLM(false)}>
              <Text style={styles.llmCloseButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
    <Footer onPress={() => navigation.navigate('HomeTab')} />
  </View>
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7fb' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  imageContainer: { borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  image: { width: '100%', height: 120, resizeMode: 'cover' },
  imageTitle: {
    position: 'absolute',
    left: 16,
    bottom: 12,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginLeft: 5 },
  priceLabel: { fontSize: 16, color: '#222', flex: 1, top: 20, },

  trendBox: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  trendIcon: {
    width: 20,
    height: 20,
    marginLeft: 5,
  },
  trendText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  priceValue: { fontSize: 32, fontWeight: 'bold', color: '#054783', marginVertical: 10, marginLeft: 5, },
  priceValueRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, },
  predictedValueNull: { fontSize: 25, fontWeight: '700', color: '#888', top: 5 },
  predictedContainer: {
    marginLeft: 20, alignItems: 'flex-start', marginTop: -30,
  },
  predictedLabel: { fontSize: 16, color: '#222' },
  predictedValue: {
    fontSize: 25,
    top: 5,
    fontWeight: '700',
    color: trendColors.down
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#a8d5e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  analysisBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    shadowColor: '#a8d5e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  analysisTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  analysisTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  analysisIcon: { width: 24, height: 24, marginRight: 8, resizeMode: 'contain' },
  analysisText: { fontSize: 15, color: '#222', marginBottom: 8 },
  analysisNote: { fontSize: 12, color: '#624444ff' },
  llmButton: {
    backgroundColor: '#167EE6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 12,
    justifyContent: 'center',
  },
  llmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  llmButtonIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
  llmModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  llmModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  llmStar: {
    width: 64,
    height: 64,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  llmTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  llmBody: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 12 },
  llmCloseButton: {
    backgroundColor: '#167EE6',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  llmCloseButtonText: { color: '#fff', fontWeight: '700' },
});

export default CommodityDetail;