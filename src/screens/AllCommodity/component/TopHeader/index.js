// @ts-check
/* eslint-disable prettier/prettier */
import { useNavigation } from '@react-navigation/native'
import React, { createRef, useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import theme from '../../../../theme'

/** @typedef {import('@react-navigation/native').NavigationProp<import('@react-navigation/native').ParamListBase>} GenericNavigator */

const TopHeader = ({ }) => {
  const insets = useSafeAreaInsets();
  /** @type {GenericNavigator} */
  const navigation = useNavigation()
  const [activeSearch, setActiveSearch] = useState(false)
  /** @type {React.LegacyRef<TextInput>} */
  const searchRef = createRef()

  const handleBackPress = () => navigation.goBack()

  useEffect(() => {
    searchRef.current?.focus()
  }, [activeSearch, searchRef.current])

  return <View style={styles.container}>
    <View style={{ height: insets.top, backgroundColor: theme.colors.surface }} />
    <View style={styles.topContainer}>
      <Pressable style={styles.backButton} onPress={handleBackPress}>
      
        <Text style={styles.backText}>back</Text>
      </Pressable>

      <Text style={styles.title}>KOMODITAS</Text>
    </View>

  </View>
}

export default TopHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderBottomLeftRadius: theme.radii.lg,
    borderBottomRightRadius: theme.radii.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: theme.spacing.md,
    fontStyle: 'normal',
    fontSize: 18,
    color: theme.colors.accent,
  },
  title: {
    fontSize: 15,
    fontStyle: 'normal', 
    fontWeight: '600', 
    color: theme.colors.accent,
    marginLeft: 140, 
    textAlign: 'left',           
  },
  topActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})