import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';

const ImagePickerExample = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const options: CameraOptions & ImageLibraryOptions = {
    mediaType: 'photo',
    includeBase64: false,
    maxHeight: 500,
    maxWidth: 500,
    quality: 0.8 as any,
  };

  const openCamera = async () => {
    try {
      const result = await launchCamera(options);
      handleImagePickerResponse(result);
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const openGallery = async () => {
    try {
      const result = await launchImageLibrary(options);
      handleImagePickerResponse(result);
    } catch (error) {
      console.error('Gallery error:', error);
    }
  };

  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
    } else if (response.assets && response.assets.length > 0) {
      const asset = response.assets[0];
      setImageUri(asset.uri || null);
      console.log('Selected image:', asset);
      // You can access other properties like:
      // asset.width, asset.height, asset.fileName, asset.fileSize, asset.type
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Picker Example</Text>
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>No image selected</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={openCamera}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={openGallery}>
          <Text style={styles.buttonText}>Select from Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  placeholderContainer: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#888',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ImagePickerExample; 