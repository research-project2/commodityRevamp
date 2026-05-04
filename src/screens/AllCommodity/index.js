// @ts-check

import React, { useState, useMemo, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  View,
} from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase/index';
import TopHeader from '../AllCommodity/component/TopHeader';
import Category from './component/Category';
import {
  IMGCengkeh1, IMGKopra, IMGNilam, IMGPPala, IMGUPtren1, IMGdowntren1,
  IMGTomat, IMGBeras, IMGCabai, IMGBawangPutih, IMGDgayam, IMGDgbabi,
  IMGDgsapi, IMGBawangMerah, IMGMinyakGoreng, IMGTelur, IMGGula 
} from '../../assets/images';
const commoditiesData = [
  { id: '1', name: 'Tomat', image: IMGTomat, category: 'Bumbu' },
  { id: '2', name: 'Bawang Putih', image: IMGBawangPutih, category: 'Bumbu' },
  { id: '3', name: 'Cabai', image: IMGCabai, category: 'Bumbu' },
  { id: '4', name: 'Daging Ayam', image: IMGDgayam, category: 'Daging' },
  { id: '5', name: 'Daging Babi', image: IMGDgbabi, category: 'Daging' },
  { id: '6', name: 'Nilam', image: IMGNilam, category: 'Non-pangan' },
  { id: '7', name: 'Kopra', image: IMGKopra, category: 'Non-pangan' },
  { id: '8', name: 'Pala', image: IMGPPala, category: 'Bumbu' },
  { id: '9', name: 'Cengkeh', image: IMGCengkeh1, category: 'Non-pangan' },
  { id: '10', name: 'Beras', image: IMGBeras, category: 'Pangan' },
  { id: '11', name: 'Daging Sapi', image: IMGDgsapi, category: 'Daging' },
  { id: '12', name: 'Bawang Merah', image: IMGBawangMerah, category: 'Bumbu' },
  { id: '13', name: 'Minyak', image: IMGMinyakGoreng, category: 'Pangan' },
  { id: '14', name: 'Telur', image: IMGTelur, category: 'Pangan' },
  { id: '15', name: 'Gula', image: IMGGula, category: 'Pangan' },
];

const numColumns = 3;

function getFirebaseKey(name) {
  return name.toLowerCase().replace(/[ .]/g, ''); 
}

const formatPrice = (price) => {
  if (price === null || price === undefined) {
    return 'Prediksi Belum Tersedia';
  }
  if (price >= 1000000) {
    return `${(price / 1000000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} jt`;
  }
  if (price >= 10000) {
    return `${(price / 1000).toLocaleString('id-ID')} rb`;
  }
  return price.toString();
};

// Fungsi ini menghitung tren dan persentase perubahan
const calculateTrend = (current, old) => {
  // Jika oldPrice tidak ada, null, atau 0, kita tidak bisa membandingkan.
  if (!old || old === 0) {
    return { trend: 'stay', change: '0,0%' };
  }

  const diff = current - old;
  // (perbedaan / harga_lama) * 100
  const percentage = (diff / old) * 100;

  const trend = diff > 0 ? 'up' : (diff < 0 ? 'down' : 'stay');
  
  // Ambil nilai absolut (selalu positif) dan format ke 1 desimal
  const formattedChange = `${Math.abs(percentage).toLocaleString('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;

  return { trend, change: formattedChange };
};

// Definisikan warna untuk tren di satu tempat agar mudah diubah
const trendColors = {
  up: '#EA4335',   // Merah (harga naik = buruk untuk user)
  down: '#34A853', // Hijau (harga turun = baik untuk user)
  stay: '#5f6368', // Abu-abu
};

const AllCommodity = ({ navigation }) => {
  
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [livePrices, setLivePrices] = useState({});

  // termasuk 'currentPrice' dan 'oldPrice'
  useEffect(() => {
    const dbRef = ref(database, 'realTimePrice/v2');
    //get data realtime dari firebase
    const unsubscribe = onValue(dbRef, snap => {
      const data = snap.val();
      console.log("[RealtimePrice/v2]", data);

      if (!data) {
        setLivePrices({});
        return;
      }

      const latestPrices = {};

      Object.keys(data).forEach(key => {
        const actual = data[key]?.actual;

        let priceArray = [];

        // STRUKTUR: actual = { '2026-04-03': { harga: 46250, jam: "...", sumber: "..." }, ... }
        if (actual && typeof actual === 'object' && !Array.isArray(actual)) {
          const sortedDates = Object.keys(actual).sort(); // sort ASC
          // handle kedua format: nested (dengan .harga) atau langsung number
          priceArray = sortedDates.map(date => {
            const data = actual[date];
            return typeof data === 'object' ? data?.harga : data;
          }).filter(price => price !== null && price !== undefined);
        }

        if (priceArray.length > 0) {
          const currentPrice = priceArray[priceArray.length - 1];
          const oldPrice = priceArray.length > 1 ? priceArray[priceArray.length - 2] : currentPrice;

          latestPrices[key] = { currentPrice, oldPrice };
        } else {
          latestPrices[key] = { currentPrice: null, oldPrice: null };
        }
      });

      setLivePrices(latestPrices);
    });

    return () => unsubscribe();
  }, []);





  const displayedData = useMemo(() => {
    
    // 1. Gabungkan data
    const allMergedData = commoditiesData.map(item => {
      const key = getFirebaseKey(item.name);
      
      // Ambil seluruh node untuk komoditas ini (misal: 'tomat')
      const liveDataNode = livePrices[key]; 
      
      // Ekstrak harga
      const current = liveDataNode?.currentPrice;
      const old = liveDataNode?.oldPrice; 

      // Kalkulasi tren dan persentase
      const { trend, change } = calculateTrend(current, old);
      
      return {
        ...item, // id, name, image, category
        price: current ?? null, // Harga saat ini
        trend: trend,           // 'up', 'down', atau 'stay'
        change: change,         // 'X,X%'
      };
    });

    // 2. Filter (logika tetap sama)
    const filtered = selectedCategory === 'Semua'
      ? allMergedData
      : allMergedData.filter(item => item.category === selectedCategory);

    // 3. Tambahkan item kosong (logika tetap sama)
    const remainder = filtered.length % numColumns;
    if (remainder !== 0) {
      for (let i = 0; i < numColumns - remainder; i++) {
        filtered.push({ id: `empty-${i}`, empty: true });
      }
    }
    return filtered;

  }, [selectedCategory, livePrices]); 

  const renderCommodityCard = ({ item }) => {
    if (item.empty) {
      return <View style={styles.cardWrapper}><View style={styles.cardContainerEmpty} /></View>;
    }
    
    const imageStyle = item.name === 'Beras' ? styles.cardBeras : styles.cardImage;
    return (
      
      <View style={styles.cardWrapper}>
        <View style={styles.cardContainer}>
          <Image source={item.image} style={imageStyle} />
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.priceRow}>
            {item.price === null ? (
              <Text style={styles.priceText}>Prediksi Belum Tersedia</Text>
            ) : (
              <>
                <Text style={styles.priceText}>{formatPrice(item.price)}</Text> 
                
                <View style={styles.trendContainer}>
                
                  {item.trend !== 'stay' && (
                    <Image
                      source={item.trend === 'up' ? IMGUPtren1 : IMGdowntren1}
                      style={styles.trendIcon}
                    />
                  )}
     
                  <Text style={[styles.trendText, { color: trendColors[item.trend] }]}>
                    {item.change}
                  </Text>
                </View>
              </>
            )}
            
          </View>
          
        </View>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => navigation.navigate('CommodityDetail', { commodityName: item.name })}
        >
          <Text style={styles.detailButtonText}>Lihat Detail</Text>
        </TouchableOpacity>
      </View>
       
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader
        title="REVAMP KOMODITAS"
        onBack={() => navigation.goBack()}
        showSearch={false}
        showSetting={false}
      />
      <Category
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <FlatList
        data={displayedData}
        keyExtractor={(item) => item.id}
        renderItem={renderCommodityCard}
        numColumns={numColumns}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    backgroundColor: '#f0f7fb',
  },
  listContainer: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 4,
    marginTop: 35,
    marginBottom: 10,
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingTop: 40,
    paddingBottom: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#9FBBC7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 6,
  },
  cardContainerEmpty: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    width: '100%',
    height: 120,
  },
  cardImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    position: 'absolute',
    top: -35,
    zIndex: 1,
  },
  cardBeras: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    position: 'absolute',
    top: -35,
    zIndex: 1,
    right: 10,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#054783',
    marginRight: 6,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    width: 9,
    height: 12,
    marginRight: 3,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailButton: {
    backgroundColor: '#26e58c',
    borderBottomLeftRadius: 12,   
    borderBottomRightRadius: 12,  
    borderTopLeftRadius: 0,       
    borderTopRightRadius: 0,      
    paddingVertical: 10,
    width: '100%',
    marginTop: -15,
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
});

export default AllCommodity;