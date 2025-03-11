import React, { createContext, useState, useContext } from 'react';
import { productAPI } from '../services/api';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productAPI.searchProducts(query);
      setProducts(response.data.data || response.data);
      return response.data.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = (updatedProduct) => {
    setProducts(currentProducts => {
      const index = currentProducts.findIndex(p => p._id === updatedProduct._id);
      if (index !== -1) {
        const newProducts = [...currentProducts];
        newProducts[index] = updatedProduct;
        return newProducts;
      }
      return currentProducts;
    });
  };

  const addComment = async (productId, commentData) => {
    try {
      setError(null);
      await productAPI.addComment(productId, commentData);
      const response = await productAPI.getProductById(productId);
      updateProduct(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
      throw err;
    }
  };

  return (
    <ProductContext.Provider 
      value={{
        products,
        loading,
        error,
        fetchProducts,
        updateProduct,
        addComment
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}; 