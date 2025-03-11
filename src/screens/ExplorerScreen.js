import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, ScrollView, RefreshControl } from 'react-native';
import { Searchbar, Card, Title, Paragraph, Button, Portal, Modal, List, ActivityIndicator, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProducts } from '../context/ProductContext';

const regions = [
  'Thailand',
  'Mexico',
  'Japan',
  'Italy',
];

const ExplorerScreen = ({ route, navigation }) => {
  const { isGuest } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { products, loading, error, fetchProducts } = useProducts();

  const handleSearch = async () => {
    const query = {
      ...(searchQuery && { search: searchQuery }),
      ...(selectedRegion && { country: selectedRegion }),
    };
    await fetchProducts(query);
  };

  // Fetch products when region changes
  useEffect(() => {
    handleSearch();
  }, [selectedRegion]);

  // Fetch products when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        handleSearch();
      }
    }, 500); // Debounce search for 500ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await handleSearch();
    setRefreshing(false);
  };

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setShowRegionModal(false);
  };

  const renderProductCard = ({ item }) => {
    return (
      <Card 
        style={styles.card} 
        onPress={() => navigation.navigate('Product', { product: item, isGuest })}
      >
        {item.images && item.images.length > 0 && (
          <Card.Cover source={{ uri: item.images[0] }} style={styles.cardImage} />
        )}
        <Card.Content>
          <Title>{item.name}</Title>
          <Paragraph>{item.location}</Paragraph>
          <Paragraph numberOfLines={2} ellipsizeMode="tail">{item.description}</Paragraph>
          <Paragraph>Rating: {item.rating} ⭐</Paragraph>
        </Card.Content>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search products..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          onSubmitEditing={handleSearch}
        />
        <Button
          mode="outlined"
          onPress={() => setShowRegionModal(true)}
          style={styles.regionButton}
        >
          {selectedRegion || 'Select Region'}
        </Button>
      </View>

      {isGuest && (
        <Card style={styles.guestCard}>
          <Card.Content>
            <Text>You're browsing as a guest</Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Welcome')}
              style={styles.loginButton}
            >
              Log In
            </Button>
          </Card.Content>
        </Card>
      )}

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={item => item._id || item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No products found</Text>
          </View>
        }
      />

      <Portal>
        <Modal
          visible={showRegionModal}
          onDismiss={() => setShowRegionModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Card>
            <Card.Content>
              <List.Section>
                <List.Subheader>Select Region</List.Subheader>
                {regions.map((region) => (
                  <List.Item
                    key={region}
                    title={region}
                    onPress={() => handleRegionSelect(region)}
                  />
                ))}
              </List.Section>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  searchBar: {
    flex: 1,
  },
  regionButton: {
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardImage: {
    height: 200,
    resizeMode: 'cover',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  guestCard: {
    margin: 16,
    backgroundColor: '#E8F5E9',
  },
  loginButton: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
  },
  errorCard: {
    margin: 16,
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    color: '#D32F2F',
  },
});

export default ExplorerScreen; 