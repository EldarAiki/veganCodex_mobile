import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, FlatList, RefreshControl, Dimensions, Image, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, TextInput, Button, Avatar, Divider, ActivityIndicator, Snackbar, Portal, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productAPI } from '../services/api';
import { useProducts } from '../context/ProductContext';

const ProductScreen = ({ route, navigation }) => {
  const { product: initialProduct, isGuest } = route.params;
  const [product, setProduct] = useState(initialProduct);
  const [comments, setComments] = useState(initialProduct.comments || []);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { error, loading, addComment: contextAddComment, updateProduct } = useProducts();

  const screenWidth = Dimensions.get('window').width;
  const imageSize = (screenWidth - 48) / 2; // 2 images per row with 16px padding on sides and 16px gap

  const renderImageGrid = () => {
    if (!product.images || product.images.length === 0) return null;

    return (
      <View style={styles.imageGrid}>
        {product.images.map((imageUrl, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedImage(imageUrl)}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri: imageUrl }}
              style={[styles.gridImage, { width: imageSize, height: imageSize }]}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const fetchProductDetails = async () => {
    try {
      const updatedProduct = await productAPI.getProductById(product._id);
      setProduct(updatedProduct.data);
      setComments(updatedProduct.data.comments || []);
      updateProduct(updatedProduct.data);
    } catch (err) {
      console.error('Error fetching product details:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProductDetails();
    setRefreshing(false);
  };

  const handleSubmitComment = async () => {
    if (isGuest) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const updatedProduct = await contextAddComment(product._id, {
        text: newComment,
        rating,
      });
      setProduct(updatedProduct);
      setComments(updatedProduct.comments || []);
      setNewComment('');
      setRating(0);
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  };

  const renderComment = ({ item }) => (
    <Card style={styles.commentCard}>
      <Card.Content>
        <View style={styles.commentHeader}>
          <Avatar.Text size={40} label={item.user.username[0]} />
          <View style={styles.commentInfo}>
            <Title>{item.user.username}</Title>
            <Paragraph>Rating: {item.rating} ⭐</Paragraph>
          </View>
        </View>
        <Paragraph style={styles.commentText}>{item.text}</Paragraph>
        <Paragraph style={styles.commentDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Paragraph>
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.productCard}>
          {product.images && product.images.length > 0 && (
            <Card.Cover source={{ uri: product.images[0] }} style={styles.mainImage} />
          )}
          <Card.Content>
            <Title>{product.name}</Title>
            <Paragraph>Location: {product.location}</Paragraph>
            <Paragraph>Overall Rating: {product.rating} ⭐</Paragraph>
            <Paragraph style={styles.description}>{product.description}</Paragraph>
          </Card.Content>
        </Card>

        {product.images && product.images.length > 1 && (
          <View style={styles.imagesSection}>
            <Title style={styles.sectionTitle}>Images</Title>
            {renderImageGrid()}
          </View>
        )}

        <View style={styles.commentSection}>
          <Title style={styles.sectionTitle}>Comments</Title>
          {isGuest ? (
            <Card style={styles.loginPromptCard}>
              <Card.Content>
                <Paragraph>Please log in to add comments and ratings</Paragraph>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('Welcome')}
                  style={styles.loginButton}
                >
                  Log In
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <>
              <TextInput
                label="Add a comment"
                value={newComment}
                onChangeText={setNewComment}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.commentInput}
                disabled={loading}
              />
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    mode={star <= rating ? 'contained' : 'outlined'}
                    onPress={() => setRating(star)}
                    style={styles.ratingButton}
                    disabled={loading}
                  >
                    ⭐
                  </Button>
                ))}
              </View>
              <Button
                mode="contained"
                onPress={handleSubmitComment}
                style={styles.submitButton}
                disabled={!newComment.trim() || rating === 0 || loading}
                loading={loading}
              >
                Submit Comment
              </Button>
            </>
          )}
        </View>

        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={item => item._id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Paragraph>No comments yet</Paragraph>
            </View>
          }
        />
      </ScrollView>

      {/* Image Preview Modal */}
      <Portal>
        <Modal
          visible={selectedImage !== null}
          onDismiss={() => setSelectedImage(null)}
          contentContainerStyle={styles.imagePreviewModal}
        >
          {selectedImage && (
            <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </Modal>
      </Portal>

      <Snackbar
        visible={error !== null}
        onDismiss={() => {}}
        duration={3000}
      >
        {error}
      </Snackbar>

      <Portal>
        <Modal
          visible={showLoginPrompt}
          onDismiss={() => setShowLoginPrompt(false)}
          contentContainerStyle={styles.modal}
        >
          <Card>
            <Card.Content>
              <Title>Login Required</Title>
              <Paragraph>Please log in to add comments and ratings</Paragraph>
              <Button
                mode="contained"
                onPress={() => {
                  setShowLoginPrompt(false);
                  navigation.navigate('Welcome');
                }}
                style={styles.modalButton}
              >
                Log In
              </Button>
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
  productCard: {
    margin: 16,
    elevation: 4,
  },
  description: {
    marginTop: 8,
  },
  commentSection: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  commentInput: {
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ratingButton: {
    marginHorizontal: 4,
  },
  submitButton: {
    marginBottom: 16,
    backgroundColor: '#4CAF50',
  },
  commentCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentInfo: {
    marginLeft: 8,
  },
  commentText: {
    marginTop: 8,
  },
  commentDate: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loginPromptCard: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalButton: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
  },
  mainImage: {
    height: 300,
    resizeMode: 'cover',
  },
  imagesSection: {
    padding: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'flex-start',
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridImage: {
    borderRadius: 8,
  },
  imagePreviewModal: {
    margin: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    flex: 1,
    justifyContent: 'center',
  },
  imagePreviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});

export default ProductScreen; 