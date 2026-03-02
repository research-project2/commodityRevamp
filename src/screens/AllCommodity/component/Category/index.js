import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const categoryNames = ['Semua', 'Bumbu', 'Daging', 'Non-pangan'];

const Category = ({ selectedCategory, setSelectedCategory }) => (
  <View style={styles.categoryContainer}>
    {categoryNames.map((cat) => (
      <TouchableOpacity
        key={cat}
        style={[
          styles.categoryButton,
          selectedCategory === cat && styles.categoryButtonActive,
        ]}
        onPress={() => setSelectedCategory(cat)}
      >
        <Text
          style={[
            styles.categoryText,
            selectedCategory === cat && styles.categoryTextActive,
          ]}
        >
          {cat}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    backgroundColor: 'transparent',
    left: 31,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#56A4EB',
  },
  categoryText: {
    color: '#6c757d',
    fontWeight: '500',
    fontSize: 10,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Category;