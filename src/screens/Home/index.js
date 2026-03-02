import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase/index';
import { IMGCengkeh1, IMGNilam, IMGKopra, IMGPPala, IMGUptrend, IMGDowntrend } from '../../assets/images';
import { AuthContext } from '../../context/SimpleAuthContext';
import theme from '../../theme';


const Home = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapping images untuk setiap komoditas
  const commodityImages = {
    kopra: IMGKopra,
    pala: IMGPPala,
    cengkeh: IMGCengkeh1,
    nilam: IMGNilam,
  };

  // Format harga dalam format yang readable
  const formatPrice = (price) => {
    if (price === null || price === undefined) {
      return 'N/A';
    }
    if (price >= 10000) {
      return `Rp ${(price / 1000).toLocaleString('id-ID')} rb`;
    }
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  // Calculate trend dan percentage change
  const calculateTrend = (current, old) => {
    if (!old || old === 0) {
      return { trend: 'stay', change: '0%', color: '#5f6368' };
    }

    const diff = current - old;
    const percentage = (diff / old) * 100;
    const trend = diff > 0 ? 'up' : (diff < 0 ? 'down' : 'stay');
    const color = trend === 'up' ? '#34A853' : (trend === 'down' ? '#EA4335' : '#5f6368');
    const change = `${Math.abs(percentage).toLocaleString('id-ID', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}%`;

    return { trend, change, color };
  };

  // Fetch data dari Firebase
  useEffect(() => {
    setLoading(true);
    const dbRef = ref(database, 'realTimePrice/v2');
    
    const unsubscribe = onValue(
      dbRef,
      (snap) => {
        const data = snap.val();
        console.log('[RealtimePrice/v2]', data);

        if (!data) {
          setCommodities([]);
          setLoading(false);
          return;
        }

        // Items yang ingin ditampilkan
        const itemsToShow = ['kopra', 'pala', 'cengkeh', 'nilam'];
        const processedCommodities = [];

        itemsToShow.forEach((itemName, index) => {
          const firebaseNode = data[itemName];
          
          if (firebaseNode && firebaseNode.actual && typeof firebaseNode.actual === 'object') {
            const sortedDates = Object.keys(firebaseNode.actual).sort();
            const priceArray = sortedDates.map(date => firebaseNode.actual[date]);

            if (priceArray.length > 0) {
              const currentPrice = priceArray[priceArray.length - 1];
              const oldPrice = priceArray.length > 1 ? priceArray[priceArray.length - 2] : currentPrice;
              const { trend, change, color } = calculateTrend(currentPrice, oldPrice);

              processedCommodities.push({
                id: (index + 1).toString(),
                name: itemName.charAt(0).toUpperCase() + itemName.slice(1),
                price: formatPrice(currentPrice),
                trend: trend === 'up' ? `+${change}` : (trend === 'down' ? `-${change}` : change),
                color: color,
                currentPrice: currentPrice,
                oldPrice: oldPrice,
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
    Alert.alert(
      'Keluar Aplikasi',
      'Apakah Anda yakin ingin keluar?',
      [
        {
          text: 'Batal',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Keluar',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              Alert.alert('Sukses', 'Anda telah keluar dari aplikasi');
            } else {
              Alert.alert('Error', result.error || 'Gagal logout');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderCommodityItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={() => navigation.navigate('CommodityDetail', { commodityName: item.name })}
      activeOpacity={0.8}
    >
      {/* Image Section */}
      <View style={styles.cardImageSection}>
        <Image
          source={item.image}
          style={styles.cardImage}
          resizeMode="contain"
        />
      </View>

      {/* Content Section */}
      <View style={styles.cardContentSection}>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardItemName}>{item.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.cardPrice}>{item.price}</Text>
            {item.trend !== '0%' && (
              <Image
                source={item.trend.startsWith('+') ? IMGUptrend : IMGDowntrend}
                style={styles.trendIcon}
                resizeMode="contain"
              />
            )}
          </View>
          {item.trend !== '0%' && (
            <Text style={[styles.cardTrend, { color: item.color }]}>
              {item.trend}
            </Text>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.detailButton, { backgroundColor: item.color }]}
          onPress={() => navigation.navigate('CommodityDetail', { commodityName: item.name })}
        >
          <Text style={styles.detailButtonText}>Lihat Detail</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with User Info and Logout */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            Halo, {user?.displayName || user?.name || 'User'}! 👋
          </Text>
          <Text style={styles.headerSubtitle}>Selamat datang di Commodity Revamp</Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <View style={styles.userInfoCard}>
            <Text style={styles.userInfoLabel}>Email</Text>
            <Text style={styles.userInfoValue}>{user?.email || 'N/A'}</Text>
          </View>
          <View style={styles.userInfoCard}>
            <Text style={styles.userInfoLabel}>User ID</Text>
            <Text style={styles.userInfoValue}>
              {user?.uid?.substring(0, 8) || 'N/A'}...
            </Text>
          </View>
        </View>

        {/* Commodities Section */}
        <View style={styles.commoditiesSection}>
          {commodities.length > 0 ? (
            <FlatList
              data={commodities}
              renderItem={renderCommodityItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.commodityList}
            />
          ) : (
            <Text style={styles.emptyText}>Tidak ada data komoditas</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.accent }]}
            onPress={() => navigation.navigate('AllCommodity')}
          >
            <Text style={styles.actionButtonText}>Lihat Semua Komoditas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  header: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: theme.radii.lg,
    borderBottomRightRadius: theme.radii.lg,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
  },
  logoutButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  userInfoSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  userInfoCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  userInfoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  userInfoValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  commoditiesSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  commodityList: {
    gap: theme.spacing.md,
  },
  cardContainer: {
    height: 160,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardImageSection: {
    width: 140,
    height: '100%',
    padding: theme.spacing.md,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContentSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    justifyContent: 'space-between',
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  trendIcon: {
    width: 20,
    height: 20,
  },
  cardItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  cardTrend: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  detailButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
  },
  actionsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Home;