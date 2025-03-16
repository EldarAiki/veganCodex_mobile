import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserProducts = async () => {
    try {
      console.log('Current user:', user);
      console.log('Uploaded products array:', user?.uploadedProducts);

      if (!user?.uploadedProducts || user.uploadedProducts.length === 0) {
        console.log('No uploaded products found');
        setProducts([]);
        return;
      }

      console.log('Fetching products for IDs:', user.uploadedProducts);
      const productPromises = user.uploadedProducts.map(productId => {
        console.log('Fetching product with ID:', productId);
        return productAPI.getProductById(productId);
      });

      const responses = await Promise.all(productPromises);
      console.log('Fetched product responses:', responses);
      const fetchedProducts = responses.map(response => response.data);
      console.log('Processed products:', fetchedProducts);
      setProducts(fetchedProducts);
      setError(null);
    } catch (err) {
      console.error('Error fetching user products:', err);
      setError('Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered, user:', user);
    fetchUserProducts();
  }, [user?.uploadedProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProducts();
    setRefreshing(false);
  };

  const renderProductCard = (product) => (
    <Card
      key={product._id}
      style={styles.productCard}
      onPress={() => navigation.navigate('Product', { product })}
    >
      {product.images && product.images.length > 0 && (
        <Card.Cover source={{ uri: product.images[0] }} style={styles.productImage} />
      )}
      <Card.Content>
        <Title>{product.name}</Title>
        <Paragraph>Category: {product.category}</Paragraph>
        <Paragraph>Country: {product.country}</Paragraph>
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.userInfo}>
        <Text style={styles.username}>{user?.username || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.productsSection}>
        <Title style={styles.sectionTitle}>Your Products</Title>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : products.length === 0 ? (
          <Text style={styles.emptyText}>You haven't added any products yet</Text>
        ) : (
          products.map(renderProductCard)
        )}
      </View>
      
      <Button
        mode="contained"
        onPress={logout}
        style={styles.logoutButton}
      >
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  productsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  productCard: {
    marginBottom: 16,
    elevation: 4,
  },
  productImage: {
    height: 200,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 16,
  },
  logoutButton: {
    margin: 16,
    marginTop: 32,
    backgroundColor: '#4CAF50',
  },
});

export default ProfileScreen; 