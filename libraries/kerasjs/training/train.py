from keras import models, layers, optimizers
from keras.preprocessing.image import img_to_array
from imutils import paths
import cv2
import os
import numpy as np
from sklearn.model_selection import train_test_split
from keras.utils import to_categorical
from keras.preprocessing.image import ImageDataGenerator
# import matplotlib.pyplot as plt

data = []
labels = []
EPOCHS = 25
INIT_LR = 1e-3
BS = 32

def getImages():
  imagePaths = sorted(list(paths.list_images('./images')))
  for imagePath in imagePaths:
    # load the image, pre-process it, and store it in the data list
    image = cv2.imread(imagePath)
    image = cv2.resize(image, (128, 128))
    image = img_to_array(image)
    data.append(image)

    # extract the class label from the image path and update the
    # labels list
    label = 1 if 'not' in imagePath else 0
    labels.append(label)


def build_model():
  model = models.Sequential()
  model.add(layers.Conv2D(20, (5, 5), activation='relu', input_shape=(128,128,3)))
  model.add(layers.MaxPooling2D(pool_size=(2,2), strides=(2,2)))
  model.add(layers.Conv2D(50, (5, 5), activation='relu', padding='same'))
  model.add(layers.MaxPooling2D(pool_size=(2,2), strides=(2,2)))
  model.add(layers.Flatten())
  model.add(layers.Dense(500, activation='relu'))
  model.add(layers.Dense(2, activation='sigmoid'))
  model.compile(optimizer=optimizers.RMSprop(lr=2e-5), loss='binary_crossentropy', metrics=['acc'])
  H = model.fit_generator(aug.flow(trainX, trainY, batch_size=BS),
	  validation_data=(testX, testY), steps_per_epoch=len(trainX) // BS,
	  epochs=EPOCHS, verbose=1)
  model.save('dog.model')
  return H

def plot():
  plt.style.use("ggplot")
  plt.figure()
  N = EPOCHS
  plt.plot(np.arange(0, N), H.history["loss"], label="train_loss")
  plt.plot(np.arange(0, N), H.history["val_loss"], label="val_loss")
  plt.plot(np.arange(0, N), H.history["acc"], label="train_acc")
  plt.plot(np.arange(0, N), H.history["val_acc"], label="val_acc")
  plt.title("Training Loss and Accuracy on Santa/Not Santa")
  plt.xlabel("Epoch #")
  plt.ylabel("Loss/Accuracy")
  plt.legend(loc="lower left")
  plt.savefig(args["plot"])

getImages()
data = np.array(data, dtype="float") / 255.0
labels = np.array(labels)
(trainX, testX, trainY, testY) = train_test_split(data, labels, test_size=0.25, random_state=42)
trainY = to_categorical(trainY, num_classes=2)
testY = to_categorical(testY, num_classes=2)
aug = ImageDataGenerator(rotation_range=30, width_shift_range=0.1,
	height_shift_range=0.1, shear_range=0.2, zoom_range=0.2,
	horizontal_flip=True, fill_mode="nearest")
H = build_model()
