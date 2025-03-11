import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Snackbar,
  HelperText,
  Divider,
  List,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../services/api';

// Predefined categories and countries
const CATEGORIES = [
  'Snacks',
  'Beverages',
  'Ready Meals',
  'Dairy Alternatives',
  'Meat Alternatives',
  'Sweets',
  'Other',
];

const COUNTRIES = [
  'Thailand',
  'Japan',
  'South Korea',
  'Vietnam',
  'Singapore',
  'Malaysia',
  'Indonesia',
  'Philippines',
];

const AddProductScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    country: '',
    description: '',
    ingredients: '',
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleImagePick = async (useCamera = false) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          setError('Camera permission is required to take photos');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled) {
          setImages([...images, result.assets[0]]);
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          setError('Gallery permission is required to select photos');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled) {
          setImages([...images, ...result.assets]);
        }
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to pick image');
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validation
      if (!formData.name || !formData.category || !formData.country || !formData.description) {
        setError('Please fill in all required fields');
        return;
      }

      if (images.length === 0) {
        setError('Please add at least one image');
        return;
      }

      // Create form data for multipart request
      const productFormData = new FormData();
      productFormData.append('name', formData.name);
      productFormData.append('category', formData.category);
      productFormData.append('country', formData.country);
      productFormData.append('description', formData.description);
      productFormData.append('ingredients', formData.ingredients);

      // Append images
      images.forEach((image, index) => {
        const imageUri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        productFormData.append('images', {
          uri: imageUri,
          name: filename,
          type,
        });
      });

      await productAPI.addProduct(productFormData);
      setSnackbarMessage('Product added successfully!');
      setSnackbarVisible(true);
      navigation.goBack();
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          label="Product Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          mode="outlined"
          style={styles.input}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            style={styles.picker}
          >
            <Picker.Item label="Select a category" value="" />
            {CATEGORIES.map((category) => (
              <Picker.Item key={category} label={category} value={category} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Country</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.country}
            onValueChange={(value) => setFormData({ ...formData, country: value })}
            style={styles.picker}
          >
            <Picker.Item label="Select a country" value="" />
            {COUNTRIES.map((country) => (
              <Picker.Item key={country} label={country} value={country} />
            ))}
          </Picker>
        </View>

        <TextInput
          label="Description"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <TextInput
          label="Ingredients"
          value={formData.ingredients}
          onChangeText={(text) => setFormData({ ...formData, ingredients: text })}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
          placeholder="One ingredient per line"
        />

        <Divider style={styles.divider} />

        <Text style={styles.label}>Images</Text>
        <View style={styles.imageButtons}>
          <Button
            mode="contained"
            onPress={() => handleImagePick(false)}
            style={styles.imageButton}
          >
            Pick Images
          </Button>
          <Button
            mode="contained"
            onPress={() => handleImagePick(true)}
            style={styles.imageButton}
          >
            Take Photo
          </Button>
        </View>

        {images.length > 0 && (
          <ScrollView horizontal style={styles.imagePreviewContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imagePreview}>
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {error ? <HelperText type="error">{error}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        >
          Add Product
        </Button>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  divider: {
    marginVertical: 16,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imagePreview: {
    marginRight: 8,
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: 16,
  },
});

export default AddProductScreen; 