import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase/index';
import { IMGCabai,IMGMinyakGoreng,IMGTelur,IMGDgayam, IMGBeras } from '../../assets/images';
import { AuthContext } from '../../context/SimpleAuthContext';

const GREEN = '#1ABC9C';

const Home = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);

  const commodityImages = {
    minyak: IMGMinyakGoreng,
    beras: IMGBeras,
    dagingayam: IMGDgayam,
    cabai: IMGCabai,
    telur: IMGTelur,
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    if (price >= 10000) return `Rp ${(price / 1000).toLocaleString('id-ID')} rb`;
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const calculateTrend = (current, old) => {
    if (!old || old === 0) return { trend: 'stay', change: '0%' };
    const diff = current - old;
    const percentage = (diff / old) * 100;
    const change = `${Math.abs(percentage).toLocaleString('id-ID', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}%`;
    return { trend: diff > 0 ? 'up' : (diff < 0 ? 'down' : 'stay'), change };
  };

  useEffect(() => {
    setLoading(true);
    const dbRef = ref(database, 'realTimePrice/v2');
    
    const unsubscribe = onValue(
      dbRef,
      (snap) => {
        const data = snap.val();
        if (!data) {
          setCommodities([]);
          setLoading(false);
          return;
        }

        const itemsToShow = ['minyak', 'dagingayam', 'telur', 'cabai', 'beras'];
        const processedCommodities = [];

        itemsToShow.forEach((itemName, index) => {
          const firebaseNode = data[itemName];
          if (firebaseNode && firebaseNode.actual && typeof firebaseNode.actual === 'object') {
            const sortedDates = Object.keys(firebaseNode.actual).sort();
            const priceArray = sortedDates.map(date => firebaseNode.actual[date]);

            if (priceArray.length > 0) {
              const currentPrice = priceArray[priceArray.length - 1];
              const oldPrice = priceArray.length > 1 ? priceArray[priceArray.length - 2] : currentPrice;
              const { trend, change } = calculateTrend(currentPrice, oldPrice);

              processedCommodities.push({
                id: (index + 1).toString(),
                name: itemName.charAt(0).toUpperCase() + itemName.slice(1),
                price: formatPrice(currentPrice),
                change: trend === 'up' ? `+${change}` : (trend === 'down' ? `-${change}` : change),
                image: commodityImages[itemName],
              });
            }
          }
        });

        setCommodities(processedCommodities);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase error:', error);
        setCommodities([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        onPress: async () => {
          const result = await logout();
          if (result.success) Alert.alert('Sukses', 'Anda telah keluar');
          else Alert.alert('Error', result.error);
        },
        style: 'destructive',
      },
    ]);
  };

  const renderCommodityItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.cardImage} resizeMode="contain" />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardPrice}>{item.price}</Text>
        <Text style={styles.cardChange}>{item.change}</Text>
      </View>
      <TouchableOpacity 
        style={styles.detailBtn}
        onPress={() => navigation.navigate('CommodityDetail', { commodityName: item.name })}
      >
        <Text style={styles.detailBtnText}>Lihat Detail</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, {user?.displayName || user?.name || 'User'}!</Text>
          <Text style={styles.subtitle}>Selamat datang</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userCard}>
          <Text style={styles.userLabel}>Email</Text>
          <Text style={styles.userValue}>{user?.email}</Text>
        </View>

        {/* Commodities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Komoditas</Text>
          <FlatList
            data={commodities}
            renderItem={renderCommodityItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Button */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('AllCommodity')}
        >
          <Text style={styles.buttonText}>Lihat Semua Komoditas</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: GREEN,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  userCard: {
    backgroundColor: '#f5f5f5',
    margin: 16,
    padding: 14,
    borderRadius: 8,
  },
  userLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  userValue: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardImage: {
    width: 70,
    height: 70,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: GREEN,
    marginTop: 4,
  },
  cardChange: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  detailBtn: {
    backgroundColor: GREEN,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  detailBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  button: {
    backgroundColor: GREEN,
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

});

export default Home;